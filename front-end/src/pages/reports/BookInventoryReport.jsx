// import { useEffect, useState } from "react";
// import {
//   AlertCircle,
//   ArrowUpRight,
//   BookOpen,
//   BookX,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   FileDown,
//   Info,
//   Layers,
//   ListFilter,
//   Printer,
//   RotateCcw,
//   Search,
//   Table as TableIcon,
// } from "lucide-react";
// import Navbar from "../../components/Navbar";
// import Sidebar from "../../components/Adminsidebar";
// import api from "../../utils/api";

// const PAGE_SIZE = 5;

// const CATEGORIES = [
//   "All Categories",
//   "Computer Science, Information & General Works",
//   "Philosophy & Psychology",
//   "Religion",
//   "Social Sciences",
//   "Language",
//   "Science",
//   "Technology",
//   "Arts & Recreation",
//   "Literature",
//   "History & Geography",
// ];

// const STATUSES = ["All Status", "AVAILABLE", "LOW STOCK", "BORROWED", "OUT OF STOCK"];

// // Canonical section order (matches booksController.js's own SECTIONS list),
// // so the panel doesn't just show whatever order groupBy happens to return.
// const SECTION_ORDER = ["K1", "KK1", "E1", "EK1", "F1", "FK1", "Inter1"];

// function formatNumber(value) {
//   return new Intl.NumberFormat("en-US").format(value ?? 0);
// }

// function escapeCsvValue(value) {
//   return `"${String(value ?? "").replace(/"/g, '""')}"`;
// }

// function downloadInventoryCsv(rows) {
//   const headers = ["Book ID", "ISBN", "Book Title", "Category", "Total", "Available", "Borrowed", "Status"];
//   const csvRows = rows.map((row) => [
//     row.book_id,
//     row.isbn || "",
//     row.title,
//     row.category,
//     row.total_copies,
//     row.available_copies,
//     row.borrowed_copies,
//     row.status,
//   ]);
//   const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = "book-inventory-report.csv";
//   link.click();
//   URL.revokeObjectURL(url);
// }

// function getStatusClass(status) {
//   const statusClasses = {
//     AVAILABLE: "bg-[#E3F6FC] text-[#006088]",
//     BORROWED: "bg-[#FFF1B8] text-[#8C6A00]",
//     "LOW STOCK": "bg-[#FFE8C7] text-[#B45309]",
//     "OUT OF STOCK": "bg-[#FFE1E6] text-[#C51F34]",
//   };
//   return statusClasses[status] || "bg-gray-100 text-gray-600";
// }

// function MetricCard({ card }) {
//   const Icon = card.icon;
//   return (
//     <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
//       <div className="flex items-start justify-between gap-3">
//         <div className={`flex h-9 w-9 items-center justify-center rounded-md ${card.iconClass}`}>
//           <Icon size={18} />
//         </div>
//         {card.change && (
//           <span className="rounded-full bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-500">
//             {card.change}
//           </span>
//         )}
//       </div>
//       <p className="mt-4 text-xs font-semibold text-gray-400">{card.label}</p>
//       <h3 className="mt-1 text-2xl font-extrabold tracking-normal text-[#1B4965]">{card.value}</h3>
//     </div>
//   );
// }

// function StockBySectionPanel({ bySection, loading }) {
//   const [hovered, setHovered] = useState(null);

//   const known = SECTION_ORDER.map((code) => bySection.find((s) => s.section === code)).filter(Boolean);
//   const knownCodes = new Set(known.map((s) => s.section));
//   const others = bySection.filter((s) => s.section && !knownCodes.has(s.section)).sort((a, b) => a.section.localeCompare(b.section));
//   const unassigned = bySection.filter((s) => !s.section);
//   const ordered = [...known, ...others, ...unassigned.map((s) => ({ ...s, section: "N/A" }))];

//   const maxCopies = Math.max(1, ...ordered.map((s) => s.totalCopies));

