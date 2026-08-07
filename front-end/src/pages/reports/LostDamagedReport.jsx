// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   AlertCircle,
//   AlertTriangle,
//   BookX,
//   Calendar,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   ClipboardList,
//   FileDown,
//   Loader2,
//   MoreVertical,
//   Printer,
//   RefreshCcw,
//   RotateCcw,
//   Search,
//   Table as TableIcon,
// } from "lucide-react";
// import Navbar from "../../components/Navbar";
// import Sidebar from "../../components/Adminsidebar";

// const PAGE_SIZE = 5;

// // --- API wiring -------------------------------------------------------
// // Same assumptions as the other wired report pages: adjust API_BASE / the
// // auth-token lookup if your project's api.js / AuthContext differ.
// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// async function apiFetch(path, options = {}) {
//   const token = localStorage.getItem("token");
//   const res = await fetch(`${API_BASE}${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...(options.headers || {}),
//     },
//   });
//   const json = await res.json().catch(() => null);
//   if (!res.ok || !json?.success) {
//     throw new Error(json?.message || `Request failed (${res.status})`);
//   }
//   return json;
// }

// function formatDate(value) {
//   if (!value) return "--";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "--";
//   return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
// }

// function getDateRangeCutoff(option) {
//   const now = new Date();
//   if (option === "Last 90 Days") {
//     const d = new Date(now);
//     d.setDate(d.getDate() - 90);
//     return d;
//   }
//   if (option === "This Year") return new Date(now.getFullYear(), 0, 1);
//   const d = new Date(now);
//   d.setDate(d.getDate() - 30);
//   return d;
// }

// // Maps a damage_reports row (see reportsController.lostDamaged) into the
// // shape this UI uses. `books` here only selects title/author/dewey_code
// // (no isbn, no category) so those show what's actually available instead.
// function normalizeIncident(r) {
//   const reporterName = r.users ? `${r.users.first_name} ${r.users.last_name}`.trim() : "Unknown staff";
//   return {
//     id: `#REP-${r.report_id ?? "?"}`,
//     title: r.books?.title || "Unknown Book",
//     author: r.books?.author || "",
//     dewey: r.books?.dewey_code || "--",
//     // Not selected by the current /reports/lost-damaged query (books.select
//     // only includes title/author/dewey_code) - add `category: true` to that
//     // select in reportsController.js to make this real.
//     category: r.books?.category || null,
//     type: r.book_condition || "Unknown",
//     reportedBy: reporterName,
//     memberName: r.borrow_records?.members?.full_name || null,
//     reportedDateRaw: r.reported_at,
//     reportedDate: formatDate(r.reported_at),
//   };
// }

// function escapeCsvValue(value) {
//   return `"${String(value).replace(/"/g, '""')}"`;
// }

// function downloadCsv(rows) {
//   const headers = ["Report ID", "Book Title", "Dewey Code", "Category", "Condition", "Reported By", "Member", "Reported Date"];
//   const csvRows = rows.map((row) => [
//     row.id,
//     row.title,
//     row.dewey,
//     row.category || "Uncategorized",
//     row.type,
//     row.reportedBy,
//     row.memberName || "--",
//     row.reportedDate,
//   ]);
//   const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");

//   link.href = url;
//   link.download = "lost-damaged-report.csv";
//   link.click();
//   URL.revokeObjectURL(url);
// }

// function getStatusClass(type) {
//   const classes = {
//     Lost: "bg-red-50 text-red-600",
//     Damaged: "bg-[#FFF3C4] text-[#A06E00]",
//     Fair: "bg-[#FFE8CC] text-[#B45309]",
//     Good: "bg-emerald-50 text-emerald-600",
//   };

//   return classes[type] || "bg-gray-100 text-gray-600";
// }

// function computeMonthlyTrend(rows) {
//   const now = new Date();
//   const buckets = [];
//   for (let i = 5; i >= 0; i--) {
//     const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//     buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleDateString("en-US", { month: "short" }), lost: 0, damaged: 0 });
//   }
//   const bucketMap = new Map(buckets.map((b) => [b.key, b]));

//   rows.forEach((r) => {
//     if (!r.reportedDateRaw) return;
//     const d = new Date(r.reportedDateRaw);
//     const bucket = bucketMap.get(`${d.getFullYear()}-${d.getMonth()}`);
//     if (!bucket) return;
//     if (r.type === "Lost") bucket.lost += 1;
//     if (r.type === "Damaged") bucket.damaged += 1;
//   });

//   return buckets;
// }

