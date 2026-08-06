import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileDown,
  FileSpreadsheet,
  Loader2,
  MoreVertical,
  RefreshCcw,
  Search,
  TrendingUp,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const PAGE_SIZE = 4;
const BRAND = "#055E83";
// Real transaction dates won't fall inside a fixed historical window, so the
// date filter starts empty (= "no date filter") instead of a hardcoded range.
const DEFAULT_DATE_RANGE = "";
const tabs = ["All", "Borrowing", "Returns", "Overdue"];

// --- API wiring -------------------------------------------------------
// Adjust API_BASE / the auth-token lookup to match your project's actual
// api.js / AuthContext if they differ from these assumptions.
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
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function formatDate(value) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// Maps a borrow_records API row (see borrowRecordsController's `serialize`)
// into the shape the existing UI expects. `isOverdue` comes from the API
// (status is still 'Borrowed' in the DB until refresh-overdue runs), so we
// show it as effectively Overdue here without needing that extra call.
function normalizeRecord(record) {
  const memberName = record.members?.full_name || "Unknown Member";
  const effectiveStatus =
    record.isOverdue && record.status === "Borrowed" ? "Overdue" : record.status;
  const avatar = avatarStyleFor(memberName);
  return {
    id: `BR-${record.borrow_id}`,
    rawId: record.borrow_id,
    borrower: memberName,
    uid: `#${record.member_id}`,
    initials: getInitials(memberName),
    avatarBg: avatar.bg,
    avatarColor: avatar.color,
    book: record.books?.title || "Unknown Book",
    status: effectiveStatus,
    borrowDate: formatDate(record.borrow_date),
    returnDate: formatDate(record.return_date),
    dueDate: formatDate(record.due_date),
    borrowDateRaw: record.borrow_date,
    dueDateRaw: record.due_date,
  };
}

const statusBadgeStyle = {
  Overdue: { backgroundColor: "#FEE2E2", color: "#DC2626" },
  Returned: { backgroundColor: "#DCFCE7", color: "#16A34A" },
  Borrowed: { backgroundColor: "#DBEAFE", color: "#2563EB" },
};

const escapeCsvValue = (val) => `"${String(val).replace(/"/g, '""')}"`;

