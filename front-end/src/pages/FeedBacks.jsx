import { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import {
  Star, MessageSquare, ThumbsUp, Search, ChevronDown, Pencil, Trash2,
  ChevronLeft, ChevronRight, Send, Check, AlertTriangle, X, Activity,
  BookOpen, Calendar, Building2, Clock, CheckCircle2, Printer, Filter,
  ArrowUpDown, Eye,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────
const QUICK_TEMPLATES = {
  "Thank You": "Thank you for your feedback! We appreciate you taking the time to share your thoughts with us.",
  "We'll Look Into It": "Thank you for your feedback! We will look into this matter and make the necessary improvements soon.",
  "Coming Soon": "Thank you for your feedback! We are glad you enjoyed the books. We will look into adding more Science Fiction titles to our collection very soon.",
};

const CATEGORIES = ["All Categories", "Book", "Event", "General"];
const STATUSES   = ["All Status", "REPLIED", "NOT REPLIED"];

const SOURCE_TO_CATEGORY = { book: "Book", event: "Event", general: "General" };
const STATUS_TO_UI       = { replied: "REPLIED", pending: "NOT REPLIED" };

const inputCls = "w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#055E83] transition text-gray-800 placeholder:text-gray-400";
const filterPillCls = "flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2";
const cardShadow = { boxShadow: "0 2px 12px rgba(0,0,0,0.12)" };
const gridLayout = "grid-cols-[180px_110px_300px_130px_110px_160px_200px] items-center";

// ─── Helpers ──────────────────────────────────────────────────────────────
const categoryStyle = {
  Book:    { bg: "#F5F3FF", text: "#6D28D9" },
  Event:   { bg: "#FDF2F8", text: "#9D174D" },
  General: { bg: "#F0F9FF", text: "#0369A1" },
};
const categoryIcon = { Book: BookOpen, Event: Calendar, General: Building2 };
const statusStyle = {
  "REPLIED":     { bg: "#E8F5E9", text: "#2E7D32" },
  "NOT REPLIED": { bg: "#FFFDE7", text: "#B78103" },
};

function getInitials(name) {
  return (name || "?").trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}
function formatDateTime(d) {
  return d ? new Date(d).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
}

// Maps a raw DB row -> the shape the UI expects
function mapFeedback(row) {
  const category = SOURCE_TO_CATEGORY[row.source] || "General";
  return {
    id: `FBK-${row.feedback_id}`,
    feedbackId: row.feedback_id,
    user: row.user_name || "Anonymous",
    email: row.email || null,
    category,
    source: `${category}`, // no linked book/event title in schema, so just the category label
    comment: row.comment,
    date: row.feedback_date,
    status: STATUS_TO_UI[row.status] || "NOT REPLIED",
    rating: Number(row.rating),
    adminReply: row.admin_reply || null,
    avatar: getInitials(row.user_name),
  };
}

function Stars({ rating, size = 13 }) {
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? "#E8C110" : "none"} color={i <= Math.round(rating) ? "#E8C110" : "#d1d5db"} />
      ))}
    </span>
  );
}

function CategoryBadge({ cat }) {
  const s = categoryStyle[cat] || categoryStyle.General;
  const Icon = categoryIcon[cat] || Building2;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ backgroundColor: s.bg, color: s.text }}>
      <Icon size={11} /> {cat}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = statusStyle[status] || statusStyle["NOT REPLIED"];
  const Icon = status === "REPLIED" ? CheckCircle2 : Clock;
  return (
    <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md text-center" style={{ backgroundColor: s.bg, color: s.text }}>
      <span className="inline-flex items-center gap-1"><Icon size={11} /> {status}</span>
    </span>
  );
}

