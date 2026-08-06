// import { useEffect, useMemo, useState } from "react";
// import {
//   BookCheck,
//   BookUp,
//   CalendarRange,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Clock3,
//   EllipsisVertical,
//   FileChartColumn,
//   FileSpreadsheet,
//   Printer,
//   ReceiptText,
//   RefreshCcw,
//   Search,
// } from "lucide-react";
// import Navbar from "../../components/Navbar";
// import Sidebar from "../../components/Adminsidebar";
// import api from "../../utils/api";

// const PAGE_SIZE = 5;
// const STATUS_OPTIONS = ["All Statuses", "Borrowed", "Returned", "Overdue"];

// const statusClass = {
//   Borrowed: "bg-sky-100 text-sky-700",
//   Returned: "bg-emerald-100 text-emerald-700",
//   Overdue: "bg-red-100 text-red-600",
// };

// function formatNumber(value) {
//   return new Intl.NumberFormat("en-US").format(value ?? 0);
// }

// function formatDateTime(value) {
//   if (!value) return "—";
//   return new Date(value).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
// }

// function escapeCsvValue(value) {
//   return `"${String(value ?? "").replace(/"/g, '""')}"`;
// }

// function downloadActivityCsv(rows) {
//   const headers = ["Borrow ID", "Member", "Book", "Issued By", "Status", "Borrow Date", "Due Date", "Return Date"];
//   const csvRows = rows.map((r) => [
//     r.borrow_id,
//     r.members?.full_name || "",
//     r.books?.title || "",
//     r.users ? `${r.users.first_name} ${r.users.last_name}` : "",
//     r.status,
//     r.borrow_date,
//     r.due_date,
//     r.return_date || "",
//   ]);
//   const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
//   const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = "borrow-return-activity.csv";
//   link.click();
//   URL.revokeObjectURL(url);
// }

// function ToolbarButton({ icon: Icon, children, variant = "light", ...props }) {
//   const className =
//     variant === "primary"
//       ? "bg-[#005A76] text-white hover:bg-[#00445a]"
//       : "border border-slate-200 bg-white text-slate-700 hover:border-[#005A76] hover:text-[#005A76]";

//   return (
//     <button
//       type="button"
//       className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
//       {...props}
//     >
//       <Icon size={14} />
//       {children}
//     </button>
//   );
// }

// function StatCard({ card }) {
//   const Icon = card.icon;
//   return (
//     <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
//       <div className="flex items-start justify-between gap-3">
//         <span className={`flex h-8 w-8 items-center justify-center rounded ${card.iconClass}`}>
//           <Icon size={16} />
//         </span>
//       </div>
//       <p className="mt-5 text-[11px] font-black uppercase text-slate-500">{card.label}</p>
//       <h3 className="mt-1 text-2xl font-black tracking-normal text-slate-900">{card.value}</h3>
//     </article>
//   );
// }

// function PeriodTabs({ value, onChange }) {
//   return (
//     <div className="inline-flex h-9 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
//       {["daily", "weekly", "monthly"].map((period) => (
//         <button
//           type="button"
//           key={period}
//           onClick={() => onChange(period)}
//           className={`min-w-20 rounded px-4 text-[11px] font-black capitalize transition ${
//             value === period ? "bg-[#E6F4F7] text-[#005A76]" : "text-slate-500 hover:bg-slate-50"
//           }`}
//         >
//           {period}
//         </button>
//       ))}
//     </div>
//   );
// }

// function SelectFilter({ value, onChange }) {
//   return (
//     <label className="relative block">
//       <select
//         aria-label="Status"
//         value={value}
//         onChange={(event) => onChange(event.target.value)}
//         className="h-9 min-w-44 appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
//       >
//         {STATUS_OPTIONS.map((s) => (
//           <option key={s}>{s}</option>
//         ))}
//       </select>
//       <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
//     </label>
//   );
// }

