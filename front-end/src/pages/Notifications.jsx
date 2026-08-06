import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RefreshCw,
  AlertCircle,
  UserPlus,
  Calendar,
  Bell,
} from "lucide-react";
import api from "../utils/api";

const PAGE_SIZE = 8;

const BADGE_RULES = [
  { test: /overdue|reminder/i, icon: AlertCircle, iconBg: "bg-red-50", iconColor: "text-red-500", badge: "ALERT", badgeBg: "bg-red-100", badgeText: "text-red-600" },
  { test: /return/i, icon: RefreshCw, iconBg: "bg-green-50", iconColor: "text-green-500", badge: "BORROWING", badgeBg: "bg-green-100", badgeText: "text-green-600" },
  { test: /due|borrow/i, icon: BookOpen, iconBg: "bg-blue-50", iconColor: "text-blue-500", badge: "BORROWING", badgeBg: "bg-blue-100", badgeText: "text-blue-600" },
  { test: /member/i, icon: UserPlus, iconBg: "bg-purple-50", iconColor: "text-purple-500", badge: "MEMBERS", badgeBg: "bg-purple-100", badgeText: "text-purple-600" },
  { test: /event/i, icon: Calendar, iconBg: "bg-orange-50", iconColor: "text-orange-500", badge: "EVENTS", badgeBg: "bg-orange-100", badgeText: "text-orange-600" },
];
const DEFAULT_BADGE = { icon: Bell, iconBg: "bg-slate-50", iconColor: "text-slate-500", badge: "GENERAL", badgeBg: "bg-slate-100", badgeText: "text-slate-600" };

function classify(title) {
  return BADGE_RULES.find((r) => r.test.test(title)) || DEFAULT_BADGE;
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;

  const isYesterday = diffHr < 48 && new Date().getDate() !== date.getDate();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return isYesterday ? `Yesterday, ${time}` : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + `, ${time}`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [unreadCount, setUnreadCount] = useState(0);
  const [readCount, setReadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [tab, currentPage]);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (tab === "unread") params.append("unreadOnly", "true");
      if (tab === "read") params.append("readOnly", "true");
      params.append("page", currentPage);
      params.append("limit", PAGE_SIZE);

      const response = await api.get(`/notifications?${params.toString()}`);
      if (response.data?.success) {
        setRows(response.data.data);
        const meta = response.data.meta || {};
        setTotalItems(meta.totalItems ?? meta.total ?? response.data.data.length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const [allRes, unreadRes] = await Promise.all([
        api.get("/notifications?limit=1"),
        api.get("/notifications?unreadOnly=true&limit=1"),
      ]);
      const allTotal = allRes.data?.meta?.totalItems ?? allRes.data?.meta?.total ?? 0;
      const unreadTotal = unreadRes.data?.meta?.totalItems ?? unreadRes.data?.meta?.total ?? 0;
      setUnreadCount(unreadTotal);
      setReadCount(Math.max(0, allTotal - unreadTotal));
    } catch (err) {
      console.error("Failed to load notification counts:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setRows((current) => current.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)));
      fetchCounts();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      fetchNotifications();
      fetchCounts();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const totalCount = unreadCount + readCount;
  const tabs = [
    { key: "all", label: "All", count: totalCount },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read", count: readCount },
  ];

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const showingStart = rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(safePage * PAGE_SIZE, totalItems);

  return (
    <div className="flex-1 min-w-0 bg-[#F8FAFC]">
        <Navbar title="Notifications" breadcrumb="Check your notifications!" onBack={() => navigate(-1)} />

        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                    tab === t.key ? "bg-[#1B4965] text-white" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>

            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:bg-gray-50 transition"
            >
              Mark all as read
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {loading ? (
              <div className="px-5 py-12 text-center text-sm font-semibold text-gray-400">Loading notifications...</div>
            ) : rows.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm font-semibold text-gray-400">No notifications here.</div>
            ) : (
              rows.map((n) => {
                const c = classify(n.title);
                const Icon = c.icon;
                return (
                  <div
                    key={n.notification_id}
                    onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
                    className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-full ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} className={c.iconColor} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                        <p className="text-sm font-semibold text-gray-800 truncate">{n.title}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                      <span className={`inline-block mt-2 text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded ${c.badgeBg} ${c.badgeText}`}>
                        {c.badge}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(n.created_at)}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${n.is_read ? "border border-gray-300" : "bg-blue-500"}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>
              Showing {showingStart}-{showingEnd} of {totalItems} notifications
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-md text-sm font-medium transition ${
                    p === safePage ? "bg-[#1B4965] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}