//   return (
//     <div className="mt-5">
//       <div className="mb-3 flex items-center gap-2 text-[#1B4965]">
//         <Layers size={17} />
//         <h3 className="text-sm font-bold">Stock by Section</h3>
//       </div>
//       {loading ? (
//         <div className="flex h-44 items-center justify-center rounded-lg bg-[#E8F0F5] text-xs font-semibold text-gray-400">
//           Loading section breakdown...
//         </div>
//       ) : ordered.length === 0 ? (
//         <div className="flex h-44 items-center justify-center rounded-lg bg-[#E8F0F5] text-xs font-semibold text-gray-400">
//           No section data yet.
//         </div>
//       ) : (
//         <div className="relative flex h-44 items-end gap-4 rounded-lg bg-[#E8F0F5] px-5 pb-6 pt-5">
//           {ordered.map((s) => (
//             <div
//               key={s.section}
//               className="relative flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
//               onMouseEnter={() => setHovered(s.section)}
//               onMouseLeave={() => setHovered((h) => (h === s.section ? null : h))}
//             >
//               {hovered === s.section && (
//                 <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1B4965] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg">
//                   {s.titleCount} titles · {s.availableCopies}/{s.totalCopies} available
//                 </div>
//               )}
//               <div
//                 className={`w-full rounded-t-md transition-all ${
//                   hovered === s.section ? "bg-[#1B4965]" : "bg-[#B9CDD8]"
//                 }`}
//                 style={{ height: `${Math.max(6, (s.totalCopies / maxCopies) * 100)}%` }}
//               />
//               <span
//                 className={`text-center text-[10px] font-bold uppercase transition-colors ${
//                   hovered === s.section ? "text-[#1B4965]" : "text-gray-500"
//                 }`}
//               >
//                 {s.section}
//               </span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function LowStockPanel({ items, loading }) {
//   return (
//     <aside className="rounded-lg border border-red-200 bg-red-50/70 p-4 shadow-sm">
//       <div className="flex items-start gap-3 text-red-600">
//         <AlertCircle size={22} className="mt-0.5 flex-shrink-0" />
//         <div>
//           <h3 className="text-sm font-extrabold">Low Stock Alert</h3>
//           <p className="mt-1 text-xs font-semibold text-red-500">Needs restocking review</p>
//         </div>
//       </div>

//       <div className="mt-4 divide-y divide-red-100">
//         {loading ? (
//           <p className="py-3 text-xs font-semibold text-red-400">Loading...</p>
//         ) : items.length === 0 ? (
//           <p className="py-3 text-xs font-semibold text-red-400">Nothing low on stock right now.</p>
//         ) : (
//           items.map((book) => {
//             const urgent = book.available_copies <= 0;
//             return (
//               <div key={book.book_id} className="py-3">
//                 <div className="flex items-center justify-between gap-3">
//                   <p className="text-xs font-bold text-[#1B4965] truncate">{book.title}</p>
//                   <span className={`rounded-full px-2 py-1 text-[10px] font-bold shrink-0 ${urgent ? "bg-red-600 text-white" : "bg-white text-red-500"}`}>
//                     {urgent ? "Out of stock" : `${book.available_copies} ${book.available_copies === 1 ? "copy" : "copies"} left`}
//                   </span>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </aside>
//   );
// }

// function StatusBadge({ status }) {
//   return (
//     <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusClass(status)}`}>
//       {status}
//     </span>
//   );
// }

// export default function BookInventoryReport() {
//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All Categories");
//   const [status, setStatus] = useState("All Status");
//   const [currentPage, setCurrentPage] = useState(1);

//   const [books, setBooks] = useState([]);
//   const [totalItems, setTotalItems] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const [stats, setStats] = useState(null);
//   const [lostDamaged, setLostDamaged] = useState(null);
//   const [bySection, setBySection] = useState([]);
//   const [sectionLoading, setSectionLoading] = useState(true);
//   const [lowStock, setLowStock] = useState([]);
//   const [lowStockLoading, setLowStockLoading] = useState(true);