// function ActivityChart({ rows, loading, period }) {
//   const max = Math.max(1, ...rows.flatMap((r) => [r.borrows, r.returns]));

//   return (
//     <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//       <div className="flex items-center justify-between">
//         <h2 className="text-sm font-black text-[#005A76]">
//           {period[0].toUpperCase() + period.slice(1)} Borrow / Return Activity
//         </h2>
//         <div className="flex items-center gap-3 text-[10px] font-black text-slate-500">
//           <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#005A76]" />Borrows</span>
//           <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#CFE1E8]" />Returns</span>
//         </div>
//       </div>

//       {loading ? (
//         <div className="mt-5 flex h-48 items-center justify-center text-xs font-semibold text-slate-400">Loading activity...</div>
//       ) : rows.length === 0 ? (
//         <div className="mt-5 flex h-48 items-center justify-center text-xs font-semibold text-slate-400">No activity in this range.</div>
//       ) : (
//         <>
//           <div className="mt-5 flex h-48 items-end gap-2 border-b border-slate-100">
//             {rows.map((r) => (
//               <div key={r.bucket} className="flex h-full min-w-0 flex-1 items-end gap-0.5" title={`${r.bucket}: ${r.borrows} borrowed, ${r.returns} returned`}>
//                 <div className="w-1/2 rounded-t-sm bg-[#005A76] transition hover:bg-[#00445a]" style={{ height: `${Math.max(4, (r.borrows / max) * 100)}%` }} />
//                 <div className="w-1/2 rounded-t-sm bg-[#CFE1E8] transition hover:bg-[#b7d3de]" style={{ height: `${Math.max(4, (r.returns / max) * 100)}%` }} />
//               </div>
//             ))}
//           </div>
//           <div className="mt-3 flex gap-2 text-center text-[10px] font-black text-slate-400">
//             {rows.map((r) => (
//               <span key={r.bucket} className="flex-1 truncate">{r.bucket.slice(5)}</span>
//             ))}
//           </div>
//         </>
//       )}
//     </section>
//   );
// }

// function BucketOverview({ rows, loading }) {
//   const max = Math.max(1, ...rows.map((r) => r.borrows + r.returns));

//   return (
//     <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//       <div className="flex items-center justify-between gap-3">
//         <h2 className="text-lg font-black leading-tight text-[#005A76]">Period Breakdown</h2>
//         <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-500 transition hover:border-[#005A76] hover:text-[#005A76]" aria-label="Options">
//           <EllipsisVertical size={14} />
//         </button>
//       </div>

//       {loading ? (
//         <p className="mt-6 text-xs font-semibold text-slate-400">Loading...</p>
//       ) : rows.length === 0 ? (
//         <p className="mt-6 text-xs font-semibold text-slate-400">No data in this range.</p>
//       ) : (
//         <div className="mt-6 space-y-5">
//           {rows.slice(-6).map((r) => {
//             const total = r.borrows + r.returns;
//             return (
//               <div key={r.bucket}>
//                 <div className="mb-2 flex items-center justify-between text-[11px] font-black">
//                   <span className="text-slate-700">{r.bucket}</span>
//                   <span className="text-slate-400">{total} events</span>
//                 </div>
//                 <div className="h-2 overflow-hidden rounded-full bg-slate-100">
//                   <div className="h-full rounded-full bg-[#005A76]" style={{ width: `${(total / max) * 100}%` }} />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </aside>
//   );
// }

// export default function DailyWeeklyMonthlyTransactionReport() {
//   const [period, setPeriod] = useState("daily");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [status, setStatus] = useState("All Statuses");
//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [toast, setToast] = useState("");

//   const [activityRows, setActivityRows] = useState([]);
//   const [activityLoading, setActivityLoading] = useState(true);

//   const [records, setRecords] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [recordsLoading, setRecordsLoading] = useState(true);

