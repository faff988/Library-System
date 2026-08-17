import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileDown,
  Loader2,
  Printer,
  RefreshCcw,
  RotateCcw,
  Search,
  Table as TableIcon,
  Trophy,
  Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const PAGE_SIZE = 6;
const BRAND = "#005A76";

// --- API wiring -------------------------------------------------------
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

function getDateRangeParams(option) {
  if (option === "All Time") return {};
  const now = new Date();
  const from = new Date(now);
  if (option === "Last 7 Days") from.setDate(from.getDate() - 7);
  else if (option === "This Month") { from.setDate(1); }
  else if (option === "This Year") { from.setMonth(0); from.setDate(1); }
  else from.setDate(from.getDate() - 30); // Last 30 Days (default)
  return { from: from.toISOString(), to: now.toISOString() };
}

// Real action strings actually written by utils/logAction.js across the
// controllers (borrowRecordsController, staffController, feedbackController,
// damageReportsController, etc.) - there's no invented "Fine Collection" or
// "Inventory Audit" action anywhere in the backend, so those mock categories
// from the old version are dropped rather than faked.
const ACTION_META = {
  BORROW: { label: "Book Borrowed", className: "bg-sky-100 text-sky-700" },
  RETURN: { label: "Book Returned", className: "bg-amber-100 text-amber-700" },
  REFRESH_OVERDUE: { label: "Overdue Refresh", className: "bg-red-100 text-red-600" },
  CREATE: { label: "Record Created", className: "bg-emerald-100 text-emerald-700" },
  UPDATE: { label: "Record Updated", className: "bg-violet-100 text-violet-700" },
  UPDATE_STATUS: { label: "Status Changed", className: "bg-violet-100 text-violet-700" },
  DELETE: { label: "Record Deleted", className: "bg-red-100 text-red-600" },
  REPLY: { label: "Feedback Replied", className: "bg-indigo-100 text-indigo-700" },
  REMOVE_REPLY: { label: "Reply Removed", className: "bg-slate-100 text-slate-500" },
};

function getActionMeta(action) {
  return ACTION_META[action] || { label: action || "Unknown", className: "bg-slate-100 text-slate-600" };
}

// table_name from system_logs (e.g. 'borrow_records', 'staff', 'feedback')
// is snake_case and not meant for display - title-case it as a fallback
// label since there's no per-table friendly-name table in the schema.
function formatTableName(tableName) {
  if (!tableName) return "-";
  return tableName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "??";
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "--";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--";
}

// Maps a system_logs row (via reportsController.staffActivity's `logs`
// array) into the shape this UI uses. There's no book title or member ID
// stored on the log itself - only table_name + record_id - so those are
// shown as "<Table Name> #<record_id>" instead of inventing a book title
// the way the old mock data did.
function normalizeLog(log) {
  const staffName = log.users ? `${log.users.first_name} ${log.users.last_name}`.trim() : "System";
  return {
    id: `LOG-${log.log_id}`,
    staffId: log.user_id,
    staffName,
    staffEmail: log.users?.email || null,
    initials: getInitials(staffName),
    action: log.action,
    tableName: log.table_name,
    recordId: log.record_id,
    details: log.details,
    rawDate: log.created_at,
    date: formatDate(log.created_at),
    time: formatTime(log.created_at),
  };
}

