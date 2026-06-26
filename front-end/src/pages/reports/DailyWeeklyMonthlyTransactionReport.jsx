import { useMemo, useState } from "react";
import {
  Banknote,
  BookCheck,
  BookUp,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  EllipsisVertical,
  FileChartColumn,
  FileSpreadsheet,
  HandCoins,
  Printer,
  ReceiptText,
  RefreshCcw,
  Search,
  Users,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Adminsidebar";

const PAGE_SIZE = 5;
const DEFAULT_FILTERS = {
  header: "",
  table: "",
  period: "Daily",
  date: "10/24/2023",
  type: "All Transaction Types",
};

const transactions = [
  { id: "#TXN-9021", dateTime: "Oct 24, 10:45 AM", member: "Somnang Roth", initials: "SR", avatarClass: "bg-sky-100 text-sky-700", type: "Fines", amount: 45, status: "Success" },
  { id: "#TXN-9022", dateTime: "Oct 24, 11:15 AM", member: "Phanit Kao", initials: "PK", avatarClass: "bg-amber-100 text-amber-700", type: "Donation", amount: 120, status: "Pending" },
  { id: "#TXN-9023", dateTime: "Oct 24, 01:22 PM", member: "Vuthy Tan", initials: "VT", avatarClass: "bg-rose-100 text-rose-600", type: "Fines", amount: 15, status: "Cancelled" },
  { id: "#TXN-9024", dateTime: "Oct 24, 02:40 PM", member: "Dara Ly", initials: "DL", avatarClass: "bg-cyan-100 text-cyan-700", type: "Donation", amount: 250, status: "Success" },
  { id: "#TXN-9025", dateTime: "Oct 24, 03:55 PM", member: "Maly Nuon", initials: "MN", avatarClass: "bg-emerald-100 text-emerald-700", type: "Fines", amount: 12.5, status: "Success" },
  { id: "#TXN-9026", dateTime: "Oct 23, 09:12 AM", member: "Chan Sophea", initials: "CS", avatarClass: "bg-indigo-100 text-indigo-700", type: "Borrowed", amount: 0, status: "Success" },
  { id: "#TXN-9027", dateTime: "Oct 23, 10:30 AM", member: "Leakena Rath", initials: "LR", avatarClass: "bg-violet-100 text-violet-700", type: "Returned", amount: 0, status: "Success" },
  { id: "#TXN-9028", dateTime: "Oct 22, 04:05 PM", member: "Kosal Dara", initials: "KD", avatarClass: "bg-slate-200 text-slate-700", type: "New Member", amount: 5, status: "Pending" },
];

const transactionTypes = ["All Transaction Types", "Fines", "Donation", "Borrowed", "Returned", "New Member"];

const statCards = [
  { label: "Total Transactions", value: "1,284", change: "+12%", icon: ReceiptText, iconClass: "bg-indigo-100 text-indigo-700", changeClass: "text-emerald-600 bg-emerald-50" },
  { label: "Books Borrowed", value: "842", change: "+8%", icon: BookUp, iconClass: "bg-violet-100 text-violet-700", changeClass: "text-emerald-600 bg-emerald-50" },
  { label: "Books Returned", value: "650", change: "-3%", icon: BookCheck, iconClass: "bg-emerald-100 text-emerald-700", changeClass: "text-red-500 bg-red-50" },
  { label: "New Members", value: "156", change: "+24%", icon: Users, iconClass: "bg-amber-100 text-amber-700", changeClass: "text-emerald-600 bg-emerald-50" },
  { label: "Fine Payments", value: "$1,420", change: "+$142", icon: CreditCard, iconClass: "bg-red-100 text-red-600", changeClass: "text-emerald-600 bg-emerald-50" },
];

const dailyActivity = [
  { day: "Mon", value: 48 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 104 },
  { day: "Thu", value: 65 },
  { day: "Fri", value: 36 },
  { day: "Sat", value: 92 },
  { day: "Sun", value: 52 },
];

const monthlyTrend2023 = [42, 49, 46, 48, 57, 58, 36, 27, 45, 61, 40];
const monthlyTrend2022 = [35, 38, 34, 30, 39, 42, 28, 18, 32, 43, 26];

const weeklyOverview = [
  { label: "Week 1 (Oct)", value: 342, max: 420, tone: "bg-[#005A76]" },
  { label: "Week 2 (Oct)", value: 285, max: 420, tone: "bg-[#005A76]" },
  { label: "Week 3 (Oct)", value: 410, max: 420, tone: "bg-[#F5A623]" },
  { label: "Week 4 (Oct)", value: 247, max: 420, tone: "bg-[#005A76]" },
];

const statusClass = {
  Success: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-600",
};

const typeClass = {
  Fines: "bg-slate-200 text-slate-700",
  Donation: "bg-violet-100 text-violet-700",
  Borrowed: "bg-sky-100 text-sky-700",
  Returned: "bg-emerald-100 text-emerald-700",
  "New Member": "bg-amber-100 text-amber-700",
};

const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function downloadTransactionCsv(rows) {
  const headers = ["Transaction ID", "Date & Time", "Member Name", "Type", "Amount", "Status"];
  const csvRows = rows.map((row) => [row.id, row.dateTime, row.member, row.type, formatCurrency(row.amount), row.status]);
  const csv = [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");

  link.href = url;
  link.download = "daily-weekly-monthly-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function buildLinePath(values, width, height) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const step = width / (values.length - 1);

  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 18) - 9;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
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
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${card.changeClass}`}>
          {card.change}
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
      {["Daily", "Weekly", "Monthly"].map((period) => (
        <button
          type="button"
          key={period}
          onClick={() => onChange(period)}
          className={`min-w-20 rounded px-4 text-[11px] font-black transition ${
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
        aria-label="Transaction type"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-44 appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
      >
        {transactionTypes.map((type) => (
          <option key={type}>{type}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </label>
  );
}

function DailyActivityChart() {
  const max = Math.max(...dailyActivity.map((item) => item.value));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-[#005A76]">Daily Transaction Activity</h2>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 hover:text-[#005A76]"
          aria-label="Daily chart options"
        >
          <EllipsisVertical size={16} />
        </button>
      </div>

      <div className="mt-5 grid h-48 grid-cols-7 items-end gap-4 border-b border-slate-100">
        {dailyActivity.map((item, index) => (
          <div key={item.day} className="flex h-full min-w-0 flex-col justify-end">
            <div
              className={`rounded-t-md transition hover:bg-[#00445a] ${index === 2 || index === 5 ? "bg-[#005A76]" : "bg-[#CFE1E8]"}`}
              style={{ height: `${Math.max(18, (item.value / max) * 100)}%` }}
              title={`${item.day}: ${item.value} transactions`}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-4 text-center text-[10px] font-black uppercase text-slate-400">
        {dailyActivity.map((item) => (
          <span key={item.day}>{item.day}</span>
        ))}
      </div>
    </section>
  );
}

function MonthlyTrendChart() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-[#005A76]">Monthly Transaction Trend</h2>
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#005A76]" />
            2023
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#F5A623]" />
            2022
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-md bg-gradient-to-b from-white to-slate-50 p-2">
        <svg viewBox="0 0 520 210" className="h-52 w-full" role="img" aria-label="Monthly transaction trend">
          <path d="M0 178 H520" stroke="#E2E8F0" strokeWidth="1" />
          <path
            d={buildLinePath(monthlyTrend2022, 520, 180)}
            fill="none"
            stroke="#F5A623"
            strokeDasharray="4 5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <path
            d={buildLinePath(monthlyTrend2023, 520, 180)}
            fill="none"
            stroke="#005A76"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </svg>
      </div>

      <div className="grid grid-cols-6 text-center text-[10px] font-black uppercase text-slate-400">
        {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </section>
  );
}

function WeeklyOverview() {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black leading-tight text-[#005A76]">Weekly Transaction Overview</h2>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-500 transition hover:border-[#005A76] hover:text-[#005A76]"
          aria-label="Weekly overview options"
        >
          <EllipsisVertical size={14} />
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {weeklyOverview.map((week) => (
          <div key={week.label}>
            <div className="mb-2 flex items-center justify-between text-[11px] font-black">
              <span className="text-slate-700">{week.label}</span>
              <span className="text-slate-400">{week.value} txn</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${week.tone}`}
                style={{ width: `${(week.value / week.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function DailyWeeklyMonthlyTransactionReport() {
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

  const filteredTransactions = useMemo(() => {
    const headerQuery = filters.header.trim().toLowerCase();
    const tableQuery = filters.table.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const searchableText = `${transaction.id} ${transaction.dateTime} ${transaction.member} ${transaction.type} ${transaction.amount} ${transaction.status}`.toLowerCase();
      const matchesHeader = !headerQuery || searchableText.includes(headerQuery);
      const matchesTable = !tableQuery || searchableText.includes(tableQuery);
      const matchesType = filters.type === "All Transaction Types" || transaction.type === filters.type;

      return matchesHeader && matchesTable && matchesType;
    });
  }, [filters]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleTransactions = filteredTransactions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingStart = filteredTransactions.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, filteredTransactions.length);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    showMessage("Transaction filters reset");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#E4ECF5]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          title={(
            <>
              Daily / Weekly / Monthly
              <br />
              Transaction Report
            </>
          )}
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
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
              <PeriodTabs value={filters.period} onChange={(value) => updateFilter("period", value)} />
              <label className="relative block">
                <CalendarRange
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#005A76]"
                />
                <input
                  value={filters.date}
                  onChange={(event) => updateFilter("date", event.target.value)}
                  className="h-9 min-w-40 rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-600 shadow-sm outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10"
                  aria-label="Report date"
                />
              </label>
              <SelectFilter value={filters.type} onChange={(value) => updateFilter("type", value)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <ToolbarButton icon={Printer} onClick={() => window.print()}>Print</ToolbarButton>
              <ToolbarButton icon={FileChartColumn} onClick={() => window.print()}>PDF</ToolbarButton>
              <ToolbarButton
                icon={FileSpreadsheet}
                variant="primary"
                onClick={() => {
                  filteredTransactions.length ? (downloadTransactionCsv(filteredTransactions), showMessage("Transaction report exported")) : showMessage("No transactions to export");
                }}
                disabled={filteredTransactions.length === 0}
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

          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {statCards.map((card) => (
              <StatCard key={card.label} card={card} />
            ))}
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <DailyActivityChart />
            <MonthlyTrendChart />
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-sm font-black text-[#005A76]">Recent Transactions</h2>
                <label className="relative">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={filters.table}
                    onChange={(event) => updateFilter("table", event.target.value)}
                    placeholder="Search transactions..."
                    className="h-10 w-full min-w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-bold text-slate-600 outline-none transition focus:border-[#005A76] focus:bg-white"
                  />
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      {["Transaction ID", "Date & Time", "Member Name", "Type", "Amount", "Status"].map((heading) => (
                        <th key={heading} className="px-5 py-4 font-black">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {visibleTransactions.map((transaction) => (
                      <tr key={transaction.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4 text-xs font-black text-[#005A76]">{transaction.id}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-600">{transaction.dateTime}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black ${transaction.avatarClass}`}>
                              {transaction.initials}
                            </span>
                            <span className="font-bold text-slate-800">{transaction.member}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded px-2.5 py-1 text-[10px] font-black uppercase ${typeClass[transaction.type]}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-black text-slate-900">
                          {transaction.amount > 0 ? formatCurrency(transaction.amount) : "-"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${statusClass[transaction.status]}`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {!visibleTransactions.length && (
                      <tr>
                        <td colSpan="6" className="px-5 py-12 text-center text-sm font-semibold text-slate-400">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  Showing {showingStart} to {showingEnd} of {filteredTransactions.length} transactions
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
            </div>

            <WeeklyOverview />
          </section>

          <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#005A76]">
                <Download size={16} />
                <p className="text-xs font-black uppercase">Export Queue</p>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">3 files</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Ready for finance review</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <HandCoins size={16} />
                <p className="text-xs font-black uppercase">Donation Total</p>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">$370</p>
              <p className="mt-1 text-xs font-semibold text-emerald-600">Across selected period</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600">
                <Banknote size={16} />
                <p className="text-xs font-black uppercase">Pending Amount</p>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">$125</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Needs confirmation</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