// // Real insight cards computed from the incident history itself - no cost
// // data exists anywhere in the schema (same gap the /reports/fines endpoint
// // already documents), so unlike the mock this never invents a dollar figure.
// function computeRiskAlerts(rows) {
//   const lostCounts = new Map();
//   const damagedCounts = new Map();

//   rows.forEach((r) => {
//     if (r.type === "Lost") lostCounts.set(r.title, (lostCounts.get(r.title) || 0) + 1);
//     if (r.type === "Damaged") damagedCounts.set(r.title, (damagedCounts.get(r.title) || 0) + 1);
//   });

//   const topLost = [...lostCounts.entries()].sort((a, b) => b[1] - a[1])[0];
//   const topDamaged = [...damagedCounts.entries()].sort((a, b) => b[1] - a[1])[0];
//   const mostRecent = rows[0];

//   const alerts = [];
//   if (topLost && topLost[1] > 1) {
//     alerts.push({
//       title: "Frequent Loss",
//       detail: `${topLost[0]} (${topLost[1]} lost reports)`,
//       className: "border-red-500 bg-red-50 text-red-600",
//     });
//   }
//   if (topDamaged && topDamaged[1] > 1) {
//     alerts.push({
//       title: "Frequently Damaged",
//       detail: `${topDamaged[0]} (${topDamaged[1]} damage reports)`,
//       className: "border-[#006088] bg-[#E6F4F7] text-[#006088]",
//     });
//   }
//   if (mostRecent) {
//     alerts.push({
//       title: "Most Recent Incident",
//       detail: `${mostRecent.title} - ${mostRecent.type}, ${mostRecent.reportedDate}`,
//       className: "border-[#C79700] bg-[#FFF7D8] text-[#8A6500]",
//     });
//   }
//   return alerts;
// }

// function StatCard({ card }) {
//   return (
//     <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
//       <div className="flex items-start justify-between gap-3">
//         <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.iconClass}`}>
//           <card.icon size={17} />
//         </div>
//       </div>
//       <p className="mt-4 text-[11px] font-extrabold uppercase text-gray-500">{card.label}</p>
//       <h3 className="mt-1 text-2xl font-extrabold tracking-normal text-[#1B4965]">{card.value}</h3>
//     </div>
//   );
// }

// function TrendChart({ data }) {
//   const maxValue = Math.max(...data.flatMap((point) => [point.lost, point.damaged]), 1);
//   const width = 600;
//   const height = 190;
//   const paddingX = 28;
//   const paddingY = 18;
//   const chartHeight = height - paddingY * 2;
//   const step = (width - paddingX * 2) / Math.max(1, data.length - 1);

//   const getPoint = (value, index) => {
//     const x = paddingX + index * step;
//     const y = paddingY + chartHeight - (value / maxValue) * chartHeight;
//     return `${x},${y}`;
//   };

//   const lostPath = data.map((point, index) => getPoint(point.lost, index)).join(" ");
//   const damagedPath = data.map((point, index) => getPoint(point.damaged, index)).join(" ");

//   return (
//     <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
//       <div className="flex items-start justify-between gap-4">
//         <h2 className="text-base font-extrabold text-gray-800">Monthly Trend</h2>
//         <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500">
//           <span className="flex items-center gap-1.5">
//             <span className="h-2 w-2 rounded-full bg-[#006088]" />
//             Lost
//           </span>
//           <span className="flex items-center gap-1.5">
//             <span className="h-2 w-2 rounded-full bg-[#F5C842]" />
//             Damaged
//           </span>
//         </div>
//       </div>

//       <div className="mt-4 overflow-hidden rounded-md bg-white">
//         <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label="Lost and damaged monthly trend">
//           {[0, 1, 2, 3].map((line) => {
//             const y = paddingY + (chartHeight / 3) * line;
//             return <line key={line} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#EEF2F6" strokeWidth="1" />;
//           })}
//           <polyline points={lostPath} fill="none" stroke="#006088" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
//           <polyline points={damagedPath} fill="none" stroke="#F5C842" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
//           {data.map((point, index) => {
//             const [lostX, lostY] = getPoint(point.lost, index).split(",");
//             const [damagedX, damagedY] = getPoint(point.damaged, index).split(",");
//             return (
//               <g key={point.key}>
//                 <circle cx={lostX} cy={lostY} r="4" fill="#006088" />
//                 <circle cx={damagedX} cy={damagedY} r="4" fill="#F5C842" />
//                 <text x={lostX} y={height - 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">
//                   {point.month}
//                 </text>
//               </g>
//             );
//           })}
//         </svg>
//       </div>
//     </div>
//   );
// }

