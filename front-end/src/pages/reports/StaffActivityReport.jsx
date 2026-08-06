// import { useMemo, useState } from "react";
// import {
//   AlertTriangle,
//   Calendar,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   ClipboardCheck,
//   Clock3,
//   FileDown,
//   Printer,
//   RefreshCcw,
//   Search,
//   Table as TableIcon,
//   Trophy,
// } from "lucide-react";
// import Navbar from "../../components/Navbar";
// import Sidebar from "../../components/Adminsidebar";

// const PAGE_SIZE = 4;
// const activityTypes = ["All Activities", "Borrowing", "Returning", "Record Update", "Fine Collection"];
// const staffNames = ["All Staff", "John Doe", "Sarah Smith", "Michael Chen", "Nita Long"];

// const staffActivities = [
//   {
//     id: "S-0129",
//     staffName: "John Doe",
//     initials: "JD",
//     activity: "Borrowing",
//     bookTitle: "To Kill a Mockingbird",
//     member: "M-998",
//     date: "Oct 24, 2023",
//     time: "09:15 AM",
//     status: "Completed",
//   },
//   {
//     id: "S-0244",
//     staffName: "Sarah Smith",
//     initials: "SS",
//     activity: "Returning",
//     bookTitle: "Modern Library Mgmt",
//     member: "M-442",
//     date: "Oct 24, 2023",
//     time: "10:45 AM",
//     status: "Completed",
//   },
//   {
//     id: "S-0129",
//     staffName: "John Doe",
//     initials: "JD",
//     activity: "Record Update",
//     bookTitle: "Pride and Prejudice",
//     member: "M-731",
//     date: "Oct 24, 2023",
//     time: "11:20 AM",
//     status: "Pending",
//   },
//   {
//     id: "S-0311",
//     staffName: "Michael Chen",
//     initials: "MC",
//     activity: "Fine Collection",
//     bookTitle: "-",
//     member: "M-998",
//     date: "Oct 24, 2023",
//     time: "12:35 PM",
//     status: "Completed",
//   },
//   {
//     id: "S-0384",
//     staffName: "Nita Long",
//     initials: "NL",
//     activity: "Inventory Audit",
//     bookTitle: "Khmer Folktales",
//     member: "-",
//     date: "Oct 23, 2023",
//     time: "03:05 PM",
//     status: "Completed",
//   },
//   {
//     id: "S-0244",
//     staffName: "Sarah Smith",
//     initials: "SS",
//     activity: "Borrowing",
//     bookTitle: "The Lean Startup",
//     member: "M-210",
//     date: "Oct 23, 2023",
//     time: "04:10 PM",
//     status: "Completed",
//   },
//   {
//     id: "S-0129",
//     staffName: "John Doe",
//     initials: "JD",
//     activity: "Returning",
//     bookTitle: "Atomic Habits",
//     member: "M-554",
//     date: "Oct 22, 2023",
//     time: "01:30 PM",
//     status: "Completed",
//   },
//   {
//     id: "S-0311",
//     staffName: "Michael Chen",
//     initials: "MC",
//     activity: "Record Update",
//     bookTitle: "Database Systems",
//     member: "M-087",
//     date: "Oct 22, 2023",
//     time: "02:15 PM",
//     status: "Pending",
//   },
// ];

// const chartData = [
//   { day: "Mon", borrowing: 42, returning: 50 },
//   { day: "Tue", borrowing: 58, returning: 47 },
//   { day: "Wed", borrowing: 78, returning: 67 },
//   { day: "Thu", borrowing: 92, returning: 79 },
//   { day: "Fri", borrowing: 66, returning: 63 },
//   { day: "Sat", borrowing: 86, returning: 98 },
// ];

// const targets = [
//   { label: "Circulation Goal", value: 85, color: "bg-[#005A76]" },
//   { label: "Data Cleaning", value: 42, color: "bg-[#F5C842]" },
//   { label: "Inventory Audit", value: 12, color: "bg-slate-500" },
// ];

// const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`;

