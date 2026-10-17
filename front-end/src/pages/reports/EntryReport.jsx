import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  FileDown,
  FileSpreadsheet,
  Loader2,
  PieChart,
  RefreshCcw,
  Search,
  TrendingUp,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";
import ExportPreviewModal, {
  downloadCsvFile,
  printReport,
  defaultSelection,
} from "../../components/Exportpreviewmodal";

const PAGE_SIZE = 5;
const BRAND = "#055E83";
const PURPOSE_COLORS = [
  "#055E83",
  "#9A7A00",
  "#39A7D7",
  "#B7CBD6",
  "#C9CDD7",
  "#7C5CBF",
  "#C2547A",
];

const AVATAR_PALETTE = [
  { bg: "#DBEAFE", color: "#2563EB" },
  { bg: "#FFEDD5", color: "#EA580C" },
  { bg: "#F1F5F9", color: "#64748B" },
  { bg: "#CFFAFE", color: "#0E7490" },
  { bg: "#DCFCE7", color: "#16A34A" },
  { bg: "#FFE4E6", color: "#E11D48" },
  { bg: "#E0E7FF", color: "#4F46E5" },
  { bg: "#FEF3C7", color: "#B45309" },
];

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function avatarStyleFor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatDateTime(value) {
  if (!value) return { date: "--", time: "" };
  const date = new Date(value);
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

// Column list the export preview modal picks from - labels match the old
// CSV headers 1:1, so the default (all-checked) export is unchanged.
const EXPORT_COLUMNS = [
  { key: "entry_id", label: "Entry ID" },
  { key: "attendee_name", label: "Attendee Name" },
  { key: "age", label: "Age" },
  { key: "address", label: "Address" },
  { key: "phone_number", label: "Phone Number" },
  { key: "purpose", label: "Purpose" },
  { key: "entry_time", label: "Entry Time" },
];

function buildDonutGradient(items) {
  let cursor = 0;
  return `conic-gradient(${items
    .map((item) => {
      const start = cursor;
      cursor += item.percent;
      return `${item.color} ${start}% ${cursor}%`;
    })
    .join(", ")})`;
}

// purpose is optional on library_entries, so entries without one are
// grouped under "Unspecified" rather than dropped.
function computePurposeDistribution(entries) {
  if (!entries || !entries.length) return [];
  const counts = new Map();
  entries.forEach((e) => {
    const key = e.purpose || "Unspecified";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count], index) => ({
      label,
      count,
      percent: Number(((count / entries.length) * 100).toFixed(1)),
      color: PURPOSE_COLORS[index % PURPOSE_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);
}

function MetricCard({ card }) {
  const Icon = card.icon;
  return (
    <div className="bg-white rounded-xl px-4 py-4 border border-gray-300 shadow-3xs flex flex-col gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: card.iconBg, color: card.iconColor }}
      >
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 mb-1">
          {card.title}
        </p>
        <p className="text-xl font-black leading-tight text-gray-900 truncate">
          {card.value}
        </p>
        {card.sub && (
          <p
            className="text-[11px] mt-1 font-semibold"
            style={{ color: card.subColor }}
          >
            {card.sub}
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
      : "border border-gray-300 bg-white text-gray-600 shadow-3xs hover:bg-gray-50 active:scale-[0.98]";

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

function EntryTrendChart({ byDay, loading, todayKey }) {
  const maxValue = Math.max(1, ...byDay.map((d) => d.count));

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-3xs p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#055E83]">
          <TrendingUp size={18} />
          <h3 className="text-sm font-bold">Daily Entries</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-400">
          {byDay.length} day(s)
        </span>
      </div>

      {loading ? (
        <div className="mt-5 flex h-28 items-center justify-center text-xs font-semibold text-gray-400">
          Loading trend...
        </div>
      ) : byDay.length === 0 ? (
        <div className="mt-5 flex h-28 items-center justify-center text-xs font-semibold text-gray-400">
          No entries in this range.
        </div>
      ) : (
        <div className="mt-5 flex h-28 items-end gap-3">
          {byDay.map((d) => (
            <div
              key={d.day}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              title={`${d.day}: ${d.count}`}
            >
              <div
                className={`w-full rounded-t-md ${d.day === todayKey ? "bg-[#F5C842]" : "bg-[#BFDCE8]"}`}
                style={{
                  height: `${Math.max(6, (d.count / maxValue) * 100)}%`,
                }}
              />
              <span className="text-[10px] font-bold text-gray-400">
                {d.day.slice(5)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PurposeDistribution({ items, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-3xs p-5">
      <div className="flex items-center gap-2 text-[#055E83]">
        <PieChart size={18} />
        <h3 className="text-sm font-bold">Visit Purpose Distribution</h3>
      </div>

      {loading ? (
        <div className="mt-5 flex h-28 items-center justify-center text-xs font-semibold text-gray-400">
          Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5 flex h-28 items-center justify-center text-xs font-semibold text-gray-400">
          No purpose data yet.
        </div>
      ) : (
        <div className="mt-5 grid items-center gap-6 md:grid-cols-[150px_minmax(0,1fr)]">
          <div
            className="mx-auto flex h-32 w-32 items-center justify-center rounded-full"
            style={{ background: buildDonutGradient(items) }}
          >
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-xl font-black leading-tight text-gray-900">
                {items.reduce((s, i) => s + i.count, 0)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Total
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 text-xs font-semibold"
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 flex-1 truncate text-gray-600">
                  {item.label}
                </span>
                <span className="font-black text-gray-900">
                  {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EntryReport() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const [entriesRows, setEntriesRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const showMessage = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchEntries();
  }, [search, startDate, endDate, currentPage]);

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", currentPage);
      params.append("limit", PAGE_SIZE);

      const response = await api.get(`/library-entries?${params.toString()}`);
      if (response.data?.success) {
        setEntriesRows(response.data.data);
        const meta = response.data.meta || {};
        setTotalItems(
          meta.totalItems ?? meta.total ?? response.data.data.length,
        );
      }
    } catch (err) {
      console.error("Failed to load entry records:", err);
      setError("Failed to load entry records");
    } finally {
      setLoading(false);
    }
  };

  // reportsController.entries uses from/to (not startDate/endDate) as
  // its query params, and caps results at 1000 rows.
  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("from", startDate);
      if (endDate) params.append("to", endDate);

      const response = await api.get(`/reports/entries?${params.toString()}`);
      if (response.data?.success) setSummary(response.data.data);
    } catch (err) {
      console.error("Failed to load entry summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const refreshAll = () => {
    fetchEntries();
    fetchSummary();
  };

  // Export preview modal: null when closed, otherwise { type: 'csv' | 'pdf', rows }.
  // The on-screen table is server-paginated, so this fetches the full
  // filtered set (up to 1000 rows) before opening the column picker.
  const [exportModal, setExportModal] = useState(null);
  const [exportPreparing, setExportPreparing] = useState(false);
  const [exportSelection, setExportSelection] = useState(() =>
    defaultSelection(EXPORT_COLUMNS),
  );

  const openExportPreview = async (type) => {
    try {
      setExportPreparing(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("limit", "1000");

      const response = await api.get(`/library-entries?${params.toString()}`);
      if (response.data?.success)
        setExportModal({ type, rows: response.data.data });
    } catch (err) {
      console.error("Failed to prepare export preview:", err);
      alert("Failed to prepare the export preview. Please try again.");
    } finally {
      setExportPreparing(false);
    }
  };

  const toggleExportColumn = (key) =>
    setExportSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  const setAllExportColumns = (checked) =>
    setExportSelection(
      EXPORT_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: checked }), {}),
    );

  const confirmExport = () => {
    if (!exportModal) return;
    if (exportModal.type === "csv") {
      downloadCsvFile(
        exportModal.rows,
        EXPORT_COLUMNS,
        exportSelection,
        "entry-report.csv",
      );
      showMessage("Entry report exported");
    } else {
      printReport(exportModal.rows, EXPORT_COLUMNS, exportSelection, {
        title: "Entry Report",
        brandColor: BRAND,
      });
    }
    setExportModal(null);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    showMessage("Filters reset");
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const showingStart =
    entriesRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, totalItems);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayCount =
    summary?.byDay?.find((d) => d.day === todayKey)?.count ?? 0;
  const purposeItems = summary
    ? computePurposeDistribution(summary.entries)
    : [];
  const topPurpose = purposeItems[0];

  const metricCards =
    summaryLoading || !summary
      ? []
      : [
          {
            title: "Total Entries",
            value: formatNumber(summary.totalEntries),
            sub: startDate || endDate ? "In selected range" : "Most recent 1,000",
            subColor: "#71717A",
            icon: Users,
            iconBg: "#DBEAFE",
            iconColor: "#2563EB",
          },
          {
            title: "Today's Entries",
            value: formatNumber(todayCount),
            sub: "Today",
            subColor: "#71717A",
            icon: CalendarDays,
            iconBg: "#FFEDD5",
            iconColor: "#EA580C",
          },
          {
            title: "Average Age",
            value: summary.averageAge || 0,
            sub: "Across all visitors",
            subColor: "#71717A",
            icon: UserRoundCheck,
            iconBg: "#CFFAFE",
            iconColor: "#0E7490",
          },
          {
            title: "Top Purpose",
            value: topPurpose ? topPurpose.label : "--",
            sub: topPurpose ? `${topPurpose.percent}% of visits` : "No data yet",
            subColor: topPurpose ? "#16A34A" : "#71717A",
            icon: DoorOpen,
            iconBg: "#DCFCE7",
            iconColor: "#16A34A",
          },
        ];

  return (
    <div className="flex-1 bg-[#E9EEF4]">
      <Navbar
        title="Entry Report"
        breadcrumb="View and analyze library entry records"
        onBack={() => window.history.back()}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search attendee name..."
      />

      <div className="px-6 py-5 space-y-5">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-[#055E83] px-4 py-3 text-sm font-bold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            {toast}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
            <span>{error}</span>
            <button
              type="button"
              onClick={refreshAll}
              className="rounded-md bg-red-600 px-3 py-1.5 text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryLoading || !summary ? (
            <div className="col-span-full rounded-xl border border-gray-300 bg-white p-4 text-xs font-semibold text-gray-400 shadow-3xs">
              Loading summary...
            </div>
          ) : (
            metricCards.map((card) => (
              <MetricCard key={card.title} card={card} />
            ))
          )}
        </div>

        {/* REFRESH ROW */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-[11px] font-bold text-gray-600 shadow-3xs transition hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCcw size={14} />
            )}
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* FILTERS + EXPORT ROW */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="relative block">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Filter by attendee name..."
                className="h-10 w-full min-w-56 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs font-semibold text-gray-600 shadow-3xs outline-none transition focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
              />
            </label>
            <label className="relative block">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full min-w-40 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs font-semibold text-gray-600 shadow-3xs outline-none transition focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
              />
            </label>
            <label className="relative block">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full min-w-40 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs font-semibold text-gray-600 shadow-3xs outline-none transition focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <ExportButton icon={RefreshCcw} onClick={resetFilters}>
              Reset
            </ExportButton>
            <ExportButton
              icon={FileDown}
              onClick={() => openExportPreview("pdf")}
              disabled={exportPreparing}
            >
              Export PDF
            </ExportButton>
            <ExportButton
              icon={FileSpreadsheet}
              variant="primary"
              onClick={() => openExportPreview("csv")}
              disabled={exportPreparing}
            >
              Excel
            </ExportButton>
          </div>
        </div>

        {/* ENTRY TABLE */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-3xs overflow-hidden">
          <div className="border-b border-gray-300 px-5 py-4">
            <h3 className="text-sm font-bold text-gray-800">Entry Log</h3>
            <p className="mt-1 text-xs font-semibold text-gray-400">
              Recorded library visits and their stated purpose
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="sticky top-0 z-[1] bg-gray-50/90 backdrop-blur text-[10px] uppercase tracking-wider text-gray-400">
                <tr>
                  {["Attendee", "Age", "Contact", "Purpose", "Entry Time"].map(
                    (h) => (
                      <th key={h} className="px-5 py-3.5 font-bold">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading && (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <Loader2
                        size={20}
                        className="mx-auto animate-spin text-[#055E83]"
                      />
                      <p className="mt-2 text-xs font-bold text-gray-400">
                        Loading entries...
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  entriesRows.map((entry) => {
                    const dt = formatDateTime(entry.entry_time);
                    const avatar = avatarStyleFor(entry.attendee_name);
                    return (
                      <tr
                        key={entry.entry_id}
                        className="transition-colors hover:bg-gray-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                              style={{
                                backgroundColor: avatar.bg,
                                color: avatar.color,
                              }}
                            >
                              {getInitials(entry.attendee_name)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-bold leading-tight text-gray-800">
                                {entry.attendee_name}
                              </span>
                              <span className="mt-0.5 block text-[11px] font-semibold text-gray-400">
                                Entry ID: #{entry.entry_id}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-700">
                          {entry.age}
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-700">
                          {entry.phone_number || entry.address || "--"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                            {entry.purpose || "Unspecified"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-700">
                          {dt.date} · {dt.time}
                        </td>
                      </tr>
                    );
                  })}

                {!loading && !entriesRows.length && (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <p className="text-sm font-bold text-gray-500">
                        No entry records found
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

          <div className="flex flex-col gap-3 border-t border-gray-300 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-gray-500">
              Showing {showingStart}-{showingEnd} of {formatNumber(totalItems)}{" "}
              records
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                      safePage === page
                        ? "bg-[#055E83] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* TREND + PURPOSE */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <EntryTrendChart
            byDay={summary?.byDay || []}
            loading={summaryLoading}
            todayKey={todayKey}
          />
          <PurposeDistribution items={purposeItems} loading={summaryLoading} />
        </div>
      </div>

      {exportModal && (
        <ExportPreviewModal
          type={exportModal.type}
          rows={exportModal.rows}
          columns={EXPORT_COLUMNS}
          selection={exportSelection}
          onToggleColumn={toggleExportColumn}
          onSelectAll={setAllExportColumns}
          onClose={() => setExportModal(null)}
          onConfirm={confirmExport}
          getRowKey={(row) => row.entry_id}
          brandColor={BRAND}
        />
      )}
    </div>
  );
}