// function RiskAlerts({ alerts, loading }) {
//   return (
//     <aside className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
//       <div className="flex items-center gap-2">
//         <AlertCircle size={18} className="text-red-500" />
//         <h2 className="text-base font-extrabold text-gray-800">Incident Insights</h2>
//       </div>

//       <div className="mt-4 space-y-3">
//         {alerts.map((alert) => (
//           <div key={alert.title} className={`rounded-md border-l-4 p-3 ${alert.className}`}>
//             <p className="text-[11px] font-extrabold uppercase">{alert.title}</p>
//             <p className="mt-1 text-xs font-semibold leading-5 text-gray-700">{alert.detail}</p>
//           </div>
//         ))}
//         {!alerts.length && (
//           <p className="px-1 py-3 text-xs font-semibold text-gray-400">
//             {loading ? "Loading..." : "No repeat incidents to flag yet"}
//           </p>
//         )}
//       </div>
//     </aside>
//   );
// }

// function StatusBadge({ type }) {
//   return (
//     <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${getStatusClass(type)}`}>
//       {type}
//     </span>
//   );
// }

// export default function LostDamagedReport() {
//   const [rows, setRows] = useState([]);
//   const [summary, setSummary] = useState({ total: 0, damaged: 0, fair: 0, lost: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [headerSearch, setHeaderSearch] = useState("");
//   const [tableSearch, setTableSearch] = useState("");
//   const [dateRange, setDateRange] = useState("Last 30 Days");
//   const [typeFilter, setTypeFilter] = useState("All");
//   const [categoryFilter, setCategoryFilter] = useState("All");
//   const [currentPage, setCurrentPage] = useState(1);

//   const loadReport = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       // No query params are read server-side (no from/to filtering, no
//       // pagination) - it always returns the full history, so date-range
//       // filtering happens client-side below.
//       const json = await apiFetch("/reports/lost-damaged");
//       setRows((json.data?.rows || []).map(normalizeIncident));
//       setSummary(json.data?.summary || { total: 0, damaged: 0, fair: 0, lost: 0 });
//     } catch (err) {
//       setError(err.message || "Unable to load lost/damaged report.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadReport();
//   }, [loadReport]);

//   const typeOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.type))).sort(), [rows]);
//   const categories = useMemo(
//     () => ["All", ...new Set(rows.map((r) => r.category || "Uncategorized"))],
//     [rows],
//   );

//   const filteredIncidents = useMemo(() => {
//     const headerQuery = headerSearch.trim().toLowerCase();
//     const tableQuery = tableSearch.trim().toLowerCase();
//     const cutoff = getDateRangeCutoff(dateRange);

//     return rows.filter((incident) => {
//       const searchableText = `${incident.id} ${incident.title} ${incident.dewey} ${incident.category || ""} ${incident.type} ${incident.reportedBy}`.toLowerCase();
//       const matchesHeader = !headerQuery || searchableText.includes(headerQuery);
//       const matchesTable = !tableQuery || searchableText.includes(tableQuery);
//       const matchesType = typeFilter === "All" || incident.type === typeFilter;
//       const matchesCategory = categoryFilter === "All" || (incident.category || "Uncategorized") === categoryFilter;
//       const matchesDate = !incident.reportedDateRaw || new Date(incident.reportedDateRaw) >= cutoff;

//       return matchesHeader && matchesTable && matchesType && matchesCategory && matchesDate;
//     });
//   }, [rows, categoryFilter, dateRange, headerSearch, tableSearch, typeFilter]);

//   const pageCount = Math.max(1, Math.ceil(filteredIncidents.length / PAGE_SIZE));
//   const safePage = Math.min(currentPage, pageCount);
//   const visibleIncidents = filteredIncidents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

//   const monthlyTrend = useMemo(() => computeMonthlyTrend(rows), [rows]);
//   const riskAlerts = useMemo(() => computeRiskAlerts(rows), [rows]);

//   const summaryCards = [
//     { label: "Total Reports", value: summary.total, icon: ClipboardList, iconClass: "bg-[#E7F4FA] text-[#006088]" },
//     { label: "Lost", value: summary.lost, icon: BookX, iconClass: "bg-red-50 text-red-500" },
//     { label: "Damaged", value: summary.damaged, icon: AlertTriangle, iconClass: "bg-[#FFF2C7] text-[#8A6500]" },
//     { label: "Fair Condition", value: summary.fair, icon: CheckCircle2, iconClass: "bg-emerald-50 text-emerald-600" },
//   ];

//   const handleFilterChange = (setter) => (event) => {
//     setter(event.target.value);
//     setCurrentPage(1);
//   };

//   const resetFilters = () => {
//     setTableSearch("");
//     setDateRange("Last 30 Days");
//     setTypeFilter("All");
//     setCategoryFilter("All");
//     setCurrentPage(1);
//   };

