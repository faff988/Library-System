const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/dashboard/overview
 * Powers Dashboard.jsx's summary cards, recent activity feed and category
 * chart. Everything the dashboard needs for non-chart data comes from this
 * single endpoint, so a user who can open the dashboard never has the page
 * break because they lack access to a separate /reports/* endpoint.
 */
const overview = asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    totalBooks,
    bookCopyAgg,
    totalMembers,
    activeMembers,
    activeBorrows,
    overdueBorrows,
    pendingFeedback,
    upcomingEvents,
    lostCopies,
    borrowsPerBook,
    recentBorrows,
    recentReturns,
    recentDonations,
  ] = await Promise.all([
    prisma.books.count(),
    prisma.books.aggregate({ _sum: { total_copies: true, available_copies: true } }),
    prisma.members.count(),
    prisma.members.count({ where: { status: 'Active' } }),
    prisma.borrow_records.count({ where: { status: { in: ['Borrowed', 'Overdue'] } } }),
    // A record can be past due_date while still at 'Borrowed' if nothing
    // flips it to 'Overdue' on schedule, so both are checked - kept
    // consistent with booksController.stats and reportsController.
    prisma.borrow_records.count({ where: { status: { in: ['Borrowed', 'Overdue'] }, due_date: { lt: now } } }),
    prisma.feedback.count({ where: { status: 'pending' } }),
    prisma.events.count({ where: { event_date: { gte: now } } }),
    prisma.damage_reports.count({ where: { book_condition: 'Lost' } }),
    prisma.borrow_records.groupBy({ by: ['book_id'], _count: { _all: true } }),
    prisma.borrow_records.findMany({
      take: 5,
      orderBy: { borrow_date: 'desc' },
      include: { members: { select: { full_name: true } }, books: { select: { title: true } } },
    }),
    prisma.borrow_records.findMany({
      take: 5,
      where: { status: 'Returned' },
      orderBy: { return_date: 'desc' },
      include: { members: { select: { full_name: true } }, books: { select: { title: true } } },
    }),
    prisma.donations.findMany({
      take: 5,
      orderBy: { donation_date: 'desc' },
      include: { items: { select: { title: true } } },
    }),
  ]);

  // Borrows per category: count every borrow record (not just a "top N"
  // sample), grouped by the book's category. Top 4 categories are kept and
  // the remainder is rolled into "Others".
  let categoryBorrows = [];
  if (borrowsPerBook.length > 0) {
    const bookRows = await prisma.books.findMany({
      where: { book_id: { in: borrowsPerBook.map((r) => r.book_id) } },
      select: { book_id: true, category: true },
    });
    const categoryByBook = new Map(bookRows.map((b) => [b.book_id, b.category || 'Uncategorized']));

    const totals = new Map();
    borrowsPerBook.forEach((r) => {
      const key = categoryByBook.get(r.book_id) || 'Uncategorized';
      totals.set(key, (totals.get(key) || 0) + r._count._all);
    });

    const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4).map(([name, value]) => ({ name, value }));
    const othersTotal = sorted.slice(4).reduce((sum, [, value]) => sum + value, 0);
    categoryBorrows = othersTotal > 0 ? [...top, { name: 'Others', value: othersTotal }] : top;
  }

  res.json({
    success: true,
    data: {
      totalBooks,
      totalCopies: bookCopyAgg._sum.total_copies || 0,
      availableCopies: bookCopyAgg._sum.available_copies || 0,
      totalMembers,
      activeMembers,
      activeBorrows,
      overdueBorrows,
      pendingFeedback,
      upcomingEvents,
      lostCopies,
      categoryBorrows,
      recentActivity: {
        borrows: recentBorrows.map((r) => ({ member: r.members?.full_name || 'Unknown Member', book: r.books?.title || 'Unknown Book', at: r.borrow_date })),
        returns: recentReturns.map((r) => ({ member: r.members?.full_name || 'Unknown Member', book: r.books?.title || 'Unknown Book', at: r.return_date })),
        donations: recentDonations.map((d) => ({
          donor: d.donor_name,
          itemCount: d.items.length,
          titles: d.items.map((i) => i.title),
          amount: d.amount,
          at: d.donation_date,
        })),
      },
    },
  });
});

// ── Borrow / Return trend ─────────────────────────────────────────────────────
// Week and month are bucketed daily; quarter is bucketed weekly (Mon-Sun) so
// the chart stays readable. Empty buckets are included as zeros so the line
// is continuous.
const TREND_RANGES = {
  week: { days: 7, weekly: false },
  month: { days: 30, weekly: false },
  quarter: { days: 90, weekly: true },
};

function dayKey(d) {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d) {
  const x = startOfDay(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x;
}

function bucketLabel(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * GET /api/dashboard/trend?range=week|month|quarter
 * Returns { rows: [{ bucket, borrows, returns }] } for the dashboard chart.
 */
const trend = asyncHandler(async (req, res) => {
  const cfg = TREND_RANGES[req.query.range] || TREND_RANGES.month;

  const today = startOfDay(new Date());
  const from = new Date(today);
  from.setDate(from.getDate() - (cfg.days - 1));

  const [borrowRows, returnRows] = await Promise.all([
    prisma.borrow_records.findMany({
      where: { borrow_date: { gte: from } },
      select: { borrow_date: true },
    }),
    // gte also excludes NULL return_date, i.e. books not yet returned.
    prisma.borrow_records.findMany({
      where: { return_date: { gte: from } },
      select: { return_date: true },
    }),
  ]);

  const toBucketStart = (d) => (cfg.weekly ? startOfWeek(d) : startOfDay(d));

  const buckets = new Map();
  const step = cfg.weekly ? 7 : 1;
  for (let d = toBucketStart(from); d <= today; d.setDate(d.getDate() + step)) {
    buckets.set(dayKey(d), { bucket: bucketLabel(d), borrows: 0, returns: 0 });
  }

  borrowRows.forEach((r) => {
    const b = buckets.get(dayKey(toBucketStart(r.borrow_date)));
    if (b) b.borrows += 1;
  });
  returnRows.forEach((r) => {
    const b = buckets.get(dayKey(toBucketStart(r.return_date)));
    if (b) b.returns += 1;
  });

  res.json({ success: true, data: { rows: Array.from(buckets.values()) } });
});

module.exports = { overview, trend };