//   useEffect(() => {
//     const t = setTimeout(() => setSearch(searchInput), 300);
//     return () => clearTimeout(t);
//   }, [searchInput]);

//   useEffect(() => {
//     fetchActivity();
//   }, [period, fromDate, toDate]);

//   useEffect(() => {
//     fetchRecords();
//   }, [fromDate, toDate, status]);

//   const fetchActivity = async () => {
//     try {
//       setActivityLoading(true);
//       const params = new URLSearchParams({ period });
//       if (fromDate) params.append("from", fromDate);
//       if (toDate) params.append("to", toDate);

//       const response = await api.get(`/reports/transactions?${params.toString()}`);
//       if (response.data?.success) setActivityRows(response.data.data.rows);
//     } catch (err) {
//       console.error("Failed to load activity chart:", err);
//     } finally {
//       setActivityLoading(false);
//     }
//   };

//   const fetchRecords = async () => {
//     try {
//       setRecordsLoading(true);
//       const params = new URLSearchParams();
//       if (fromDate) params.append("from", fromDate);
//       if (toDate) params.append("to", toDate);
//       if (status !== "All Statuses") params.append("status", status);

//       const response = await api.get(`/reports/borrow-return?${params.toString()}`);
//       if (response.data?.success) {
//         setRecords(response.data.data.records);
//         setSummary(response.data.data.summary);
//       }
//     } catch (err) {
//       console.error("Failed to load borrow/return records:", err);
//     } finally {
//       setRecordsLoading(false);
//     }
//   };

//   const showMessage = (message) => {
//     setToast(message);
//     setTimeout(() => setToast(""), 2200);
//   };

//   // /reports/borrow-return has no search param, so member/book search is
//   // applied client-side over the already date/status-filtered set.
//   const filteredRecords = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return records;
//     return records.filter((r) => {
//       const text = `${r.borrow_id} ${r.members?.full_name || ""} ${r.books?.title || ""} ${r.books?.author || ""}`.toLowerCase();
//       return text.includes(q);
//     });
//   }, [records, search]);

//   const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
//   const safePage = Math.min(currentPage, pageCount);
//   const visibleRecords = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
//   const showingStart = filteredRecords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
//   const showingEnd = Math.min(safePage * PAGE_SIZE, filteredRecords.length);

//   const resetFilters = () => {
//     setPeriod("daily");
//     setFromDate("");
//     setToDate("");
//     setStatus("All Statuses");
//     setSearchInput("");
//     setSearch("");
//     setCurrentPage(1);
//     showMessage("Filters reset");
//   };

//   const totalBorrows = activityRows.reduce((s, r) => s + r.borrows, 0);
//   const totalReturns = activityRows.reduce((s, r) => s + r.returns, 0);

//   const statCards = summary
//     ? [
//         { label: "Total Records", value: formatNumber(summary.total), icon: ReceiptText, iconClass: "bg-indigo-100 text-indigo-700" },
//         { label: "Currently Borrowed", value: formatNumber(summary.borrowed), icon: BookUp, iconClass: "bg-sky-100 text-sky-700" },
//         { label: "Returned", value: formatNumber(summary.returned), icon: BookCheck, iconClass: "bg-emerald-100 text-emerald-700" },
//         { label: "Overdue", value: formatNumber(summary.overdue), icon: Clock3, iconClass: "bg-red-100 text-red-600" },
//       ]
//     : [];

//   return (
//     <div className="flex h-screen overflow-hidden bg-[#E9EEF4]">
//       <Sidebar />

//       <div className="flex min-w-0 flex-1 flex-col">
//         <Navbar
//           title="Borrow / Return Activity Report"
//           breadcrumb="Reports / Borrow-Return Activity"
//           onBack={() => window.history.back()}
//           searchValue={searchInput}
//           onSearchChange={(value) => { setSearchInput(value); setCurrentPage(1); }}
//           searchPlaceholder="Search member, book..."
//         />