//   return (
//     <div className="flex h-screen overflow-hidden bg-[#E9EEF4]">
//       <Sidebar />

//       <div className="flex min-w-0 flex-1 flex-col">
//         <Navbar
//           title="Lost or Damaged Book Report"
//           breadcrumb="Reports"
//           onBack={() => window.history.back()}
//           searchValue={headerSearch}
//           onSearchChange={setHeaderSearch}
//           searchPlaceholder="Search books, member..."
//         />

//         <main className="flex-1 p-4 md:p-6 lg:p-8">
//           {error && (
//             <div className="mb-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
//               <span>{error}</span>
//               <button type="button" onClick={loadReport} className="rounded-md bg-red-600 px-3 py-1.5 text-white">
//                 Retry
//               </button>
//             </div>
//           )}

//           <div className="mb-4 flex justify-end">
//             <button
//               type="button"
//               onClick={loadReport}
//               disabled={loading}
//               className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-[11px] font-bold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
//             >
//               {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
//               {loading ? "Loading..." : "Refresh"}
//             </button>
//           </div>

//           <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             {summaryCards.map((card) => (
//               <StatCard key={card.label} card={card} />
//             ))}
//           </section>

//           <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
//             <TrendChart data={monthlyTrend} />
//             <RiskAlerts alerts={riskAlerts} loading={loading} />
//           </section>

//           <section className="mt-6 flex flex-col gap-4">
//             <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
//               <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
//                 <label className="relative">
//                   <Calendar
//                     size={15}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   />
//                   <select
//                     value={dateRange}
//                     onChange={handleFilterChange(setDateRange)}
//                     className="h-10 min-w-40 appearance-none rounded-md border border-gray-200 bg-white pl-9 pr-8 text-xs font-bold text-gray-600 outline-none transition focus:border-[#1B4965]"
//                   >
//                     <option>Last 30 Days</option>
//                     <option>Last 90 Days</option>
//                     <option>This Year</option>
//                   </select>
//                 </label>

//                 <label className="relative">
//                   <BookX
//                     size={15}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   />
//                   <select
//                     value={typeFilter}
//                     onChange={handleFilterChange(setTypeFilter)}
//                     className="h-10 min-w-44 appearance-none rounded-md border border-gray-200 bg-white pl-9 pr-8 text-xs font-bold text-gray-600 outline-none transition focus:border-[#1B4965]"
//                   >
//                     <option value="All">Condition: All</option>
//                     {typeOptions.map((type) => (
//                       <option key={type} value={type}>
//                         {type}
//                       </option>
//                     ))}
//                   </select>
//                 </label>

//                 <label className="relative">
//                   <Search
//                     size={15}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   />
//                   <input
//                     type="search"
//                     value={tableSearch}
//                     onChange={handleFilterChange(setTableSearch)}
//                     placeholder="Search reports"
//                     className="h-10 min-w-48 rounded-md border border-gray-200 bg-white pl-9 pr-3 text-xs font-bold text-gray-600 outline-none transition focus:border-[#1B4965]"
//                   />
//                 </label>

//                 <label className="relative">
//                   <AlertCircle
//                     size={15}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   />
//                   <select
//                     value={categoryFilter}
//                     onChange={handleFilterChange(setCategoryFilter)}
//                     className="h-10 min-w-44 appearance-none rounded-md border border-gray-200 bg-white pl-9 pr-8 text-xs font-bold text-gray-600 outline-none transition focus:border-[#1B4965]"
//                   >
//                     {categories.map((category) => (
//                       <option key={category} value={category}>
//                         {category === "All" ? "Category: All" : category}
//                       </option>
//                     ))}
//                   </select>
//                 </label>

//                 <button
//                   type="button"
//                   onClick={resetFilters}
//                   className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-xs font-bold text-[#006088] shadow-sm transition hover:bg-[#E6F4F7]"
//                 >
//                   <RotateCcw size={15} />
//                   Reset
//                 </button>
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 <button
//                   type="button"
//                   onClick={() => window.print()}
//                   className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
//                 >
//                   <FileDown size={15} />
//                   PDF
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => downloadCsv(filteredIncidents)}
//                   className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
//                 >
//                   <TableIcon size={15} />
//                   Excel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => window.print()}
//                   className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1B4965] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#14374d]"
//                 >
//                   <Printer size={15} />
//                   Print Report
//                 </button>
//               </div>
//             </div>
//           </section>

