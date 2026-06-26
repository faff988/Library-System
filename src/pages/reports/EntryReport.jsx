import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChartNoAxesColumn,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DoorOpen,
  FileDown,
  FileSpreadsheet,
  LogIn,
  Printer,
  Search,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Adminsidebar";

const PAGE_SIZE = 3;
const DEFAULT_FILTERS = {
  header: "",
  table: "",
  date: "Date Range",
  memberType: "Member Type",
  status: "Status",
  purpose: "Purpose",
};

const attendanceRecords = [
  {
    id: "#ATT-90210",
    member: "Chan Sophea",
    initials: "CS",
    dob: "17-JUN-2002",
    date: "Oct 24, 2023",
    checkIn: "08:30 AM",
    memberType: "Student",
    purpose: "Research/Study",
    status: "Inside",
    avatarClass: "bg-sky-100 text-[#005A76]",
  },
  {
    id: "#ATT-90209",
    member: "Dr. Kong Virak",
    initials: "KV",
    dob: "18-OCT-2009",
    date: "Oct 24, 2023",
    checkIn: "09:15 AM",
    memberType: "Teacher",
    purpose: "Research/Study",
    status: "Checked Out",
    avatarClass: "bg-amber-100 text-amber-700",
  },
  {
    id: "#ATT-90208",
    member: "Srey Rath",
    initials: "SR",
    dob: "18-JUN-2012",
    date: "Oct 24, 2023",
    checkIn: "10:00 AM",
    memberType: "Student",
    purpose: "Reading",
    status: "Inside",
    avatarClass: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "#ATT-90207",
    member: "Mony Rotha",
    initials: "MR",
    dob: "05-FEB-2001",
    date: "Oct 24, 2023",
    checkIn: "10:35 AM",
    memberType: "Student",
    purpose: "Borrow Book",
    status: "Inside",
    avatarClass: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "#ATT-90206",
    member: "Nita Long",
    initials: "NL",
    dob: "12-MAR-2004",
    date: "Oct 23, 2023",
    checkIn: "01:20 PM",
    memberType: "Staff",
    purpose: "Other",
    status: "Checked Out",
    avatarClass: "bg-rose-100 text-rose-600",
  },
  {
    id: "#ATT-90205",
    member: "Leakena Rath",
    initials: "LR",
    dob: "27-AUG-2003",
    date: "Oct 23, 2023",
    checkIn: "02:05 PM",
    memberType: "Guest",
    purpose: "Play Board Game",
    status: "Checked Out",
    avatarClass: "bg-cyan-100 text-cyan-700",
  },
  {
    id: "#ATT-90204",
    member: "Kosal Dara",
    initials: "KD",
    dob: "30-NOV-2000",
    date: "Oct 22, 2023",
    checkIn: "11:45 AM",
    memberType: "Student",
    purpose: "Reading",
    status: "Inside",
    avatarClass: "bg-violet-100 text-violet-700",
  },
];

const attendanceTrend = [
  { day: "Mon", current: 54, previous: 72 },
  { day: "Tue", current: 92, previous: 116 },
  { day: "Wed", current: 34, previous: 62 },
  { day: "Thu", current: 138, previous: 96 },
  { day: "Fri", current: 66, previous: 98 },
  { day: "Sat", current: 18, previous: 48 },
  { day: "Sun", current: 10, previous: 28 },
];

const purposeDistribution = [
  { label: "Reading", percent: 45, color: "#005A76" },
  { label: "Borrow Book", percent: 25, color: "#9A7A00" },
  { label: "Research/Study", percent: 15, color: "#39A7D7" },
  { label: "Play Board Game", percent: 10, color: "#B7CBD6" },
  { label: "Other", percent: 5, color: "#C9CDD7" },
];

const metricCards = [
  {
    title: "Total Attendance",
    value: "12,842",
    note: "+12% from last month",
    icon: Users,
    iconClass: "bg-[#E6F4F7] text-[#005A76]",
    accentClass: "bg-[#005A76]",
    noteClass: "text-emerald-600",
  },
  {
    title: "Today's Attendance",
    value: "248",
    note: "Peak: 14:00 - 16:00",
    icon: CalendarDays,
    iconClass: "bg-[#FFF4CC] text-[#9A7A00]",
    accentClass: "bg-[#9A7A00]",
    noteClass: "text-slate-500",
  },
  {
    title: "Avg. Visit Time",
    value: "1h 45m",
    note: "Steady vs previous week",
    icon: Clock3,
    iconClass: "bg-sky-100 text-sky-700",
    accentClass: "bg-[#005A76]",
    noteClass: "text-slate-500",
  },
  {
    title: "Active Inside",
    value: "42",
    note: "Live occupancy now",
    icon: LogIn,
    iconClass: "bg-emerald-100 text-emerald-700",
    accentClass: "bg-emerald-500",
    noteClass: "text-slate-500",
  },
];

