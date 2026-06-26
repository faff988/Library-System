import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileDown,
  Filter,
  Printer,
  Receipt,
  RotateCcw,
  Search,
  Table as TableIcon,
  Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Adminsidebar";

const PAGE_SIZE = 4;
const DEFAULT_FILTERS = {
  date: "Registration Date",
  type: "Member Type",
  status: "Status",
};

const members = [
  {
    id: "MB-2024-001",
    name: "Chivon Sophea",
    email: "sophea.ch@email.com",
    initials: "CS",
    avatarClass: "bg-blue-100 text-blue-600",
    membership: "Premium",
    status: "Active",
    borrowed: 12,
    overdue: 2,
    totalFines: 15,
    registeredDate: "Oct 02, 2023",
  },
  {
    id: "MB-2024-042",
    name: "Leakena Rath",
    email: "r.leakena@domain.kh",
    initials: "LR",
    avatarClass: "bg-purple-100 text-purple-600",
    membership: "Basic",
    status: "Active",
    borrowed: 45,
    overdue: 0,
    totalFines: 0,
    registeredDate: "Oct 08, 2023",
  },
  {
    id: "MB-2023-882",
    name: "Serey Mesa",
    email: "mesa.serey@email.com",
    initials: "SM",
    avatarClass: "bg-orange-100 text-orange-600",
    membership: "Premium",
    status: "Expired",
    borrowed: 5,
    overdue: 0,
    totalFines: 2.5,
    registeredDate: "Sep 20, 2023",
  },
  {
    id: "MB-2024-115",
    name: "Kosal Dara",
    email: "dara.k@school.edu",
    initials: "KD",
    avatarClass: "bg-pink-100 text-pink-600",
    membership: "Premium",
    status: "Active",
    borrowed: 108,
    overdue: 1,
    totalFines: 5,
    registeredDate: "Oct 18, 2023",
  },
  {
    id: "MB-2024-154",
    name: "Mony Rotha",
    email: "mony.rotha@email.com",
    initials: "MR",
    avatarClass: "bg-indigo-100 text-indigo-600",
    membership: "Basic",
    status: "Active",
    borrowed: 31,
    overdue: 0,
    totalFines: 0,
    registeredDate: "Oct 22, 2023",
  },
  {
    id: "MB-2024-203",
    name: "Nita Long",
    email: "nita.long@email.com",
    initials: "NL",
    avatarClass: "bg-rose-100 text-rose-600",
    membership: "Premium",
    status: "Suspended",
    borrowed: 18,
    overdue: 3,
    totalFines: 26,
    registeredDate: "Nov 01, 2023",
  },
  {
    id: "MB-2024-274",
    name: "Chan Vanny",
    email: "chan.vanny@email.com",
    initials: "CV",
    avatarClass: "bg-cyan-100 text-cyan-700",
    membership: "Basic",
    status: "Active",
    borrowed: 64,
    overdue: 0,
    totalFines: 0,
    registeredDate: "Nov 05, 2023",
  },
  {
    id: "MB-2024-318",
    name: "Lina Mao",
    email: "lina.mao@email.com",
    initials: "LM",
    avatarClass: "bg-amber-100 text-amber-700",
    membership: "Basic",
    status: "Active",
    borrowed: 22,
    overdue: 1,
    totalFines: 8,
    registeredDate: "Nov 12, 2023",
  },
];

const metricCards = [
  {
    title: "Total Members",
    value: "12,482",
    note: "+4.5%",
    icon: Users,
    iconClass: "bg-blue-50 text-blue-600",
    noteClass: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Active Members",
    value: "10,240",
    note: "82% Rate",
    icon: CheckCircle2,
    iconClass: "bg-emerald-50 text-emerald-600",
    noteClass: "text-slate-400",
  },
  {
    title: "Overdue Books",
    value: "342",
    note: "High",
    icon: Clock3,
    iconClass: "bg-red-50 text-red-500",
    noteClass: "bg-red-50 text-red-600",
  },
  {
    title: "Total Fines Collected",
    value: "$1,240.50",
    note: "This Month",
    icon: Receipt,
    iconClass: "bg-[#FFF4CC] text-[#A06E00]",
    noteClass: "text-slate-400",
  },
];