// function downloadStaffActivityCsv(rows) {
//   const headers = ["Staff ID", "Staff Name", "Activity", "Book Title", "Member", "Date", "Time", "Status"];
//   const csvRows = rows.map((row) => [
//     row.id,
//     row.staffName,
//     row.activity,
//     row.bookTitle,
//     row.member,
//     row.date,
//     row.time,
//     row.status,
//   ]);
//   const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = "staff-activity-report.csv";
//   link.click();
//   URL.revokeObjectURL(url);
// }

// const getActivityClass = (activity) => ({
//   Borrowing: "bg-sky-100 text-sky-700",
//   Returning: "bg-amber-100 text-amber-700",
//   "Record Update": "bg-violet-100 text-violet-700",
//   "Fine Collection": "bg-red-100 text-red-600",
//   "Inventory Audit": "bg-emerald-100 text-emerald-700",
// }[activity] || "bg-slate-100 text-slate-600");

// const getStatusClass = (status) => ({
//   Completed: "bg-emerald-100 text-emerald-700",
//   Pending: "bg-slate-100 text-slate-500",
// }[status] || "bg-slate-100 text-slate-600");

// function SummaryCard({ title, value, note, icon: Icon, iconClass, noteClass = "text-emerald-600" }) {
//   return (
//     <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//       <div className="flex items-start gap-4">
//         <span className={`mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${iconClass}`}>
//           <Icon size={20} />
//         </span>
//         <div className="min-w-0">
//           <p className="text-xs font-bold text-slate-400">{title}</p>
//           <h3 className="mt-1 text-2xl font-black tracking-normal text-slate-800">{value}</h3>
//           <p className={`mt-1 text-[11px] font-black ${noteClass}`}>{note}</p>
//         </div>
//       </div>
//     </article>
//   );
// }

// function SelectFilter({ label, value, onChange, children }) {
//   return (
//     <label className="flex min-w-[170px] flex-col gap-1">
//       <span className="text-[11px] font-bold text-slate-500">{label}</span>
//       <select
//         value={value}
//         onChange={(event) => onChange(event.target.value)}
//         className="h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
//       >
//         {children}
//       </select>
//     </label>
//   );
// }

// export default function StaffActivityReport() {
//   const [filters, setFilters] = useState({
//     header: "",
//     table: "",
//     dateRange: "Last 30 Days",
//     staffName: "All Staff",
//     activityType: "All Activities",
//     period: "All Time",
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [toast, setToast] = useState("");

//   const updateFilter = (key, value) => {
//     setFilters((current) => ({ ...current, [key]: value }));
//     setCurrentPage(1);
//   };

//   const showMessage = (message) => {
//     setToast(message);
//     setTimeout(() => setToast(""), 2200);
//   };

//   const filteredActivities = useMemo(() => {
//     const headerQuery = filters.header.trim().toLowerCase();
//     const tableQuery = filters.table.trim().toLowerCase();

//     return staffActivities.filter((activity) => {
//       const text = `${activity.id} ${activity.staffName} ${activity.activity} ${activity.bookTitle} ${activity.member} ${activity.date} ${activity.time} ${activity.status}`.toLowerCase();
//       const matchesSearch = (!headerQuery || text.includes(headerQuery)) && (!tableQuery || text.includes(tableQuery));
//       const matchesStaff = filters.staffName === "All Staff" || activity.staffName === filters.staffName;
//       const matchesActivity = filters.activityType === "All Activities" || activity.activity === filters.activityType;

//       return matchesSearch && matchesStaff && matchesActivity;
//     });
//   }, [filters]);

//   const pageCount = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
//   const safePage = Math.min(currentPage, pageCount);
//   const visibleActivities = filteredActivities.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
//   const showingStart = filteredActivities.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
//   const showingEnd = Math.min(safePage * PAGE_SIZE, filteredActivities.length);

