import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  Hash,
  ListFilter,
  Loader2,
  MoreVertical,
  RefreshCcw,
  RotateCcw,
  Search,
  Shapes,
  SlidersHorizontal,
  Star,
  TrendingUp,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import ExportPreviewModal, {
  downloadCsvFile,
  printReport,
  defaultSelection,
} from "../../components/Exportpreviewmodal";

const PAGE_SIZE = 4;
const BRAND = "#055E83";
const PERIODS = ["Daily", "Weekly", "Monthly"];

const sortOptions = [
  { value: "borrow-desc", label: "Most Borrowed" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "author-asc", label: "Author A-Z" },
  { value: "status-asc", label: "Status" },
];

// --- API wiring -------------------------------------------------------
// Same assumptions as BorrowReturnReport.jsx: adjust API_BASE / the
// auth-token lookup to match your project's actual api.js / AuthContext
// if they differ from these.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return json;
}

// popular-books takes a from/to window rather than a period bucket, so the
// Daily/Weekly/Monthly tabs are mapped to "borrowed in the last N days".
function getPopularRange(period) {
  const to = new Date();
  const from = new Date();
  if (period === "daily") from.setDate(from.getDate() - 1);
  else if (period === "weekly") from.setDate(from.getDate() - 7);
  else from.setDate(from.getDate() - 30);
  return { from: from.toISOString(), to: to.toISOString() };
}

// The transaction-trend endpoint DOES bucket by period, so this window
// controls how many bars show up (7 days / 5 weeks / 6 months).
function getTrendRange(period) {
  const to = new Date();
  const from = new Date();
  if (period === "daily") from.setDate(from.getDate() - 6);
  else if (period === "weekly") from.setDate(from.getDate() - 7 * 5);
  else from.setMonth(from.getMonth() - 5);
  return { from: from.toISOString(), to: to.toISOString() };
}