const dateOptions = ["Date Range", "Oct 24, 2023", "Oct 23, 2023", "Oct 22, 2023", "Last 7 Days"];
const memberTypeOptions = ["Member Type", "Student", "Teacher", "Staff", "Guest"];
const statusOptions = ["Status", "Inside", "Checked Out"];
const purposeOptions = ["Purpose", "Reading", "Borrow Book", "Research/Study", "Play Board Game", "Other"];

const purposeBadgeClass = {
  Reading: "bg-sky-100 text-sky-700",
  "Borrow Book": "bg-amber-100 text-amber-700",
  "Research/Study": "bg-cyan-100 text-[#005A76]",
  "Play Board Game": "bg-slate-200 text-slate-600",
  Other: "bg-violet-100 text-violet-700",
};

const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`;

function downloadAttendanceCsv(rows) {
  const headers = ["Attendance ID", "Member", "DOB", "Date", "Check-In", "Member Type", "Purpose", "Status"];
  const csvRows = rows.map((row) => [
    row.id,
    row.member,
    row.dob,
    row.date,
    row.checkIn,
    row.memberType,
    row.purpose,
    row.status,
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
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

function SelectFilter({ icon: Icon, value, onChange, options, ariaLabel }) {
  return (
    <label className="relative block min-w-[150px]">
      <Icon
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]"
      />
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </label>
  );
}

function ExportButton({ icon: Icon, children, variant = "light", ...props }) {
  const className =
    variant === "primary"
      ? "bg-[#005A76] text-white shadow-sm hover:bg-[#00445a]"
      : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-[#005A76] hover:text-[#005A76]";

  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function MetricCard({ card }) {
  const Icon = card.icon;

  return (
    <article className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`absolute left-0 top-0 h-full w-1 ${card.accentClass}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-500">{card.title}</p>
          <h3 className="mt-2 text-3xl font-black tracking-normal text-slate-900">{card.value}</h3>
          <p className={`mt-3 text-[11px] font-black ${card.noteClass}`}>{card.note}</p>
        </div>
        <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}>
          <Icon size={19} />
        </span>
      </div>
    </article>
  );
}

