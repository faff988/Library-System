// import { useEffect, useState } from "react";
// import {
//   CalendarDays,
//   ChevronLeft,
//   ChevronRight,
//   DoorOpen,
//   FileDown,
//   FileSpreadsheet,
//   Printer,
//   RotateCcw,
//   Search,
//   UserRoundCheck,
//   Users,
// } from "lucide-react";
// import Navbar from "../../components/Navbar";
// import Sidebar from "../../components/Adminsidebar";
// import api from "../../utils/api";

// const PAGE_SIZE = 5;
// const PURPOSE_COLORS = ["#005A76", "#9A7A00", "#39A7D7", "#B7CBD6", "#C9CDD7", "#7C5CBF", "#C2547A"];

// function formatNumber(value) {
//   return new Intl.NumberFormat("en-US").format(value ?? 0);
// }

// function formatDateTime(value) {
//   if (!value) return { date: "—", time: "" };
//   const date = new Date(value);
//   return {
//     date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
//     time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
//   };
// }

// function escapeCsvValue(value) {
//   return `"${String(value ?? "").replace(/"/g, '""')}"`;
// }

// function downloadEntriesCsv(rows) {
//   const headers = ["Entry ID", "Attendee Name", "Age", "Address", "Phone Number", "Purpose", "Entry Time"];
//   const csvRows = rows.map((row) => [
//     row.entry_id,
//     row.attendee_name,
//     row.age,
//     row.address || "",
//     row.phone_number || "",
//     row.purpose || "",
//     row.entry_time,
//   ]);
//   const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = "entry-report.csv";
//   link.click();
//   URL.revokeObjectURL(url);
// }

// function buildDonutGradient(items) {
//   let cursor = 0;
//   return `conic-gradient(${items
//     .map((item) => {
//       const start = cursor;
//       cursor += item.percent;
//       return `${item.color} ${start}% ${cursor}%`;
//     })
//     .join(", ")})`;
// }

// // purpose is optional on library_entries, so entries without one are
// // grouped under "Unspecified" rather than dropped.
// function computePurposeDistribution(entries) {
//   if (!entries || !entries.length) return [];
//   const counts = new Map();
//   entries.forEach((e) => {
//     const key = e.purpose || "Unspecified";
//     counts.set(key, (counts.get(key) || 0) + 1);
//   });
//   return Array.from(counts.entries())
//     .map(([label, count], index) => ({
//       label,
//       count,
//       percent: Number(((count / entries.length) * 100).toFixed(1)),
//       color: PURPOSE_COLORS[index % PURPOSE_COLORS.length],
//     }))
//     .sort((a, b) => b.count - a.count);
// }

// function MetricCard({ card }) {
//   const Icon = card.icon;
//   return (
//     <article className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//       <span className={`absolute left-0 top-0 h-full w-1 ${card.accentClass}`} />
//       <div className="flex items-start justify-between gap-4">
//         <div className="min-w-0">
//           <p className="text-xs font-black text-slate-500">{card.title}</p>
//           <h3 className="mt-2 text-3xl font-black tracking-normal text-slate-900">{card.value}</h3>
//           {card.note && <p className={`mt-3 text-[11px] font-black ${card.noteClass}`}>{card.note}</p>}
//         </div>
//         <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}>
//           <Icon size={19} />
//         </span>
//       </div>
//     </article>
//   );
// }

// function EntryTrendChart({ byDay, loading }) {
//   const maxValue = Math.max(1, ...byDay.map((d) => d.count));

//   return (
//     <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//       <div className="flex items-center justify-between gap-3">
//         <h2 className="text-sm font-black text-slate-800">Daily Entries</h2>
//         <span className="text-[11px] font-bold text-slate-400">{byDay.length} day(s)</span>
//       </div>

