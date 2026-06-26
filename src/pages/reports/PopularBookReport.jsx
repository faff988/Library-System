import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  ListFilter,
  MoreVertical,
  RotateCcw,
  Search,
  Shapes,
  SlidersHorizontal,
  Star,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Adminsidebar";

const PAGE_SIZE = 4;
const PERIODS = ["Daily", "Weekly", "Monthly"];

const sortOptions = [
  { value: "borrow-desc", label: "Most Borrowed" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "author-asc", label: "Author A-Z" },
  { value: "status-asc", label: "Status" },
];

const emptySummary = {
  totalBorrows: 0,
  growth: "+0%",
  mostPopular: "-",
  totalReaders: 0,
  readerBadge: "-",
  topCategory: "-",
};

const mockReport = {
  summaries: {
    Daily: {
      totalBorrows: 1284,
      growth: "+12.5%",
      mostPopular: "Fiction",
      totalReaders: 856,
      readerBadge: "New Peak",
      topCategory: "Classic",
    },
    Weekly: {
      totalBorrows: 5892,
      growth: "+8.2%",
      mostPopular: "Classic",
      totalReaders: 3146,
      readerBadge: "Stable",
      topCategory: "Classic",
    },
    Monthly: {
      totalBorrows: 21478,
      growth: "+15.8%",
      mostPopular: "Non-Fiction",
      totalReaders: 12640,
      readerBadge: "High",
      topCategory: "Non-Fiction",
    },
  },
  trends: {
    Daily: [
      { label: "Mon", value: 188 },
      { label: "Tue", value: 203 },
      { label: "Wed", value: 245 },
      { label: "Thu", value: 214 },
      { label: "Fri", value: 226 },
      { label: "Sat", value: 208 },
    ],
    Weekly: [
      { label: "W1", value: 1124 },
      { label: "W2", value: 1268 },
      { label: "W3", value: 1382 },
      { label: "W4", value: 1195 },
      { label: "W5", value: 923 },
    ],
    Monthly: [
      { label: "Jan", value: 2910 },
      { label: "Feb", value: 3184 },
      { label: "Mar", value: 3566 },
      { label: "Apr", value: 4012 },
      { label: "May", value: 4328 },
      { label: "Jun", value: 3478 },
    ],
  },
  books: [
    {
      id: "PB-001",
      title: "The Great Gatsby",
      isbn: "ISBN: 978-0743273565",
      author: "F. Scott Fitzgerald",
      category: "Classic",
      status: "Checked Out",
      rating: 5,
      isPick: true,
      cover: "from-[#1F2E2A] via-[#31413B] to-[#0D1716]",
      borrowCount: { Daily: 342, Weekly: 1128, Monthly: 4260 },
      readerCount: { Daily: 250, Weekly: 722, Monthly: 2184 },
    },
    {
      id: "PB-002",
      title: "Atomic Habits",
      isbn: "ISBN: 978-0735211292",
      author: "James Clear",
      category: "Non-Fiction",
      status: "Available",
      rating: 5,
      isPick: true,
      cover: "from-[#E9F2F5] via-[#AFC7CE] to-[#28576B]",
      borrowCount: { Daily: 290, Weekly: 984, Monthly: 3892 },
      readerCount: { Daily: 194, Weekly: 585, Monthly: 1922 },
    },
    {
      id: "PB-003",
      title: "Project Hail Mary",
      isbn: "ISBN: 978-0593135204",
      author: "Andy Weir",
      category: "Science Fiction",
      status: "Available",
      rating: 4,
      isPick: true,
      cover: "from-[#0B2028] via-[#104857] to-[#7EA4AA]",
      borrowCount: { Daily: 275, Weekly: 832, Monthly: 3074 },
      readerCount: { Daily: 170, Weekly: 486, Monthly: 1510 },
    },
    {
      id: "PB-004",
      title: "The Hobbit",
      isbn: "ISBN: 978-0547928227",
      author: "J.R.R. Tolkien",
      category: "Fantasy",
      status: "Reserved",
      rating: 4,
      isPick: false,
      cover: "from-[#7D3B21] via-[#C77638] to-[#F5C842]",
      borrowCount: { Daily: 256, Weekly: 764, Monthly: 2848 },
      readerCount: { Daily: 151, Weekly: 438, Monthly: 1398 },
    },
    {
      id: "PB-005",
      title: "Clean Code",
      isbn: "ISBN: 978-0132350884",
      author: "Robert C. Martin",
      category: "Technology",
      status: "Available",
      rating: 4,
      isPick: false,
      cover: "from-[#E5E7EB] via-[#9CA3AF] to-[#111827]",
      borrowCount: { Daily: 24, Weekly: 442, Monthly: 1760 },
      readerCount: { Daily: 21, Weekly: 286, Monthly: 884 },
    },
    {
      id: "PB-006",
      title: "1984",
      isbn: "ISBN: 978-0451524935",
      author: "George Orwell",
      category: "Classic",
      status: "Checked Out",
      rating: 5,
      isPick: false,
      cover: "from-[#402218] via-[#9A3412] to-[#F97316]",
      borrowCount: { Daily: 21, Weekly: 384, Monthly: 1584 },
      readerCount: { Daily: 19, Weekly: 224, Monthly: 768 },
    },
    {
      id: "PB-007",
      title: "Educated",
      isbn: "ISBN: 978-0399590504",
      author: "Tara Westover",
      category: "Memoir",
      status: "Available",
      rating: 4,
      isPick: true,
      cover: "from-[#F8FAFC] via-[#93C5FD] to-[#1D4ED8]",
      borrowCount: { Daily: 19, Weekly: 328, Monthly: 1324 },
      readerCount: { Daily: 17, Weekly: 196, Monthly: 650 },
    },
    {
      id: "PB-008",
      title: "Dune",
      isbn: "ISBN: 978-0441172719",
      author: "Frank Herbert",
      category: "Science Fiction",
      status: "Reserved",
      rating: 5,
      isPick: false,
      cover: "from-[#78350F] via-[#D97706] to-[#FEF3C7]",
      borrowCount: { Daily: 17, Weekly: 305, Monthly: 1190 },
      readerCount: { Daily: 16, Weekly: 178, Monthly: 594 },
    },
    {
      id: "PB-009",
      title: "The Art of Khmer Architecture",
      isbn: "ISBN: 978-9924905124",
      author: "Sokun Vann",
      category: "History",
      status: "Available",
      rating: 4,
      isPick: true,
      cover: "from-[#164E63] via-[#0E7490] to-[#67E8F9]",
      borrowCount: { Daily: 15, Weekly: 264, Monthly: 1020 },
      readerCount: { Daily: 14, Weekly: 154, Monthly: 510 },
    },
    {
      id: "PB-010",
      title: "Deep Work",
      isbn: "ISBN: 978-1455586691",
      author: "Cal Newport",
      category: "Non-Fiction",
      status: "Checked Out",
      rating: 4,
      isPick: false,
      cover: "from-[#111827] via-[#334155] to-[#CBD5E1]",
      borrowCount: { Daily: 12, Weekly: 218, Monthly: 856 },
      readerCount: { Daily: 11, Weekly: 132, Monthly: 430 },
    },
    {
      id: "PB-011",
      title: "Invisible Cities",
      isbn: "ISBN: 978-0156453806",
      author: "Italo Calvino",
      category: "Fiction",
      status: "Available",
      rating: 5,
      isPick: true,
      cover: "from-[#312E81] via-[#7C3AED] to-[#C4B5FD]",
      borrowCount: { Daily: 8, Weekly: 142, Monthly: 536 },
      readerCount: { Daily: 8, Weekly: 84, Monthly: 268 },
    },
    {
      id: "PB-012",
      title: "Sapiens",
      isbn: "ISBN: 978-0062316097",
      author: "Yuval Noah Harari",
      category: "History",
      status: "Available",
      rating: 4,
      isPick: false,
      cover: "from-[#F5F5F4] via-[#A8A29E] to-[#44403C]",
      borrowCount: { Daily: 5, Weekly: 101, Monthly: 394 },
      readerCount: { Daily: 5, Weekly: 61, Monthly: 194 },
    },
  ],
};

