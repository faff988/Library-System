const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/dashboard/overview
 * Powers Dashboard.jsx's top-level summary cards / recent activity feed.
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
    recentBorrows,
    recentReturns,
    recentDonations,
  ] = await Promise.all([
    prisma.books.count(),
    prisma.books.aggregate({ _sum: { total_copies: true, available_copies: true } }),
    prisma.members.count(),
    prisma.members.count({ where: { status: 'Active' } }),
    prisma.borrow_records.count({ where: { status: { in: ['Borrowed', 'Overdue'] } } }),
    // borrow_records_status is an enum (Borrowed | Returned | Overdue); a
    // record can be past due_date while still sitting at 'Borrowed' if
    // nothing flips it to 'Overdue' on schedule, so both are checked here -
    // kept consistent with booksController.stats and reportsController.
    prisma.borrow_records.count({ where: { status: { in: ['Borrowed', 'Overdue'] }, due_date: { lt: now } } }),
    prisma.feedback.count({ where: { status: 'pending' } }),
    prisma.events.count({ where: { event_date: { gte: now } } }),
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
    // donations has no book_title of its own - book info lives on the
    // related donation_items (a donation can include several), so those
    // are included and summarized rather than read off donations directly.
    prisma.donations.findMany({
      take: 5,
      orderBy: { donation_date: 'desc' },
      include: { items: { select: { title: true } } },
    }),
  ]);

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
      recentActivity: {
        borrows: recentBorrows.map((r) => ({ member: r.members.full_name, book: r.books.title, at: r.borrow_date })),
        returns: recentReturns.map((r) => ({ member: r.members.full_name, book: r.books.title, at: r.return_date })),
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

module.exports = { overview };