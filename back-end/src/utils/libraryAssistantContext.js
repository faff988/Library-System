const prisma = require('../lib/prisma');

// Mirrors booksController.js's own computeStatus() exactly, so the AI's
// idea of "low stock" always matches what Inventory.jsx shows.
function computeStatus(book) {
  const total = book.total_copies ?? 0;
  const available = book.available_copies ?? 0;
  if (total === 0 || available === 0) return 'OUT OF STOCK';
  if (available / total <= 0.3) return 'LOW STOCK';
  if (available < total) return 'BORROWED';
  return 'AVAILABLE';
}

/** Always-available baseline stats, cheap to compute, keeps generic
 * questions ("how many members do we have?") grounded without needing
 * the heavier acquisition query below. */
async function getGeneralLibrarySnapshot() {
  const [totalBooks, totalMembers, activeBorrows, totalDonations] = await Promise.all([
    prisma.books.count(),
    prisma.members.count(),
    prisma.borrow_records.count({ where: { status: { in: ['Borrowed', 'Overdue'] } } }),
    prisma.donations.count(),
  ]);
  return { totalBooks, totalMembers, activeBorrows, totalDonations };
}

/**
 * Powers the "which books should we add" / "recommend similar" FAQ.
 * Same groupBy pattern as reportsController.js's popularBooks() endpoint.
 *
 * Logic: rank books by all-time borrow count, flag the ones that are
 * simultaneously popular AND low/out of stock (genuine acquisition
 * candidates - popular but hard to actually get a copy of), then for
 * each flagged book, look up other titles already in the same category
 * that aren't already in the popular list - these are the "similar
 * books" a librarian could point patrons to right now, or use as a
 * signal for what else to acquire in that category.
 */
async function getAcquisitionInsights(limit = 10) {
  const grouped = await prisma.borrow_records.groupBy({
    by: ['book_id'],
    _count: { book_id: true },
    orderBy: { _count: { book_id: 'desc' } },
    take: limit,
  });

  if (grouped.length === 0) return null;

  const books = await prisma.books.findMany({
    where: { book_id: { in: grouped.map((g) => g.book_id) } },
  });
  const bookMap = new Map(books.map((b) => [b.book_id, b]));

  const popular = grouped
    .map((g) => {
      const book = bookMap.get(g.book_id);
      if (!book) return null;
      return { ...book, timesBorrowed: g._count.book_id, status: computeStatus(book) };
    })
    .filter(Boolean);

  const needsRestock = popular.filter((b) => b.status === 'LOW STOCK' || b.status === 'OUT OF STOCK');

  const similarByBookId = {};
  for (const book of needsRestock) {
    const similar = await prisma.books.findMany({
      where: {
        category: book.category,
        book_id: { notIn: popular.map((p) => p.book_id) },
      },
      orderBy: { available_copies: 'desc' },
      take: 5,
    });
    similarByBookId[book.book_id] = similar;
  }

  return { popular, needsRestock, similarByBookId };
}

module.exports = { getGeneralLibrarySnapshot, getAcquisitionInsights, computeStatus };