async function fetchPopularBookReport() {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 150);
  });

  return mockReport;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function escapeCsvValue(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function getStatusStyle(status) {
  const styles = {
    Available: {
      text: "text-[#006088]",
      dot: "bg-[#006088]",
    },
    "Checked Out": {
      text: "text-red-500",
      dot: "bg-red-500",
    },
    Reserved: {
      text: "text-[#A58200]",
      dot: "bg-[#CFA900]",
    },
  };

  return styles[status] || { text: "text-gray-500", dot: "bg-gray-400" };
}

function BookCover({ gradient, title, compact = false }) {
  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden rounded-sm bg-gradient-to-br ${gradient} shadow-[0_4px_10px_rgba(15,23,42,0.22)] ${
        compact ? "h-10 w-8" : "h-16 w-12"
      }`}
    >
      <div className="absolute inset-y-1 left-1 w-1 rounded-full bg-white/20" />
      <div className="absolute bottom-1.5 left-1.5 right-1.5 h-1 rounded-full bg-white/35" />
      <span className="sr-only">{title}</span>
    </div>
  );
}

function RatingStars({ rating }) {
  return (
    <div className="mt-1 flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={9}
          fill="currentColor"
          strokeWidth={0}
          className={index < rating ? "text-[#F5C842]" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

function CategoryPill({ children }) {
  const styles = {
    Classic: "bg-[#D8EEF7] text-[#08709B]",
    "Non-Fiction": "bg-[#FFF2B7] text-[#9C7300]",
    "Science Fiction": "bg-[#FFE1D0] text-[#B3481E]",
    Fantasy: "bg-[#D8EEF7] text-[#08709B]",
    Technology: "bg-[#E8F5E9] text-[#2E7D32]",
    Memoir: "bg-[#F3E8FF] text-[#7E22CE]",
    History: "bg-[#FEE2E2] text-[#B91C1C]",
    Fiction: "bg-[#E0F2FE] text-[#0369A1]",
  };

  return (
    <span
      className={`inline-flex min-w-16 justify-center rounded-full px-2 py-1 text-[10px] font-extrabold leading-none ${
        styles[children] || "bg-gray-100 text-gray-500"
      }`}
    >
      {children}
    </span>
  );
}

export default function PopularBookReport() {
  const [report, setReport] = useState({
    summaries: {},
    trends: {},
    books: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePeriod, setActivePeriod] = useState("Daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("borrow-desc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllPicks, setShowAllPicks] = useState(false);
  const [showTrendDetails, setShowTrendDetails] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadReport() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchPopularBookReport();
        if (isActive) {
          setReport(data);
        }
      } catch {
        if (isActive) {
          setError("Unable to load popular book report.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isActive = false;
    };
  }, []);

  const periodBooks = useMemo(
    () =>
      report.books.map((book) => ({
        ...book,
        activeBorrowCount: book.borrowCount[activePeriod] || 0,
        activeReaderCount: book.readerCount[activePeriod] || 0,
      })),
    [activePeriod, report.books],
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(report.books.map((book) => book.category))).sort(
        (first, second) => first.localeCompare(second),
      ),
    [report.books],
  );

  const statuses = useMemo(
    () =>
      Array.from(new Set(report.books.map((book) => book.status))).sort(
        (first, second) => first.localeCompare(second),
      ),
    [report.books],
  );

  const filteredBooks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return periodBooks.filter((book) => {
      const matchesSearch =
        !normalizedSearch ||
        [book.title, book.author, book.isbn, book.category, book.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesCategory =
        categoryFilter === "All" || book.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All" || book.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, periodBooks, searchTerm, statusFilter]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((first, second) => {
      if (sortBy === "title-asc") {
        return first.title.localeCompare(second.title);
      }

      if (sortBy === "author-asc") {
        return first.author.localeCompare(second.author);
      }

      if (sortBy === "status-asc") {
        return first.status.localeCompare(second.status);
      }

      return second.activeBorrowCount - first.activeBorrowCount;
    });
  }, [filteredBooks, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedBooks = sortedBooks.slice(startIndex, startIndex + PAGE_SIZE);
  const showingStart = sortedBooks.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + PAGE_SIZE, sortedBooks.length);
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const activeSummary = report.summaries[activePeriod] || emptySummary;
  const trendData = report.trends[activePeriod] || [];
  const trendMax = Math.max(...trendData.map((item) => item.value), 1);
  const peakTrend = trendData.reduce(
    (peak, item) => (item.value > peak.value ? item : peak),
    { label: "-", value: 0 },
  );
  const averageTrend =
    trendData.length === 0
      ? 0
      : Math.round(
          trendData.reduce((total, item) => total + item.value, 0) /
            trendData.length,
        );
  const librarianPicks = useMemo(
    () =>
      periodBooks
        .filter((book) => book.isPick)
        .sort((first, second) => second.rating - first.rating),
    [periodBooks],
  );
  const visiblePicks = showAllPicks
    ? librarianPicks
    : librarianPicks.slice(0, 3);
  const hasActiveFilters =
    searchTerm.trim() ||
    categoryFilter !== "All" ||
    statusFilter !== "All" ||
    sortBy !== "borrow-desc";

  function showMessage(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function handlePeriodChange(period) {
    setActivePeriod(period);
    setPage(1);
  }

  function handleSearchChange(value) {
    setSearchTerm(value);
    setPage(1);
  }

  function handleCategoryChange(value) {
    setCategoryFilter(value);
    setPage(1);
  }

  function handleStatusChange(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleSortChange(value) {
    setSortBy(value);
    setPage(1);
  }

  function clearFilters() {
    setSearchTerm("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setSortBy("borrow-desc");
    setPage(1);
  }

  function cycleSortMode() {
    const currentIndex = sortOptions.findIndex((option) => option.value === sortBy);
    const nextOption = sortOptions[(currentIndex + 1) % sortOptions.length];
    handleSortChange(nextOption.value);
    showMessage(`Sorted by ${nextOption.label}`);
  }

  function exportReport() {
    if (sortedBooks.length === 0) {
      showMessage("No rows to export");
      return;
    }

    const headers = [
      "Rank",
      "Book ID",
      "Title",
      "ISBN",
      "Author",
      "Category",
      "Borrow Count",
      "Readers",
      "Status",
      "Period",
    ];
    const rows = sortedBooks.map((book, index) => [
      index + 1,
      book.id,
      book.title,
      book.isbn,
      book.author,
      book.category,
      book.activeBorrowCount,
      book.activeReaderCount,
      book.status,
      activePeriod,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `popular-book-report-${activePeriod.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showMessage("Report exported");
  }

  function selectPick(book) {
    handleSearchChange(book.title);
    setCategoryFilter("All");
    setStatusFilter("All");
    setShowAllPicks(false);
    setPage(1);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#E7EEF6]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#E7EEF6]">
        <Navbar
          title="Popular Book Report"
          onBack={() => window.history.back()}
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search popular books..."
        />

        <div className="px-8 py-5">
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 rounded bg-[#004D6E] px-4 py-3 text-sm font-bold text-white shadow-lg">
              {toast}
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-h-9 items-center gap-2">
              {loading && (
                <span className="rounded bg-white px-3 py-2 text-[11px] font-bold text-gray-500 shadow-sm ring-1 ring-gray-200">
                  Loading report...
                </span>
              )}
              {error && (
                <button
                  onClick={() => window.location.reload()}
                  className="rounded bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 ring-1 ring-red-100"
                >
                  Retry report
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex overflow-hidden rounded bg-white shadow-sm ring-1 ring-gray-200">
                {PERIODS.map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={`px-4 py-2 text-[11px] font-bold transition ${
                      period === activePeriod
                        ? "bg-[#004D6E] text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 rounded bg-[#004D6E] px-4 py-2 text-[11px] font-extrabold text-white shadow-sm hover:bg-[#063D55] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={sortedBooks.length === 0}
              >
                <Download size={13} />
                Export Report
              </button>
            </div>
          </div>

          <section className="grid grid-cols-4 gap-5">
            {[
              {
                label: "TOTAL BORROWS",
                value: formatNumber(activeSummary.totalBorrows),
                icon: BookOpen,
                iconClass: "bg-[#E8F4F7] text-[#0A6E86]",
                badge: activeSummary.growth,
              },
              {
                label: "MOST POPULAR",
                value: activeSummary.mostPopular,
                icon: TrendingUp,
                iconClass: "bg-[#F8F0D7] text-[#8A6A00]",
                badge: "Trending",
              },
              {
                label: "TOTAL READERS",
                value: formatNumber(activeSummary.totalReaders),
                icon: UsersRound,
                iconClass: "bg-[#F6E8D6] text-[#915B1B]",
                badge: activeSummary.readerBadge,
              },
              {
                label: "TOP CATEGORY",
                value: activeSummary.topCategory,
                icon: Shapes,
                iconClass: "bg-[#E8F3F7] text-[#0A6E86]",
              },
            ].map(({ label, value, icon: Icon, iconClass, badge }) => (
              <div
                key={label}
                className="min-h-[112px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded ${iconClass}`}
                  >
                    <Icon size={18} />
                  </div>
                  {badge && (
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-extrabold ${
                        badge.startsWith("+")
                          ? "bg-emerald-50 text-emerald-500"
                          : "text-gray-400"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                  {label}
                </p>
                <p className="mt-1 truncate text-[25px] font-black leading-none text-gray-900">
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-5 grid grid-cols-[1fr_300px] gap-5">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-gray-900">
                  Borrowing Trends
                </h2>
                <button
                  onClick={() => setShowTrendDetails((current) => !current)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                  title="Toggle trend details"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="mt-5 h-[238px]">
                <div className="flex h-[200px] items-end gap-4 border-b border-gray-100 px-3">
                  {trendData.map((item) => {
                    const height = Math.max(18, (item.value / trendMax) * 170);
                    const isPeak = item.value === peakTrend.value;

                    return (
                      <div
                        key={item.label}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >
                        {isPeak && (
                          <div className="text-center">
                            <p className="text-[10px] font-extrabold text-[#C99A00]">
                              Peak
                            </p>
                            <p className="text-[10px] font-extrabold text-[#C99A00]">
                              {formatNumber(item.value)}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => showMessage(`${item.label}: ${formatNumber(item.value)} borrows`)}
                          className={`w-full max-w-12 rounded-t transition hover:opacity-80 ${
                            isPeak ? "bg-[#F5C842]" : "bg-[#1B4965]"
                          }`}
                          style={{ height }}
                          title={`${item.label}: ${formatNumber(item.value)} borrows`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 grid text-center text-[10px] font-medium text-gray-500" style={{ gridTemplateColumns: `repeat(${trendData.length || 1}, minmax(0, 1fr))` }}>
                  {trendData.map((item) => (
                    <span
                      key={item.label}
                      className={
                        item.value === peakTrend.value
                          ? "font-extrabold text-gray-900"
                          : ""
                      }
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {showTrendDetails && (
                <div className="mt-3 grid grid-cols-3 gap-3 rounded bg-[#F8FAFC] p-3 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400">
                      Period
                    </p>
                    <p className="text-sm font-extrabold text-[#004D6E]">
                      {activePeriod}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400">
                      Peak
                    </p>
                    <p className="text-sm font-extrabold text-[#004D6E]">
                      {peakTrend.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400">
                      Average
                    </p>
                    <p className="text-sm font-extrabold text-[#004D6E]">
                      {formatNumber(averageTrend)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-gray-900">
                  Librarian's Picks
                </h2>
                <button
                  onClick={() => setShowAllPicks((current) => !current)}
                  className="text-[10px] font-extrabold text-[#006088] hover:underline"
                >
                  {showAllPicks ? "View Less" : "View All"}
                </button>
              </div>

              <div className="max-h-[298px] space-y-4 overflow-y-auto pr-1">
                {visiblePicks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => selectPick(book)}
                    className="flex w-full gap-4 rounded p-1 text-left transition hover:bg-gray-50"
                  >
                    <BookCover gradient={book.cover} title={book.title} />
                    <div className="min-w-0 pt-1">
                      <h3 className="truncate text-[12px] font-extrabold leading-tight text-gray-900">
                        {book.title}
                      </h3>
                      <p className="truncate text-[10px] font-semibold text-gray-500">
                        {book.author}
                      </p>
                      <RatingStars rating={book.rating} />
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          </section>

          <section className="mt-5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-[#004D6E]">
                  Ranked Books Ranking
                </h2>
                {hasActiveFilters && (
                  <p className="mt-1 text-[11px] font-semibold text-gray-400">
                    {formatNumber(sortedBooks.length)} matching books
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters((current) => !current)}
                  className={`flex h-8 w-8 items-center justify-center rounded border text-gray-500 hover:bg-gray-50 ${
                    showFilters
                      ? "border-[#004D6E] bg-[#E8F4F7] text-[#004D6E]"
                      : "border-gray-200"
                  }`}
                  title="Filters"
                >
                  <ListFilter size={15} />
                </button>
                <button
                  onClick={cycleSortMode}
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
                  title="Cycle sorting"
                >
                  <SlidersHorizontal size={15} />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-[1.3fr_1fr_1fr_auto] gap-3 border-t border-gray-100 bg-[#FBFCFD] px-5 py-4">
                <label className="relative">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase text-gray-400">
                    Search
                  </span>
                  <Search
                    size={15}
                    className="absolute bottom-3 left-3 text-gray-400"
                  />
                  <input
                    value={searchTerm}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Title, author, ISBN..."
                    className="h-10 w-full rounded border border-gray-200 bg-white pl-9 pr-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#004D6E]"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-[10px] font-extrabold uppercase text-gray-400">
                    Category
                  </span>
                  <select
                    value={categoryFilter}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                    className="h-10 w-full rounded border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#004D6E]"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1 block text-[10px] font-extrabold uppercase text-gray-400">
                    Status
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    className="h-10 w-full rounded border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#004D6E]"
                  >
                    <option value="All">All Status</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1 block text-[10px] font-extrabold uppercase text-gray-400">
                    Sort
                  </span>
                  <select
                    value={sortBy}
                    onChange={(event) => handleSortChange(event.target.value)}
                    className="h-10 w-40 rounded border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#004D6E]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  onClick={clearFilters}
                  className="col-span-4 flex h-9 w-fit items-center gap-2 rounded border border-gray-200 bg-white px-3 text-[11px] font-extrabold text-gray-500 hover:bg-gray-50"
                >
                  <RotateCcw size={13} />
                  Reset filters
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="bg-[#F7F9FB] text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-5 py-4">Rank</th>
                    <th className="px-5 py-4">Book Cover</th>
                    <th className="px-5 py-4">
                      <button
                        onClick={() => handleSortChange("title-asc")}
                        className="font-extrabold uppercase hover:text-[#004D6E]"
                      >
                        Book Title
                      </button>
                    </th>
                    <th className="px-5 py-4">
                      <button
                        onClick={() => handleSortChange("author-asc")}
                        className="font-extrabold uppercase hover:text-[#004D6E]"
                      >
                        Author
                      </button>
                    </th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleSortChange("borrow-desc")}
                        className="font-extrabold uppercase hover:text-[#004D6E]"
                      >
                        Borrow Count
                      </button>
                    </th>
                    <th className="px-5 py-4">
                      <button
                        onClick={() => handleSortChange("status-asc")}
                        className="font-extrabold uppercase hover:text-[#004D6E]"
                      >
                        Status
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedBooks.map((book, index) => {
                    const statusStyle = getStatusStyle(book.status);

                    return (
                      <tr key={book.id} className="hover:bg-gray-50/70">
                        <td className="px-5 py-4 text-sm font-extrabold text-[#B18400]">
                          {String(startIndex + index + 1).padStart(2, "0")}
                        </td>
                        <td className="px-5 py-4">
                          <BookCover
                            compact
                            gradient={book.cover}
                            title={book.title}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[12px] font-extrabold leading-tight text-gray-900">
                            {book.title}
                          </p>
                          <p className="mt-1 text-[10px] font-semibold text-gray-400">
                            {book.isbn}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-[12px] font-semibold text-gray-700">
                          {book.author}
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleCategoryChange(book.category)}>
                            <CategoryPill>{book.category}</CategoryPill>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center text-[12px] font-extrabold text-gray-900">
                          {formatNumber(book.activeBorrowCount)}
                        </td>
                        <td
                          className={`px-5 py-4 text-[11px] font-extrabold ${statusStyle.text}`}
                        >
                          <button
                            onClick={() => handleStatusChange(book.status)}
                            className="inline-flex items-center gap-2"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                            />
                            {book.status}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedBooks.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-10 text-center text-sm font-bold text-gray-400"
                      >
                        No books match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <p className="text-[11px] font-medium text-gray-400">
                Showing {showingStart}-{showingEnd} of{" "}
                {formatNumber(sortedBooks.length)} books
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                  className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                </button>
                {visiblePages.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`flex h-7 w-7 items-center justify-center rounded text-[11px] font-bold ${
                      pageNumber === currentPage
                        ? "bg-[#004D6E] text-white"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