//   return (
//     <div className="flex h-screen overflow-hidden bg-[#E9EEF4]">
//       <Sidebar />
//       <div className="flex min-w-0 flex-1 flex-col">
//         <Navbar
//           title="Staff Activity Report"
//           breadcrumb=" View and analyze staff activities in the library"
//           onBack={() => window.history.back()}
//           searchValue={filters.header}
//           onSearchChange={(value) => updateFilter("header", value)}
//           searchPlaceholder="Search books, member..."
//         />

//         <main className="flex-1 p-4 md:p-6 lg:p-8">
//           {toast && (
//             <div className="fixed bottom-6 right-6 z-50 rounded-md bg-[#005A76] px-4 py-3 text-sm font-bold text-white shadow-lg">
//               {toast}
//             </div>
//           )}

//           <section className="flex flex-wrap justify-end gap-2">
//             <button
//               type="button"
//               onClick={() => window.print()}
//               className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76]"
//             >
//               <FileDown size={14} />
//               PDF
//             </button>
//             <button
//               type="button"
//               onClick={() => filteredActivities.length ? (downloadStaffActivityCsv(filteredActivities), showMessage("Staff activity exported")) : showMessage("No activities to export")}
//               disabled={filteredActivities.length === 0}
//               className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76] disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <TableIcon size={14} />
//               Excel
//             </button>
//             <button
//               type="button"
//               onClick={() => window.print()}
//               className="inline-flex h-9 items-center gap-2 rounded-md bg-[#005A76] px-4 text-xs font-black text-white shadow-sm transition hover:bg-[#00445a]"
//             >
//               <Printer size={14} />
//               Print Report
//             </button>
//           </section>

//           <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             <SummaryCard
//               title="Total Activities"
//               value="1,284"
//               note="+8% from last month"
//               icon={CheckCircle2}
//               iconClass="bg-sky-100 text-[#005A76]"
//             />
//             <SummaryCard
//               title="Borrow Transactions"
//               value="842"
//               note="+5% from last month"
//               icon={ClipboardCheck}
//               iconClass="bg-amber-100 text-amber-700"
//             />
//             <SummaryCard
//               title="Return Transactions"
//               value="412"
//               note="stable trend"
//               icon={RefreshCcw}
//               iconClass="bg-indigo-100 text-indigo-700"
//               noteClass="text-slate-500"
//             />
//             <SummaryCard
//               title="Overdue Handling"
//               value="31"
//               note="+2 more than yesterday"
//               icon={AlertTriangle}
//               iconClass="bg-red-100 text-red-600"
//               noteClass="text-red-500"
//             />
//           </section>

//           <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
//             <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//               <div className="flex flex-wrap items-center justify-between gap-3">
//                 <h2 className="text-sm font-black text-slate-700">Staff Productivity Trend</h2>
//                 <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
//                   <span className="inline-flex items-center gap-1.5">
//                     <span className="h-2.5 w-2.5 rounded-full bg-[#005A76]" />
//                     Borrowing
//                   </span>
//                   <span className="inline-flex items-center gap-1.5">
//                     <span className="h-2.5 w-2.5 rounded-full bg-[#F5C842]" />
//                     Returning
//                   </span>
//                 </div>
//               </div>

//               <div className="mt-5 rounded-md bg-slate-50 px-4 pb-4 pt-5">
//                 <div className="grid h-56 grid-cols-6 items-end gap-4 border-b border-slate-200">
//                   {chartData.map((item) => (
//                     <div key={item.day} className="flex h-full min-w-0 items-end justify-center gap-1.5">
//                       <div
//                         className="w-full max-w-[38px] rounded-t-sm bg-[#B7CBD6] transition hover:bg-[#9AB6C4]"
//                         style={{ height: `${item.borrowing}%` }}
//                         title={`${item.day} borrowing ${item.borrowing}`}
//                       />
//                       <div
//                         className="w-full max-w-[38px] rounded-t-sm bg-[#4F8196] transition hover:bg-[#005A76]"
//                         style={{ height: `${item.returning}%` }}
//                         title={`${item.day} returning ${item.returning}`}
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 <div className="mt-3 grid grid-cols-6 gap-4 text-center text-[11px] font-black text-slate-400">
//                   {chartData.map((item) => <span key={item.day}>{item.day}</span>)}
//                 </div>
//               </div>
//             </div>