function downloadBorrowReturnCsv(rows) {
  const headers = ["Record ID", "Borrower", "User ID", "Book Title", "Status", "Borrow Date", "Return Date", "Due Date"];
  const csvRows = rows.map((r) => [r.id, r.borrower, r.uid, r.book, r.status, r.borrowDate, r.returnDate, r.dueDate]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "borrow-return-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

const parseReportDate = (value) => {
  if (!value || value === "--") return null;
  const parsed = new Date(`${value} 00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toDayTime = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const parseDateRange = (value) => {
  const dateRange = value.trim();
  if (!dateRange) return null;

  const [startText, endText] = dateRange.split(/\s+-\s+/);
  const startDate = parseReportDate(startText);
  const endDate = parseReportDate(endText || startText);

  if (!startDate || !endDate) return null;

  const start = toDayTime(startDate);
  const end = toDayTime(endDate);

  return { start: Math.min(start, end), end: Math.max(start, end) };
};

const isRecordInDateRange = (record, range) => {
  if (!range) return true;

  return [record.borrowDate, record.returnDate]
    .map(parseReportDate)
    .filter(Boolean)
    .some((date) => {
      const recordDay = toDayTime(date);
      return recordDay >= range.start && recordDay <= range.end;
    });
};

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun .. 6 = Sat
  const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function MetricCard({ title, value, sub, subColor, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl px-4 py-4 border border-gray-100 shadow-3xs flex flex-col gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg, color: iconColor }}>
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 mb-1">{title}</p>
        <p className="text-xl font-black leading-tight text-gray-900">{value}</p>
        <p className="text-[11px] mt-1 font-semibold" style={{ color: subColor }}>{sub}</p>
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

export default function BorrowReturnReport() {
  const [filters, setFilters] = useState({ header: "", table: "", tab: "All", date: DEFAULT_DATE_RANGE });
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateFilter = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setCurrentPage(1);
  };
  const showMessage = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // limit is set high because this report filters/paginates client-side,
      // same as the rest of this component's existing filter logic.
      const json = await apiFetch("/borrow-records?limit=1000&page=1");
      setRecords((json.data || []).map(normalizeRecord));
    } catch (err) {
      setError(err.message || "Failed to load borrow records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filteredRecords = useMemo(() => {
    const hQ = filters.header.trim().toLowerCase();
    const tQ = filters.table.trim().toLowerCase();
    const dateRange = parseDateRange(filters.date);

    return records.filter((r) => {
      const txt = `${r.id} ${r.borrower} ${r.uid} ${r.book} ${r.status} ${r.borrowDate} ${r.returnDate} ${r.dueDate}`.toLowerCase();
      const matchesSearch = (!hQ || txt.includes(hQ)) && (!tQ || txt.includes(tQ));
      const matchesTab =
        filters.tab === "All" ||
        (filters.tab === "Borrowing" && r.status === "Borrowed") ||
        (filters.tab === "Returns" && r.status === "Returned") ||
        (filters.tab === "Overdue" && r.status === "Overdue");

      return matchesSearch && matchesTab && isRecordInDateRange(r, dateRange);
    });
  }, [filters, records]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleRecords = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredRecords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredRecords.length);

  const todayStr = useMemo(() => formatDate(new Date()), []);
  const metrics = useMemo(() => {
    const borrowedToday = records.filter((r) => r.borrowDate === todayStr).length;
    const returnedToday = records.filter((r) => r.returnDate === todayStr).length;
    const overdueCount = records.filter((r) => r.status === "Overdue").length;
    return { borrowedToday, returnedToday, overdueCount };
  }, [records, todayStr]);

  const weeklyTrend = useMemo(() => {
    const monday = startOfWeek(new Date());
    const buckets = Array(7).fill(0);
    records.forEach((r) => {
      if (!r.borrowDateRaw) return;
      const d = new Date(r.borrowDateRaw);
      const diffDays = Math.floor((toDayTime(d) - monday.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays < 7) buckets[diffDays] += 1;
    });
    return buckets;
  }, [records]);
  const todayIndex = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  }, []);
  const maxTrendValue = Math.max(1, ...weeklyTrend);

  const overdueWatch = useMemo(
    () =>
      records
        .filter((r) => r.status === "Overdue")
        .sort((a, b) => new Date(a.dueDateRaw) - new Date(b.dueDateRaw))
        .slice(0, 6),
    [records]
  );

  return (
    <div className="flex-1 bg-[#E9EEF4]">
        <Navbar
          title="Borrow/Return Reports"
          breadcrumb="View and analyze borrow and return records"
          onBack={() => window.history.back()}
          searchValue={filters.header}
          onSearchChange={(v) => updateFilter("header", v)}
          searchPlaceholder="Search books, member..."
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
              <button type="button" onClick={loadRecords} className="rounded-md bg-red-600 px-3 py-1.5 text-white">
                Retry
              </button>
            </div>
          )}

          {/* TABS */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={loadRecords}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-bold text-gray-600 shadow-3xs transition hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
              {loading ? "Loading..." : "Refresh"}
            </button>

            <div className="flex overflow-hidden rounded-lg bg-white p-1 shadow-3xs ring-1 ring-gray-100">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => updateFilter("tab", tab)}
                  className={`rounded-md px-4 py-2 text-[11px] font-bold transition ${
                    filters.tab === tab ? "bg-[#055E83] text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* FILTERS + EXPORT ROW */}
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="relative block">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={filters.table}
                  onChange={(e) => updateFilter("table", e.target.value)}
                  placeholder="Filter by name or book title..."
                  className="h-10 w-full min-w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs font-semibold text-gray-600 shadow-3xs outline-none transition focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
                />
              </label>
              <label className="relative block">
                <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={filters.date}
                  onChange={(e) => updateFilter("date", e.target.value)}
                  placeholder="e.g. Jul 01, 2026 - Jul 31, 2026"
                  className="h-10 w-full min-w-56 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs font-semibold text-gray-600 shadow-3xs outline-none transition focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <ExportButton
                icon={RefreshCcw}
                onClick={() => {
                  setFilters({ header: "", table: "", tab: "All", date: DEFAULT_DATE_RANGE });
                  setCurrentPage(1);
                  showMessage("Filters reset");
                }}
              >
                Reset
              </ExportButton>
              <ExportButton icon={FileDown} onClick={() => window.print()}>Export PDF</ExportButton>
              <ExportButton
                icon={FileSpreadsheet}
                variant="primary"
                onClick={() => {
                  filteredRecords.length ? (downloadBorrowReturnCsv(filteredRecords), showMessage("Borrow/return report exported")) : showMessage("No records to export");
                }}
                disabled={filteredRecords.length === 0}
              >
                Excel
              </ExportButton>
            </div>
          </div>

          {/* RECORDS TABLE */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-bold text-gray-800">Borrow / Return Records</h3>
              <p className="mt-1 text-xs font-semibold text-gray-400">Active loans, returns, and overdue tracking</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="sticky top-0 z-[1] bg-gray-50/90 backdrop-blur text-[10px] uppercase tracking-wider text-gray-400">
                  <tr>
                    {["Borrower Name", "Book Title", "Status", "Borrow Date", "Return Date", "Due Date", ""].map((h) => (
                      <th key={h} className={`px-5 py-3.5 font-bold ${h === "Status" ? "text-center" : ""} ${h === "" ? "w-12 px-3" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading && !records.length && (
                    <tr>
                      <td colSpan="7" className="px-5 py-16 text-center">
                        <Loader2 size={20} className="mx-auto animate-spin text-[#055E83]" />
                        <p className="mt-2 text-xs font-bold text-gray-400">Loading borrow records...</p>
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    visibleRecords.map((record) => (
                      <tr key={record.id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                              style={{ backgroundColor: record.avatarBg, color: record.avatarColor }}
                            >
                              {record.initials}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-bold leading-tight text-gray-800">{record.borrower}</span>
                              <span className="mt-0.5 block text-[11px] font-semibold text-gray-400">UID: {record.uid}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-56">
                          <p className="font-semibold leading-snug text-gray-700">{record.book}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide" style={statusBadgeStyle[record.status]}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-700">{record.borrowDate}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-500">{record.returnDate}</td>
                        <td className={`px-5 py-4 text-xs font-black ${record.status === "Overdue" ? "text-red-600" : "text-gray-700"}`}>{record.dueDate}</td>
                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() => showMessage(`${record.borrower} - ${record.book} - ${record.status}`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[#055E83]"
                            aria-label={`View actions for ${record.borrower}`}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                  {!loading && !visibleRecords.length && (
                    <tr>
                      <td colSpan="7" className="px-5 py-16 text-center">
                        <p className="text-sm font-bold text-gray-500">No borrow or return records found</p>
                        <p className="mt-1 text-xs font-medium text-gray-400">Try adjusting your filters or search terms</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-gray-500">
                Showing {showingStart}-{showingEnd} of {filteredRecords.length} records
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
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                      safePage === page ? "bg-[#055E83] text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  disabled={safePage === pageCount}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* METRIC CARDS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard title="Total Borrowed Today" value={metrics.borrowedToday} sub="Today" subColor="#71717A" icon={ArrowUpFromLine} iconBg="#DBEAFE" iconColor="#2563EB" />
            <MetricCard title="Books Returned Today" value={metrics.returnedToday} sub="Today" subColor="#71717A" icon={ArrowDownToLine} iconBg="#FFEDD5" iconColor="#EA580C" />
            <MetricCard title="Currently Overdue" value={metrics.overdueCount} sub="Urgent, requires attention" subColor="#DC2626" icon={RefreshCcw} iconBg="#FEE2E2" iconColor="#DC2626" />
          </div>

          {/* TREND + OVERDUE WATCH */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-3xs p-5">
              <div className="flex items-center gap-2 text-[#055E83]">
                <TrendingUp size={18} />
                <h3 className="text-sm font-bold">Weekly Borrowing Trend</h3>
              </div>
              <div className="mt-5 flex h-28 items-end gap-3">
                {weeklyTrend.map((v, i) => (
                  <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-md ${i === todayIndex ? "bg-[#F5C842]" : "bg-[#BFDCE8]"}`}
                      style={{ height: `${Math.max(6, (v / maxTrendValue) * 100)}%` }}
                    />
                    <span className="text-[10px] font-bold text-gray-400">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-3xs p-5">
              <div className="flex items-center gap-2 text-red-600">
                <Clock3 size={18} />
                <h3 className="text-sm font-bold">Overdue Watch</h3>
              </div>
              <div className="mt-4 space-y-3">
                {overdueWatch.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => {
                      setFilters((f) => ({ ...f, tab: "Overdue", table: r.borrower }));
                      setCurrentPage(1);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-red-50"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black"
                      style={{ backgroundColor: r.avatarBg, color: r.avatarColor }}
                    >
                      {r.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-gray-700">{r.borrower}</span>
                      <span className="block truncate text-[11px] font-semibold text-gray-400">Due {r.dueDate}</span>
                    </span>
                    <span className="text-[11px] font-bold text-red-600">Overdue</span>
                  </button>
                ))}
                {!overdueWatch.length && (
                  <p className="px-2 py-4 text-center text-xs font-semibold text-gray-400">No overdue books right now</p>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}