function escapeCsvValue(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(rows) {
  const headers = ["Log ID", "Staff Name", "Staff Email", "Action", "Table", "Record ID", "Date", "Time"];
  const csvRows = rows.map((row) => [
    row.id,
    row.staffName,
    row.staffEmail || "--",
    getActionMeta(row.action).label,
    formatTableName(row.tableName),
    row.recordId ?? "--",
    row.date,
    row.time,
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "staff-activity-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function SummaryCard({ title, value, note, icon: Icon, iconClass, noteClass = "text-emerald-600" }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className={`mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${iconClass}`}>
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400">{title}</p>
          <h3 className="mt-1 text-2xl font-black tracking-normal text-slate-800">{value}</h3>
          {note && <p className={`mt-1 text-[11px] font-black ${noteClass}`}>{note}</p>}
        </div>
      </div>
    </article>
  );
}

function SelectFilter({ label, value, onChange, children }) {
  return (
    <label className="flex min-w-[170px] flex-col gap-1">
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
      >
        {children}
      </select>
    </label>
  );
}

export default function StaffActivityReport() {
  const [logs, setLogs] = useState([]);
  const [byUser, setByUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [staffFilter, setStaffFilter] = useState("All Staff");
  const [actionFilter, setActionFilter] = useState("All Activities");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const showMessage = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { from, to } = getDateRangeParams(dateRange);
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const json = await apiFetch(`/reports/staff-activity?${params.toString()}`);
      setLogs((json.data?.logs || []).map(normalizeLog));
      setByUser(json.data?.byUser || []);
    } catch (err) {
      setError(err.message || "Unable to load staff activity report.");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const staffOptions = useMemo(
    () => ["All Staff", ...new Set(logs.map((log) => log.staffName))].sort((a, b) => (a === "All Staff" ? -1 : a.localeCompare(b))),
    [logs],
  );

  const actionOptions = useMemo(
    () => ["All Activities", ...new Set(logs.map((log) => log.action))],
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const headerQuery = headerSearch.trim().toLowerCase();
    const tableQuery = tableSearch.trim().toLowerCase();

    return logs.filter((log) => {
      const text = `${log.id} ${log.staffName} ${getActionMeta(log.action).label} ${formatTableName(log.tableName)} ${log.recordId ?? ""} ${log.date} ${log.time}`.toLowerCase();
      const matchesSearch = (!headerQuery || text.includes(headerQuery)) && (!tableQuery || text.includes(tableQuery));
      const matchesStaff = staffFilter === "All Staff" || log.staffName === staffFilter;
      const matchesAction = actionFilter === "All Activities" || log.action === actionFilter;
      return matchesSearch && matchesStaff && matchesAction;
    });
  }, [logs, headerSearch, tableSearch, staffFilter, actionFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleLogs = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredLogs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredLogs.length);

  // Real summary counts computed from actual log actions, replacing the
  // old hardcoded "1,284 / 842 / 412 / 31" mock numbers.
  const summary = useMemo(() => {
    const total = logs.length;
    const borrowed = logs.filter((l) => l.action === "BORROW").length;
    const returned = logs.filter((l) => l.action === "RETURN").length;
    const overdueRefreshes = logs.filter((l) => l.action === "REFRESH_OVERDUE").length;
    return { total, borrowed, returned, overdueRefreshes };
  }, [logs]);

  // Borrow vs Return activity per day, computed from real log timestamps
  // instead of the old hardcoded Mon-Sat mock chart.
  const trend = useMemo(() => {
    const byDay = new Map();
    logs.forEach((log) => {
      if (log.action !== "BORROW" && log.action !== "RETURN") return;
      const dayKey = new Date(log.rawDate).toISOString().slice(0, 10);
      const entry = byDay.get(dayKey) || { day: dayKey, borrowing: 0, returning: 0 };
      if (log.action === "BORROW") entry.borrowing += 1;
      else entry.returning += 1;
      byDay.set(dayKey, entry);
    });
    return Array.from(byDay.values())
      .sort((a, b) => (a.day > b.day ? 1 : -1))
      .slice(-7)
      .map((entry) => ({
        ...entry,
        label: new Date(entry.day).toLocaleDateString("en-US", { weekday: "short" }),
      }));
  }, [logs]);

  const trendMax = Math.max(...trend.flatMap((t) => [t.borrowing, t.returning]), 1);

  const topStaff = useMemo(() => [...byUser].sort((a, b) => b.actionCount - a.actionCount).slice(0, 5), [byUser]);

  const clearFilters = () => {
    setHeaderSearch("");
    setTableSearch("");
    setDateRange("Last 30 Days");
    setStaffFilter("All Staff");
    setActionFilter("All Activities");
    setCurrentPage(1);
    showMessage("Filters reset");
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Navbar
        title="Staff Activity Report"
        breadcrumb="View and analyze staff activities in the library"
        onBack={() => window.history.back()}
        searchValue={headerSearch}
        onSearchChange={(value) => { setHeaderSearch(value); setCurrentPage(1); }}
        searchPlaceholder="Search staff, action..."
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-md bg-[#005A76] px-4 py-3 text-sm font-bold text-white shadow-lg">
            {toast}
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
            <span>{error}</span>
            <button type="button" onClick={loadReport} className="rounded-md bg-red-600 px-3 py-1.5 text-white">
              Retry
            </button>
          </div>
        )}

        <section className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={loadReport}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
            {loading ? "Loading..." : "Refresh"}
          </button>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76]"
            >
              <FileDown size={14} />
              PDF
            </button>
            <button
              type="button"
              onClick={() =>
                filteredLogs.length
                  ? (downloadCsv(filteredLogs), showMessage("Staff activity exported"))
                  : showMessage("No activities to export")
              }
              disabled={filteredLogs.length === 0}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TableIcon size={14} />
              Excel
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#005A76] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#00445a]"
            >
              <Printer size={14} />
              Print Report
            </button>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Activities"
            value={summary.total.toLocaleString()}
            note={dateRange}
            icon={Activity}
            iconClass="bg-sky-100 text-[#005A76]"
            noteClass="text-slate-500"
          />
          <SummaryCard
            title="Borrow Transactions"
            value={summary.borrowed.toLocaleString()}
            icon={ClipboardCheck}
            iconClass="bg-amber-100 text-amber-700"
            note={null}
          />
          <SummaryCard
            title="Return Transactions"
            value={summary.returned.toLocaleString()}
            icon={RefreshCcw}
            iconClass="bg-indigo-100 text-indigo-700"
            note={null}
          />
          <SummaryCard
            title="Overdue Refreshes"
            value={summary.overdueRefreshes.toLocaleString()}
            icon={Clock3}
            iconClass="bg-red-100 text-red-600"
            note={null}
          />
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black text-slate-700">Borrow / Return Activity (last 7 active days)</h2>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#005A76]" />
                  Borrowing
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F5C842]" />
                  Returning
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-slate-50 px-4 pb-4 pt-5">
              {trend.length ? (
                <>
                  <div
                    className="grid h-56 items-end gap-4 border-b border-slate-200"
                    style={{ gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))` }}
                  >
                    {trend.map((item) => (
                      <div key={item.day} className="flex h-full min-w-0 items-end justify-center gap-1.5">
                        <div
                          className="w-full max-w-[38px] rounded-t-sm bg-[#B7CBD6] transition hover:bg-[#9AB6C4]"
                          style={{ height: `${Math.max(4, (item.borrowing / trendMax) * 100)}%` }}
                          title={`${item.label} borrowing ${item.borrowing}`}
                        />
                        <div
                          className="w-full max-w-[38px] rounded-t-sm bg-[#4F8196] transition hover:bg-[#005A76]"
                          style={{ height: `${Math.max(4, (item.returning / trendMax) * 100)}%` }}
                          title={`${item.label} returning ${item.returning}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-3 grid gap-4 text-center text-[11px] font-black text-slate-400"
                    style={{ gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))` }}
                  >
                    {trend.map((item) => <span key={item.day}>{item.label}</span>)}
                  </div>
                </>
              ) : (
                <p className="py-14 text-center text-xs font-semibold text-slate-400">
                  {loading ? "Loading trend..." : "No borrow/return activity in this window"}
                </p>
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#005A76]" />
              <h2 className="text-sm font-black text-slate-700">Top Staff by Activity</h2>
            </div>
            <div className="mt-5 space-y-4">
              {topStaff.map((staff, index) => (
                <div key={staff.userId ?? index} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E6F4F7] text-[11px] font-black text-[#005A76]">
                      {getInitials(staff.name)}
                    </span>
                    <span className="truncate text-xs font-bold text-slate-700">{staff.name}</span>
                  </div>
                  <span className="flex-shrink-0 text-xs font-black text-[#005A76]">{staff.actionCount}</span>
                </div>
              ))}
              {!topStaff.length && (
                <p className="py-4 text-center text-xs font-semibold text-slate-400">
                  {loading ? "Loading..." : "No staff activity yet"}
                </p>
              )}
            </div>

            {topStaff[0] && (
              <div className="mt-7 rounded-lg bg-[#005A76] p-4 text-white">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                  <Trophy size={14} />
                  Most Active Staff
                </div>
                <p className="mt-3 text-sm font-black">{topStaff[0].name}</p>
                <p className="mt-1 text-xs font-semibold text-white/80">{topStaff[0].actionCount} actions in this window</p>
              </div>
            )}
          </aside>
        </section>

        <section className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <SelectFilter label="Date Range" value={dateRange} onChange={(value) => { setDateRange(value); setCurrentPage(1); }}>
              {["Last 7 Days", "Last 30 Days", "This Month", "This Year", "All Time"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </SelectFilter>
            <SelectFilter label="Staff Name" value={staffFilter} onChange={(value) => { setStaffFilter(value); setCurrentPage(1); }}>
              {staffOptions.map((option) => <option key={option}>{option}</option>)}
            </SelectFilter>
            <SelectFilter label="Activity Type" value={actionFilter} onChange={(value) => { setActionFilter(value); setCurrentPage(1); }}>
              {actionOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All Activities" ? option : getActionMeta(option).label}
                </option>
              ))}
            </SelectFilter>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76]"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </section>

        <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-sm font-black text-slate-700">Detailed Activity Log</h2>
            <label className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={tableSearch}
                onChange={(event) => { setTableSearch(event.target.value); setCurrentPage(1); }}
                placeholder="Search activity log..."
                className="h-10 w-full min-w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  {["Log ID", "Staff Name", "Activity", "Table / Record", "Date & Time"].map((heading) => (
                    <th key={heading} className="px-6 py-4 font-black">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading && !logs.length && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <Loader2 size={20} className="mx-auto animate-spin text-[#005A76]" />
                      <p className="mt-2 text-xs font-bold text-slate-400">Loading staff activity...</p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  visibleLogs.map((log) => {
                    const meta = getActionMeta(log.action);
                    return (
                      <tr key={log.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4 text-xs font-black text-[#005A76]">{log.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#E6F4F7] text-[11px] font-black text-[#005A76]">
                              {log.initials}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-700">{log.staffName}</p>
                              {log.staffEmail && <p className="truncate text-[11px] font-semibold text-slate-400">{log.staffEmail}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${meta.className}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-700">{formatTableName(log.tableName)}</p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-400">
                            {log.recordId != null ? `Record #${log.recordId}` : "--"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Calendar size={14} className="text-slate-400" />
                            {log.date}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                            <Clock3 size={13} />
                            {log.time}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && visibleLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm font-semibold text-slate-400">
                      No staff activity records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Showing {showingStart}-{showingEnd} of {filteredLogs.length} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-black transition ${
                    safePage === page ? "bg-[#005A76] text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                disabled={safePage === pageCount}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}