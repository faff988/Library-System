
 import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BookX,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileDown,
  MoreVertical,
  Printer,
  RotateCcw,
  Search,
  Table as TableIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Adminsidebar";

const PAGE_SIZE = 5;

const incidents = [
  {
    id: "#REP-8291",
    title: "The Great Gatsby",
    isbn: "978-0-16-148410-0",
    category: "Fiction",
    type: "Lost",
    reportedBy: "Sarah Jenkins",
    reportedDate: "Oct 12, 2023",
    cost: 24.95,
    action: "Replace",
  },
  {
    id: "#REP-8382",
    title: "Principles of Chemistry",
    isbn: "978-0-13-148410-0",
    category: "Science",
    type: "Damaged",
    reportedBy: "Mark Weber",
    reportedDate: "Oct 14, 2023",
    cost: 115,
    action: "Repair",
  },
  {
    id: "#REP-8396",
    title: "History of Cambodia",
    isbn: "978-9-16-148410-0",
    category: "History",
    type: "Recovered",
    reportedBy: "Sarah Jenkins",
    reportedDate: "Oct 15, 2023",
    cost: 0,
    action: "Archive",
  },
  {
    id: "#REP-8401",
    title: "Database System Concepts",
    isbn: "978-0-07-352332-3",
    category: "Technology",
    type: "Damaged",
    reportedBy: "Mina Sor",
    reportedDate: "Oct 16, 2023",
    cost: 82.5,
    action: "Replace",
  },
  {
    id: "#REP-8417",
    title: "Intro to Calculus",
    isbn: "978-1-22-332451-5",
    category: "Science",
    type: "Lost",
    reportedBy: "Chan Dara",
    reportedDate: "Oct 17, 2023",
    cost: 58.75,
    action: "Charge",
  },
  {
    id: "#REP-8420",
    title: "English Grammar Guide",
    isbn: "978-0-18-224410-2",
    category: "Language",
    type: "Damaged",
    reportedBy: "Nita Long",
    reportedDate: "Oct 18, 2023",
    cost: 18.4,
    action: "Repair",
  },
  {
    id: "#REP-8434",
    title: "Clean Code",
    isbn: "978-0-13-235088-4",
    category: "Technology",
    type: "Lost",
    reportedBy: "Paul Kim",
    reportedDate: "Oct 19, 2023",
    cost: 44.99,
    action: "Replace",
  },
  {
    id: "#REP-8441",
    title: "World Geography Atlas",
    isbn: "978-0-42-118540-7",
    category: "Geography",
    type: "Recovered",
    reportedBy: "Sokha Rin",
    reportedDate: "Oct 20, 2023",
    cost: 0,
    action: "Archive",
  },
  {
    id: "#REP-8455",
    title: "Java Programming",
    isbn: "978-0-13-468599-1",
    category: "Technology",
    type: "Damaged",
    reportedBy: "Lina Mao",
    reportedDate: "Oct 21, 2023",
    cost: 67.2,
    action: "Replace",
  },
];

const summaryCards = [
  {
    label: "Total Lost",
    value: "124",
    note: "+8%",
    noteClass: "text-red-500",
    iconClass: "bg-red-50 text-red-500",
  },
  {
    label: "Damaged",
    value: "86",
    note: "No change",
    noteClass: "text-gray-500",
    iconClass: "bg-[#E7F4FA] text-[#006088]",
  },
  {
    label: "Replacement Cost",
    value: "$3,420",
    note: "NT cost",
    noteClass: "text-gray-500",
    iconClass: "bg-[#FFF2C7] text-[#8A6500]",
  },
  {
    label: "Recovered",
    value: "42",
    note: "Active",
    noteClass: "text-emerald-600",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Pending Cases",
    value: "12",
    note: "Open",
    noteClass: "text-[#A06E00]",
    iconClass: "bg-[#FFF5CB] text-[#A06E00]",
  },
  {
    label: "Require Replacement",
    value: "18",
    note: "Urgent",
    noteClass: "text-red-500",
    iconClass: "bg-red-50 text-red-500",
  },
];