//         <main className="flex-1 p-4 md:p-6 lg:p-8">
//           {toast && (
//             <div className="fixed bottom-6 right-6 z-50 rounded-md bg-[#005A76] px-4 py-3 text-sm font-bold text-white shadow-lg">
//               {toast}
//             </div>
//           )}

//           <section className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
//             <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
//               <PeriodTabs value={period} onChange={setPeriod} />
//               <label className="relative block">
//                 <CalendarRange size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]" />
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
//                   className="h-9 min-w-40 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
//                   aria-label="From date"
//                 />
//               </label>
//               <label className="relative block">
//                 <CalendarRange size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]" />
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
//                   className="h-9 min-w-40 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
//                   aria-label="To date"
//                 />
//               </label>
//               <SelectFilter value={status} onChange={(value) => { setStatus(value); setCurrentPage(1); }} />
//             </div>

//             <div className="flex flex-wrap gap-2">
//               <ToolbarButton icon={Printer} onClick={() => window.print()}>Print</ToolbarButton>
//               <ToolbarButton icon={FileChartColumn} onClick={() => window.print()}>PDF</ToolbarButton>
//               <ToolbarButton
//                 icon={FileSpreadsheet}
//                 variant="primary"
//                 onClick={() => {
//                   filteredRecords.length ? (downloadActivityCsv(filteredRecords), showMessage("Report exported")) : showMessage("No records to export");
//                 }}
//                 disabled={filteredRecords.length === 0}
//               >
//                 Export Excel
//               </ToolbarButton>
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className="flex h-9 w-9 items-center justify-center rounded-md text-[#005A76] transition hover:bg-white"
//                 aria-label="Reset filters"
//               >
//                 <RefreshCcw size={16} />
//               </button>
//             </div>
//           </section>

//           <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             {recordsLoading ? (
//               <div className="col-span-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-400 shadow-sm">Loading summary...</div>
//             ) : (
//               statCards.map((card) => <StatCard key={card.label} card={card} />)
//             )}
//           </section>

//           <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
//             <ActivityChart rows={activityRows} loading={activityLoading} period={period} />
//             <BucketOverview rows={activityRows} loading={activityLoading} />
//           </section>

//           <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
//             <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
//               <h2 className="text-sm font-black text-[#005A76]">Recent Borrow / Return Records</h2>
//               <label className="relative">
//                 <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   type="search"
//                   value={searchInput}
//                   onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
//                   placeholder="Filter by member or book..."
//                   className="h-10 w-full min-w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
//                 />
//               </label>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[820px] text-left">
//                 <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
//                   <tr>
//                     {["Borrow ID", "Member & Book", "Issued By", "Status", "Borrow Date", "Due / Return"].map((heading) => (
//                       <th key={heading} className="px-5 py-4 font-black">{heading}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-sm">
//                   {recordsLoading ? (
//                     <tr>
//                       <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-400">Loading records...</td>
//                     </tr>
//                   ) : visibleRecords.length === 0 ? (
//                     <tr>
//                       <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-400">No records found.</td>
//                     </tr>
//                   ) : (
//                     visibleRecords.map((r) => (
//                       <tr key={r.borrow_id} className="transition hover:bg-slate-50">
//                         <td className="px-5 py-4 text-xs font-black text-[#005A76]">#{r.borrow_id}</td>
//                         <td className="px-5 py-4">
//                           <p className="font-bold text-slate-800">{r.members?.full_name || "Unknown"}</p>
//                           <p className="mt-0.5 text-xs font-medium text-slate-400">{r.books?.title}</p>
//                         </td>
//                         <td className="px-5 py-4 text-xs font-semibold text-slate-600">
//                           {r.users ? `${r.users.first_name} ${r.users.last_name}` : "—"}
//                         </td>
//                         <td className="px-5 py-4">
//                           <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${statusClass[r.status] || "bg-slate-100 text-slate-600"}`}>
//                             {r.status}
//                           </span>
//                         </td>
//                         <td className="px-5 py-4 text-xs font-semibold text-slate-600">{formatDateTime(r.borrow_date)}</td>
//                         <td className="px-5 py-4 text-xs font-semibold text-slate-600">
//                           {r.return_date ? `Returned ${formatDateTime(r.return_date)}` : `Due ${formatDateTime(r.due_date)}`}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
//               <p className="text-xs font-semibold text-slate-500">
//                 Showing {showingStart} to {showingEnd} of {filteredRecords.length} records
//               </p>
//               <div className="flex items-center gap-1">
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
//                   disabled={safePage === 1}
//                   className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
//                   aria-label="Previous page"
//                 >
//                   <ChevronLeft size={16} />
//                 </button>
//                 {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
//                   <button
//                     type="button"
//                     key={page}
//                     onClick={() => setCurrentPage(page)}
//                     className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-black transition ${safePage === page ? "bg-[#005A76] text-white" : "text-slate-600 hover:bg-slate-100"}`}
//                   >
//                     {page}
//                   </button>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
//                   disabled={safePage === pageCount}
//                   className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
//                   aria-label="Next page"
//                 >
//                   <ChevronRight size={16} />
//                 </button>
//               </div>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import {
  BookCheck,
  BookUp,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  EllipsisVertical,
  FileChartColumn,
  FileSpreadsheet,
  Printer,
  ReceiptText,
  RefreshCcw,
  Search,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";