//   useEffect(() => {
//     const t = setTimeout(() => {
//       setSearch(searchInput);
//       setCurrentPage(1);
//     }, 300);
//     return () => clearTimeout(t);
//   }, [searchInput]);

//   useEffect(() => {
//     fetchBooks();
//     fetchSectionBreakdown();
//   }, [search, category, status, currentPage]);

//   useEffect(() => {
//     fetchStats();
//     fetchLostDamaged();
//     fetchLowStock();
//   }, []);

//   const fetchBooks = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       if (search) params.append("search", search);
//       if (category !== "All Categories") params.append("category", category);
//       if (status !== "All Status") params.append("status", status);
//       params.append("page", currentPage);
//       params.append("limit", PAGE_SIZE);

//       const response = await api.get(`/books?${params.toString()}`);
//       if (response.data?.success) {
//         setBooks(response.data.data);
//         const meta = response.data.meta || {};
//         setTotalItems(meta.totalItems ?? meta.total ?? meta.totalCount ?? response.data.data.length);
//       }
//     } catch (err) {
//       console.error("Failed to load inventory report data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await api.get("/books/stats");
//       if (response.data?.success) setStats(response.data.data);
//     } catch (err) {
//       console.error("Failed to load inventory stats:", err);
//     }
//   };

//   const fetchLostDamaged = async () => {
//     try {
//       const response = await api.get("/reports/lost-damaged");
//       if (response.data?.success) setLostDamaged(response.data.data.summary);
//     } catch (err) {
//       console.error("Failed to load lost/damaged report:", err);
//     }
//   };

//   const fetchSectionBreakdown = async () => {
//   try {
//     setSectionLoading(true);
//     const params = new URLSearchParams();
//     if (search) params.append("search", search);
//     if (category !== "All Categories") params.append("category", category);
//     if (status !== "All Status") params.append("status", status);

//     const response = await api.get(`/reports/book-inventory?${params.toString()}`);
//     if (response.data?.success) setBySection(response.data.data.bySection);
//   } catch (err) {
//     console.error("Failed to load section breakdown:", err);
//   } finally {
//     setSectionLoading(false);
//   }
// };

//   const fetchLowStock = async () => {
//     try {
//       setLowStockLoading(true);
//       const [outRes, lowRes] = await Promise.all([
//         api.get(`/books?status=${encodeURIComponent("OUT OF STOCK")}&limit=5`),
//         api.get(`/books?status=${encodeURIComponent("LOW STOCK")}&limit=5`),
//       ]);
//       const out = outRes.data?.success ? outRes.data.data : [];
//       const low = lowRes.data?.success ? lowRes.data.data : [];
//       setLowStock([...out, ...low].slice(0, 3));
//     } catch (err) {
//       console.error("Failed to load low stock alerts:", err);
//     } finally {
//       setLowStockLoading(false);
//     }
//   };

//   const handleExportCsv = async () => {
//     try {
//       const params = new URLSearchParams();
//       if (search) params.append("search", search);
//       if (category !== "All Categories") params.append("category", category);
//       if (status !== "All Status") params.append("status", status);
//       params.append("limit", "1000");

//       const response = await api.get(`/books?${params.toString()}`);
//       if (response.data?.success) downloadInventoryCsv(response.data.data);
//     } catch (err) {
//       console.error("Failed to export inventory CSV:", err);
//       alert("Failed to export the report. Please try again.");
//     }
//   };

//   const resetFilters = () => {
//     setSearchInput("");
//     setSearch("");
//     setCategory("All Categories");
//     setStatus("All Status");
//     setCurrentPage(1);
//   };

//   const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
//   const safePage = Math.min(currentPage, totalPages);
//   const summaryLoading = !stats || !lostDamaged;