function Avatar({ initials }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#055E83] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Delete Feedback Modal (permanent, whole record) ───────────────────────
function DeleteFeedbackModal({ feedbackId, onCancel, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-80 text-center relative shadow-2xl border-2 border-gray-300">
        <button onClick={onCancel} className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-2 border-red-100">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Feedback?</h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
          This will permanently delete "{feedbackId}" and the visitor's original comment and rating — not just any reply.
        </p>
        <div className="flex items-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 mb-5">
          <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" /> This action cannot be undone.
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting} className="flex-1 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-60">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-60">
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── LIST VIEW ────────────────────────────────────────────────────────────
function FeedbackList({ feedbacks, loading, onView, onReply, onDeleteFeedbackClick }) {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const stats = useMemo(() => {
    const total = feedbacks.length;
    const avg = total ? feedbacks.reduce((s, f) => s + f.rating, 0) / total : 0;
    const satisfied = feedbacks.filter((f) => f.rating >= 4).length;
    const satisfactionRate = total ? Math.round((satisfied / total) * 100) : 0;
    return {
      avgRating: avg.toFixed(1),
      total,
      satisfactionRate,
    };
  }, [feedbacks]);

  const filtered = useMemo(() => {
    return feedbacks.filter((f) =>
      (!search || f.user.toLowerCase().includes(search.toLowerCase()) || f.comment.toLowerCase().includes(search.toLowerCase())) &&
      (catFilter === "All Categories" || f.category === catFilter) &&
      (statusFilter === "All Status" || f.status === statusFilter)
    );
  }, [feedbacks, search, catFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Average Rating", value: `${stats.avgRating} / 5`, sub: "across all feedback", subColor: "#CA8A04", border: "#E8C110" },
          { label: "Total Feedback", value: String(stats.total), sub: "all-time records", subColor: "#055E83", border: "#055E83" },
          { label: "Satisfaction Rate", value: `${stats.satisfactionRate}%`, sub: "rated 4 stars or higher", subColor: "#16A34A", border: "#16A34A" },
        ].map(({ label, value, sub, subColor, border }) => (
          <div key={label} className="bg-white rounded-xl px-5 py-4 border-2 border-gray-300" style={{ borderTop: `4px solid ${border}`, ...cardShadow }}>
            <p className="text-xs text-gray-400 mb-1 font-bold">{label}</p>
            <p className="text-2xl font-bold leading-tight" style={{ color: subColor }}>{value}</p>
            <p className="text-xs mt-1 font-bold" style={{ color: subColor }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className={filterPillCls}>
            <Search size={14} className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by user or comment..."
              className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" />
          </div>
        </div>
        <div className={filterPillCls}>
          <Filter size={13} className="text-gray-400" />
          <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600 font-bold">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className={filterPillCls}>
          <Filter size={13} className="text-gray-400" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600 font-bold">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <p className="ml-auto text-xs text-gray-400 font-bold">Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-300" style={cardShadow}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: "#055E83" }}>
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <MessageSquare size={15} /> Feedback Information
          </h2>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "1150px" }}>
            <div className={`grid ${gridLayout} py-3 border-b-2 border-gray-300 bg-gray-50/70 text-xs font-bold uppercase tracking-wider`} style={{ color: "#055E83" }}>
              <span className="pl-6">User</span>
              <span>Category</span>
              <span>Comment</span>
              <span>Rating</span>
              <span>Date</span>
              <span className="text-center">Status</span>
              <span className="pr-6 text-center">Actions</span>
            </div>

            {loading ? (
              <div className="py-10 text-center text-sm text-gray-400 font-semibold">Loading feedback...</div>
            ) : paginated.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400 font-semibold">No feedback matches your filter criteria.</div>
            ) : (
              paginated.map((f) => (
                <div key={f.id} className={`grid ${gridLayout} py-4 border-b border-gray-300 hover:bg-slate-50/60 transition`}>
                  <div className="pl-6 flex items-center gap-2.5 min-w-0">
                    <Avatar initials={f.avatar} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 leading-tight truncate">{f.user}</p>
                      <p className="text-[10px] font-bold mt-0.5" style={{ color: "#055E83" }}>{f.id}</p>
                    </div>
                  </div>

                  <div><CategoryBadge cat={f.category} /></div>

                  <span className="text-xs font-medium text-gray-500 truncate pr-2">
                    {f.comment.length > 32 ? f.comment.slice(0, 32) + "…" : f.comment}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Stars rating={f.rating} size={11} />
                    <span className="text-xs font-bold text-gray-500">{f.rating.toFixed(1)}</span>
                  </div>

                  <span className="text-xs font-medium text-gray-500">{formatDate(f.date)}</span>

                  <div className="text-center"><StatusBadge status={f.status} /></div>

                  <div className="pr-6 flex items-center justify-center gap-1.5">
                    <button onClick={() => onView(f)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm" style={{ backgroundColor: "#055E83", color: "#fff" }}>
                      <Eye size={12} /> View
                    </button>
                    {can("feedback", "update") && (
                      <button onClick={() => onReply(f)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm" style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
                        <Pencil size={12} /> Reply
                      </button>
                    )}
                    {can("feedback", "delete") && (
                      <button onClick={() => onDeleteFeedbackClick(f)} title="Delete feedback permanently" className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm bg-red-500 text-white">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-gray-300 bg-gray-50/50">
          <p className="text-xs text-gray-500 font-bold">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-gray-300 text-gray-500 hover:bg-gray-100 transition bg-white shadow-sm disabled:opacity-40">
              <ChevronLeft size={12} /> Prev
            </button>
            <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm border-2 border-transparent disabled:opacity-50"
              style={{ backgroundColor: "#055E83", color: "#fff" }}>
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL VIEW ──────────────────────────────────────────────────────────
function FeedbackDetail({ fb, allFeedbacks, onReply, onDeleteFeedbackClick }) {
  const { can } = useAuth();
  const userHistory = useMemo(() => {
    if (fb.user === "Anonymous") return null;
    const rows = allFeedbacks.filter((f) => f.user === fb.user);
    const total = rows.length;
    const avg = total ? (rows.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : "0.0";
    const replied = rows.filter((r) => r.status === "REPLIED").length;
    const recent = [...rows].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    return { total, avg, replied, recent };
  }, [fb.user, allFeedbacks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border-2 border-gray-300" style={cardShadow}>
        <div className="flex items-center gap-3">
          <StatusBadge status={fb.status} />
          <span className="text-xs font-bold tracking-wider" style={{ color: "#055E83" }}>#{fb.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border-2 border-gray-300 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition shadow-sm">
            <Printer size={12} /> Print
          </button>
          <button onClick={() => onReply(fb)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-85 transition shadow-sm" style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
            <Pencil size={12} /> {fb.status === "REPLIED" ? "Edit Reply" : "Reply"}
          </button>
          {can("feedback", "delete") && (
            <button onClick={() => onDeleteFeedbackClick(fb)} className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm">
              <Trash2 size={12} /> Delete Feedback
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_260px] gap-5 items-start">
        <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden" style={cardShadow}>
          <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#055E83" }}>
            <MessageSquare size={14} className="text-[#E8C110]" />
            <span className="text-white font-bold text-sm">Feedback Details</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Feedback ID</span>
                <span className="text-xs font-bold" style={{ color: "#055E83" }}>{fb.id}</span>
              </div>
              <div />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">User</span>
                <span className="text-xs font-bold text-gray-800">{fb.user}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
                <span className="text-xs font-bold text-gray-700">{formatDateTime(fb.date)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</span>
                <CategoryBadge cat={fb.category} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rating</span>
                <Stars rating={fb.rating} />
                <span className="text-xs font-bold text-gray-600">{fb.rating.toFixed(1)} / 5.0</span>
              </div>
              {fb.email && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                  <span className="text-xs font-bold text-gray-700">{fb.email}</span>
                </div>
              )}
            </div>

            <div className="border-t-2 border-gray-300 pt-4 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comment</p>
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 leading-relaxed border-2 border-gray-300">{fb.comment}</div>
            </div>

            {fb.status === "REPLIED" && fb.adminReply && (
              <div className="border-t-2 border-gray-300 pt-4 mb-4">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#055E83" }}>Library Reply</p>
                <div className="bg-green-50 border-2 border-green-100 rounded-lg px-4 py-3 text-sm font-semibold text-green-800 leading-relaxed">
                  {fb.adminReply}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex-shrink-0">
          <div className="rounded-xl p-5 text-white border-2 border-gray-300" style={{ backgroundColor: "#055E83", ...cardShadow }}>
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">User Profile</p>
            <div className="flex items-center gap-3 mb-5">
              <Avatar initials={fb.avatar} />
              <div>
                <div className="font-bold text-sm">{fb.user}</div>
              </div>
            </div>
            {userHistory ? (
              <>
                <div className="border-t border-white/10 pt-4 mb-4">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Feedback Stats</p>
                  <div className="flex justify-between">
                    {[[String(userHistory.total), "Total"], [userHistory.avg, "Avg Rating"], [String(userHistory.replied), "Replied"]].map(([v, l]) => (
                      <div key={l} className="text-center">
                        <div className="text-xl font-bold" style={{ color: "#E8C110" }}>{v}</div>
                        <div className="text-xs font-bold text-white/60 mt-1">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Recent Feedbacks</p>
                  {userHistory.recent.map((r) => (
                    <div key={r.id} className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 mb-2 text-xs">
                      <div className="font-bold mb-1">{r.category}: {r.comment.slice(0, 24)}{r.comment.length > 24 ? "…" : ""}</div>
                      <div className="text-white/60 font-bold flex items-center gap-1">{formatDate(r.date)} • <Stars rating={r.rating} size={10} /></div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs font-bold text-white/60 pt-2">No profile history for anonymous submissions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REPLY VIEW ───────────────────────────────────────────────────────────
function ReplyView({ fb, onCancel, onSend, sending }) {
  const [reply, setReply] = useState(fb.adminReply || "");
  const MAX = 500;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border-2 border-gray-300" style={cardShadow}>
        <div className="flex items-center gap-3">
          <StatusBadge status={fb.status} />
          <span className="text-xs font-bold tracking-wider" style={{ color: "#055E83" }}>#{fb.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} disabled={sending} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 transition disabled:opacity-60">
            Cancel
          </button>
          <button onClick={() => onSend(reply)} disabled={sending || !reply.trim()}
            className="flex items-center gap-1.5 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition shadow-md disabled:opacity-60"
            style={{ backgroundColor: "#055E83" }}>
            <Send size={12} /> {sending ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_240px] gap-5 items-start">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden" style={cardShadow}>
            <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#055E83" }}>
              <MessageSquare size={14} className="text-[#E8C110]" />
              <span className="text-white font-bold text-sm">Replying To</span>
            </div>
            <div className="p-5 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm" style={{ color: "#055E83" }}>{fb.user}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Stars rating={fb.rating} size={12} />
                  <span className="text-xs font-bold text-gray-600">{fb.rating.toFixed(1)} / 5.0</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CategoryBadge cat={fb.category} />
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-[200px] text-right italic font-medium">"{fb.comment.slice(0, 40)}{fb.comment.length > 40 ? "..." : ""}"</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden" style={cardShadow}>
            <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#055E83" }}>
              <Send size={14} className="text-[#E8C110]" />
              <span className="text-white font-bold text-sm">Compose Reply</span>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Quick Templates</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {Object.keys(QUICK_TEMPLATES).map((t) => (
                  <button key={t} onClick={() => setReply(QUICK_TEMPLATES[t])}
                    className="px-3 py-1.5 rounded-full border-2 border-gray-300 text-xs font-bold text-gray-600 hover:border-[#055E83] hover:text-[#055E83] bg-white transition shadow-sm">
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Your Reply</p>
              <textarea value={reply} onChange={(e) => setReply(e.target.value.slice(0, MAX))} rows={5}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#055E83] transition resize-none font-semibold leading-relaxed" />
              <div className="text-right text-xs font-bold text-gray-400 mt-1.5">{reply.length} / {MAX} characters</div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-300 p-5" style={cardShadow}>
            <p className="font-bold text-sm mb-3" style={{ color: "#055E83" }}>Reply Guidelines</p>
            {["Be professional and courteous", "Acknowledge the feedback directly", "Provide actionable information", "Keep reply under 500 characters", "Avoid personal information"].map((g) => (
              <div key={g} className="flex items-start gap-2 mb-2.5 text-xs text-gray-500 font-semibold">
                <Check size={12} className="text-green-500 flex-shrink-0 mt-0.5" /> {g}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-300 p-5" style={cardShadow}>
            <p className="font-bold text-sm text-gray-700 mb-2.5">Status after reply</p>
            <StatusBadge status="REPLIED" />
            <p className="text-xs font-bold text-gray-400 mt-2">This feedback will be marked as replied.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteFeedbackTarget, setDeleteFeedbackTarget] = useState(null);
  const [deletingFeedback, setDeletingFeedback] = useState(false);
  const [sending, setSending] = useState(false);

  const selected = feedbacks.find((f) => f.feedbackId === selectedId) || null;

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/feedback?limit=500");
      if (response.data?.success) {
        setFeedbacks(response.data.data.map(mapFeedback));
      }
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  function handleView(fb) { setSelectedId(fb.feedbackId); setView("detail"); }
  function handleReply(fb) { setSelectedId(fb.feedbackId); setView("reply"); }
  function handleDeleteFeedbackClick(fb) { setDeleteFeedbackTarget(fb); }

  async function handleDeleteFeedbackConfirm() {
    try {
      setDeletingFeedback(true);
      await api.delete(`/feedback/${deleteFeedbackTarget.feedbackId}`);
      await fetchFeedbacks();
      if (view !== "list" && selectedId === deleteFeedbackTarget.feedbackId) setView("list");
    } catch (err) {
      console.error("Failed to delete feedback:", err);
      alert(err.response?.data?.error || "Failed to delete this feedback. Please try again.");
    } finally {
      setDeletingFeedback(false);
      setDeleteFeedbackTarget(null);
    }
  }

  async function handleSendReply(replyText) {
    try {
      setSending(true);
      await api.put(`/feedback/${selected.feedbackId}/reply`, { adminReply: replyText });
      await fetchFeedbacks();
      setView("detail");
    } catch (err) {
      console.error("Failed to send reply:", err);
      alert(err.response?.data?.error || "Failed to send the reply. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const getBreadcrumb = () => {
    if (view === "list") return "Welcome back, Admin!";
    if (view === "detail") return "Feedback › Details";
    return "Feedback › Reply";
  };

  return (
    <div className="flex-1 min-w-0 bg-[#E9EEF4]">
        <Navbar
          title="Feedback"
          breadcrumb={getBreadcrumb()}
          onBack={view !== "list" ? () => setView("list") : undefined}
        />
        <div className="px-6 py-5">
          {view === "list" && (
            <FeedbackList feedbacks={feedbacks} loading={loading} onView={handleView} onReply={handleReply} onDeleteFeedbackClick={handleDeleteFeedbackClick} />
          )}
          {view === "detail" && selected && (
            <FeedbackDetail fb={selected} allFeedbacks={feedbacks} onReply={handleReply} onDeleteFeedbackClick={handleDeleteFeedbackClick} />
          )}
          {view === "reply" && selected && (
            <ReplyView fb={selected} onCancel={() => setView(selected.status === "REPLIED" ? "detail" : "list")} onSend={handleSendReply} sending={sending} />
          )}
          {deleteFeedbackTarget && (
            <DeleteFeedbackModal feedbackId={deleteFeedbackTarget.id} onCancel={() => setDeleteFeedbackTarget(null)} onConfirm={handleDeleteFeedbackConfirm} deleting={deletingFeedback} />
          )}
        </div>
    </div>
  );
}