//           <section className="mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
//             <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
//               <h2 className="text-base font-extrabold text-gray-800">Detailed Incident Logs</h2>
//               <p className="text-xs font-semibold text-gray-500">
//                 Showing {visibleIncidents.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}-
//                 {Math.min(safePage * PAGE_SIZE, filteredIncidents.length)} of{" "}
//                 {filteredIncidents.length} reports
//               </p>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[850px] text-left">
//                 <thead className="bg-[#F1F6FA] text-[11px] uppercase tracking-wide text-gray-500">
//                   <tr>
//                     <th className="px-5 py-4 font-extrabold">Report ID</th>
//                     <th className="px-5 py-4 font-extrabold">Book Details</th>
//                     <th className="px-5 py-4 font-extrabold">Category</th>
//                     <th className="px-5 py-4 text-center font-extrabold">Condition</th>
//                     <th className="px-5 py-4 font-extrabold">Reported By</th>
//                     <th className="px-5 py-4 font-extrabold">Reported Date</th>
//                     <th className="px-5 py-4 w-12" />
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm">
//                   {loading && !rows.length && (
//                     <tr>
//                       <td colSpan={7} className="px-5 py-16 text-center">
//                         <Loader2 size={20} className="mx-auto animate-spin text-[#1B4965]" />
//                         <p className="mt-2 text-xs font-bold text-gray-400">Loading incident reports...</p>
//                       </td>
//                     </tr>
//                   )}

//                   {!loading &&
//                     visibleIncidents.map((incident) => (
//                       <tr key={incident.id} className="transition hover:bg-[#F8FAFC]">
//                         <td className="px-5 py-4 text-xs font-extrabold text-[#006088]">{incident.id}</td>
//                         <td className="px-5 py-4">
//                           <p className="font-extrabold leading-tight text-gray-900">{incident.title}</p>
//                           <p className="mt-1 text-xs font-semibold text-gray-400">Dewey: {incident.dewey}</p>
//                         </td>
//                         <td className="px-5 py-4">
//                           <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
//                             {incident.category || "Uncategorized"}
//                           </span>
//                         </td>
//                         <td className="px-5 py-4 text-center">
//                           <StatusBadge type={incident.type} />
//                         </td>
//                         <td className="px-5 py-4">
//                           <p className="font-bold text-gray-700">{incident.reportedBy}</p>
//                           {incident.memberName && (
//                             <p className="mt-1 text-xs font-semibold text-gray-400">For: {incident.memberName}</p>
//                           )}
//                         </td>
//                         <td className="px-5 py-4 text-xs font-semibold text-gray-500">{incident.reportedDate}</td>
//                         <td className="px-5 py-4 text-center">
//                           <button
//                             type="button"
//                             onClick={() =>
//                               window.alert(`${incident.title} - ${incident.type}, reported ${incident.reportedDate}`)
//                             }
//                             className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
//                             aria-label={`View details for ${incident.title}`}
//                           >
//                             <MoreVertical size={16} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}

//                   {!loading && visibleIncidents.length === 0 && (
//                     <tr>
//                       <td colSpan={7} className="px-5 py-10 text-center text-sm font-semibold text-gray-400">
//                         No lost or damaged reports found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
//               <button
//                 type="button"
//                 onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
//                 className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
//               >
//                 <ChevronLeft size={15} />
//                 Previous
//               </button>

//               <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
//                 {Array.from({ length: pageCount }).map((_, index) => {
//                   const page = index + 1;

//                   return (
//                     <button
//                       type="button"
//                       key={page}
//                       onClick={() => setCurrentPage(page)}
//                       className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
//                         safePage === page ? "bg-[#1B4965] text-white" : "text-gray-500 hover:bg-gray-100"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   );
//                 })}
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
//                 className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
//               >
//                 Next
//                 <ChevronRight size={15} />
//               </button>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BookX,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileDown,
  Loader2,
  MoreVertical,
  Printer,
  RefreshCcw,
  RotateCcw,
  Search,
  Table as TableIcon,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const PAGE_SIZE = 5;

// --- API wiring -------------------------------------------------------
// Same assumptions as the other wired report pages: adjust API_BASE / the
// auth-token lookup if your project's api.js / AuthContext differ.
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

function formatDate(value) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function getDateRangeCutoff(option) {
  const now = new Date();
  if (option === "Last 90 Days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 90);
    return d;
  }
  if (option === "This Year") return new Date(now.getFullYear(), 0, 1);
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return d;
}

