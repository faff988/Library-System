import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Library,
  UserCheck,
  AlertTriangle,
  Users,
  Clock,
  Plus,
  RefreshCcw,
  UserPlus,
  CalendarPlus,
  FileBarChart2,
  ChevronDown,
  ArrowRight,
  CornerDownRight,
  UserRound,
  HandCoins,
  MessageSquare,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

const CATEGORY_COLORS = ["#3B82F6", "#8B5CF6", "#94A3B8", "#F59E0B", "#22C55E", "#EC4899", "#14B8A6"];

// Background refresh interval for the whole dashboard.
const REFRESH_MS = 60_000;

const RANGE_OPTIONS = ["This Week", "This Month", "This Quarter"];
// Maps each range option to the `range` param of GET /dashboard/trend.
// The quarter view is bucketed weekly server-side since 90 daily points
// would be unreadable in this chart's width.
const RANGE_PARAM = {
  "This Week": "week",
  "This Month": "month",
  "This Quarter": "quarter",
};

// `module` + `action` gate each shortcut with the same can() check the rest
// of the app uses, so a user never sees a button that leads to a 403.
// Shortcuts without a module are always visible.
const QUICK_ACTIONS = [
  { label: "Add Book", icon: Plus, bg: "#EDE9FE", color: "#7C3AED", path: "/inventory/add", module: "inventory", action: "create" },
  { label: "New Borrow", icon: RefreshCcw, bg: "#DCFCE7", color: "#16A34A", path: "/borrow-return", module: "borrow_return", action: "create" },
  { label: "Add Member", icon: UserPlus, bg: "#DBEAFE", color: "#2563EB", path: "/member", module: "members", action: "create" },
  { label: "Create Event", icon: CalendarPlus, bg: "#FFEDD5", color: "#EA580C", path: "/event" },
  { label: "Generate Report", icon: FileBarChart2, bg: "#FEE2E2", color: "#DC2626", path: "/reports/book-inventory" },
];

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