const monthlyTrend = [
  { month: "Jan", lost: 18, damaged: 12 },
  { month: "Feb", lost: 24, damaged: 16 },
  { month: "Mar", lost: 20, damaged: 18 },
  { month: "Apr", lost: 31, damaged: 21 },
  { month: "May", lost: 26, damaged: 19 },
  { month: "Jun", lost: 34, damaged: 24 },
];

 const highRiskAlerts = [
  {
    title: "High-Cost Missing",
    detail: "Encyclopaedia Britannica (Vol. 1-12) - $850.00",
    className: "border-red-500 bg-red-50 text-red-600",
  },
  {
    title: "Frequent Loss",
    detail: "Intro to Calculus (3 copies this month)",
    className: "border-[#C79700] bg-[#FFF7D8] text-[#8A6500]",
  },
  {
    title: "Damaged Category",
    detail: "Science & Tech Journals (High wear)",
    className: "border-[#006088] bg-[#E6F4F7] text-[#006088]",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function escapeCsvValue(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(rows) {
  const headers = [
    "Report ID",
    "Book Title",
    "ISBN",
    "Category",
    "Status",
    "Reported By",
    "Reported Date",
    "Cost",
    "Action",
  ];
  const csvRows = rows.map((row) => [
    row.id,
    row.title,
    row.isbn,
    row.category,
    row.type,
    row.reportedBy,
    row.reportedDate,
    formatCurrency(row.cost),
    row.action,
  ]);
  const csv = [headers, ...csvRows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
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
    Recovered: "bg-[#FFE8CC] text-[#B45309]",
  };

  return classes[type] || "bg-gray-100 text-gray-600";
}

function StatCard({ card }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.iconClass}`}>
          <BookX size={17} />
        </div>
        <span className={`text-[11px] font-extrabold ${card.noteClass}`}>{card.note}</span>
      </div>
      <p className="mt-4 text-[11px] font-extrabold uppercase text-gray-500">{card.label}</p>
      <h3 className="mt-1 text-2xl font-extrabold tracking-normal text-[#1B4965]">
        {card.value}
      </h3>
    </div>
  );
}

function TrendChart() {
  const maxValue = Math.max(...monthlyTrend.flatMap((point) => [point.lost, point.damaged]));
  const width = 600;
  const height = 190;
  const paddingX = 28;
  const paddingY = 18;
  const chartHeight = height - paddingY * 2;
  const step = (width - paddingX * 2) / (monthlyTrend.length - 1);

  const getPoint = (value, index) => {
    const x = paddingX + index * step;
    const y = paddingY + chartHeight - (value / maxValue) * chartHeight;

    return `${x},${y}`;
  };

  const lostPath = monthlyTrend.map((point, index) => getPoint(point.lost, index)).join(" ");
  const damagedPath = monthlyTrend.map((point, index) => getPoint(point.damaged, index)).join(" ");

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

            return (
              <line

               key={line}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="#EEF2F6"
                strokeWidth="1"
              />
            );
          })}
          <polyline points={lostPath} fill="none" stroke="#006088" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={damagedPath} fill="none" stroke="#F5C842" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {monthlyTrend.map((point, index) => {
            const [lostX, lostY] = getPoint(point.lost, index).split(",");
            const [damagedX, damagedY] = getPoint(point.damaged, index).split(",");

            return (
              <g key={point.month}>
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

function RiskAlerts() {
  return (
    <aside className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <AlertCircle size={18} className="text-red-500" />
        <h2 className="text-base font-extrabold text-gray-800">High Risk Alerts</h2>
      </div>

      <div className="mt-4 space-y-3">
        {highRiskAlerts.map((alert) => (
          <div key={alert.title} className={`rounded-md border-l-4 p-3 ${alert.className}`}>
            <p className="text-[11px] font-extrabold uppercase">{alert.title}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-gray-700">{alert.detail}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-md px-3 py-2 text-xs font-extrabold text-[#006088] transition hover:bg-[#E6F4F7]"
      >
        View All Alerts
      </button>
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
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(
    () => ["All", ...new Set(incidents.map((incident) => incident.category))],
    [],
  );

  const filteredIncidents = useMemo(() => {
    const headerQuery = headerSearch.trim().toLowerCase();
    const tableQuery = tableSearch.trim().toLowerCase();

    return incidents.filter((incident) => {
      const searchableText = `${incident.id} ${incident.title} ${incident.isbn} ${incident.category} ${incident.type} ${incident.reportedBy}`.toLowerCase();
      const matchesHeader = !headerQuery || searchableText.includes(headerQuery);
      const matchesTable = !tableQuery || searchableText.includes(tableQuery);
      const matchesType = typeFilter === "All" || incident.type === typeFilter;
      const matchesCategory = categoryFilter === "All" || incident.category === categoryFilter;

      return matchesHeader && matchesTable && matchesType && matchesCategory;
    });
  }, [categoryFilter, headerSearch, tableSearch, typeFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredIncidents.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleIncidents = filteredIncidents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
    <div className="flex h-screen overflow-hidden bg-[#E2E9F2]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          title="Lost or Damaged Book Report"
          breadcrumb="Reports"
          onBack={() => window.history.back()}
          searchValue={headerSearch}
          onSearchChange={setHeaderSearch}
          searchPlaceholder="Search books, member..."
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {summaryCards.map((card) => (
              <StatCard key={card.label} card={card} />
            ))}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
            <TrendChart />
            <RiskAlerts />
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
                    <option value="All">Report Type: All</option>
                    <option value="Lost">Lost</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Recovered">Recovered</option>
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
                    <th className="px-5 py-4 text-center font-extrabold">Status</th>
                    <th className="px-5 py-4 font-extrabold">Reported By</th>
                    <th className="px-5 py-4 text-right font-extrabold">Cost</th>
                    <th className="px-5 py-4 text-center font-extrabold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {visibleIncidents.map((incident) => (
                    <tr key={incident.id} className="transition hover:bg-[#F8FAFC]">
                      <td className="px-5 py-4 text-xs font-extrabold text-[#006088]">
                        {incident.id}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-extrabold leading-tight text-gray-900">{incident.title}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-400">ISBN: {incident.isbn}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                          {incident.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusBadge type={incident.type} />
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-700">{incident.reportedBy}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-400">{incident.reportedDate}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-gray-900">
                        {formatCurrency(incident.cost)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                          aria-label={`${incident.action} ${incident.title}`}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visibleIncidents.length === 0 && (
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

                  រី: return (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                        safePage === page
                          ? "bg-[#1B4965] text-white"
                          : "text-gray-500 hover:bg-gray-100"
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
    </div>
  );
}