// Maps a damage_reports row (see reportsController.lostDamaged) into the
// shape this UI uses. `books` here only selects title/author/dewey_code
// (no isbn, no category) so those show what's actually available instead.
function normalizeIncident(r) {
  const reporterName = r.users ? `${r.users.first_name} ${r.users.last_name}`.trim() : "Unknown staff";
  return {
    id: `#REP-${r.report_id ?? "?"}`,
    title: r.books?.title || "Unknown Book",
    author: r.books?.author || "",
    dewey: r.books?.dewey_code || "--",
    // Not selected by the current /reports/lost-damaged query (books.select
    // only includes title/author/dewey_code) - add `category: true` to that
    // select in reportsController.js to make this real.
    category: r.books?.category || null,
    type: r.book_condition || "Unknown",
    reportedBy: reporterName,
    memberName: r.borrow_records?.members?.full_name || null,
    reportedDateRaw: r.reported_at,
    reportedDate: formatDate(r.reported_at),
  };
}

function escapeCsvValue(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(rows) {
  const headers = ["Report ID", "Book Title", "Dewey Code", "Category", "Condition", "Reported By", "Member", "Reported Date"];
  const csvRows = rows.map((row) => [
    row.id,
    row.title,
    row.dewey,
    row.category || "Uncategorized",
    row.type,
    row.reportedBy,
    row.memberName || "--",
    row.reportedDate,
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "lost-damaged-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function getStatusClass(type) {
  const classes = {
    Lost: "bg-red-50 text-red-600",
    Damaged: "bg-[#FFF3C4] text-[#A06E00]",
    Fair: "bg-[#FFE8CC] text-[#B45309]",
    Good: "bg-emerald-50 text-emerald-600",
  };

  return classes[type] || "bg-gray-100 text-gray-600";
}

function computeMonthlyTrend(rows) {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleDateString("en-US", { month: "short" }), lost: 0, damaged: 0 });
  }
  const bucketMap = new Map(buckets.map((b) => [b.key, b]));

  rows.forEach((r) => {
    if (!r.reportedDateRaw) return;
    const d = new Date(r.reportedDateRaw);
    const bucket = bucketMap.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (!bucket) return;
    if (r.type === "Lost") bucket.lost += 1;
    if (r.type === "Damaged") bucket.damaged += 1;
  });

  return buckets;
}

// Real insight cards computed from the incident history itself - no cost
// data exists anywhere in the schema (same gap the /reports/fines endpoint
// already documents), so unlike the mock this never invents a dollar figure.
function computeRiskAlerts(rows) {
  const lostCounts = new Map();
  const damagedCounts = new Map();

  rows.forEach((r) => {
    if (r.type === "Lost") lostCounts.set(r.title, (lostCounts.get(r.title) || 0) + 1);
    if (r.type === "Damaged") damagedCounts.set(r.title, (damagedCounts.get(r.title) || 0) + 1);
  });

  const topLost = [...lostCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topDamaged = [...damagedCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const mostRecent = rows[0];

  const alerts = [];
  if (topLost && topLost[1] > 1) {
    alerts.push({
      title: "Frequent Loss",
      detail: `${topLost[0]} (${topLost[1]} lost reports)`,
      className: "border-red-500 bg-red-50 text-red-600",
    });
  }
  if (topDamaged && topDamaged[1] > 1) {
    alerts.push({
      title: "Frequently Damaged",
      detail: `${topDamaged[0]} (${topDamaged[1]} damage reports)`,
      className: "border-[#006088] bg-[#E6F4F7] text-[#006088]",
    });
  }
  if (mostRecent) {
    alerts.push({
      title: "Most Recent Incident",
      detail: `${mostRecent.title} - ${mostRecent.type}, ${mostRecent.reportedDate}`,
      className: "border-[#C79700] bg-[#FFF7D8] text-[#8A6500]",
    });
  }
  return alerts;
}

function StatCard({ card }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.iconClass}`}>
          <card.icon size={17} />
        </div>
      </div>
      <p className="mt-4 text-[11px] font-extrabold uppercase text-gray-500">{card.label}</p>
      <h3 className="mt-1 text-2xl font-extrabold tracking-normal text-[#1B4965]">{card.value}</h3>
    </div>
  );
}

function TrendChart({ data }) {
  const maxValue = Math.max(...data.flatMap((point) => [point.lost, point.damaged]), 1);
  const width = 600;
  const height = 190;
  const paddingX = 28;
  const paddingY = 18;
  const chartHeight = height - paddingY * 2;
  const step = (width - paddingX * 2) / Math.max(1, data.length - 1);

  const getPoint = (value, index) => {
    const x = paddingX + index * step;
    const y = paddingY + chartHeight - (value / maxValue) * chartHeight;
    return `${x},${y}`;
  };

  const lostPath = data.map((point, index) => getPoint(point.lost, index)).join(" ");
  const damagedPath = data.map((point, index) => getPoint(point.damaged, index)).join(" ");

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-extrabold text-gray-800">Monthly Trend</h2>
        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#006088]" />
            Lost
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#F5C842]" />
            Damaged
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-md bg-white">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label="Lost and damaged monthly trend">
          {[0, 1, 2, 3].map((line) => {
            const y = paddingY + (chartHeight / 3) * line;
            return <line key={line} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#EEF2F6" strokeWidth="1" />;
          })}
          <polyline points={lostPath} fill="none" stroke="#006088" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={damagedPath} fill="none" stroke="#F5C842" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((point, index) => {
            const [lostX, lostY] = getPoint(point.lost, index).split(",");
            const [damagedX, damagedY] = getPoint(point.damaged, index).split(",");
            return (
              <g key={point.key}>
                <circle cx={lostX} cy={lostY} r="4" fill="#006088" />
                <circle cx={damagedX} cy={damagedY} r="4" fill="#F5C842" />
                <text x={lostX} y={height - 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">
                  {point.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function RiskAlerts({ alerts, loading }) {
  return (
    <aside className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <AlertCircle size={18} className="text-red-500" />
        <h2 className="text-base font-extrabold text-gray-800">Incident Insights</h2>
      </div>

      <div className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <div key={alert.title} className={`rounded-md border-l-4 p-3 ${alert.className}`}>
            <p className="text-[11px] font-extrabold uppercase">{alert.title}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-gray-700">{alert.detail}</p>
          </div>
        ))}
        {!alerts.length && (
          <p className="px-1 py-3 text-xs font-semibold text-gray-400">
            {loading ? "Loading..." : "No repeat incidents to flag yet"}
          </p>
        )}
      </div>
    </aside>
  );
}

function StatusBadge({ type }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${getStatusClass(type)}`}>
      {type}
    </span>
  );
}