// Today -> "02:15 PM"; any other day -> "Oct 14, 02:15 PM".
function formatWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === new Date().toDateString()) return time;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
          {p.dataKey === "borrows" ? "Borrowed" : "Returned"}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { can, role } = useAuth();

  const [range, setRange] = useState("This Month");
  const [rangeOpen, setRangeOpen] = useState(false);

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [trend, setTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState("");

  // `silent` refreshes (the 60s timer, tab re-focus) update the data in place
  // without flashing the loading state.
  const fetchOverview = useCallback(async (silent = false) => {
    try {
      if (!silent) setOverviewLoading(true);
      setOverviewError("");
      const response = await api.get("/dashboard/overview");
      if (response.data?.success) {
        setOverview(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to load dashboard overview:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setOverviewError(backendMessage || "Failed to load dashboard data.");
    } finally {
      if (!silent) setOverviewLoading(false);
    }
  }, []);

  const fetchTrend = useCallback(async (silent = false) => {
    try {
      if (!silent) setTrendLoading(true);
      const response = await api.get(`/dashboard/trend?range=${RANGE_PARAM[range]}`);
      if (response.data?.success) {
        setTrend(response.data.data.rows);
        setTrendError("");
      }
    } catch (err) {
      // A failure here shouldn't take the rest of the dashboard down with it.
      console.error("Failed to load borrow/return trend:", err);
      const status = err.response?.status;
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setTrendError(`Couldn't load the trend${status ? ` (${status})` : ""}${backendMessage ? `: ${backendMessage}` : "."}`);
      if (!silent) setTrend([]);
    } finally {
      if (!silent) setTrendLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => { fetchTrend(); }, [fetchTrend]);

  // Keep the page live: refresh every minute while the tab is visible, and
  // again as soon as the user comes back to the tab.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        fetchOverview(true);
        fetchTrend(true);
      }
    };
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [fetchOverview, fetchTrend]);

  const handleManualRefresh = () => {
    fetchOverview(true);
    fetchTrend(true);
  };

  const categories = useMemo(() => {
    const rows = overview?.categoryBorrows || [];
    const total = rows.reduce((sum, r) => sum + r.value, 0);
    return rows.map((r, index) => ({
      ...r,
      pct: total ? `${Math.round((r.value / total) * 100)}%` : "0%",
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [overview]);

  const totalCategoryBorrows = categories.reduce((sum, c) => sum + c.value, 0);

  const lostCount = overview?.lostCopies ?? 0;
  const borrowedCopies = overview ? (overview.totalCopies || 0) - (overview.availableCopies || 0) : 0;
  const availablePct = overview?.totalCopies ? Math.round((overview.availableCopies / overview.totalCopies) * 100) : 0;
  const borrowedPct = overview?.totalCopies ? Math.round((borrowedCopies / overview.totalCopies) * 100) : 0;
  const lostPct = overview?.totalCopies ? Math.round((lostCount / overview.totalCopies) * 1000) / 10 : 0;

  const stats = overview
    ? [
        { label: "Total Titles", value: formatNumber(overview.totalBooks), icon: BookOpen, iconBg: "#EDE9FE", iconColor: "#7C3AED" },
        { label: "Total Copies", value: formatNumber(overview.totalCopies), icon: CheckCircle2, iconBg: "#DCFCE7", iconColor: "#16A34A" },
        { label: "Available Copies", value: formatNumber(overview.availableCopies), sub: `${availablePct}% of total`, subColor: "#71717A", icon: Library, iconBg: "#DBEAFE", iconColor: "#2563EB" },
        { label: "Borrowed Copies", value: formatNumber(borrowedCopies), sub: `${borrowedPct}% of total`, subColor: "#71717A", icon: UserCheck, iconBg: "#FFEDD5", iconColor: "#EA580C" },
        { label: "Missing / Lost", value: formatNumber(lostCount), sub: `${lostPct}% of total`, subColor: "#71717A", icon: AlertTriangle, iconBg: "#FEE2E2", iconColor: "#DC2626" },
        { label: "Active Members", value: formatNumber(overview.activeMembers), sub: `of ${formatNumber(overview.totalMembers)} total`, subColor: "#71717A", icon: Users, iconBg: "#CCFBF1", iconColor: "#0D9488" },
        { label: "Overdue Items", value: formatNumber(overview.overdueBorrows), sub: "View overdue", subColor: "#055E83", icon: Clock, iconBg: "#FEF3C7", iconColor: "#D97706", link: "/borrow-return" },
      ]
    : [];

  const attention = overview
    ? [
        { label: "Pending Feedback", value: overview.pendingFeedback, sub: "Awaiting a reply", icon: MessageSquare, iconBg: "#FCE7F3", iconColor: "#DB2777", path: "/feedback" },
        { label: "Upcoming Events", value: overview.upcomingEvents, sub: "Scheduled from today", icon: CalendarDays, iconBg: "#FFEDD5", iconColor: "#EA580C", path: "/event" },
      ]
    : [];

  const activities = overview
    ? [
        ...overview.recentActivity.borrows.map((b) => ({
          icon: CornerDownRight,
          iconBg: "#DBEAFE",
          iconColor: "#2563EB",
          text: "Book borrowed",
          detail: `${b.book} — ${b.member}`,
          at: b.at,
        })),
        ...overview.recentActivity.returns.map((r) => ({
          icon: UserRound,
          iconBg: "#DCFCE7",
          iconColor: "#16A34A",
          text: "Book returned",
          detail: `${r.book} — ${r.member}`,
          at: r.at,
        })),
        ...overview.recentActivity.donations.map((d) => ({
          icon: HandCoins,
          iconBg: "#EDE9FE",
          iconColor: "#7C3AED",
          text: "Donation received",
          detail: `${d.itemCount} item(s) from ${d.donor || "Anonymous"}`,
          at: d.at,
        })),
      ]
        .sort((a, b) => new Date(b.at) - new Date(a.at))
        .slice(0, 5)
    : [];

  const visibleActions = QUICK_ACTIONS.filter((a) => !a.module || can(a.module, a.action));

  return (
    <div className="flex-1 bg-[#E9EEF4]">
        <Navbar title="Dashboard" breadcrumb={`Welcome back, ${role || "User"}!`} />

        <div className="px-6 py-5 space-y-5">

          <div className="flex items-center justify-end gap-3 -mb-2">
            {lastUpdated && (
              <span className="text-[11px] font-semibold text-gray-400">
                Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
            >
              <RefreshCcw size={12} /> Refresh
            </button>
          </div>

          {overviewError && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-red-600">{overviewError}</p>
              <button onClick={() => fetchOverview()} className="text-xs font-bold text-red-600 hover:underline">Retry</button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
            {overviewLoading ? (
              <div className="col-span-full bg-white rounded-xl border border-gray-300 shadow-md p-4 text-sm text-gray-400">
                Loading dashboard...
              </div>
            ) : (
              stats.map(({ label, value, sub, subColor, icon: Icon, iconBg, iconColor, link }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl px-4 py-4 border border-gray-300 shadow-md flex flex-col gap-3"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg, color: iconColor }}>
                    <Icon size={17} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-700 mb-1">{label}</p>
                    <p className="text-xl font-black leading-tight text-gray-900">{value}</p>
                    {sub && (link ? (
                      <button onClick={() => navigate(link)} className="text-[11px] font-bold mt-1 hover:underline" style={{ color: subColor }}>
                        {sub}
                      </button>
                    ) : (
                      <p className="text-[11px] mt-1 font-semibold" style={{ color: subColor }}>{sub}</p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {!overviewLoading && attention.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attention.map(({ label, value, sub, icon: Icon, iconBg, iconColor, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="bg-white rounded-xl px-4 py-3 border border-gray-300 shadow-md flex items-center gap-3 text-left hover:bg-gray-50/80 transition"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-gray-700">{label}</p>
                    <p className="text-[11px] font-semibold text-gray-400">{sub}</p>
                  </div>
                  <span className="ml-auto text-xl font-black text-gray-900">{formatNumber(value)}</span>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.1fr_1fr] gap-4 items-stretch">

            <div className="bg-white rounded-xl border border-gray-300 shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Borrow / Return Overview</h3>
                <div className="relative">
                  <button
                    onClick={() => setRangeOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
                  >
                    {range} <ChevronDown size={13} className="text-gray-700" />
                  </button>
                  {rangeOpen && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-lg shadow-md z-10 overflow-hidden">
                      {RANGE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setRange(opt); setRangeOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-52">
                {trendLoading ? (
                  <div className="flex h-full items-center justify-center text-xs font-semibold text-gray-400">Loading trend...</div>
                ) : trendError ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <p className="text-xs font-semibold text-red-500">{trendError}</p>
                    <button onClick={() => fetchTrend()} className="text-xs font-bold text-[#055E83] hover:underline">Retry</button>
                  </div>
                ) : trend.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs font-semibold text-gray-400">No activity in this range.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#F1F5F9" vertical={false} />
                      <XAxis
                        dataKey="bucket"
                        tick={{ fontSize: 10, fill: "#94A3B8" }}
                        tickLine={false}
                        axisLine={{ stroke: "#E2E8F0" }}
                        interval={Math.max(0, Math.floor(trend.length / 8) - 1)}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="borrows" stroke="#4C1D95" strokeWidth={2.5} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="returns" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex items-center gap-5 justify-center mt-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4C1D95]" /> Borrowed
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" /> Returned
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-300 shadow-md p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Top Borrowed Categories</h3>
              {overviewLoading ? (
                <div className="h-40 flex items-center justify-center text-xs font-semibold text-gray-400">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-xs font-semibold text-gray-400">No borrow data yet.</div>
              ) : (
                <>
                  <div className="h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categories}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={45}
                          outerRadius={68}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {categories.map((c) => (
                            <Cell key={c.name} fill={c.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-black text-gray-800">{totalCategoryBorrows.toLocaleString()}</span>
                      <span className="text-[10px] font-semibold text-gray-700">Borrows</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-3">
                    {categories.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-xs gap-2">
                        <span className="flex items-center gap-2 font-semibold text-gray-600 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                          <span className="truncate">{c.name}</span>
                        </span>
                        <span className="font-bold text-gray-400 shrink-0">{c.pct} ({c.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-300 shadow-md p-5 flex flex-col">
              <h3 className="text-sm font-bold text-gray-800 mb-3.5">Recent Activities</h3>
              <div className="space-y-3 flex-1">
                {overviewLoading ? (
                  <p className="text-xs font-semibold text-gray-400">Loading...</p>
                ) : activities.length === 0 ? (
                  <p className="text-xs font-semibold text-gray-400">No recent activity.</p>
                ) : (
                  activities.map(({ icon: Icon, iconBg, iconColor, text, detail, at }, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-700 truncate">{text}</p>
                        <p className="text-[11px] text-gray-400 font-medium truncate">{detail}</p>
                      </div>
                      <span className="ml-auto text-[10px] text-gray-700 font-semibold shrink-0">{formatWhen(at)}</span>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => navigate("/reports/borrow-return")}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#055E83] hover:underline mt-3 pt-3 border-t border-gray-100"
              >
                View all activities <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {visibleActions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-300 shadow-md p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3.5">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {visibleActions.map(({ label, icon: Icon, bg, color, path }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50/80 transition text-left shadow-md"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color }}>
                      <Icon size={15} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
    </div>
  );
}