//   const summaryCards = summaryLoading
//     ? []
//     : [
//         { label: "Total Books", value: formatNumber(stats.totalCopies), change: `${stats.totalBooks} titles`, icon: BookOpen, iconClass: "bg-[#E7F4FA] text-[#006088]" },
//         { label: "Available Books", value: formatNumber(stats.availableCopies), change: `${stats.availabilityRate}%`, icon: ArrowUpRight, iconClass: "bg-[#FFF5CB] text-[#A97900]" },
//         { label: "Borrowed Books", value: formatNumber(stats.borrowedCopies), change: "Active", icon: FileDown, iconClass: "bg-[#FFF0DF] text-[#B65D14]" },
//         { label: "Lost Books", value: formatNumber(lostDamaged.lost), change: lostDamaged.lost > 0 ? "Alert" : undefined, icon: AlertCircle, iconClass: "bg-[#FFE5E8] text-[#D8243C]" },
//         { label: "Damaged Books", value: formatNumber(lostDamaged.damaged), change: lostDamaged.damaged > 0 ? "Review" : undefined, icon: BookX, iconClass: "bg-[#EDF1F5] text-[#64748B]" },
//       ];

//   return (
//     <div className="flex h-screen overflow-hidden bg-[#E9EEF4]">
//       <Sidebar />

//       <div className="flex min-w-0 flex-1 flex-col">
//         <Navbar
//           title="Book Inventory Report"
//           breadcrumb="Reports"
//           onBack={() => window.history.back()}
//           searchValue={searchInput}
//           onSearchChange={setSearchInput}
//           searchPlaceholder="Search books, ISBN..."
//         />

//         <main className="flex-1 p-4 md:p-6 lg:p-8">
//           <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
//             {summaryLoading ? (
//               <div className="col-span-full rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-400 shadow-sm">Loading summary...</div>
//             ) : (
//               summaryCards.map((card) => <MetricCard key={card.label} card={card} />)
//             )}
//           </section>

//           <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
//             <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
//               <div className="flex flex-wrap items-center justify-between gap-3">
//                 <div className="flex items-center gap-2 text-[#1B4965]">
//                   <ListFilter size={18} />
//                   <h2 className="text-sm font-extrabold">Advanced Filters</h2>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={resetFilters}
//                   className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50"
//                 >
//                   <RotateCcw size={14} />
//                   Reset
//                 </button>
//               </div>
//               <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
//                 <label className="text-[11px] font-bold uppercase text-gray-400">
//                   Category
//                   <select
//                     value={category}
//                     onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
//                     className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
//                   >
//                     {CATEGORIES.map((item) => (
//                       <option key={item}>{item}</option>
//                     ))}
//                   </select>
//                 </label>

//                 <label className="text-[11px] font-bold uppercase text-gray-400">
//                   Status
//                   <select
//                     value={status}
//                     onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
//                     className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
//                   >
//                     {STATUSES.map((item) => (
//                       <option key={item}>{item}</option>
//                     ))}
//                   </select>
//                 </label>

//                 <label className="text-[11px] font-bold uppercase text-gray-400">
//                   Search
//                   <div className="relative mt-1">
//                     <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                     <input
//                       type="search"
//                       value={searchInput}
//                       onChange={(e) => setSearchInput(e.target.value)}
//                       placeholder="Title, author, ISBN, Dewey code"
//                       className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
//                     />
//                   </div>
//                 </label>
//               </div>

//               <StockBySectionPanel bySection={bySection} loading={sectionLoading} />
//             </div>

//             <LowStockPanel items={lowStock} loading={lowStockLoading} />
//           </section>

