import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  BookX,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileDown,
  ListFilter,
  Printer,
  RotateCcw,
  Search,
  Table as TableIcon,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Adminsidebar";

const PAGE_SIZE = 5;

const inventoryBooks = [
  {
    id: "LIB-001-24",
    isbn: "978-0134685991",
    title: "Effective Java (3rd Edition)",
    category: "Computer Science",
    total: 15,
    available: 12,
    borrowed: 3,
    status: "Available",
  },
  {
    id: "LIB-001-56",
    isbn: "978-0262033848",
    title: "Introduction to Algorithms",
    category: "Computer Science",
    total: 8,
    available: 2,
    borrowed: 6,
    status: "Borrowed",
  },
  {
    id: "LIB-002-12",
    isbn: "978-0593135204",
    title: "Project Hail Mary",
    category: "Fiction / Sci-Fi",
    total: 24,
    available: 20,
    borrowed: 4,
    status: "Available",
  },
  {
    id: "LIB-018-669",
    isbn: "978-0321125217",
    title: "Domain-Driven Design",
    category: "Software Architecture",
    total: 5,
    available: 0,
    borrowed: 5,
    status: "Lost",
  },
  {
    id: "LIB-003-42",
    isbn: "978-1491950357",
    title: "Building Microservices",
    category: "Computer Science",
    total: 12,
    available: 11,
    borrowed: 1,
    status: "Available",
  },
  {
    id: "LIB-009-18",
    isbn: "978-0132350884",
    title: "Clean Code",
    category: "Computer Science",
    total: 18,
    available: 4,
    borrowed: 14,
    status: "Low Stock",
  },
  {
    id: "LIB-012-27",
    isbn: "978-1449373320",
    title: "Designing Data-Intensive Applications",
    category: "Database Systems",
    total: 7,
    available: 1,
    borrowed: 6,
    status: "Low Stock",
  },
  {
    id: "LIB-014-88",
    isbn: "978-0743273565",
    title: "The Great Gatsby",
    category: "Classic Fiction",
    total: 30,
    available: 23,
    borrowed: 7,
    status: "Available",
  },
  {
    id: "LIB-017-03",
    isbn: "978-0131103627",
    title: "The C Programming Language",
    category: "Computer Science",
    total: 10,
    available: 0,
    borrowed: 8,
    status: "Damaged",
  },
  {
    id: "LIB-021-09",
    isbn: "978-9924905124",
    title: "The Art of Khmer Architecture",
    category: "History",
    total: 16,
    available: 13,
    borrowed: 3,
    status: "Available",
  },
];

const summaryCards = [
  {
    label: "Total Books",
    value: "12,482",
    change: "+12%",
    icon: BookOpen,
    iconClass: "bg-[#E7F4FA] text-[#006088]",
  },
  {
    label: "Available Books",
    value: "10,920",
    change: "+8.8%",
    icon: ArrowUpRight,
    iconClass: "bg-[#FFF5CB] text-[#A97900]",
  },
  {
    label: "Borrowed Books",
    value: "1,245",
    change: "Active",
    icon: FileDown,
    iconClass: "bg-[#FFF0DF] text-[#B65D14]",
  },
  {
    label: "Lost Books",
    value: "48",
    change: "Alert",
    icon: AlertCircle,
    iconClass: "bg-[#FFE5E8] text-[#D8243C]",
  },
  {
    label: "Damaged Books",
    value: "269",
    change: "Review",
    icon: BookX,
    iconClass: "bg-[#EDF1F5] text-[#64748B]",
  },
];

const inventoryTrend = [
  { month: "Jan", value: 340 },
  { month: "Feb", value: 455 },
  { month: "Mar", value: 295 },
  { month: "Apr", value: 560, highlight: true },
  { month: "May", value: 510 },
  { month: "Jun", value: 610 },
];

const lowStockAlerts = [
  { title: "Database Systems", copies: "2 copies left" },
  { title: "Java Programming", copies: "1 copy left" },
  { title: "English Grammar", copies: "Out of stock", urgent: true },
];

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function escapeCsvValue(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}
function downloadInventoryCsv(rows) {
  const headers = [
    "Book ID",
    "ISBN",
    "Book Title",
    "Category",
    "Total",
    "Available",
    "Borrowed",
    "Status",
  ];
  const csvRows = rows.map((row) => [
    row.id,
    row.isbn,
    row.title,
    row.category,
    row.total,
    row.available,
    row.borrowed,
    row.status,
  ]);
  const csv = [headers, ...csvRows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
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
    Available: "bg-[#E3F6FC] text-[#006088]",
    Borrowed: "bg-[#FFF1B8] text-[#8C6A00]",
    "Low Stock": "bg-[#FFE8C7] text-[#B45309]",
    Lost: "bg-[#FFE1E6] text-[#C51F34]",
    Damaged: "bg-[#EEF2F6] text-[#475569]",
  };

  return statusClasses[status] || "bg-gray-100 text-gray-600";
}

