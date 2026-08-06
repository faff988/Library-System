import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileDown,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Search,
  Users,
  UserX,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";

const PAGE_SIZE = 4;

const STATUS_OPTIONS = ["All Status", "Active", "Expired", "Suspended"];

const statusBadgeStyle = {
  Active: { backgroundColor: "#DCFCE7", color: "#16A34A" },
  Expired: { backgroundColor: "#F1F5F9", color: "#64748B" },
  Suspended: { backgroundColor: "#FFEDD5", color: "#EA580C" },
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function escapeCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadMemberCsv(rows) {
  const headers = ["Member ID", "Full Name", "Email", "Membership Type", "Status", "Total Borrows", "Registered Date"];
  const csvRows = rows.map((row) => [
    row.member_id,
    row.full_name,
    row.email || "",
    row.membership_type || "",
    row.status,
    row.totalBorrows,
    row.created_at,
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
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
    <div className="bg-white rounded-xl px-4 py-4 border border-gray-100 shadow-3xs flex flex-col gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 mb-1">{card.title}</p>
        <p className="text-xl font-black leading-tight text-gray-900">{card.value}</p>
        {card.sub && <p className="text-[11px] mt-1 font-semibold" style={{ color: card.subColor }}>{card.sub}</p>}
      </div>
    </div>
  );
}

function SelectFilter({ icon: Icon, value, onChange, options, ariaLabel }) {
  return (
    <label className="relative block min-w-[150px]">
      <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-xs font-semibold text-gray-600 shadow-3xs outline-none transition hover:bg-gray-50 focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
      >
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </label>
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

export default function MemberReport() {
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [membershipType, setMembershipType] = useState("All Types");
  const [status, setStatus] = useState("All Status");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const [allMembers, setAllMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [byStatus, setByStatus] = useState({});
  const [loading, setLoading] = useState(true);

  const [membershipTypes, setMembershipTypes] = useState([]);

  const [bookStats, setBookStats] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, [status]);

  useEffect(() => {
    fetchMembershipTypes();
    fetchBookStats();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== "All Status") params.append("status", status);

      const response = await api.get(`/reports/members?${params.toString()}`);
      if (response.data?.success) {
        setAllMembers(response.data.data.members);
        setTotalMembers(response.data.data.totalMembers);
        setByStatus(response.data.data.byStatus || {});
      }
    } catch (err) {
      console.error("Failed to load member report:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipTypes = async () => {
    try {
      const response = await api.get("/membership-types");
      if (response.data?.success) setMembershipTypes(response.data.data);
    } catch (err) {
      console.error("Failed to load membership types:", err);
    }
  };

  // /books/stats already computes a global overdueCount, reused here since
  // /reports/members has no equivalent overdue figure of its own.
  const fetchBookStats = async () => {
    try {
      const response = await api.get("/books/stats");
      if (response.data?.success) setBookStats(response.data.data);
    } catch (err) {
      console.error("Failed to load book stats:", err);
    }
  };

  const showMessage = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  // /reports/members has no search or membershipTypeId-name filter (only
  // membershipTypeId, which the UI doesn't track), so both are applied
  // client-side over the already-fetched (status-filtered) set.
  const filteredMembers = allMembers.filter((member) => {
    const headerQuery = headerSearch.trim().toLowerCase();
    const tableQuery = tableSearch.trim().toLowerCase();
    const searchableText = `${member.member_id} ${member.full_name} ${member.email || ""} ${member.membership_type || ""} ${member.status}`.toLowerCase();
    const matchesHeader = !headerQuery || searchableText.includes(headerQuery);
    const matchesTable = !tableQuery || searchableText.includes(tableQuery);
    const matchesType = membershipType === "All Types" || member.membership_type === membershipType;

    return matchesHeader && matchesTable && matchesType;
  });

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleMembers = filteredMembers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredMembers.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredMembers.length);

  const resetFilters = () => {
    setHeaderSearch("");
    setTableSearch("");
    setMembershipType("All Types");
    setStatus("All Status");
    setCurrentPage(1);
    showMessage("Filters reset");
  };

  const metricCards = [
    {
      title: "Total Members",
      value: formatNumber(totalMembers),
      icon: Users,
      iconBg: "#DBEAFE",
      iconColor: "#2563EB",
    },
    {
      title: "Active Members",
      value: formatNumber(byStatus.Active || 0),
      sub: totalMembers ? `${Math.round(((byStatus.Active || 0) / totalMembers) * 100)}% of total members` : undefined,
      subColor: "#71717A",
      icon: CheckCircle2,
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
    },
    {
      title: "Overdue Books",
      value: bookStats ? formatNumber(bookStats.overdueCount) : "—",
      sub: bookStats?.overdueCount > 0 ? "High priority" : undefined,
      subColor: "#DC2626",
      icon: Clock3,
      iconBg: "#FEE2E2",
      iconColor: "#DC2626",
    },
    {
      title: "Suspended Members",
      value: formatNumber(byStatus.Suspended || 0),
      icon: UserX,
      iconBg: "#FFEDD5",
      iconColor: "#EA580C",
    },
  ];

  const typeOptions = ["All Types", ...membershipTypes.map((t) => t.type_name)];

  return (
    <div className="flex-1 bg-[#E9EEF4]">
        <Navbar
          title="Member Report"
          breadcrumb="View and analyze member records"
          onBack={() => window.history.back()}
          searchValue={headerSearch}
          onSearchChange={(value) => {
            setHeaderSearch(value);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search books, member..."
        />

        <div className="px-6 py-5 space-y-5">
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-[#055E83] px-4 py-3 text-sm font-bold text-white shadow-lg">
              {toast}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <MetricCard key={card.title} card={card} />
            ))}
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SelectFilter
                icon={Users}
                value={membershipType}
                onChange={(value) => { setMembershipType(value); setCurrentPage(1); }}
                options={typeOptions}
                ariaLabel="Member type"
              />
              <SelectFilter
                icon={CheckCircle2}
                value={status}
                onChange={(value) => { setStatus(value); setCurrentPage(1); }}
                options={STATUS_OPTIONS}
                ariaLabel="Status"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <ExportButton icon={Search} onClick={() => setShowMoreFilters((visible) => !visible)}>More Filters</ExportButton>
              <ExportButton icon={RotateCcw} onClick={resetFilters}>Reset</ExportButton>
              <ExportButton icon={Printer} onClick={() => window.print()}>Print</ExportButton>
              <ExportButton icon={FileDown} variant="primary" onClick={() => window.print()}>Export PDF</ExportButton>
              <ExportButton
                icon={FileSpreadsheet}
                onClick={() => {
                  filteredMembers.length
                    ? (downloadMemberCsv(filteredMembers), showMessage("Member report exported"))
                    : showMessage("No member records to export");
                }}
                disabled={filteredMembers.length === 0}
              >
                Excel
              </ExportButton>
            </div>
          </div>

          {showMoreFilters && (
            <div className="max-w-sm">
              <label className="relative block">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={tableSearch}
                  onChange={(event) => {
                    setTableSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter by member ID, name, or email..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs font-semibold text-gray-600 shadow-3xs outline-none transition focus:border-[#055E83] focus:ring-2 focus:ring-[#055E83]/10"
                />
              </label>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-bold text-gray-800">Member Records</h3>
              <p className="mt-1 text-xs font-semibold text-gray-400">Borrowing activity per member</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="sticky top-0 z-[1] bg-gray-50/90 backdrop-blur text-[10px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Member ID</th>
                    <th className="px-5 py-3.5 font-bold">Full Name</th>
                    <th className="px-5 py-3.5 font-bold">Membership</th>
                    <th className="px-5 py-3.5 font-bold">Status</th>
                    <th className="px-5 py-3.5 text-center font-bold">Total Borrows</th>
                    <th className="px-5 py-3.5 font-bold">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-sm font-semibold text-gray-400">
                        Loading members...
                      </td>
                    </tr>
                  ) : visibleMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <p className="text-sm font-bold text-gray-500">No member records found</p>
                        <p className="mt-1 text-xs font-medium text-gray-400">Try adjusting your filters or search terms</p>
                      </td>
                    </tr>
                  ) : (
                    visibleMembers.map((member) => (
                      <tr key={member.member_id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-5 py-4 text-xs font-bold text-[#055E83]">#{member.member_id}</td>
                        <td className="px-5 py-4">
                          <span className="min-w-0">
                            <span className="block truncate font-bold leading-tight text-gray-800">{member.full_name}</span>
                            <span className="mt-0.5 block truncate text-[11px] font-semibold text-gray-400">{member.email || "—"}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                            {member.membership_type || "None"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                            style={statusBadgeStyle[member.status] || statusBadgeStyle.Expired}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: (statusBadgeStyle[member.status] || statusBadgeStyle.Expired).color }}
                            />
                            {member.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-xs font-bold text-gray-800">{member.totalBorrows}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-600">{formatDate(member.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-gray-500">
                Showing {showingStart}-{showingEnd} of {filteredMembers.length} members
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
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
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  disabled={safePage === pageCount}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}