function AttendanceTrendChart() {
  const maxValue = Math.max(...attendanceTrend.flatMap((item) => [item.current, item.previous]));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-800">Daily Attendance Trends</h2>
        <span className="text-[11px] font-bold text-slate-400">Last 7 Days</span>
      </div>

      <div className="mt-5 grid h-48 grid-cols-7 items-end gap-3 border-b border-slate-100">
        {attendanceTrend.map((item) => (
          <div key={item.day} className="relative flex h-full min-w-0 items-end">
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-[#CFE1E8]"
              style={{ height: `${(item.previous / maxValue) * 100}%` }}
              title={`${item.day} previous ${item.previous}`}
            />
            <div
              className="relative z-[1] w-full rounded-t-sm bg-[#005A76] transition hover:bg-[#00445a]"
              style={{ height: `${(item.current / maxValue) * 100}%` }}
              title={`${item.day} attendance ${item.current}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-3 text-center text-[10px] font-black text-slate-400">
        {attendanceTrend.map((item) => (
          <span key={item.day}>{item.day}</span>
        ))}
      </div>
    </section>
  );
}

function PurposeDistribution() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-black text-slate-800">Visit Purpose Distribution</h2>

      <div className="mt-6 grid items-center gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full" style={{ background: buildDonutGradient(purposeDistribution) }}>
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <span className="text-2xl font-black tracking-normal text-slate-800">1.2k</span>
            <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
          </div>
        </div>

        <div className="space-y-3">
          {purposeDistribution.map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-xs font-bold">
              <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="min-w-0 flex-1 text-slate-600">{item.label}</span>
              <span className="font-black text-slate-900">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsideStack() {
  return (
    <div className="mt-2 flex items-center">
      {["CS", "SR", "MR", "+39"].map((label, index) => (
        <span
          key={label}
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-black shadow-sm ${index === 3 ? "bg-[#005A76] text-white" : "bg-slate-200 text-slate-500"}`}
          style={{ marginLeft: index ? "-7px" : 0 }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export default function EntryReport() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
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

  const filteredRecords = useMemo(() => {
    const headerQuery = filters.header.trim().toLowerCase();
    const tableQuery = filters.table.trim().toLowerCase();

    return attendanceRecords.filter((record) => {
      const searchableText = `${record.id} ${record.member} ${record.dob} ${record.date} ${record.checkIn} ${record.memberType} ${record.purpose} ${record.status}`.toLowerCase();
      const matchesHeader = !headerQuery || searchableText.includes(headerQuery);
      const matchesTable = !tableQuery || searchableText.includes(tableQuery);
      const matchesDate = filters.date === "Date Range" || filters.date === "Last 7 Days" || record.date === filters.date;
      const matchesType = filters.memberType === "Member Type" || record.memberType === filters.memberType;
      const matchesStatus = filters.status === "Status" || record.status === filters.status;
      const matchesPurpose = filters.purpose === "Purpose" || record.purpose === filters.purpose;

      return matchesHeader && matchesTable && matchesDate && matchesType && matchesStatus && matchesPurpose;
    });
  }, [filters]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleRecords = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredRecords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredRecords.length);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    showMessage("Entry filters reset");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#E4ECF5]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          title="Entry Report"
          onBack={() => window.history.back()}
          searchValue={filters.header}
          onSearchChange={(value) => updateFilter("header", value)}
          searchPlaceholder="Search books, member..."
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 rounded-md bg-[#005A76] px-4 py-3 text-sm font-bold text-white shadow-lg">
              {toast}
            </div>
          )}

          <section className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SelectFilter icon={CalendarDays} value={filters.date} onChange={(value) => updateFilter("date", value)} options={dateOptions} ariaLabel="Date range" />
              <SelectFilter icon={Users} value={filters.memberType} onChange={(value) => updateFilter("memberType", value)} options={memberTypeOptions} ariaLabel="Member type" />
              <SelectFilter icon={UserRoundCheck} value={filters.status} onChange={(value) => updateFilter("status", value)} options={statusOptions} ariaLabel="Status" />
              <SelectFilter icon={DoorOpen} value={filters.purpose} onChange={(value) => updateFilter("purpose", value)} options={purposeOptions} ariaLabel="Visit purpose" />
            </div>

            <div className="flex flex-wrap gap-2">
              <ExportButton icon={FileDown} onClick={() => window.print()}>PDF</ExportButton>
              <ExportButton
                icon={FileSpreadsheet}
                onClick={() => {
                  filteredRecords.length ? (downloadAttendanceCsv(filteredRecords), showMessage("Entry report exported")) : showMessage("No records to export");
                }}
                disabled={filteredRecords.length === 0}
              >
                Excel
              </ExportButton>
              <ExportButton icon={Printer} variant="primary" onClick={() => window.print()}>Print Report</ExportButton>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <MetricCard key={card.title} card={card} />
            ))}
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <AttendanceTrendChart />
            <PurposeDistribution />
          </section>

          <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-800">Attendance History</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">Live member entry records and visit purpose details</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={filters.table}
                    onChange={(event) => updateFilter("table", event.target.value)}
                    placeholder="Filter attendance history..."
                    className="h-10 w-full min-w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
                  />
                </label>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-[#005A76] hover:text-[#005A76]"
                >
                  <ChartNoAxesColumn size={15} />
                  Reset
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] text-left">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    {["Attendance ID", "Member", "DOB", "Date", "Check-In", "Purpose", "Status"].map((heading) => (
                      <th key={heading} className="px-5 py-4 font-black">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {visibleRecords.map((record) => (
                    <tr key={record.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 text-xs font-black text-slate-800">{record.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-black ${record.avatarClass}`}>
                            {record.initials}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-black leading-tight text-slate-800">{record.member}</span>
                            <span className="mt-0.5 block text-[11px] font-semibold text-slate-400">{record.memberType}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-700">{record.dob}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-700">{record.date}</td>
                      <td className="px-5 py-4 text-xs font-black text-slate-800">{record.checkIn}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded px-2.5 py-1 text-[10px] font-black uppercase ${purposeBadgeClass[record.purpose]}`}>
                          {record.purpose}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-2 text-xs font-black ${record.status === "Inside" ? "text-emerald-600" : "text-slate-500"}`}>
                          <span className={`h-2 w-2 rounded-full ${record.status === "Inside" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!visibleRecords.length && (
                    <tr>
                      <td colSpan="7" className="px-5 py-12 text-center text-sm font-semibold text-slate-400">
                        No entry records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Showing {showingStart}-{showingEnd} of {filteredRecords.length} records
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

          <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-black text-slate-500">Current Occupancy</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-black text-slate-900">42 inside</p>
                  <InsideStack />
                </div>
                <DoorOpen size={28} className="text-emerald-600" />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-black text-slate-500">Quietest Window</p>
              <p className="mt-2 text-2xl font-black text-slate-900">12:00 PM</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">Great for study room planning</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-black text-slate-500">Peak Purpose</p>
              <p className="mt-2 text-2xl font-black text-slate-900">Reading</p>
              <p className="mt-2 text-xs font-semibold text-emerald-600">45% of visits this period</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