const dateOptions = ["Registration Date", "Oct 2023", "Nov 2023", "Sep 2023"];
const typeOptions = ["Member Type", "Premium", "Basic"];
const statusOptions = ["Status", "Active", "Expired", "Suspended"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function escapeCsvValue(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadMemberCsv(rows) {
  const headers = [
    "Member ID",
    "Full Name",
    "Email",
    "Membership",
    "Status",
    "Borrowed",
    "Overdue",
    "Total Fines",
    "Registration Date",
  ];
  const csvRows = rows.map((row) => [
    row.id,
    row.name,
    row.email,
    row.membership,
    row.status,
    row.borrowed,
    row.overdue,
    formatCurrency(row.totalFines),
    row.registeredDate,
  ]);
  const csv = [headers, ...csvRows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");

  link.href = url;
  link.download = "member-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function MetricCard({ card }) {
  const Icon = card.icon;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-9 w-9 items-center justify-center rounded-md ${card.iconClass}`}>
          <Icon size={18} />
        </span>
        <span className={`rounded px-2 py-1 text-[10px] font-black ${card.noteClass}`}>
          {card.note}
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{card.title}</p>
      <h3 className="mt-1 text-2xl font-black tracking-normal text-slate-900">{card.value}</h3>
    </article>
  );
}

function SelectFilter({ value, onChange, options, ariaLabel }) {
  return (
    <label className="relative block">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-40 appearance-none rounded-md border border-slate-200 bg-slate-50 px-4 pr-9 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white focus:ring-2 focus:ring-[#005A76]/10"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </label>
  );
}

function StatusCell({ status }) {
  const styles = {
    Active: "bg-emerald-500 text-emerald-600",
    Expired: "bg-slate-400 text-slate-500",
    Suspended: "bg-amber-500 text-amber-600",
  };
  const className = styles[status] || styles.Expired;

  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
      <span className={`h-2 w-2 rounded-full ${className.split(" ")[0]}`} />
      <span className={className.split(" ")[1]}>{status}</span>
    </span>
  );
}

export default function MemberReport() {
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const setFilter = (key) => (value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const filteredMembers = useMemo(() => {
    const headerQuery = headerSearch.trim().toLowerCase();
    const tableQuery = tableSearch.trim().toLowerCase();

    return members.filter((member) => {
      const searchableText = `${member.id} ${member.name} ${member.email} ${member.membership} ${member.status} ${member.borrowed} ${member.overdue} ${member.registeredDate}`.toLowerCase();
      const matchesHeader = !headerQuery || searchableText.includes(headerQuery);
      const matchesTable = !tableQuery || searchableText.includes(tableQuery);
      const matchesDate = filters.date === "Registration Date" || member.registeredDate.includes(filters.date);
      const matchesType = filters.type === "Member Type" || member.membership === filters.type;
      const matchesStatus = filters.status === "Status" || member.status === filters.status;

      return matchesHeader && matchesTable && matchesDate && matchesType && matchesStatus;
    });
  }, [filters, headerSearch, tableSearch]);

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleMembers = filteredMembers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredMembers.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredMembers.length);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setTableSearch("");
    setCurrentPage(1);
    showMessage("Filters reset");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#E4ECF5]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          title="Member Report"
          onBack={() => window.history.back()}
          searchValue={headerSearch}
          onSearchChange={(value) => {
            setHeaderSearch(value);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search books, member..."
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 rounded bg-[#005A76] px-4 py-3 text-sm font-bold text-white shadow-lg">
              {toast}
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <MetricCard key={card.title} card={card} />
            ))}
          </section>

          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                <SelectFilter
                  value={filters.date}
                  onChange={setFilter("date")}
                  options={dateOptions}
                  ariaLabel="Registration date"
                />
                <SelectFilter
                  value={filters.type}
                  onChange={setFilter("type")}
                  options={typeOptions}
                  ariaLabel="Member type"
                />
                <SelectFilter
                  value={filters.status}
                  onChange={setFilter("status")}
                  options={statusOptions}
                  ariaLabel="Status"
                />
                <button
                  type="button"
                  onClick={() => setShowMoreFilters((visible) => !visible)}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-[#005A76] hover:text-[#005A76]"
                >
                  <Filter size={15} />
                  More Filters
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-[#005A76] hover:text-[#005A76]"
                >
                  <RotateCcw size={15} />
                  Reset
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-[#005A76] hover:text-[#005A76]"
                >
                  <Printer size={15} />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-[#005A76] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#00445a]"
                >
                  <FileDown size={15} />
                  Export PDF
                </button>
                <button
                  type="button"
                  disabled={filteredMembers.length === 0}
                  onClick={() => {
                    downloadMemberCsv(filteredMembers);
                    showMessage("Member report exported");
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-[#005A76] hover:text-[#005A76] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <TableIcon size={15} />
                  Excel
                </button>
              </div>
            </div>

            {showMoreFilters && (
              <div className="mt-4 max-w-sm">
                <label className="relative block">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={tableSearch}
                    onChange={(event) => {
                      setTableSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Filter by member ID, email, or fines..."
                    className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
                  />
                </label>
              </div>
            )}
          </section>

          <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead className="bg-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-black">Member ID</th>
                    <th className="px-5 py-4 font-black">Full Name</th>
                    <th className="px-5 py-4 font-black">Membership</th>
                    <th className="px-5 py-4 font-black">Status</th>
                    <th className="px-5 py-4 text-center font-black">Borrowed</th>
                    <th className="px-5 py-4 text-center font-black">Overdue</th>
                    <th className="px-5 py-4 text-right font-black">Total Fines</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {visibleMembers.map((member) => (
                    <tr key={member.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-700">{member.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black ${member.avatarClass}`}>
                            {member.initials}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-black leading-tight text-slate-800">
                              {member.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] font-medium text-slate-400">
                              {member.email}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded bg-slate-200 px-2.5 py-1 text-[10px] font-black text-slate-700">
                          {member.membership}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusCell status={member.status} />
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-800">{member.borrowed}</td>
                      <td className={`px-5 py-4 text-center font-black ${member.overdue > 0 ? "text-red-500" : "text-slate-800"}`}>
                        {member.overdue}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-900">
                        {formatCurrency(member.totalFines)}
                      </td>
                    </tr>
                  ))}

                  {!visibleMembers.length && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-sm font-semibold text-slate-400">
                        No member records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Showing {showingStart} to {showingEnd} of {filteredMembers.length} members
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
                      safePage === page ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  disabled={safePage === pageCount}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