export default function LostDamagedReport() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, damaged: 0, fair: 0, lost: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // No query params are read server-side (no from/to filtering, no
      // pagination) - it always returns the full history, so date-range
      // filtering happens client-side below.
      const json = await apiFetch("/reports/lost-damaged");
      setRows((json.data?.rows || []).map(normalizeIncident));
      setSummary(json.data?.summary || { total: 0, damaged: 0, fair: 0, lost: 0 });
    } catch (err) {
      setError(err.message || "Unable to load lost/damaged report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const typeOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.type))).sort(), [rows]);
  const categories = useMemo(
    () => ["All", ...new Set(rows.map((r) => r.category || "Uncategorized"))],
    [rows],
  );

  const filteredIncidents = useMemo(() => {
    const headerQuery = headerSearch.trim().toLowerCase();
    const tableQuery = tableSearch.trim().toLowerCase();
    const cutoff = getDateRangeCutoff(dateRange);

    return rows.filter((incident) => {
      const searchableText = `${incident.id} ${incident.title} ${incident.dewey} ${incident.category || ""} ${incident.type} ${incident.reportedBy}`.toLowerCase();
      const matchesHeader = !headerQuery || searchableText.includes(headerQuery);
      const matchesTable = !tableQuery || searchableText.includes(tableQuery);
      const matchesType = typeFilter === "All" || incident.type === typeFilter;
      const matchesCategory = categoryFilter === "All" || (incident.category || "Uncategorized") === categoryFilter;
      const matchesDate = !incident.reportedDateRaw || new Date(incident.reportedDateRaw) >= cutoff;

      return matchesHeader && matchesTable && matchesType && matchesCategory && matchesDate;
    });
  }, [rows, categoryFilter, dateRange, headerSearch, tableSearch, typeFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredIncidents.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleIncidents = filteredIncidents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const monthlyTrend = useMemo(() => computeMonthlyTrend(rows), [rows]);
  const riskAlerts = useMemo(() => computeRiskAlerts(rows), [rows]);

  const summaryCards = [
    { label: "Total Reports", value: summary.total, icon: ClipboardList, iconClass: "bg-[#E7F4FA] text-[#006088]" },
    { label: "Lost", value: summary.lost, icon: BookX, iconClass: "bg-red-50 text-red-500" },
    { label: "Damaged", value: summary.damaged, icon: AlertTriangle, iconClass: "bg-[#FFF2C7] text-[#8A6500]" },
    { label: "Fair Condition", value: summary.fair, icon: CheckCircle2, iconClass: "bg-emerald-50 text-emerald-600" },
  ];

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setTableSearch("");
    setDateRange("Last 30 Days");
    setTypeFilter("All");
    setCategoryFilter("All");
    setCurrentPage(1);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#E9EEF4]">
        <Navbar
          title="Lost or Damaged Book Report"
          breadcrumb="Reports"
          onBack={() => window.history.back()}
          searchValue={headerSearch}
          onSearchChange={setHeaderSearch}
          searchPlaceholder="Search books, member..."
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {error && (
            <div className="mb-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
              <span>{error}</span>
              <button type="button" onClick={loadReport} className="rounded-md bg-red-600 px-3 py-1.5 text-white">
                Retry
              </button>
            </div>
          )}

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={loadReport}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-[11px] font-bold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <StatCard key={card.label} card={card} />
            ))}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
            <TrendChart data={monthlyTrend} />
            <RiskAlerts alerts={riskAlerts} loading={loading} />
          </section>

          <section className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                <label className="relative">
                  <Calendar
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={dateRange}
                    onChange={handleFilterChange(setDateRange)}
                    className="h-10 min-w-40 appearance-none rounded-md border border-gray-200 bg-white pl-9 pr-8 text-xs font-bold text-gray-600 outline-none transition focus:border-[#1B4965]"
                  >
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                    <option>This Year</option>
                  </select>
                </label>

                <label className="relative">
                  <BookX
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={typeFilter}
                    onChange={handleFilterChange(setTypeFilter)}
                    className="h-10 min-w-44 appearance-none rounded-md border border-gray-200 bg-white pl-9 pr-8 text-xs font-bold text-gray-600 outline-none transition focus:border-[#1B4965]"
                  >
                    <option value="All">Condition: All</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="relative">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="search"
                    value={tableSearch}
                    onChange={handleFilterChange(setTableSearch)}
                    placeholder="Search reports"
                    className="h-10 min-w-48 rounded-md border border-gray-200 bg-white pl-9 pr-3 text-xs font-bold text-gray-600 outline-none transition focus:border-[#1B4965]"
                  />
                </label>

                <label className="relative">
                  <AlertCircle
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={categoryFilter}
                    onChange={handleFilterChange(setCategoryFilter)}
                    className="h-10 min-w-44 appearance-none rounded-md border border-gray-200 bg-white pl-9 pr-8 text-xs font-bold text-gray-600 outline-none transition focus:border-[#1B4965]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "All" ? "Category: All" : category}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-xs font-bold text-[#006088] shadow-sm transition hover:bg-[#E6F4F7]"
                >
                  <RotateCcw size={15} />
                  Reset
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  <FileDown size={15} />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => downloadCsv(filteredIncidents)}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  <TableIcon size={15} />
                  Excel
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1B4965] px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#14374d]"
                >
                  <Printer size={15} />
                  Print Report
                </button>
              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-extrabold text-gray-800">Detailed Incident Logs</h2>
              <p className="text-xs font-semibold text-gray-500">
                Showing {visibleIncidents.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}-
                {Math.min(safePage * PAGE_SIZE, filteredIncidents.length)} of{" "}
                {filteredIncidents.length} reports
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F1F6FA] text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-extrabold">Report ID</th>
                    <th className="px-5 py-4 font-extrabold">Book Details</th>
                    <th className="px-5 py-4 font-extrabold">Category</th>
                    <th className="px-5 py-4 text-center font-extrabold">Condition</th>
                    <th className="px-5 py-4 font-extrabold">Reported By</th>
                    <th className="px-5 py-4 font-extrabold">Reported Date</th>
                    <th className="px-5 py-4 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading && !rows.length && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <Loader2 size={20} className="mx-auto animate-spin text-[#1B4965]" />
                        <p className="mt-2 text-xs font-bold text-gray-400">Loading incident reports...</p>
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    visibleIncidents.map((incident) => (
                      <tr key={incident.id} className="transition hover:bg-[#F8FAFC]">
                        <td className="px-5 py-4 text-xs font-extrabold text-[#006088]">{incident.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-extrabold leading-tight text-gray-900">{incident.title}</p>
                          <p className="mt-1 text-xs font-semibold text-gray-400">Dewey: {incident.dewey}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                            {incident.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <StatusBadge type={incident.type} />
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-700">{incident.reportedBy}</p>
                          {incident.memberName && (
                            <p className="mt-1 text-xs font-semibold text-gray-400">For: {incident.memberName}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-500">{incident.reportedDate}</td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              window.alert(`${incident.title} - ${incident.type}, reported ${incident.reportedDate}`)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            aria-label={`View details for ${incident.title}`}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                  {!loading && visibleIncidents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm font-semibold text-gray-400">
                        No lost or damaged reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
                {Array.from({ length: pageCount }).map((_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                        safePage === page ? "bg-[#1B4965] text-white" : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </section>
        </main>
      </div>
  );
}