//             <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
//               <h2 className="text-sm font-black text-slate-700">Daily Targets</h2>
//               <div className="mt-5 space-y-5">
//                 {targets.map((target) => (
//                   <div key={target.label}>
//                     <div className="mb-2 flex items-center justify-between text-xs font-black">
//                       <span className="text-slate-600">{target.label}</span>
//                       <span className="text-[#005A76]">{target.value}%</span>
//                     </div>
//                     <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
//                       <div className={`h-full rounded-full ${target.color}`} style={{ width: `${target.value}%` }} />
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-7 rounded-lg bg-[#005A76] p-4 text-white">
//                 <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
//                   <Trophy size={14} />
//                   Upcoming Milestone
//                 </div>
//                 <p className="mt-3 text-sm font-black">Staff Monthly Review</p>
//                 <p className="mt-1 text-xs font-semibold text-white/80">Friday, 10:00 AM</p>
//               </div>
//             </aside>
//           </section>

//           <section className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
//             <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
//               <SelectFilter label="Date Range" value={filters.dateRange} onChange={(value) => updateFilter("dateRange", value)}>
//                 {["Last 7 Days", "Last 30 Days", "This Month", "This Year"].map((option) => <option key={option}>{option}</option>)}
//               </SelectFilter>
//               <SelectFilter label="Staff Name" value={filters.staffName} onChange={(value) => updateFilter("staffName", value)}>
//                 {staffNames.map((option) => <option key={option}>{option}</option>)}
//               </SelectFilter>
//               <SelectFilter label="Activity Type" value={filters.activityType} onChange={(value) => updateFilter("activityType", value)}>
//                 {activityTypes.map((option) => <option key={option}>{option}</option>)}
//               </SelectFilter>
//             </div>

//             <button
//               type="button"
//               onClick={() => {
//                 setFilters({ header: "", table: "", dateRange: "Last 30 Days", staffName: "All Staff", activityType: "All Activities", period: "All Time" });
//                 setCurrentPage(1);
//                 showMessage("Filters reset");
//               }}
//               className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76]"
//             >
//               <RefreshCcw size={15} />
//               Reset
//             </button>
//           </section>

//           <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
//             <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
//               <h2 className="text-sm font-black text-slate-700">Detailed Activity Log</h2>
//               <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//                 <label className="relative">
//                   <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                   <input
//                     type="search"
//                     value={filters.table}
//                     onChange={(event) => updateFilter("table", event.target.value)}
//                     placeholder="Search activity log..."
//                     className="h-10 w-full min-w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
//                   />
//                 </label>
//                 <div className="flex overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-1">
//                   {["All Time", "Daily", "Weekly", "Monthly"].map((period) => (
//                     <button
//                       type="button"
//                       key={period}
//                       onClick={() => updateFilter("period", period)}
//                       className={`rounded px-3 py-2 text-[11px] font-black transition ${filters.period === period ? "bg-white text-[#005A76] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
//                     >
//                       {period}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[980px] text-left">
//                 <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
//                   <tr>
//                     {["Staff ID", "Staff Name", "Activity", "Book Title", "Date & Time", "Status"].map((heading) => (
//                       <th key={heading} className="px-6 py-4 font-black">{heading}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-sm">
//                   {visibleActivities.map((activity, index) => (
//                     <tr key={`${activity.id}-${activity.activity}-${activity.time}-${index}`} className="transition hover:bg-slate-50">
//                       <td className="px-6 py-4 text-xs font-black text-[#005A76]">{activity.id}</td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#E6F4F7] text-[11px] font-black text-[#005A76]">
//                             {activity.initials}
//                           </span>
//                           <span className="font-bold text-slate-700">{activity.staffName}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${getActivityClass(activity.activity)}`}>
//                           {activity.activity}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="font-semibold text-slate-700">{activity.bookTitle}</p>
//                         <p className="mt-1 text-[11px] font-semibold text-slate-400">{activity.member !== "-" ? `Member ${activity.member}` : "Library record"}</p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
//                           <Calendar size={14} className="text-slate-400" />
//                           {activity.date}
//                         </div>
//                         <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
//                           <Clock3 size={13} />
//                           {activity.time}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${getStatusClass(activity.status)}`}>
//                           {activity.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                   {!visibleActivities.length && (
//                     <tr>
//                       <td colSpan="6" className="px-6 py-12 text-center text-sm font-semibold text-slate-400">
//                         No staff activity records found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
//               <p className="text-xs font-semibold text-slate-500">
//                 Showing {showingStart}-{showingEnd} of {filteredActivities.length} entries
//               </p>
//               <div className="flex items-center gap-2">
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
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileDown,
  Printer,
  RefreshCcw,
  Search,
  Table as TableIcon,
  Trophy,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const PAGE_SIZE = 4;
const activityTypes = ["All Activities", "Borrowing", "Returning", "Record Update", "Fine Collection"];
const staffNames = ["All Staff", "John Doe", "Sarah Smith", "Michael Chen", "Nita Long"];

const staffActivities = [
  {
    id: "S-0129",
    staffName: "John Doe",
    initials: "JD",
    activity: "Borrowing",
    bookTitle: "To Kill a Mockingbird",
    member: "M-998",
    date: "Oct 24, 2023",
    time: "09:15 AM",
    status: "Completed",
  },
  {
    id: "S-0244",
    staffName: "Sarah Smith",
    initials: "SS",
    activity: "Returning",
    bookTitle: "Modern Library Mgmt",
    member: "M-442",
    date: "Oct 24, 2023",
    time: "10:45 AM",
    status: "Completed",
  },
  {
    id: "S-0129",
    staffName: "John Doe",
    initials: "JD",
    activity: "Record Update",
    bookTitle: "Pride and Prejudice",
    member: "M-731",
    date: "Oct 24, 2023",
    time: "11:20 AM",
    status: "Pending",
  },
  {
    id: "S-0311",
    staffName: "Michael Chen",
    initials: "MC",
    activity: "Fine Collection",
    bookTitle: "-",
    member: "M-998",
    date: "Oct 24, 2023",
    time: "12:35 PM",
    status: "Completed",
  },
  {
    id: "S-0384",
    staffName: "Nita Long",
    initials: "NL",
    activity: "Inventory Audit",
    bookTitle: "Khmer Folktales",
    member: "-",
    date: "Oct 23, 2023",
    time: "03:05 PM",
    status: "Completed",
  },
  {
    id: "S-0244",
    staffName: "Sarah Smith",
    initials: "SS",
    activity: "Borrowing",
    bookTitle: "The Lean Startup",
    member: "M-210",
    date: "Oct 23, 2023",
    time: "04:10 PM",
    status: "Completed",
  },
  {
    id: "S-0129",
    staffName: "John Doe",
    initials: "JD",
    activity: "Returning",
    bookTitle: "Atomic Habits",
    member: "M-554",
    date: "Oct 22, 2023",
    time: "01:30 PM",
    status: "Completed",
  },
  {
    id: "S-0311",
    staffName: "Michael Chen",
    initials: "MC",
    activity: "Record Update",
    bookTitle: "Database Systems",
    member: "M-087",
    date: "Oct 22, 2023",
    time: "02:15 PM",
    status: "Pending",
  },
];

const chartData = [
  { day: "Mon", borrowing: 42, returning: 50 },
  { day: "Tue", borrowing: 58, returning: 47 },
  { day: "Wed", borrowing: 78, returning: 67 },
  { day: "Thu", borrowing: 92, returning: 79 },
  { day: "Fri", borrowing: 66, returning: 63 },
  { day: "Sat", borrowing: 86, returning: 98 },
];

const targets = [
  { label: "Circulation Goal", value: 85, color: "bg-[#005A76]" },
  { label: "Data Cleaning", value: 42, color: "bg-[#F5C842]" },
  { label: "Inventory Audit", value: 12, color: "bg-slate-500" },
];

const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`;

function downloadStaffActivityCsv(rows) {
  const headers = ["Staff ID", "Staff Name", "Activity", "Book Title", "Member", "Date", "Time", "Status"];
  const csvRows = rows.map((row) => [
    row.id,
    row.staffName,
    row.activity,
    row.bookTitle,
    row.member,
    row.date,
    row.time,
    row.status,
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

const getActivityClass = (activity) => ({
  Borrowing: "bg-sky-100 text-sky-700",
  Returning: "bg-amber-100 text-amber-700",
  "Record Update": "bg-violet-100 text-violet-700",
  "Fine Collection": "bg-red-100 text-red-600",
  "Inventory Audit": "bg-emerald-100 text-emerald-700",
}[activity] || "bg-slate-100 text-slate-600");

const getStatusClass = (status) => ({
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-slate-100 text-slate-500",
}[status] || "bg-slate-100 text-slate-600");

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
          <p className={`mt-1 text-[11px] font-black ${noteClass}`}>{note}</p>
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
  const [filters, setFilters] = useState({
    header: "",
    table: "",
    dateRange: "Last 30 Days",
    staffName: "All Staff",
    activityType: "All Activities",
    period: "All Time",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const filteredActivities = useMemo(() => {
    const headerQuery = filters.header.trim().toLowerCase();
    const tableQuery = filters.table.trim().toLowerCase();

    return staffActivities.filter((activity) => {
      const text = `${activity.id} ${activity.staffName} ${activity.activity} ${activity.bookTitle} ${activity.member} ${activity.date} ${activity.time} ${activity.status}`.toLowerCase();
      const matchesSearch = (!headerQuery || text.includes(headerQuery)) && (!tableQuery || text.includes(tableQuery));
      const matchesStaff = filters.staffName === "All Staff" || activity.staffName === filters.staffName;
      const matchesActivity = filters.activityType === "All Activities" || activity.activity === filters.activityType;

      return matchesSearch && matchesStaff && matchesActivity;
    });
  }, [filters]);

  const pageCount = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleActivities = filteredActivities.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredActivities.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredActivities.length);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Navbar
          title="Staff Activity Report"
          breadcrumb=" View and analyze staff activities in the library"
          onBack={() => window.history.back()}
          searchValue={filters.header}
          onSearchChange={(value) => updateFilter("header", value)}
          searchPlaceholder="Search books, member..."
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 rounded-md bg-[#005A76] px-4 py-3 text-sm font-bold text-white shadow-lg">
              {toast}
            </div>
          )}

          <section className="flex flex-wrap justify-end gap-2">
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
              onClick={() => filteredActivities.length ? (downloadStaffActivityCsv(filteredActivities), showMessage("Staff activity exported")) : showMessage("No activities to export")}
              disabled={filteredActivities.length === 0}
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
          </section>

          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Activities"
              value="1,284"
              note="+8% from last month"
              icon={CheckCircle2}
              iconClass="bg-sky-100 text-[#005A76]"
            />
            <SummaryCard
              title="Borrow Transactions"
              value="842"
              note="+5% from last month"
              icon={ClipboardCheck}
              iconClass="bg-amber-100 text-amber-700"
            />
            <SummaryCard
              title="Return Transactions"
              value="412"
              note="stable trend"
              icon={RefreshCcw}
              iconClass="bg-indigo-100 text-indigo-700"
              noteClass="text-slate-500"
            />
            <SummaryCard
              title="Overdue Handling"
              value="31"
              note="+2 more than yesterday"
              icon={AlertTriangle}
              iconClass="bg-red-100 text-red-600"
              noteClass="text-red-500"
            />
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-black text-slate-700">Staff Productivity Trend</h2>
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
                <div className="grid h-56 grid-cols-6 items-end gap-4 border-b border-slate-200">
                  {chartData.map((item) => (
                    <div key={item.day} className="flex h-full min-w-0 items-end justify-center gap-1.5">
                      <div
                        className="w-full max-w-[38px] rounded-t-sm bg-[#B7CBD6] transition hover:bg-[#9AB6C4]"
                        style={{ height: `${item.borrowing}%` }}
                        title={`${item.day} borrowing ${item.borrowing}`}
                      />
                      <div
                        className="w-full max-w-[38px] rounded-t-sm bg-[#4F8196] transition hover:bg-[#005A76]"
                        style={{ height: `${item.returning}%` }}
                        title={`${item.day} returning ${item.returning}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-6 gap-4 text-center text-[11px] font-black text-slate-400">
                  {chartData.map((item) => <span key={item.day}>{item.day}</span>)}
                </div>
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black text-slate-700">Daily Targets</h2>
              <div className="mt-5 space-y-5">
                {targets.map((target) => (
                  <div key={target.label}>
                    <div className="mb-2 flex items-center justify-between text-xs font-black">
                      <span className="text-slate-600">{target.label}</span>
                      <span className="text-[#005A76]">{target.value}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${target.color}`} style={{ width: `${target.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-lg bg-[#005A76] p-4 text-white">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                  <Trophy size={14} />
                  Upcoming Milestone
                </div>
                <p className="mt-3 text-sm font-black">Staff Monthly Review</p>
                <p className="mt-1 text-xs font-semibold text-white/80">Friday, 10:00 AM</p>
              </div>
            </aside>
          </section>

          <section className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <SelectFilter label="Date Range" value={filters.dateRange} onChange={(value) => updateFilter("dateRange", value)}>
                {["Last 7 Days", "Last 30 Days", "This Month", "This Year"].map((option) => <option key={option}>{option}</option>)}
              </SelectFilter>
              <SelectFilter label="Staff Name" value={filters.staffName} onChange={(value) => updateFilter("staffName", value)}>
                {staffNames.map((option) => <option key={option}>{option}</option>)}
              </SelectFilter>
              <SelectFilter label="Activity Type" value={filters.activityType} onChange={(value) => updateFilter("activityType", value)}>
                {activityTypes.map((option) => <option key={option}>{option}</option>)}
              </SelectFilter>
            </div>

            <button
              type="button"
              onClick={() => {
                setFilters({ header: "", table: "", dateRange: "Last 30 Days", staffName: "All Staff", activityType: "All Activities", period: "All Time" });
                setCurrentPage(1);
                showMessage("Filters reset");
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-[#005A76] hover:text-[#005A76]"
            >
              <RefreshCcw size={15} />
              Reset
            </button>
          </section>

          <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-sm font-black text-slate-700">Detailed Activity Log</h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={filters.table}
                    onChange={(event) => updateFilter("table", event.target.value)}
                    placeholder="Search activity log..."
                    className="h-10 w-full min-w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
                  />
                </label>
                <div className="flex overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-1">
                  {["All Time", "Daily", "Weekly", "Monthly"].map((period) => (
                    <button
                      type="button"
                      key={period}
                      onClick={() => updateFilter("period", period)}
                      className={`rounded px-3 py-2 text-[11px] font-black transition ${filters.period === period ? "bg-white text-[#005A76] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    {["Staff ID", "Staff Name", "Activity", "Book Title", "Date & Time", "Status"].map((heading) => (
                      <th key={heading} className="px-6 py-4 font-black">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {visibleActivities.map((activity, index) => (
                    <tr key={`${activity.id}-${activity.activity}-${activity.time}-${index}`} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-xs font-black text-[#005A76]">{activity.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#E6F4F7] text-[11px] font-black text-[#005A76]">
                            {activity.initials}
                          </span>
                          <span className="font-bold text-slate-700">{activity.staffName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${getActivityClass(activity.activity)}`}>
                          {activity.activity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">{activity.bookTitle}</p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-400">{activity.member !== "-" ? `Member ${activity.member}` : "Library record"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Calendar size={14} className="text-slate-400" />
                          {activity.date}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                          <Clock3 size={13} />
                          {activity.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${getStatusClass(activity.status)}`}>
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!visibleActivities.length && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-sm font-semibold text-slate-400">
                        No staff activity records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Showing {showingStart}-{showingEnd} of {filteredActivities.length} entries
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