function MetricCard({ card }) {
  const Icon = card.icon;

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-md ${card.iconClass}`}
        >
          <Icon size={18} />
        </div>
        <span className="rounded-full bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-500">
          {card.change}
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold text-gray-400">{card.label}</p>
      <h3 className="mt-1 text-2xl font-extrabold tracking-normal text-[#1B4965]">
        {card.value}
      </h3>
    </div>
  );
}

function TrendChart() {
  const maxValue = Math.max(...inventoryTrend.map((item) => item.value));

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2 text-[#1B4965]">
        <TrendingUp size={17} />
        <h3 className="text-sm font-bold">Inventory Growth Trend</h3>
      </div>
      <div className="flex h-44 items-end gap-4 rounded-lg bg-[#E8F0F5] px-5 pb-6 pt-5">
        {inventoryTrend.map((item) => (
          <div
            key={item.month}
            className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
          >
            <div
              className={`w-full rounded-t-md transition-all ${
                item.highlight ? "bg-[#F5C842]" : "bg-[#B9CDD8]"
              }`}
              style={{
                height: `${Math.max(20, (item.value / maxValue) * 100)}%`,
              }}
            />
            <span className="text-center text-[10px] font-bold uppercase text-gray-500">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LowStockPanel() {
  return (
    <aside className="rounded-lg border border-red-200 bg-red-50/70 p-4 shadow-sm">
      <div className="flex items-start gap-3 text-red-600">
        <AlertCircle size={22} className="mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-extrabold">Low Stock Alert</h3>
          <p className="mt-1 text-xs font-semibold text-red-500">
            Needs restocking review
          </p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-red-100">
        {lowStockAlerts.map((item) => (
          <div key={item.title} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-[#1B4965]">{item.title}</p>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                  item.urgent
                    ? "bg-red-600 text-white"
                    : "bg-white text-red-500"
                }`}
              >
                {item.copies}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusClass(status)}`}
    >
      {status}
    </span>
  );
}
export default function BookInventoryReport() {
  const [headerSearch, setHeaderSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [dateRange, setDateRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(
    () => [
      "All Categories",
      ...new Set(inventoryBooks.map((book) => book.category)),
    ],
    [],
  );
  const statuses = useMemo(
    () => ["All Status", ...new Set(inventoryBooks.map((book) => book.status))],
    [],
  );

  const filteredBooks = useMemo(() => {
    const headerQuery = headerSearch.trim().toLowerCase();
    const tableQuery = tableSearch.trim().toLowerCase();

    return inventoryBooks.filter((book) => {
      const searchableText =
        `${book.id} ${book.isbn} ${book.title} ${book.category} ${book.status}`.toLowerCase();
      const matchesHeader =
        !headerQuery || searchableText.includes(headerQuery);
      const matchesTable = !tableQuery || searchableText.includes(tableQuery);
      const matchesCategory =
        category === "All Categories" || book.category === category;
      const matchesStatus = status === "All Status" || book.status === status;

      return matchesHeader && matchesTable && matchesCategory && matchesStatus;
    });
  }, [category, headerSearch, status, tableSearch]);

  const pageCount = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleBooks = filteredBooks.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setTableSearch("");
    setCategory("All Categories");
    setStatus("All Status");
    setDateRange("");
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#E9EEF4]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          title="Book Inventory Report"
          breadcrumb="Reports"
          onBack={() => window.history.back()}
          searchValue={headerSearch}
          onSearchChange={setHeaderSearch}
          searchPlaceholder="Search books, ISBN..."
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card) => (
              <MetricCard key={card.label} card={card} />
            ))}
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
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <label className="text-[11px] font-bold uppercase text-gray-400">
                  Category
                  <select
                    value={category}
                    onChange={handleFilterChange(setCategory)}
                    className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-[11px] font-bold uppercase text-gray-400">
                  Status
                  <select
                    value={status}
                    onChange={handleFilterChange(setStatus)}
                    className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
                  >
                    {statuses.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-[11px] font-bold uppercase text-gray-400">
                  Date Range
                  <div className="relative mt-1">
                    <Calendar
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="date"
                      value={dateRange}
                      onChange={handleFilterChange(setDateRange)}
                      className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
                    />
                  </div>
                </label>

                <label className="text-[11px] font-bold uppercase text-gray-400">
                  Search
                  <div className="mt-1 flex gap-2">
                    <div className="relative">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="search"
                        value={tableSearch}
                        onChange={handleFilterChange(setTableSearch)}
                        placeholder="Book title"
                        className="h-10 w-full min-w-44 rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm font-semibold normal-case text-gray-600 outline-none transition focus:border-[#1B4965]"
                      />
                    </div>
                  </div>
                </label>
              </div>

              <TrendChart />
            </div>

            <LowStockPanel />
          </section>

          <section className="mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#1B4965]">
                  Detailed Inventory List
                </h2>
                <p className="mt-1 text-xs font-semibold text-gray-400">
                  Showing{" "}
                  {visibleBooks.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}-
                  {Math.min(safePage * PAGE_SIZE, filteredBooks.length)} of{" "}
                  {formatNumber(filteredBooks.length)} entries
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
                  onClick={() => downloadInventoryCsv(filteredBooks)}
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
                    <th className="px-5 py-4 text-center font-extrabold">
                      Total
                    </th>
                    <th className="px-5 py-4 text-center font-extrabold">
                      Avail.
                    </th>
                    <th className="px-5 py-4 text-center font-extrabold">
                      Borr.
                    </th>
                    <th className="px-5 py-4 text-center font-extrabold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {visibleBooks.map((book) => (
                    <tr key={book.id} className="transition hover:bg-[#F8FAFC]">
                      <td className="px-5 py-4 text-xs font-bold text-gray-500">
                        {book.id}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-500">
                        {book.isbn}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-extrabold leading-tight text-[#006088]">
                          {book.title}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">
                        {book.category}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-gray-700">
                        {book.total}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-gray-700">
                        {book.available}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-gray-700">
                        {book.borrowed}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusBadge status={book.status} />
                      </td>
                    </tr>
                  ))}

                  {visibleBooks.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-sm font-semibold text-gray-400"
                      >
                        No inventory records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                Items per page:
                <select className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700">
                  <option>{PAGE_SIZE}</option>
                </select>
              </label>

              <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pageCount }).map((_, index) => {
                  const page = index + 1;

                  return (
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
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(pageCount, page + 1))
                  }
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
    </div>
  );
}