//       {loading ? (
//         <div className="mt-5 flex h-48 items-center justify-center text-xs font-semibold text-slate-400">
//           Loading trend...
//         </div>
//       ) : byDay.length === 0 ? (
//         <div className="mt-5 flex h-48 items-center justify-center text-xs font-semibold text-slate-400">
//           No entries in this range.
//         </div>
//       ) : (
//         <>
//           <div className="mt-5 flex h-48 items-end gap-2 border-b border-slate-100">
//             {byDay.map((d) => (
//               <div key={d.day} className="relative flex h-full min-w-0 flex-1 items-end" title={`${d.day}: ${d.count}`}>
//                 <div
//                   className="w-full rounded-t-sm bg-[#005A76] transition hover:bg-[#00445a]"
//                   style={{ height: `${Math.max(4, (d.count / maxValue) * 100)}%` }}
//                 />
//               </div>
//             ))}
//           </div>
//           <div className="mt-3 flex gap-2 text-center text-[10px] font-black text-slate-400">
//             {byDay.map((d) => (
//               <span key={d.day} className="flex-1 truncate">
//                 {d.day.slice(5)}
//               </span>
//             ))}
//           </div>
//         </>
//       )}
//     </section>
//   );
// }

// function PurposeDistribution({ items, loading }) {
//   return (
//     <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//       <h2 className="text-sm font-black text-slate-800">Visit Purpose Distribution</h2>

//       {loading ? (
//         <div className="mt-6 flex h-36 items-center justify-center text-xs font-semibold text-slate-400">
//           Loading...
//         </div>
//       ) : items.length === 0 ? (
//         <div className="mt-6 flex h-36 items-center justify-center text-xs font-semibold text-slate-400">
//           No purpose data yet.
//         </div>
//       ) : (
//         <div className="mt-6 grid items-center gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
//           <div
//             className="mx-auto flex h-36 w-36 items-center justify-center rounded-full"
//             style={{ background: buildDonutGradient(items) }}
//           >
//             <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
//               <span className="text-2xl font-black tracking-normal text-slate-800">
//                 {items.reduce((s, i) => s + i.count, 0)}
//               </span>
//               <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
//             </div>
//           </div>

//           <div className="space-y-3">
//             {items.map((item) => (
//               <div key={item.label} className="flex items-center gap-3 text-xs font-bold">
//                 <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
//                 <span className="min-w-0 flex-1 text-slate-600">{item.label}</span>
//                 <span className="font-black text-slate-900">{item.percent}%</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }

// export default function EntryReport() {
//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const [entriesRows, setEntriesRows] = useState([]);
//   const [totalItems, setTotalItems] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const [summary, setSummary] = useState(null);
//   const [summaryLoading, setSummaryLoading] = useState(true);

//   useEffect(() => {
//     const t = setTimeout(() => {
//       setSearch(searchInput);
//       setCurrentPage(1);
//     }, 300);
//     return () => clearTimeout(t);
//   }, [searchInput]);

//   useEffect(() => {
//     fetchEntries();
//   }, [search, startDate, endDate, currentPage]);

//   useEffect(() => {
//     fetchSummary();
//   }, [startDate, endDate]);

//   const fetchEntries = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       if (search) params.append("search", search);
//       if (startDate) params.append("startDate", startDate);
//       if (endDate) params.append("endDate", endDate);
//       params.append("page", currentPage);
//       params.append("limit", PAGE_SIZE);

//       const response = await api.get(`/library-entries?${params.toString()}`);
//       if (response.data?.success) {
//         setEntriesRows(response.data.data);
//         const meta = response.data.meta || {};
//         setTotalItems(meta.totalItems ?? meta.total ?? response.data.data.length);
//       }
//     } catch (err) {
//       console.error("Failed to load entry records:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // reportsController.entries uses from/to (not startDate/endDate) as
//   // its query params, and caps results at 1000 rows.
//   const fetchSummary = async () => {
//     try {
//       setSummaryLoading(true);
//       const params = new URLSearchParams();
//       if (startDate) params.append("from", startDate);
//       if (endDate) params.append("to", endDate);

