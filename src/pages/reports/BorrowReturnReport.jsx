import { useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowUpFromLine, Calendar, ChevronLeft, ChevronRight,
  Clock3, FileDown, MoreVertical, RefreshCcw, Search, Table as TableIcon, TrendingUp,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Adminsidebar";

const PAGE_SIZE = 4;
const DEFAULT_DATE_RANGE = "Oct 01, 2023 - Oct 31, 2023";
const tabs = ["All", "Borrowing", "Returns", "Overdue"];
const borrowRecords = [
  { id: "BR-10922", borrower: "Samreth Boran", uid: "#10922", initials: "SB", avatarClass: "bg-sky-100 text-[#006088]", book: "The Art of Khmer Architecture", status: "Overdue", borrowDate: "Oct 12, 2023", returnDate: "--", dueDate: "Oct 26, 2023" },
  { id: "BR-10855", borrower: "Chan Vanny", uid: "#10855", initials: "CV", avatarClass: "bg-[#FFF3C4] text-[#9A6D00]", book: "Angkor Wat: A New History", status: "Returned", borrowDate: "Oct 15, 2023", returnDate: "Oct 29, 2023", dueDate: "Oct 30, 2023" },
  { id: "BR-11004", borrower: "Keo Pitu", uid: "#11004", initials: "KP", avatarClass: "bg-slate-200 text-slate-600", book: "Modern Web Development", status: "Borrowed", borrowDate: "Oct 28, 2023", returnDate: "--", dueDate: "Nov 11, 2023" },
  { id: "BR-10772", borrower: "Mealea Arun", uid: "#10772", initials: "MA", avatarClass: "bg-cyan-100 text-[#006088]", book: "Introduction to Psychology", status: "Returned", borrowDate: "Oct 20, 2023", returnDate: "Oct 30, 2023", dueDate: "Nov 03, 2023" },
  { id: "BR-11084", borrower: "Dara Sok", uid: "#11084", initials: "DS", avatarClass: "bg-emerald-100 text-emerald-700", book: "Clean Code", status: "Borrowed", borrowDate: "Oct 31, 2023", returnDate: "--", dueDate: "Nov 14, 2023" },
  { id: "BR-10630", borrower: "Nita Long", uid: "#10630", initials: "NL", avatarClass: "bg-rose-100 text-rose-600", book: "English Grammar Guide", status: "Overdue", borrowDate: "Oct 04, 2023", returnDate: "--", dueDate: "Oct 18, 2023" },
  { id: "BR-10519", borrower: "Mony Rotha", uid: "#10519", initials: "MR", avatarClass: "bg-indigo-100 text-indigo-700", book: "Database System Concepts", status: "Returned", borrowDate: "Oct 11, 2023", returnDate: "Oct 23, 2023", dueDate: "Oct 25, 2023" },
  { id: "BR-11201", borrower: "Lina Mao", uid: "#11201", initials: "LM", avatarClass: "bg-amber-100 text-amber-700", book: "Java Programming", status: "Borrowed", borrowDate: "Nov 01, 2023", returnDate: "--", dueDate: "Nov 15, 2023" },
];

const escapeCsvValue = (val) => `"${String(val).replace(/"/g, '""')}"`;

function downloadBorrowReturnCsv(rows) {
  const headers = ["Record ID", "Borrower", "User ID", "Book Title", "Status", "Borrow Date", "Return Date", "Due Date"];
  const csvRows = rows.map(r => [r.id, r.borrower, r.uid, r.book, r.status, r.borrowDate, r.returnDate, r.dueDate]);
  const csv = [headers, ...csvRows].map(row => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "borrow-return-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

const getStatusClass = (status) => ({
  Overdue: "bg-red-50 text-red-600",
  Returned: "bg-emerald-100 text-emerald-700",
  Borrowed: "bg-pink-100 text-pink-600",
}[status] || "bg-slate-100 text-slate-600");

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

  return {
    start: Math.min(start, end),
    end: Math.max(start, end),
  };
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

function MetricCard({ title, value, note, icon: Icon, iconClass, tone = "text-[#005A76]" }) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="relative z-10">
        <p className="text-xs font-black text-slate-500">{title}</p>
        <h3 className={`mt-3 text-3xl font-black tracking-normal ${tone}`}>{value}</h3>
        <p className="mt-3 text-xs font-bold text-slate-500">{note}</p>
      </div>
      <span className="absolute -bottom-8 -right-6 h-24 w-24 rounded-full bg-slate-100" />
      <span className={`absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}><Icon size={19} /></span>
    </article>
  );
}

export default function BorrowReturnReport() {
  const [filters, setFilters] = useState({ header: "", table: "", tab: "All", date: DEFAULT_DATE_RANGE });
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const updateFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setCurrentPage(1); };
  const showMessage = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const filteredRecords = useMemo(() => {
    const hQ = filters.header.trim().toLowerCase();
    const tQ = filters.table.trim().toLowerCase();
    const dateRange = parseDateRange(filters.date);

    return borrowRecords.filter(r => {
      const txt = `${r.id} ${r.borrower} ${r.uid} ${r.book} ${r.status} ${r.borrowDate} ${r.returnDate} ${r.dueDate}`.toLowerCase();
      const matchesSearch = (!hQ || txt.includes(hQ)) && (!tQ || txt.includes(tQ));
      const matchesTab = filters.tab === "All" || (filters.tab === "Borrowing" && r.status === "Borrowed") || (filters.tab === "Returns" && r.status === "Returned") || (filters.tab === "Overdue" && r.status === "Overdue");

      return matchesSearch && matchesTab && isRecordInDateRange(r, dateRange);
    });
  }, [filters]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleRecords = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredRecords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredRecords.length);

  return (
    <div className="flex h-screen overflow-hidden bg-[#E4ECF5]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar title="Borrow/Return Reports" onBack={() => window.history.back()} searchValue={filters.header} onSearchChange={(v) => updateFilter("header", v)} searchPlaceholder="Search books, member..." />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {toast && <div className="fixed bottom-6 right-6 z-50 rounded bg-[#005A76] px-4 py-3 text-sm font-bold text-white shadow-lg">{toast}</div>}

          <section className="flex justify-end">
            <div className="flex overflow-hidden rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
              {tabs.map((tab) => (
                <button type="button" key={tab} onClick={() => updateFilter("tab", tab)} className={`rounded-md px-4 py-2 text-[11px] font-black transition ${filters.tab === tab ? "bg-[#005A76] text-white" : "text-slate-600 hover:bg-slate-50"}`}>{tab}</button>
              ))}
            </div>
          </section>

          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
              <label className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="search" value={filters.table} onChange={(e) => updateFilter("table", e.target.value)} placeholder="Filter by name or book title..." className="h-10 w-full min-w-72 rounded-md border border-slate-100 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white" />
              </label>
              <label className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={filters.date} onChange={(e) => updateFilter("date", e.target.value)} className="h-10 w-full min-w-56 rounded-md border border-slate-100 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white" />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { setFilters({ header: "", table: "", tab: "All", date: DEFAULT_DATE_RANGE }); setCurrentPage(1); showMessage("Filters reset"); }} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-[#005A76] hover:text-[#005A76]"><RefreshCcw size={15} />Reset</button>
              <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#005A76] bg-white px-4 text-xs font-black text-[#005A76] transition hover:bg-[#E6F4F7]"><FileDown size={15} />Export PDF</button>
              <button type="button" onClick={() => filteredRecords.length ? (downloadBorrowReturnCsv(filteredRecords), showMessage("Borrow/return report exported")) : showMessage("No records to export")} disabled={filteredRecords.length === 0} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#005A76] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#00445a] disabled:cursor-not-allowed disabled:opacity-50"><TableIcon size={15} />Excel</button>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>{["Borrower Name", "Book Title", "Status", "Borrow Date", "Return Date", "Due Date", ""].map((h, i) => <th key={i} className={`px-6 py-4 font-black ${h === "Status" ? "text-center" : ""} ${h === "" ? "w-12 px-3" : ""}`}>{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {visibleRecords.map((record) => (
                    <tr key={record.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black ${record.avatarClass}`}>{record.initials}</span>
                        <div>
                          <p className="font-black leading-tight text-slate-800">{record.borrower}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">UID: {record.uid}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-56"><p className="font-semibold leading-snug text-slate-700">{record.book}</p></td>
                      <td className="px-6 py-4 text-center"><span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${getStatusClass(record.status)}`}>{record.status}</span></td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">{record.borrowDate}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">{record.returnDate}</td>
                      <td className={`px-6 py-4 text-xs font-black ${record.status === "Overdue" ? "text-red-600" : "text-slate-700"}`}>{record.dueDate}</td>
                      <td className="px-3 py-4">
                        <button type="button" onClick={() => showMessage(`${record.borrower} - ${record.status}`)} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-[#005A76]" aria-label={`View actions for ${record.borrower}`}><MoreVertical size={17} /></button>
                      </td>
                    </tr>
                  ))}
                  {!visibleRecords.length && <tr><td colSpan="7" className="px-6 py-12 text-center text-sm font-semibold text-slate-400">No borrow or return records found.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">Showing {showingStart}-{showingEnd} of {filteredRecords.length} records</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={16} /></button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <button type="button" key={page} onClick={() => setCurrentPage(page)} className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-black transition ${safePage === page ? "bg-[#005A76] text-white" : "text-slate-600 hover:bg-slate-100"}`}>{page}</button>
                ))}
                <button type="button" onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <MetricCard title="Total Borrowed Today" value="42" note="+12% from yesterday" icon={ArrowUpFromLine} iconClass="bg-sky-100 text-[#006088]" />
            <MetricCard title="Books Returned Today" value="38" note="Recent: 15 mins ago" icon={ArrowDownToLine} iconClass="bg-[#FFF3C4] text-[#9A6D00]" tone="text-[#7A5A00]" />
            <MetricCard title="Currently Overdue" value="15" note="Urgent requires attention" icon={RefreshCcw} iconClass="bg-red-100 text-red-600" tone="text-red-600" />
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[#005A76]"><TrendingUp size={18} /><h2 className="text-sm font-black">Weekly Borrowing Trend</h2></div>
              <div className="mt-5 flex h-28 items-end gap-3">
                {[42, 35, 48, 40, 55, 38, 44].map((v, i) => (
                  <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className={`w-full rounded-t-md ${i === 4 ? "bg-[#F5C842]" : "bg-[#B7CBD6]"}`} style={{ height: `${Math.max(20, v * 1.5)}%` }} />
                    <span className="text-[10px] font-black text-slate-400">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-red-600"><Clock3 size={18} /><h2 className="text-sm font-black">Overdue Watch</h2></div>
              <div className="mt-4 space-y-3">
                {borrowRecords.filter(r => r.status === "Overdue").map((r) => (
                  <button type="button" key={r.id} onClick={() => { setFilters(f => ({ ...f, tab: "Overdue", table: r.borrower })); setCurrentPage(1); }} className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-red-50">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black ${r.avatarClass}`}>{r.initials}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-black text-slate-700">{r.borrower}</span>
                      <span className="block truncate text-[11px] font-semibold text-slate-400">Due {r.dueDate}</span>
                    </span>
                    <span className="text-[11px] font-black text-red-600">Overdue</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