const PAGE_SIZE = 5;
const STATUS_OPTIONS = ["All Statuses", "Borrowed", "Returned", "Overdue"];

const statusClass = {
  Borrowed: "bg-sky-100 text-sky-700",
  Returned: "bg-emerald-100 text-emerald-700",
  Overdue: "bg-red-100 text-red-600",
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function escapeCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadActivityCsv(rows) {
  const headers = ["Borrow ID", "Member", "Book", "Issued By", "Status", "Borrow Date", "Due Date", "Return Date"];
  const csvRows = rows.map((r) => [
    r.borrow_id,
    r.members?.full_name || "",
    r.books?.title || "",
    r.users ? `${r.users.first_name} ${r.users.last_name}` : "",
    r.status,
    r.borrow_date,
    r.due_date,
    r.return_date || "",
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "borrow-return-activity.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function ToolbarButton({ icon: Icon, children, variant = "light", ...props }) {
  const className =
    variant === "primary"
      ? "bg-[#005A76] text-white hover:bg-[#00445a]"
      : "border border-slate-200 bg-white text-slate-700 hover:border-[#005A76] hover:text-[#005A76]";

  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}

function StatCard({ card }) {
  const Icon = card.icon;
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded ${card.iconClass}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-5 text-[11px] font-black uppercase text-slate-500">{card.label}</p>
      <h3 className="mt-1 text-2xl font-black tracking-normal text-slate-900">{card.value}</h3>
    </article>
  );
}

function PeriodTabs({ value, onChange }) {
  return (
    <div className="inline-flex h-9 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
      {["daily", "weekly", "monthly"].map((period) => (
        <button
          type="button"
          key={period}
          onClick={() => onChange(period)}
          className={`min-w-20 rounded px-4 text-[11px] font-black capitalize transition ${
            value === period ? "bg-[#E6F4F7] text-[#005A76]" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
}

function SelectFilter({ value, onChange }) {
  return (
    <label className="relative block">
      <select
        aria-label="Status"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-44 appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

function ActivityChart({ rows, loading, period }) {
  const max = Math.max(1, ...rows.flatMap((r) => [r.borrows, r.returns]));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-[#005A76]">
          {period[0].toUpperCase() + period.slice(1)} Borrow / Return Activity
        </h2>
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#005A76]" />Borrows</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#CFE1E8]" />Returns</span>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 flex h-48 items-center justify-center text-xs font-semibold text-slate-400">Loading activity...</div>
      ) : rows.length === 0 ? (
        <div className="mt-5 flex h-48 items-center justify-center text-xs font-semibold text-slate-400">No activity in this range.</div>
      ) : (
        <>
          <div className="mt-5 flex h-48 items-end gap-2 border-b border-slate-100">
            {rows.map((r) => (
              <div key={r.bucket} className="flex h-full min-w-0 flex-1 items-end gap-0.5" title={`${r.bucket}: ${r.borrows} borrowed, ${r.returns} returned`}>
                <div className="w-1/2 rounded-t-sm bg-[#005A76] transition hover:bg-[#00445a]" style={{ height: `${Math.max(4, (r.borrows / max) * 100)}%` }} />
                <div className="w-1/2 rounded-t-sm bg-[#CFE1E8] transition hover:bg-[#b7d3de]" style={{ height: `${Math.max(4, (r.returns / max) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 text-center text-[10px] font-black text-slate-400">
            {rows.map((r) => (
              <span key={r.bucket} className="flex-1 truncate">{r.bucket.slice(5)}</span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function BucketOverview({ rows, loading }) {
  const max = Math.max(1, ...rows.map((r) => r.borrows + r.returns));

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black leading-tight text-[#005A76]">Period Breakdown</h2>
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-500 transition hover:border-[#005A76] hover:text-[#005A76]" aria-label="Options">
          <EllipsisVertical size={14} />
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-xs font-semibold text-slate-400">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-xs font-semibold text-slate-400">No data in this range.</p>
      ) : (
        <div className="mt-6 space-y-5">
          {rows.slice(-6).map((r) => {
            const total = r.borrows + r.returns;
            return (
              <div key={r.bucket}>
                <div className="mb-2 flex items-center justify-between text-[11px] font-black">
                  <span className="text-slate-700">{r.bucket}</span>
                  <span className="text-slate-400">{total} events</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#005A76]" style={{ width: `${(total / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

export default function DailyWeeklyMonthlyTransactionReport() {
  const [period, setPeriod] = useState("daily");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const [activityRows, setActivityRows] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [recordsLoading, setRecordsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchActivity();
  }, [period, fromDate, toDate]);

  useEffect(() => {
    fetchRecords();
  }, [fromDate, toDate, status]);

  const fetchActivity = async () => {
    try {
      setActivityLoading(true);
      const params = new URLSearchParams({ period });
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const response = await api.get(`/reports/transactions?${params.toString()}`);
      if (response.data?.success) setActivityRows(response.data.data.rows);
    } catch (err) {
      console.error("Failed to load activity chart:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      setRecordsLoading(true);
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);
      if (status !== "All Statuses") params.append("status", status);

      const response = await api.get(`/reports/borrow-return?${params.toString()}`);
      if (response.data?.success) {
        setRecords(response.data.data.records);
        setSummary(response.data.data.summary);
      }
    } catch (err) {
      console.error("Failed to load borrow/return records:", err);
    } finally {
      setRecordsLoading(false);
    }
  };

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  // /reports/borrow-return has no search param, so member/book search is
  // applied client-side over the already date/status-filtered set.
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const text = `${r.borrow_id} ${r.members?.full_name || ""} ${r.books?.title || ""} ${r.books?.author || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [records, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleRecords = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredRecords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredRecords.length);

  const resetFilters = () => {
    setPeriod("daily");
    setFromDate("");
    setToDate("");
    setStatus("All Statuses");
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
    showMessage("Filters reset");
  };

  const totalBorrows = activityRows.reduce((s, r) => s + r.borrows, 0);
  const totalReturns = activityRows.reduce((s, r) => s + r.returns, 0);

  const statCards = summary
    ? [
        { label: "Total Records", value: formatNumber(summary.total), icon: ReceiptText, iconClass: "bg-indigo-100 text-indigo-700" },
        { label: "Currently Borrowed", value: formatNumber(summary.borrowed), icon: BookUp, iconClass: "bg-sky-100 text-sky-700" },
        { label: "Returned", value: formatNumber(summary.returned), icon: BookCheck, iconClass: "bg-emerald-100 text-emerald-700" },
        { label: "Overdue", value: formatNumber(summary.overdue), icon: Clock3, iconClass: "bg-red-100 text-red-600" },
      ]
    : [];

  return (
    <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title="Borrow / Return Activity Report"
          breadcrumb="Reports / Borrow-Return Activity"
          onBack={() => window.history.back()}
          searchValue={searchInput}
          onSearchChange={(value) => { setSearchInput(value); setCurrentPage(1); }}
          searchPlaceholder="Search member, book..."
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 rounded-md bg-[#005A76] px-4 py-3 text-sm font-bold text-white shadow-lg">
              {toast}
            </div>
          )}

          <section className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
              <PeriodTabs value={period} onChange={setPeriod} />
              <label className="relative block">
                <CalendarRange size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                  className="h-9 min-w-40 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
                  aria-label="From date"
                />
              </label>
              <label className="relative block">
                <CalendarRange size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                  className="h-9 min-w-40 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
                  aria-label="To date"
                />
              </label>
              <SelectFilter value={status} onChange={(value) => { setStatus(value); setCurrentPage(1); }} />
            </div>

            <div className="flex flex-wrap gap-2">
              <ToolbarButton icon={Printer} onClick={() => window.print()}>Print</ToolbarButton>
              <ToolbarButton icon={FileChartColumn} onClick={() => window.print()}>PDF</ToolbarButton>
              <ToolbarButton
                icon={FileSpreadsheet}
                variant="primary"
                onClick={() => {
                  filteredRecords.length ? (downloadActivityCsv(filteredRecords), showMessage("Report exported")) : showMessage("No records to export");
                }}
                disabled={filteredRecords.length === 0}
              >
                Export Excel
              </ToolbarButton>
              <button
                type="button"
                onClick={resetFilters}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#005A76] transition hover:bg-white"
                aria-label="Reset filters"
              >
                <RefreshCcw size={16} />
              </button>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recordsLoading ? (
              <div className="col-span-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-400 shadow-sm">Loading summary...</div>
            ) : (
              statCards.map((card) => <StatCard key={card.label} card={card} />)
            )}
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <ActivityChart rows={activityRows} loading={activityLoading} period={period} />
            <BucketOverview rows={activityRows} loading={activityLoading} />
          </section>

          <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-sm font-black text-[#005A76]">Recent Borrow / Return Records</h2>
              <label className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
                  placeholder="Filter by member or book..."
                  className="h-10 w-full min-w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    {["Borrow ID", "Member & Book", "Issued By", "Status", "Borrow Date", "Due / Return"].map((heading) => (
                      <th key={heading} className="px-5 py-4 font-black">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {recordsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-400">Loading records...</td>
                    </tr>
                  ) : visibleRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-400">No records found.</td>
                    </tr>
                  ) : (
                    visibleRecords.map((r) => (
                      <tr key={r.borrow_id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4 text-xs font-black text-[#005A76]">#{r.borrow_id}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">{r.members?.full_name || "Unknown"}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">{r.books?.title}</p>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                          {r.users ? `${r.users.first_name} ${r.users.last_name}` : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${statusClass[r.status] || "bg-slate-100 text-slate-600"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-600">{formatDateTime(r.borrow_date)}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                          {r.return_date ? `Returned ${formatDateTime(r.return_date)}` : `Due ${formatDateTime(r.due_date)}`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Showing {showingStart} to {showingEnd} of {filteredRecords.length} records
              </p>
              <div className="flex items-center gap-1">
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
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-black transition ${safePage === page ? "bg-[#005A76] text-white" : "text-slate-600 hover:bg-slate-100"}`}
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