//           <section className="mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
//             <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
//               <div>
//                 <h2 className="text-base font-extrabold text-[#1B4965]">Detailed Inventory List</h2>
//                 <p className="mt-1 text-xs font-semibold text-gray-400">
//                   Showing {books.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}-
//                   {Math.min(safePage * PAGE_SIZE, totalItems)} of {formatNumber(totalItems)} entries
//                 </p>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 <button
//                   type="button"
//                   onClick={() => window.print()}
//                   className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
//                 >
//                   <Printer size={15} />
//                   Export PDF
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleExportCsv}
//                   className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
//                 >
//                   <TableIcon size={15} />
//                   Export Excel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => window.print()}
//                   className="inline-flex items-center gap-2 rounded-md bg-[#F5C842] px-4 py-2 text-xs font-extrabold text-[#1B4965] transition hover:bg-[#e7b92f]"
//                 >
//                   <FileDown size={15} />
//                   Print Report
//                 </button>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[860px] text-left">
//                 <thead className="bg-[#F1F6FA] text-[11px] uppercase tracking-wide text-gray-500">
//                   <tr>
//                     <th className="px-5 py-4 font-extrabold">Book ID</th>
//                     <th className="px-5 py-4 font-extrabold">ISBN</th>
//                     <th className="px-5 py-4 font-extrabold">Book Title</th>
//                     <th className="px-5 py-4 font-extrabold">Category</th>
//                     <th className="px-5 py-4 text-center font-extrabold">Total</th>
//                     <th className="px-5 py-4 text-center font-extrabold">Avail.</th>
//                     <th className="px-5 py-4 text-center font-extrabold">Borr.</th>
//                     <th className="px-5 py-4 text-center font-extrabold">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm">
//                   {loading ? (
//                     <tr>
//                       <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-gray-400">
//                         Loading inventory...
//                       </td>
//                     </tr>
//                   ) : books.length === 0 ? (
//                     <tr>
//                       <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-gray-400">
//                         No inventory records found.
//                       </td>
//                     </tr>
//                   ) : (
//                     books.map((book) => (
//                       <tr key={book.book_id} className="transition hover:bg-[#F8FAFC]">
//                         <td className="px-5 py-4 text-xs font-bold text-gray-500">#{book.book_id}</td>
//                         <td className="px-5 py-4 text-xs font-semibold text-gray-500">{book.isbn || "—"}</td>
//                         <td className="px-5 py-4">
//                           <p className="font-extrabold leading-tight text-[#006088]">{book.title}</p>
//                         </td>
//                         <td className="px-5 py-4 text-xs font-semibold text-gray-600">{book.category}</td>
//                         <td className="px-5 py-4 text-center font-bold text-gray-700">{book.total_copies}</td>
//                         <td className="px-5 py-4 text-center font-bold text-gray-700">{book.available_copies}</td>
//                         <td className="px-5 py-4 text-center font-bold text-gray-700">{book.borrowed_copies}</td>
//                         <td className="px-5 py-4 text-center">
//                           <StatusBadge status={book.status} />
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
//               <label className="flex items-center gap-2 text-xs font-semibold text-gray-500">
//                 Items per page:
//                 <select className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700" disabled>
//                   <option>{PAGE_SIZE}</option>
//                 </select>
//               </label>

//               <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
//                   className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100"
//                   aria-label="Previous page"
//                 >
//                   <ChevronLeft size={16} />
//                 </button>
//                 {Array.from({ length: totalPages }).map((_, index) => {
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
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
//                   className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100"
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
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  BookX,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Info,
  Layers,
  ListFilter,
  Printer,
  RotateCcw,
  Search,
  Table as TableIcon,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";

const PAGE_SIZE = 5;

const CATEGORIES = [
  "All Categories",
  "Computer Science, Information & General Works",
  "Philosophy & Psychology",
  "Religion",
  "Social Sciences",
  "Language",
  "Science",
  "Technology",
  "Arts & Recreation",
  "Literature",
  "History & Geography",
];

const STATUSES = ["All Status", "AVAILABLE", "LOW STOCK", "BORROWED", "OUT OF STOCK"];