//       const response = await api.get(`/reports/entries?${params.toString()}`);
//       if (response.data?.success) setSummary(response.data.data);
//     } catch (err) {
//       console.error("Failed to load entry summary:", err);
//     } finally {
//       setSummaryLoading(false);
//     }
//   };

//   const handleExportCsv = async () => {
//     try {
//       const params = new URLSearchParams();
//       if (search) params.append("search", search);
//       if (startDate) params.append("startDate", startDate);
//       if (endDate) params.append("endDate", endDate);
//       params.append("limit", "1000");

//       const response = await api.get(`/library-entries?${params.toString()}`);
//       if (response.data?.success) downloadEntriesCsv(response.data.data);
//     } catch (err) {
//       console.error("Failed to export entries CSV:", err);
//       alert("Failed to export the report. Please try again.");
//     }
//   };

//   const resetFilters = () => {
//     setSearchInput("");
//     setSearch("");
//     setStartDate("");
//     setEndDate("");
//     setCurrentPage(1);
//   };

//   const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
//   const safePage = Math.min(currentPage, totalPages);
//   const showingStart = entriesRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
//   const showingEnd = Math.min(safePage * PAGE_SIZE, totalItems);

//   const todayKey = new Date().toISOString().slice(0, 10);
//   const todayCount = summary?.byDay?.find((d) => d.day === todayKey)?.count ?? 0;
//   const purposeItems = summary ? computePurposeDistribution(summary.entries) : [];
//   const topPurpose = purposeItems[0];

//   const metricCards =
//     summaryLoading || !summary
//       ? []
//       : [
//           {
//             title: "Total Entries",
//             value: formatNumber(summary.totalEntries),
//             note: startDate || endDate ? "In selected range" : "Most recent 1,000",
//             icon: Users,
//             iconClass: "bg-[#E6F4F7] text-[#005A76]",
//             accentClass: "bg-[#005A76]",
//             noteClass: "text-slate-500",
//           },
//           {
//             title: "Today's Entries",
//             value: formatNumber(todayCount),
//             icon: CalendarDays,
//             iconClass: "bg-[#FFF4CC] text-[#9A7A00]",
//             accentClass: "bg-[#9A7A00]",
//           },
//           {
//             title: "Average Age",
//             value: summary.averageAge || 0,
//             icon: UserRoundCheck,
//             iconClass: "bg-sky-100 text-sky-700",
//             accentClass: "bg-[#005A76]",
//           },
//           {
//             title: "Top Purpose",
//             value: topPurpose ? topPurpose.label : "—",
//             note: topPurpose ? `${topPurpose.percent}% of visits` : undefined,
//             icon: DoorOpen,
//             iconClass: "bg-emerald-100 text-emerald-700",
//             accentClass: "bg-emerald-500",
//             noteClass: "text-emerald-600",
//           },
//         ];

//   return (
//     <div className="flex h-screen overflow-hidden bg-[#E4ECF5]">
//       <Sidebar />

//       <div className="flex min-w-0 flex-1 flex-col">
//         <Navbar
//           title="Entry Report"
//           onBack={() => window.history.back()}
//           searchValue={searchInput}
//           onSearchChange={setSearchInput}
//           searchPlaceholder="Search attendee name..."
//         />