function formatBucketLabel(bucket, period) {
  if (period === "daily") {
    const [y, m, d] = bucket.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  if (period === "weekly") {
    const [, week] = bucket.split("-W");
    return `W${week}`;
  }
  const [y, m] = bucket.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

// Mirrors the same thresholds reportsController.bookInventory uses, since
// popular-books doesn't send a computed status itself.
function computeStatus(total, available) {
  if (total === 0 || available === 0) return "OUT OF STOCK";
  if (available / total <= 0.3) return "LOW STOCK";
  if (available < total) return "BORROWED";
  return "AVAILABLE";
}

function hashString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash;
}

// No cover art or category-color columns exist in the schema, so both are
// assigned deterministically from the string itself (stable across reloads).
const COVER_PALETTE = [
  "from-[#1F2E2A] via-[#31413B] to-[#0D1716]",
  "from-[#E9F2F5] via-[#AFC7CE] to-[#28576B]",
  "from-[#0B2028] via-[#104857] to-[#7EA4AA]",
  "from-[#7D3B21] via-[#C77638] to-[#F5C842]",
  "from-[#312E81] via-[#7C3AED] to-[#C4B5FD]",
  "from-[#164E63] via-[#0E7490] to-[#67E8F9]",
  "from-[#78350F] via-[#D97706] to-[#FEF3C7]",
  "from-[#111827] via-[#334155] to-[#CBD5E1]",
];

const CATEGORY_PALETTE = [
  { bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]" },
  { bg: "bg-[#FFEDD5]", text: "text-[#EA580C]" },
  { bg: "bg-[#CFFAFE]", text: "text-[#0E7490]" },
  { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" },
  { bg: "bg-[#EDE9FE]", text: "text-[#7C3AED]" },
  { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]" },
  { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]" },
  { bg: "bg-[#FEF3C7]", text: "text-[#B45309]" },
];

// Maps a { book, timesBorrowed, averageRating, ratingCount } row from
// GET /reports/popular-books into the shape the UI uses. averageRating is
// null when a book has zero source:'book' feedback rows - kept as null
// (not 0) so the UI can distinguish "unrated" from "rated 0".
function normalizeRankedBook(row) {
  const book = row.book || {};
  const total = book.total_copies ?? 0;
  const available = book.available_copies ?? 0;
  return {
    id: `PB-${book.book_id}`,
    title: book.title || "Untitled",
    isbn: book.isbn ? `ISBN: ${book.isbn}` : "ISBN: --",
    author: book.author || "Unknown Author",
    category: book.category || "Uncategorized",
    status: computeStatus(total, available),
    cover: COVER_PALETTE[hashString(book.title || "") % COVER_PALETTE.length],
    activeBorrowCount: row.timesBorrowed || 0,
    averageRating: row.averageRating ?? null,
    ratingCount: row.ratingCount || 0,
  };
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRating(value) {
  return value == null ? "--" : value.toFixed(1);
}

// Column list the export preview modal picks from. Rank/Period aren't real
// book fields - they're stitched onto each row (see `exportRows` below)
// right before the rows are handed to the modal.
const EXPORT_COLUMNS = [
  { key: "rank", label: "Rank" },
  { key: "id", label: "Book ID" },
  { key: "title", label: "Title" },
  { key: "isbn", label: "ISBN" },
  { key: "author", label: "Author" },
  { key: "category", label: "Category" },
  { key: "activeBorrowCount", label: "Borrow Count" },
  {
    key: "averageRating",
    label: "Average Rating",
    csvValue: (book) =>
      book.averageRating != null ? book.averageRating.toFixed(2) : "N/A",
    render: (book) =>
      book.averageRating != null ? book.averageRating.toFixed(2) : "N/A",
  },
  { key: "ratingCount", label: "Rating Count" },
  { key: "status", label: "Status" },
  { key: "period", label: "Period" },
];

function getStatusStyle(status) {
  const styles = {
    AVAILABLE: { backgroundColor: "#DCFCE7", color: "#16A34A" },
    BORROWED: { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
    "LOW STOCK": { backgroundColor: "#FFEDD5", color: "#EA580C" },
    "OUT OF STOCK": { backgroundColor: "#FEE2E2", color: "#DC2626" },
  };

  return styles[status] || { backgroundColor: "#F1F5F9", color: "#64748B" };
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

function CategoryPill({ children }) {
  const palette =
    CATEGORY_PALETTE[hashString(children || "") % CATEGORY_PALETTE.length];
  return (
    <span
      className={`inline-flex min-w-16 justify-center rounded-full px-2 py-1 text-[10px] font-bold ${palette.bg} ${palette.text}`}
    >
      {children}
    </span>
  );
}

// Small "★ 4.3 (12)" style badge. Shows "Not yet rated" state when
// ratingCount is 0 rather than a misleading "0.0".
function RatingBadge({ averageRating, ratingCount, compact = false }) {
  if (!ratingCount) {
    return (
      <span className="text-[10px] font-semibold text-gray-300">
        Not yet rated
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold text-amber-600 ${compact ? "text-[10px]" : "text-xs"}`}
    >
      <Star
        size={compact ? 10 : 12}
        className="fill-amber-500 text-amber-500"
      />
      {formatRating(averageRating)}
      <span className="font-semibold text-gray-400">
        ({formatNumber(ratingCount)})
      </span>
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
  subColor,
}) {
  return (
    <div className="bg-white rounded-xl px-4 py-4 border border-gray-100 shadow-3xs flex flex-col gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-black leading-tight text-gray-900 truncate">
          {value}
        </p>
        {sub && (
          <p
            className="text-[11px] mt-1 font-semibold"
            style={{ color: subColor }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function ExportButton({ icon: Icon, children, variant = "light", ...props }) {
  const className =
    variant === "primary"
      ? "bg-[#055E83] text-white hover:bg-[#044A69] active:scale-[0.98]"
      : "border border-gray-200 bg-white text-gray-600 shadow-3xs hover:bg-gray-50 active:scale-[0.98]";

  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-xs font-bold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${className}`}
      {...props}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

export default function PopularBookReport() {
  const [books, setBooks] = useState([]);
  const [trend, setTrend] = useState([]);
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

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    const periodLower = activePeriod.toLowerCase();

    try {
      const popularRange = getPopularRange(periodLower);
      const trendRange = getTrendRange(periodLower);

      const [popularJson, trendJson] = await Promise.all([
        apiFetch(
          `/reports/popular-books?from=${encodeURIComponent(popularRange.from)}&to=${encodeURIComponent(popularRange.to)}&limit=50`,
        ),
        apiFetch(
          `/reports/transactions?period=${periodLower}&from=${encodeURIComponent(trendRange.from)}&to=${encodeURIComponent(trendRange.to)}`,
        ),
      ]);

      setBooks((popularJson.data || []).map(normalizeRankedBook));
      setTrend(
        (trendJson.data?.rows || []).map((r) => ({
          label: formatBucketLabel(r.bucket, periodLower),
          value: r.borrows,
        })),
      );
    } catch (err) {
      setError(err.message || "Unable to load popular book report.");
    } finally {
      setLoading(false);
    }
  }, [activePeriod]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const categories = useMemo(
    () =>
      Array.from(new Set(books.map((book) => book.category))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [books],
  );

  const statuses = useMemo(
    () =>
      Array.from(new Set(books.map((book) => book.status))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [books],
  );

  const filteredBooks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
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
  }, [categoryFilter, books, searchTerm, statusFilter]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((first, second) => {
      if (sortBy === "title-asc")
        return first.title.localeCompare(second.title);
      if (sortBy === "author-asc")
        return first.author.localeCompare(second.author);
      if (sortBy === "status-asc")
        return first.status.localeCompare(second.status);
      if (sortBy === "rating-desc") {
        // Unrated books (averageRating: null) always sort after rated ones,
        // regardless of direction, then fall back to borrow count.
        const firstRating = first.averageRating ?? -1;
        const secondRating = second.averageRating ?? -1;
        if (secondRating !== firstRating) return secondRating - firstRating;
        return second.activeBorrowCount - first.activeBorrowCount;
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
  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  const rangeLabel =
    activePeriod === "Daily"
      ? "Last 24 hours"
      : activePeriod === "Weekly"
        ? "Last 7 days"
        : "Last 30 days";

  const summary = useMemo(() => {
    const totalBorrows = books.reduce(
      (sum, book) => sum + book.activeBorrowCount,
      0,
    );
    const mostPopular = books[0]?.title || "-";
    const categoryCounts = books.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1;
      return acc;
    }, {});
    const topCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    const ratedBooks = books.filter((book) => book.ratingCount > 0);
    const overallAverageRating = ratedBooks.length
      ? ratedBooks.reduce((sum, book) => sum + book.averageRating, 0) /
        ratedBooks.length
      : null;

    return {
      totalBorrows,
      mostPopular,
      topCategory,
      booksTracked: books.length,
      overallAverageRating,
      ratedBooksCount: ratedBooks.length,
    };
  }, [books]);

  const trendMax = Math.max(...trend.map((item) => item.value), 1);
  const peakTrend = trend.reduce(
    (peak, item) => (item.value > peak.value ? item : peak),
    { label: "-", value: 0 },
  );
  const averageTrend =
    trend.length === 0
      ? 0
      : Math.round(
          trend.reduce((total, item) => total + item.value, 0) / trend.length,
        );

  const trendingPicks = useMemo(
    () => [...books].sort((a, b) => b.activeBorrowCount - a.activeBorrowCount),
    [books],
  );
  const visiblePicks = showAllPicks ? trendingPicks : trendingPicks.slice(0, 5);

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
    const currentIndex = sortOptions.findIndex(
      (option) => option.value === sortBy,
    );
    const nextOption = sortOptions[(currentIndex + 1) % sortOptions.length];
    handleSortChange(nextOption.value);
    showMessage(`Sorted by ${nextOption.label}`);
  }

  // Rank and Period aren't stored on each book - they're derived from sort
  // order / the active period tab, so they're stitched on here, once, right
  // before rows reach the export preview modal.
  const exportRows = useMemo(
    () =>
      sortedBooks.map((book, index) => ({
        ...book,
        rank: index + 1,
        period: activePeriod,
      })),
    [sortedBooks, activePeriod],
  );

  const [exportModal, setExportModal] = useState(null); // null | { type: 'csv' | 'pdf' }
  const [exportSelection, setExportSelection] = useState(() =>
    defaultSelection(EXPORT_COLUMNS),
  );

  const toggleExportColumn = (key) =>
    setExportSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  const setAllExportColumns = (checked) =>
    setExportSelection(
      EXPORT_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: checked }), {}),
    );

  function confirmExport() {
    if (!exportModal) return;
    if (exportModal.type === "csv") {
      downloadCsvFile(
        exportRows,
        EXPORT_COLUMNS,
        exportSelection,
        `popular-book-report-${activePeriod.toLowerCase()}.csv`,
      );
      showMessage("Report exported");
    } else {
      printReport(exportRows, EXPORT_COLUMNS, exportSelection, {
        title: `Popular Book Report - ${activePeriod}`,
        brandColor: "#055E83",
      });
    }
    setExportModal(null);
  }

  function selectPick(book) {
    handleSearchChange(book.title);
    setCategoryFilter("All");
    setStatusFilter("All");
    setShowAllPicks(false);
    setPage(1);
  }

  return (
    <div className="flex-1 bg-[#E9EEF4]">
      <Navbar
        title="Popular Book Report"
        breadcrumb="View and analyze popular books in the library"
        onBack={() => window.history.back()}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search popular books..."
      />

      <div className="px-6 py-5 space-y-5">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-[#055E83] px-4 py-3 text-sm font-bold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            {toast}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-h-9 items-center gap-2">
            <button
              type="button"
              onClick={loadReport}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-bold text-gray-600 shadow-3xs transition hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCcw size={14} />
              )}
              {loading ? "Loading..." : "Refresh"}
            </button>
            {error && (
              <button
                onClick={loadReport}
                className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 ring-1 ring-red-100"
              >
                {error} - Retry
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-lg bg-white p-1 shadow-3xs ring-1 ring-gray-100">
              {PERIODS.map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`rounded-md px-4 py-2 text-[11px] font-bold transition ${
                    period === activePeriod
                      ? "bg-[#055E83] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            {/* Two entry points now, matching the two branches confirmExport
                already implements below. Previously only the CSV branch was
                ever reachable, since this was the only export button. */}
            <ExportButton
              icon={Download}
              onClick={() => setExportModal({ type: "csv" })}
              disabled={sortedBooks.length === 0}
            >
              Export Excel
            </ExportButton>
            <ExportButton
              icon={FileDown}
              variant="primary"
              onClick={() => setExportModal({ type: "pdf" })}
              disabled={sortedBooks.length === 0}
            >
              Export PDF
            </ExportButton>
          </div>
        </div>

        {/* METRIC CARDS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Total Borrows",
              value: formatNumber(summary.totalBorrows),
              icon: BookOpen,
              iconBg: "#DBEAFE",
              iconColor: "#2563EB",
              sub: rangeLabel,
              subColor: "#71717A",
            },
            {
              label: "Most Popular",
              value: summary.mostPopular,
              icon: TrendingUp,
              iconBg: "#FFEDD5",
              iconColor: "#EA580C",
              sub: "Top performer",
              subColor: "#71717A",
            },
            {
              label: "Books Tracked",
              value: formatNumber(summary.booksTracked),
              icon: Hash,
              iconBg: "#EDE9FE",
              iconColor: "#7C3AED",
              sub: "Ranked entries",
              subColor: "#71717A",
            },
            {
              label: "Top Category",
              value: summary.topCategory,
              icon: Shapes,
              iconBg: "#CCFBF1",
              iconColor: "#0D9488",
            },
            {
              label: "Avg. Rating",
              value:
                summary.overallAverageRating != null
                  ? summary.overallAverageRating.toFixed(1)
                  : "--",
              icon: Star,
              iconBg: "#FEF3C7",
              iconColor: "#B45309",
              sub: summary.ratedBooksCount
                ? `Across ${formatNumber(summary.ratedBooksCount)} rated books`
                : "No ratings yet",
              subColor: "#71717A",
            },
          ].map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
          {/* BORROWING TRENDS */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-3xs p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">
                Borrowing Trends
              </h3>
              <button
                onClick={() => setShowTrendDetails((current) => !current)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                title="Toggle trend details"
              >
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="mt-5 h-[238px]">
              <div className="flex h-[200px] items-end gap-4 border-b border-gray-100 px-3">
                {trend.map((item, index) => {
                  const height = Math.max(18, (item.value / trendMax) * 170);
                  const isPeak =
                    item.value === peakTrend.value && item.value > 0;

                  return (
                    <div
                      key={`${item.label}-${index}`}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      {isPeak && (
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-[#C99A00]">
                            Peak
                          </p>
                          <p className="text-[10px] font-bold text-[#C99A00]">
                            {formatNumber(item.value)}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() =>
                          showMessage(
                            `${item.label}: ${formatNumber(item.value)} borrows`,
                          )
                        }
                        className={`w-full max-w-12 rounded-t transition hover:opacity-80 ${
                          isPeak ? "bg-[#F5C842]" : "bg-[#055E83]"
                        }`}
                        style={{ height }}
                        title={`${item.label}: ${formatNumber(item.value)} borrows`}
                      />
                    </div>
                  );
                })}
                {!trend.length && (
                  <p className="w-full pb-4 text-center text-xs font-semibold text-gray-400">
                    {loading
                      ? "Loading trend..."
                      : "No borrow activity in this window"}
                  </p>
                )}
              </div>
              <div
                className="mt-3 grid text-center text-[10px] font-medium text-gray-500"
                style={{
                  gridTemplateColumns: `repeat(${trend.length || 1}, minmax(0, 1fr))`,
                }}
              >
                {trend.map((item, index) => (
                  <span
                    key={`${item.label}-${index}`}
                    className={
                      item.value === peakTrend.value && item.value > 0
                        ? "font-bold text-gray-900"
                        : ""
                    }
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {showTrendDetails && (
              <div className="mt-3 grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3 text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Period
                  </p>
                  <p className="text-sm font-bold text-[#055E83]">
                    {activePeriod}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Peak
                  </p>
                  <p className="text-sm font-bold text-[#055E83]">
                    {peakTrend.label}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Average
                  </p>
                  <p className="text-sm font-bold text-[#055E83]">
                    {formatNumber(averageTrend)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* TRENDING PICKS */}
          <aside className="bg-white rounded-xl border border-gray-100 shadow-3xs p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Trending Picks
                </h3>
                <p className="text-[10px] font-semibold text-gray-400">
                  Most borrowed this period
                </p>
              </div>
              {trendingPicks.length > 5 && (
                <button
                  onClick={() => setShowAllPicks((current) => !current)}
                  className="text-[10px] font-bold text-[#055E83] hover:underline"
                >
                  {showAllPicks ? "View Less" : "View All"}
                </button>
              )}
            </div>

            <div className="max-h-[298px] space-y-4 overflow-y-auto pr-1">
              {visiblePicks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => selectPick(book)}
                  className="flex w-full gap-4 rounded-lg p-1 text-left transition hover:bg-gray-50"
                >
                  <BookCover gradient={book.cover} title={book.title} />
                  <div className="min-w-0 pt-1">
                    <h4 className="truncate text-[12px] font-bold leading-tight text-gray-900">
                      {book.title}
                    </h4>
                    <p className="truncate text-[10px] font-semibold text-gray-500">
                      {book.author}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-[10px] font-bold text-[#055E83]">
                        {formatNumber(book.activeBorrowCount)} borrows
                      </p>
                      <span className="text-gray-300">·</span>
                      <RatingBadge
                        averageRating={book.averageRating}
                        ratingCount={book.ratingCount}
                        compact
                      />
                    </div>
                  </div>
                </button>
              ))}
              {!visiblePicks.length && (
                <p className="px-2 py-4 text-center text-xs font-semibold text-gray-400">
                  {loading ? "Loading..." : "No borrow activity in this window"}
                </p>
              )}
            </div>
          </aside>
        </section>

        {/* RANKED BOOKS TABLE */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Ranked Books</h3>
              <p className="mt-1 text-xs font-semibold text-gray-400">
                {hasActiveFilters
                  ? `${formatNumber(sortedBooks.length)} matching books`
                  : "Borrow ranking across the library"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((current) => !current)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-gray-500 transition hover:bg-gray-50 ${
                  showFilters
                    ? "border-[#055E83] bg-[#E6F1FB] text-[#055E83]"
                    : "border-gray-200"
                }`}
                title="Filters"
              >
                <ListFilter size={15} />
              </button>
              <button
                onClick={cycleSortMode}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
                title="Cycle sorting"
              >
                <SlidersHorizontal size={15} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
              <label className="relative block">
                <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                  Search
                </span>
                <Search
                  size={15}
                  className="pointer-events-none absolute bottom-3 left-3 text-gray-400"
                />
                <input
                  value={searchTerm}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Title, author, ISBN..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm font-semibold text-gray-700 shadow-3xs outline-none focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                  Category
                </span>
                <select
                  value={categoryFilter}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-3xs outline-none focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
                >
                  <option value="All">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                  Status
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) => handleStatusChange(event.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-3xs outline-none focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
                >
                  <option value="All">All Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                  Sort
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => handleSortChange(event.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-3xs outline-none focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <ExportButton icon={RotateCcw} onClick={clearFilters}>
                Reset filters
              </ExportButton>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left">
              <thead className="sticky top-0 z-[1] bg-gray-50/90 backdrop-blur text-[10px] uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Rank</th>
                  <th className="px-5 py-3.5 font-bold">Book Cover</th>
                  <th className="px-5 py-3.5 font-bold">
                    <button
                      onClick={() => handleSortChange("title-asc")}
                      className="uppercase hover:text-[#055E83]"
                    >
                      Book Title
                    </button>
                  </th>
                  <th className="px-5 py-3.5 font-bold">
                    <button
                      onClick={() => handleSortChange("author-asc")}
                      className="uppercase hover:text-[#055E83]"
                    >
                      Author
                    </button>
                  </th>
                  <th className="px-5 py-3.5 font-bold">Category</th>
                  <th className="px-5 py-3.5 text-center font-bold">
                    <button
                      onClick={() => handleSortChange("borrow-desc")}
                      className="uppercase hover:text-[#055E83]"
                    >
                      Borrow Count
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-center font-bold">
                    <button
                      onClick={() => handleSortChange("rating-desc")}
                      className="uppercase hover:text-[#055E83]"
                    >
                      Rating
                    </button>
                  </th>
                  <th className="px-5 py-3.5 font-bold">
                    <button
                      onClick={() => handleSortChange("status-asc")}
                      className="uppercase hover:text-[#055E83]"
                    >
                      Status
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading && !books.length && (
                  <tr>
                    <td colSpan="8" className="px-5 py-16 text-center">
                      <Loader2
                        size={20}
                        className="mx-auto animate-spin text-[#055E83]"
                      />
                      <p className="mt-2 text-xs font-bold text-gray-400">
                        Loading popular books...
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginatedBooks.map((book, index) => {
                    const statusStyle = getStatusStyle(book.status);

                    return (
                      <tr
                        key={book.id}
                        className="transition-colors hover:bg-gray-50/80"
                      >
                        <td className="px-5 py-4 text-sm font-black text-[#B18400]">
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
                          <p className="text-[12px] font-bold leading-tight text-gray-900">
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
                          <button
                            onClick={() => handleCategoryChange(book.category)}
                          >
                            <CategoryPill>{book.category}</CategoryPill>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center text-[12px] font-black text-gray-900">
                          {formatNumber(book.activeBorrowCount)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <RatingBadge
                            averageRating={book.averageRating}
                            ratingCount={book.ratingCount}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleStatusChange(book.status)}
                            className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                            style={statusStyle}
                          >
                            {book.status}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && paginatedBooks.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-5 py-16 text-center">
                      <p className="text-sm font-bold text-gray-500">
                        No books match the current filters
                      </p>
                      <p className="mt-1 text-xs font-medium text-gray-400">
                        Try adjusting your filters or search terms
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-gray-500">
              Showing {showingStart}-{showingEnd} of{" "}
              {formatNumber(sortedBooks.length)} books
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                    pageNumber === currentPage
                      ? "bg-[#055E83] text-white"
                      : "text-gray-600 hover:bg-gray-100"
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
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {exportModal && (
        <ExportPreviewModal
          type={exportModal.type}
          rows={exportRows}
          columns={EXPORT_COLUMNS}
          selection={exportSelection}
          onToggleColumn={toggleExportColumn}
          onSelectAll={setAllExportColumns}
          onClose={() => setExportModal(null)}
          onConfirm={confirmExport}
          getRowKey={(row) => row.id}
          brandColor="#055E83"
        />
      )}
    </div>
  );
}