// Canonical section order (matches booksController.js's own SECTIONS list),
// so the panel doesn't just show whatever order groupBy happens to return.
const SECTION_ORDER = ["K1", "KK1", "E1", "EK1", "F1", "FK1", "Inter1"];

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function escapeCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadInventoryCsv(rows) {
  const headers = ["Book ID", "ISBN", "Book Title", "Category", "Total", "Available", "Borrowed", "Status"];
  const csvRows = rows.map((row) => [
    row.book_id,
    row.isbn || "",
    row.title,
    row.category,
    row.total_copies,
    row.available_copies,
    row.borrowed_copies,
    row.status,
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "book-inventory-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function getStatusClass(status) {
  const statusClasses = {
    AVAILABLE: "bg-[#E3F6FC] text-[#006088]",
    BORROWED: "bg-[#FFF1B8] text-[#8C6A00]",
    "LOW STOCK": "bg-[#FFE8C7] text-[#B45309]",
    "OUT OF STOCK": "bg-[#FFE1E6] text-[#C51F34]",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-600";
}

function MetricCard({ card }) {
  const Icon = card.icon;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${card.iconClass}`}>
          <Icon size={18} />
        </div>
        {card.change && (
          <span className="rounded-full bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-500">
            {card.change}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold text-gray-400">{card.label}</p>
      <h3 className="mt-1 text-2xl font-extrabold tracking-normal text-[#1B4965]">{card.value}</h3>
    </div>
  );
}

function StockBySectionPanel({ bySection, loading }) {
  const [hovered, setHovered] = useState(null);

  const known = SECTION_ORDER.map((code) => bySection.find((s) => s.section === code)).filter(Boolean);
  const knownCodes = new Set(known.map((s) => s.section));
  const others = bySection.filter((s) => s.section && !knownCodes.has(s.section)).sort((a, b) => a.section.localeCompare(b.section));
  const unassigned = bySection.filter((s) => !s.section);
  const ordered = [...known, ...others, ...unassigned.map((s) => ({ ...s, section: "N/A" }))];

  const maxCopies = Math.max(1, ...ordered.map((s) => s.totalCopies));

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2 text-[#1B4965]">
        <Layers size={17} />
        <h3 className="text-sm font-bold">Stock by Section</h3>
      </div>
      {loading ? (
        <div className="flex h-44 items-center justify-center rounded-lg bg-[#E8F0F5] text-xs font-semibold text-gray-400">
          Loading section breakdown...
        </div>
      ) : ordered.length === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-lg bg-[#E8F0F5] text-xs font-semibold text-gray-400">
          No section data yet.
        </div>
      ) : (
        <div className="relative flex h-44 items-end gap-4 rounded-lg bg-[#E8F0F5] px-5 pb-6 pt-5">
          {ordered.map((s) => (
            <div
              key={s.section}
              className="relative flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
              onMouseEnter={() => setHovered(s.section)}
              onMouseLeave={() => setHovered((h) => (h === s.section ? null : h))}
            >
              {hovered === s.section && (
                <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1B4965] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg">
                  {s.titleCount} titles · {s.availableCopies}/{s.totalCopies} available
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-all ${
                  hovered === s.section ? "bg-[#1B4965]" : "bg-[#B9CDD8]"
                }`}
                style={{ height: `${Math.max(6, (s.totalCopies / maxCopies) * 100)}%` }}
              />
              <span
                className={`text-center text-[10px] font-bold uppercase transition-colors ${
                  hovered === s.section ? "text-[#1B4965]" : "text-gray-500"
                }`}
              >
                {s.section}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LowStockPanel({ items, loading }) {
  return (
    <aside className="rounded-lg border border-red-200 bg-red-50/70 p-4 shadow-sm">
      <div className="flex items-start gap-3 text-red-600">
        <AlertCircle size={22} className="mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-extrabold">Low Stock Alert</h3>
          <p className="mt-1 text-xs font-semibold text-red-500">Needs restocking review</p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-red-100">
        {loading ? (
          <p className="py-3 text-xs font-semibold text-red-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="py-3 text-xs font-semibold text-red-400">Nothing low on stock right now.</p>
        ) : (
          items.map((book) => {
            const urgent = book.available_copies <= 0;
            return (
              <div key={book.book_id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-[#1B4965] truncate">{book.title}</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold shrink-0 ${urgent ? "bg-red-600 text-white" : "bg-white text-red-500"}`}>
                    {urgent ? "Out of stock" : `${book.available_copies} ${book.available_copies === 1 ? "copy" : "copies"} left`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

export default function BookInventoryReport() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);

  const [books, setBooks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [lostDamaged, setLostDamaged] = useState(null);
  const [bySection, setBySection] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [lowStock, setLowStock] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchBooks();
    fetchSectionBreakdown();
  }, [search, category, status, currentPage]);

  useEffect(() => {
    fetchStats();
    fetchLostDamaged();
    fetchLowStock();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "All Categories") params.append("category", category);
      if (status !== "All Status") params.append("status", status);
      params.append("page", currentPage);
      params.append("limit", PAGE_SIZE);

      const response = await api.get(`/books?${params.toString()}`);
      if (response.data?.success) {
        setBooks(response.data.data);
        const meta = response.data.meta || {};
        setTotalItems(meta.totalItems ?? meta.total ?? meta.totalCount ?? response.data.data.length);
      }
    } catch (err) {
      console.error("Failed to load inventory report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/books/stats");
      if (response.data?.success) setStats(response.data.data);
    } catch (err) {
      console.error("Failed to load inventory stats:", err);
    }
  };

  const fetchLostDamaged = async () => {
    try {
      const response = await api.get("/reports/lost-damaged");
      if (response.data?.success) setLostDamaged(response.data.data.summary);
    } catch (err) {
      console.error("Failed to load lost/damaged report:", err);
    }
  };

  const fetchSectionBreakdown = async () => {
  try {
    setSectionLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category !== "All Categories") params.append("category", category);
    if (status !== "All Status") params.append("status", status);

    const response = await api.get(`/reports/book-inventory?${params.toString()}`);
    if (response.data?.success) setBySection(response.data.data.bySection);
  } catch (err) {
    console.error("Failed to load section breakdown:", err);
  } finally {
    setSectionLoading(false);
  }
};

  const fetchLowStock = async () => {
    try {
      setLowStockLoading(true);
      const [outRes, lowRes] = await Promise.all([
        api.get(`/books?status=${encodeURIComponent("OUT OF STOCK")}&limit=5`),
        api.get(`/books?status=${encodeURIComponent("LOW STOCK")}&limit=5`),
      ]);
      const out = outRes.data?.success ? outRes.data.data : [];
      const low = lowRes.data?.success ? lowRes.data.data : [];
      setLowStock([...out, ...low].slice(0, 3));
    } catch (err) {
      console.error("Failed to load low stock alerts:", err);
    } finally {
      setLowStockLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "All Categories") params.append("category", category);
      if (status !== "All Status") params.append("status", status);
      params.append("limit", "1000");

      const response = await api.get(`/books?${params.toString()}`);
      if (response.data?.success) downloadInventoryCsv(response.data.data);
    } catch (err) {
      console.error("Failed to export inventory CSV:", err);
      alert("Failed to export the report. Please try again.");
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("All Categories");
    setStatus("All Status");
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const summaryLoading = !stats || !lostDamaged;

  const summaryCards = summaryLoading
    ? []
    : [
        { label: "Total Books", value: formatNumber(stats.totalCopies), change: `${stats.totalBooks} titles`, icon: BookOpen, iconClass: "bg-[#E7F4FA] text-[#006088]" },
        { label: "Available Books", value: formatNumber(stats.availableCopies), change: `${stats.availabilityRate}%`, icon: ArrowUpRight, iconClass: "bg-[#FFF5CB] text-[#A97900]" },
        { label: "Borrowed Books", value: formatNumber(stats.borrowedCopies), change: "Active", icon: FileDown, iconClass: "bg-[#FFF0DF] text-[#B65D14]" },
        { label: "Lost Books", value: formatNumber(lostDamaged.lost), change: lostDamaged.lost > 0 ? "Alert" : undefined, icon: AlertCircle, iconClass: "bg-[#FFE5E8] text-[#D8243C]" },
        { label: "Damaged Books", value: formatNumber(lostDamaged.damaged), change: lostDamaged.damaged > 0 ? "Review" : undefined, icon: BookX, iconClass: "bg-[#EDF1F5] text-[#64748B]" },
      ];

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#E9EEF4]">
        <Navbar
          title="Book Inventory Report"
          breadcrumb="Reports"
          onBack={() => window.history.back()}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search books, ISBN..."
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {summaryLoading ? (
              <div className="col-span-full rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-400 shadow-sm">Loading summary...</div>
            ) : (
              summaryCards.map((card) => <MetricCard key={card.label} card={card} />)
            )}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#1B4965]">
                  <ListFilter size={18} />
                  <h2 className="text-sm font-extrabold">Advanced Filters</h2>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="text-[11px] font-bold uppercase text-gray-400">
                  Category
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                    className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-[11px] font-bold uppercase text-gray-400">
                  Status
                  <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
                    className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
                  >
                    {STATUSES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-[11px] font-bold uppercase text-gray-400">
                  Search
                  <div className="relative mt-1">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Title, author, ISBN, Dewey code"
                      className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
                    />
                  </div>
                </label>
              </div>

              <StockBySectionPanel bySection={bySection} loading={sectionLoading} />
            </div>

            <LowStockPanel items={lowStock} loading={lowStockLoading} />
          </section>

          <section className="mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#1B4965]">Detailed Inventory List</h2>
                <p className="mt-1 text-xs font-semibold text-gray-400">
                  Showing {books.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}-
                  {Math.min(safePage * PAGE_SIZE, totalItems)} of {formatNumber(totalItems)} entries
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  <Printer size={15} />
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  <TableIcon size={15} />
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-md bg-[#F5C842] px-4 py-2 text-xs font-extrabold text-[#1B4965] transition hover:bg-[#e7b92f]"
                >
                  <FileDown size={15} />
                  Print Report
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="bg-[#F1F6FA] text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-extrabold">Book ID</th>
                    <th className="px-5 py-4 font-extrabold">ISBN</th>
                    <th className="px-5 py-4 font-extrabold">Book Title</th>
                    <th className="px-5 py-4 font-extrabold">Category</th>
                    <th className="px-5 py-4 text-center font-extrabold">Total</th>
                    <th className="px-5 py-4 text-center font-extrabold">Avail.</th>
                    <th className="px-5 py-4 text-center font-extrabold">Borr.</th>
                    <th className="px-5 py-4 text-center font-extrabold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-gray-400">
                        Loading inventory...
                      </td>
                    </tr>
                  ) : books.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-gray-400">
                        No inventory records found.
                      </td>
                    </tr>
                  ) : (
                    books.map((book) => (
                      <tr key={book.book_id} className="transition hover:bg-[#F8FAFC]">
                        <td className="px-5 py-4 text-xs font-bold text-gray-500">#{book.book_id}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-500">{book.isbn || "—"}</td>
                        <td className="px-5 py-4">
                          <p className="font-extrabold leading-tight text-[#006088]">{book.title}</p>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-600">{book.category}</td>
                        <td className="px-5 py-4 text-center font-bold text-gray-700">{book.total_copies}</td>
                        <td className="px-5 py-4 text-center font-bold text-gray-700">{book.available_copies}</td>
                        <td className="px-5 py-4 text-center font-bold text-gray-700">{book.borrowed_copies}</td>
                        <td className="px-5 py-4 text-center">
                          <StatusBadge status={book.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                Items per page:
                <select className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700" disabled>
                  <option>{PAGE_SIZE}</option>
                </select>
              </label>

              <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }).map((_, index) => {
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
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100"
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