//         <main className="flex-1 p-4 md:p-6 lg:p-8">
//           <section className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
//             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//               <label className="relative block min-w-[150px]">
//                 <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]" />
//                 <input
//                   type="date"
//                   value={startDate}
//                   onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
//                   className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
//                 />
//               </label>
//               <label className="relative block min-w-[150px]">
//                 <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]" />
//                 <input
//                   type="date"
//                   value={endDate}
//                   onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
//                   className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
//                 />
//               </label>
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-[#005A76] hover:text-[#005A76]"
//               >
//                 <RotateCcw size={15} />
//                 Reset
//               </button>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               <button
//                 type="button"
//                 onClick={() => window.print()}
//                 className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76]"
//               >
//                 <FileDown size={15} />
//                 PDF
//               </button>
//               <button
//                 type="button"
//                 onClick={handleExportCsv}
//                 className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76]"
//               >
//                 <FileSpreadsheet size={15} />
//                 Excel
//               </button>
//               <button
//                 type="button"
//                 onClick={() => window.print()}
//                 className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#005A76] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#00445a]"
//               >
//                 <Printer size={15} />
//                 Print Report
//               </button>
//             </div>
//           </section>

//           <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             {summaryLoading || !summary ? (
//               <div className="col-span-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-400 shadow-sm">
//                 Loading summary...
//               </div>
//             ) : (
//               metricCards.map((card) => <MetricCard key={card.title} card={card} />)
//             )}
//           </section>

//           <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
//             <EntryTrendChart byDay={summary?.byDay || []} loading={summaryLoading} />
//             <PurposeDistribution items={purposeItems} loading={summaryLoading} />
//           </section>

//           <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
//             <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
//               <div>
//                 <h2 className="text-sm font-black text-slate-800">Entry Log</h2>
//                 <p className="mt-1 text-xs font-semibold text-slate-400">Recorded library visits and their stated purpose</p>
//               </div>
//               <label className="relative">
//                 <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   type="search"
//                   value={searchInput}
//                   onChange={(e) => setSearchInput(e.target.value)}
//                   placeholder="Filter by attendee name..."
//                   className="h-10 w-full min-w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
//                 />
//               </label>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[860px] text-left">
//                 <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
//                   <tr>
//                     {["Entry ID", "Attendee", "Age", "Contact", "Purpose", "Entry Time"].map((heading) => (
//                       <th key={heading} className="px-5 py-4 font-black">{heading}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-sm">
//                   {loading ? (
//                     <tr>
//                       <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-400">
//                         Loading entries...
//                       </td>
//                     </tr>
//                   ) : entriesRows.length === 0 ? (
//                     <tr>
//                       <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-400">
//                         No entry records found.
//                       </td>
//                     </tr>
//                   ) : (
//                     entriesRows.map((entry) => {
//                       const dt = formatDateTime(entry.entry_time);
//                       return (
//                         <tr key={entry.entry_id} className="transition hover:bg-slate-50">
//                           <td className="px-5 py-4 text-xs font-black text-slate-800">#{entry.entry_id}</td>
//                           <td className="px-5 py-4">
//                             <span className="block truncate font-black leading-tight text-slate-800">{entry.attendee_name}</span>
//                           </td>
//                           <td className="px-5 py-4 text-xs font-semibold text-slate-700">{entry.age}</td>
//                           <td className="px-5 py-4 text-xs font-semibold text-slate-700">
//                             {entry.phone_number || entry.address || "—"}
//                           </td>
//                           <td className="px-5 py-4">
//                             <span className="inline-flex rounded bg-sky-100 px-2.5 py-1 text-[10px] font-black uppercase text-sky-700">
//                               {entry.purpose || "Unspecified"}
//                             </span>
//                           </td>
//                           <td className="px-5 py-4 text-xs font-semibold text-slate-700">
//                             {dt.date} · {dt.time}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
//               <p className="text-xs font-semibold text-slate-500">
//                 Showing {showingStart}-{showingEnd} of {formatNumber(totalItems)} records
//               </p>
//               <div className="flex items-center gap-1">
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={safePage === 1}
//                   className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
//                   aria-label="Previous page"
//                 >
//                   <ChevronLeft size={16} />
//                 </button>
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                   <button
//                     type="button"
//                     key={page}
//                     onClick={() => setCurrentPage(page)}
//                     className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-black transition ${
//                       safePage === page ? "bg-[#005A76] text-white" : "text-slate-600 hover:bg-slate-100"
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={safePage === totalPages}
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
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  FileDown,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Search,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";

const PAGE_SIZE = 5;
const PURPOSE_COLORS = ["#005A76", "#9A7A00", "#39A7D7", "#B7CBD6", "#C9CDD7", "#7C5CBF", "#C2547A"];

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatDateTime(value) {
  if (!value) return { date: "—", time: "" };
  const date = new Date(value);
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

function escapeCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadEntriesCsv(rows) {
  const headers = ["Entry ID", "Attendee Name", "Age", "Address", "Phone Number", "Purpose", "Entry Time"];
  const csvRows = rows.map((row) => [
    row.entry_id,
    row.attendee_name,
    row.age,
    row.address || "",
    row.phone_number || "",
    row.purpose || "",
    row.entry_time,
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "entry-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

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
    <article className="relative overflow-hidden rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
      <span className={`absolute left-0 top-0 h-full w-1 ${card.accentClass}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-500">{card.title}</p>
          <h3 className="mt-2 text-3xl font-black tracking-normal text-slate-900">{card.value}</h3>
          {card.note && <p className={`mt-3 text-[11px] font-black ${card.noteClass}`}>{card.note}</p>}
        </div>
        <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}>
          <Icon size={19} />
        </span>
      </div>
    </article>
  );
}

function EntryTrendChart({ byDay, loading }) {
  const maxValue = Math.max(1, ...byDay.map((d) => d.count));

  return (
    <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-800">Daily Entries</h2>
        <span className="text-[11px] font-bold text-slate-400">{byDay.length} day(s)</span>
      </div>

      {loading ? (
        <div className="mt-5 flex h-48 items-center justify-center text-xs font-semibold text-slate-400">
          Loading trend...
        </div>
      ) : byDay.length === 0 ? (
        <div className="mt-5 flex h-48 items-center justify-center text-xs font-semibold text-slate-400">
          No entries in this range.
        </div>
      ) : (
        <>
          <div className="mt-5 flex h-48 items-end gap-2 border-b border-gray-200">
            {byDay.map((d) => (
              <div key={d.day} className="relative flex h-full min-w-0 flex-1 items-end" title={`${d.day}: ${d.count}`}>
                <div
                  className="w-full rounded-t-sm bg-[#005A76] transition hover:bg-[#00445a]"
                  style={{ height: `${Math.max(4, (d.count / maxValue) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 text-center text-[10px] font-black text-slate-400">
            {byDay.map((d) => (
              <span key={d.day} className="flex-1 truncate">
                {d.day.slice(5)}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function PurposeDistribution({ items, loading }) {
  return (
    <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-black text-slate-800">Visit Purpose Distribution</h2>

      {loading ? (
        <div className="mt-6 flex h-36 items-center justify-center text-xs font-semibold text-slate-400">
          Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 flex h-36 items-center justify-center text-xs font-semibold text-slate-400">
          No purpose data yet.
        </div>
      ) : (
        <div className="mt-6 grid items-center gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
          <div
            className="mx-auto flex h-36 w-36 items-center justify-center rounded-full"
            style={{ background: buildDonutGradient(items) }}
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-2xl font-black tracking-normal text-slate-800">
                {items.reduce((s, i) => s + i.count, 0)}
              </span>
              <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-xs font-bold">
                <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="min-w-0 flex-1 text-slate-600">{item.label}</span>
                <span className="font-black text-slate-900">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function EntryReport() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [entriesRows, setEntriesRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

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
        setTotalItems(meta.totalItems ?? meta.total ?? response.data.data.length);
      }
    } catch (err) {
      console.error("Failed to load entry records:", err);
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

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("limit", "1000");

      const response = await api.get(`/library-entries?${params.toString()}`);
      if (response.data?.success) downloadEntriesCsv(response.data.data);
    } catch (err) {
      console.error("Failed to export entries CSV:", err);
      alert("Failed to export the report. Please try again.");
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const showingStart = entriesRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, totalItems);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayCount = summary?.byDay?.find((d) => d.day === todayKey)?.count ?? 0;
  const purposeItems = summary ? computePurposeDistribution(summary.entries) : [];
  const topPurpose = purposeItems[0];

  const metricCards =
    summaryLoading || !summary
      ? []
      : [
          {
            title: "Total Entries",
            value: formatNumber(summary.totalEntries),
            note: startDate || endDate ? "In selected range" : "Most recent 1,000",
            icon: Users,
            iconClass: "bg-[#E6F4F7] text-[#005A76]",
            accentClass: "bg-[#005A76]",
            noteClass: "text-slate-500",
          },
          {
            title: "Today's Entries",
            value: formatNumber(todayCount),
            icon: CalendarDays,
            iconClass: "bg-[#FFF4CC] text-[#9A7A00]",
            accentClass: "bg-[#9A7A00]",
          },
          {
            title: "Average Age",
            value: summary.averageAge || 0,
            icon: UserRoundCheck,
            iconClass: "bg-sky-100 text-sky-700",
            accentClass: "bg-[#005A76]",
          },
          {
            title: "Top Purpose",
            value: topPurpose ? topPurpose.label : "—",
            note: topPurpose ? `${topPurpose.percent}% of visits` : undefined,
            icon: DoorOpen,
            iconClass: "bg-emerald-100 text-emerald-700",
            accentClass: "bg-emerald-500",
            noteClass: "text-emerald-600",
          },
        ];

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#E9EEF4]">
        <Navbar
          title="Entry Report"
          onBack={() => window.history.back()}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search attendee name..."
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <section className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="relative block min-w-[150px]">
                <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
                />
              </label>
              <label className="relative block min-w-[150px]">
                <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
                />
              </label>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-[#005A76] hover:text-[#005A76]"
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76]"
              >
                <FileDown size={15} />
                PDF
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76]"
              >
                <FileSpreadsheet size={15} />
                Excel
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#005A76] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#00445a]"
              >
                <Printer size={15} />
                Print Report
              </button>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryLoading || !summary ? (
              <div className="col-span-full rounded-lg border border-gray-300 bg-white p-4 text-sm text-slate-400 shadow-sm">
                Loading summary...
              </div>
            ) : (
              metricCards.map((card) => <MetricCard key={card.title} card={card} />)
            )}
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <EntryTrendChart byDay={summary?.byDay || []} loading={summaryLoading} />
            <PurposeDistribution items={purposeItems} loading={summaryLoading} />
          </section>

          <section className="mt-5 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-800">Entry Log</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">Recorded library visits and their stated purpose</p>
              </div>
              <label className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Filter by attendee name..."
                  className="h-10 w-full min-w-64 rounded-md border border-gray-300 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    {["Entry ID", "Attendee", "Age", "Contact", "Purpose", "Entry Time"].map((heading) => (
                      <th key={heading} className="px-5 py-4 font-black">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-400">
                        Loading entries...
                      </td>
                    </tr>
                  ) : entriesRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm font-semibold text-slate-400">
                        No entry records found.
                      </td>
                    </tr>
                  ) : (
                    entriesRows.map((entry) => {
                      const dt = formatDateTime(entry.entry_time);
                      return (
                        <tr key={entry.entry_id} className="transition hover:bg-slate-50">
                          <td className="px-5 py-4 text-xs font-black text-slate-800">#{entry.entry_id}</td>
                          <td className="px-5 py-4">
                            <span className="block truncate font-black leading-tight text-slate-800">{entry.attendee_name}</span>
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold text-slate-700">{entry.age}</td>
                          <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                            {entry.phone_number || entry.address || "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded bg-sky-100 px-2.5 py-1 text-[10px] font-black uppercase text-sky-700">
                              {entry.purpose || "Unspecified"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                            {dt.date} · {dt.time}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Showing {showingStart}-{showingEnd} of {formatNumber(totalItems)} records
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
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