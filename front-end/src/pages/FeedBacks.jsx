import { useState } from "react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";
import {
  Star, MessageSquare, ThumbsUp, Search, ChevronDown, Pencil, Trash2,
  ChevronLeft, ChevronRight, Send, Check, AlertTriangle, X, Activity,
  BookOpen, Calendar, Building2, Clock, CheckCircle2, Printer, Filter,
  ArrowUpDown, Eye,
} from "lucide-react";

// ─── Sample data ──────────────────────────────────────────────────────────────
const FEEDBACKS = [
  { id: "FBK-2026-0301", user: "សូខ សោម៉ារតី", category: "Book",    source: "Book: ប្រភិទសញ្ញសៀវ...",      comment: "សៀវភៅល្ហណមាន់ ប្រទួចចាលបញ្ហេចញ្ចី...", date: "2026-03-03", status: "REPLIED",     rating: 5.0, avatar: "ស.ស" },
  { id: "FBK-2026-0302", user: "La Vita",       category: "Event",   source: "Event: Reading Week 2026",    comment: "Great event!",                            date: "2026-03-03", status: "NOT REPLIED", rating: 4.0, avatar: "LV" },
  { id: "FBK-2026-0303", user: "Anonymous",     category: "General", source: "General: Library Facilities", comment: "Need more seats",                         date: "2026-03-03", status: "NOT REPLIED", rating: 3.0, avatar: "AN" },
  { id: "FBK-2026-0304", user: "La Vita",       category: "Book",    source: "Book: ប្រភិទសញ្ញសៀវ...",      comment: "សៀវភៅល្ហណមាន់ ប្រទួចចាលបញ្ហេចញ្ចី...", date: "2026-03-03", status: "REPLIED",     rating: 4.5, avatar: "LV" },
  { id: "FBK-2026-0305", user: "La Vita",       category: "Event",   source: "Event: Reading Week 2026",    comment: "Great event!",                            date: "2026-03-03", status: "REPLIED",     rating: 5.0, avatar: "LV" },
  { id: "FBK-2026-0306", user: "Anonymous",     category: "General", source: "General: Library Facilities", comment: "Hard to understand",                      date: "2026-03-03", status: "NOT REPLIED", rating: 2.0, avatar: "AN" },
  { id: "FBK-2026-0307", user: "ម៉ៃ សូខរេង",   category: "Book",    source: "Book: ប្រភិទសញ្ញសៀវ...",      comment: "សៀវភៅល្ហណមាន់ ប្រទួចចាលបញ្ហេចញ្ចី...", date: "2026-03-03", status: "REPLIED",     rating: 4.8, avatar: "ម.ស" },
  { id: "FBK-2026-0308", user: "La Vita",       category: "General", source: "General: Library Facilities", comment: "Hard to understand",                      date: "2026-03-03", status: "REPLIED",     rating: 4.0, avatar: "LV" },
];

const QUICK_TEMPLATES = {
  "Thank You": "Thank you for your feedback! We appreciate you taking the time to share your thoughts with us.",
  "We'll Look Into It": "Thank you for your feedback! We will look into this matter and make the necessary improvements soon.",
  "Coming Soon": "Thank you for your feedback! We are glad you enjoyed the books. We will look into adding more Science Fiction titles to our collection very soon.",
};

const CATEGORIES = ["All Categories", "Book", "Event", "General"];
const STATUSES   = ["All Status", "REPLIED", "NOT REPLIED"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function Stars({ rating, size = 13 }) {
  return (
    <span className="inline-flex gap-px">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? "#E8C110" : "none"} color={i <= Math.round(rating) ? "#E8C110" : "#d1d5db"} />
      ))}
    </span>
  );
}

function CategoryBadge({ cat }) {
  const s = categoryStyle[cat] || categoryStyle.General;
  const Icon = categoryIcon[cat] || Building2;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md"
      style={{ backgroundColor: s.bg, color: s.text }}>
      <Icon size={11} /> {cat}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = statusStyle[status] || statusStyle["NOT REPLIED"];
  const Icon = status === "REPLIED" ? CheckCircle2 : Clock;
  return (
    <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md text-center"
      style={{ backgroundColor: s.bg, color: s.text }}>
      <span className="inline-flex items-center gap-1"><Icon size={11} /> {status}</span>
    </span>
  );
}

function Avatar({ initials }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#1B4965] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ feedbackId, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-80 text-center relative shadow-2xl">
        <button onClick={onCancel} className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Reply?</h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
          This will permanently delete the reply to "{feedbackId}". The feedback status will revert to Not Replied.
        </p>
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 mb-5">
          <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" /> This action cannot be undone.
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition">Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Grid layout ──────────────────────────────────────────────────────────────
const gridLayout = "grid-cols-[180px_110px_300px_130px_110px_160px_200px] items-center";

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function FeedbackList({ feedbacks, onView, onReply, onDeleteClick }) {
  const [search,       setSearch]       = useState("");
  const [catFilter,    setCatFilter]    = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page,         setPage]         = useState(1);
  const totalPages = 3;

  const filtered = feedbacks.filter((f) =>
    (!search || f.user.toLowerCase().includes(search.toLowerCase()) || f.comment.toLowerCase().includes(search.toLowerCase())) &&
    (catFilter    === "All Categories" || f.category === catFilter) &&
    (statusFilter === "All Status"     || f.status   === statusFilter)
  );

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Average Rating",    value: "4.2 / 5",  sub: "+0.3 this month",   subColor: "#CA8A04", border: "#E8C110" },
          { label: "Total Feedback",    value: "156",       sub: "+12 this month",    subColor: "#055E83", border: "#055E83" },
          { label: "Satisfaction Rate", value: "89%",       sub: "Above target (85%)", subColor: "#16A34A", border: "#16A34A" },
        ].map(({ label, value, sub, subColor, border }) => (
          <div key={label} className="bg-white rounded-xl px-5 py-4" style={{ borderTop: `3px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold leading-tight" style={{ color: subColor }}>{value}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: subColor }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-60">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or comment..."
            className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Filter size={12} className="text-gray-400" />
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="text-xs outline-none bg-transparent text-gray-600">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Filter size={12} className="text-gray-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs outline-none bg-transparent text-gray-600">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <ArrowUpDown size={12} className="text-gray-400" />
          <span className="text-xs text-gray-600">Sort: Date</span>
        </div>
        <p className="ml-auto text-xs text-gray-400">Showing 1–{filtered.length} of 12,450 entries</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#1B4965" }}>
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <MessageSquare size={15} /> Feedback Information
          </h2>
        </div>

        {/* Column Headers */}
        <div className={`grid ${gridLayout} py-3 border-b border-gray-100 bg-gray-50/70 text-xs font-bold uppercase tracking-wider`}
          style={{ color: "#055E83" }}>
          <span className="pl-6">User</span>
          <span>Category</span>
          <span>Comment</span>
          <span>Rating</span>
          <span>Date</span>
          <span className="text-center">Status</span>
          <span className="pr-6 text-center">Actions</span>
        </div>

        {/* Rows */}
        {filtered.map((f) => (
          <div key={f.id} className={`grid ${gridLayout} py-3.5 border-b border-gray-100 hover:bg-slate-50/60 transition`}>
            <div className="pl-6 flex items-center gap-2.5 min-w-0">
              <Avatar initials={f.avatar} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{f.user}</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#055E83" }}>{f.id}</p>
              </div>
            </div>

            <div><CategoryBadge cat={f.category} /></div>

            <span className="text-xs text-gray-500 truncate pr-2">
              {f.comment.length > 32 ? f.comment.slice(0, 32) + "…" : f.comment}
            </span>

            <div className="flex items-center gap-1.5">
              <Stars rating={f.rating} size={11} />
              <span className="text-xs font-semibold text-gray-500">{f.rating.toFixed(1)}</span>
            </div>

            <span className="text-xs text-gray-500">{f.date}</span>

            <div className="text-center"><StatusBadge status={f.status} /></div>

            <div className="pr-6 flex items-center justify-center gap-1.5">
              <button onClick={() => onView(f)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                style={{ backgroundColor: "#1B4965", color: "#fff" }}>
                <Eye size={12} /> View
              </button>
              <button onClick={() => onReply(f)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
                <Pencil size={12} /> Reply
              </button>
              <button onClick={() => onDeleteClick(f)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm bg-red-50 text-red-500 border border-red-100">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
              <ChevronLeft size={12} /> Prev
            </button>
            {[1, 2, 3].map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className="w-7 h-7 rounded-lg text-xs font-semibold transition"
                style={{ backgroundColor: page === n ? "#1B4965" : "transparent", color: page === n ? "#fff" : "#64748B", border: page === n ? "none" : "1px solid #E2E8F0" }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={{ backgroundColor: "#1B4965", color: "#fff" }}>
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL VIEW ──────────────────────────────────────────────────────────────
function FeedbackDetail({ fb, onReply, onDeleteClick }) {
  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-gray-100"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">
          <StatusBadge status={fb.status} />
          <span className="text-xs font-bold tracking-wider" style={{ color: "#055E83" }}>#{fb.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
            <Printer size={12} /> Print
          </button>
          <button onClick={() => onReply(fb)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-85 transition shadow-sm"
            style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
            <Pencil size={12} /> Edit Reply
          </button>
          <button onClick={() => onDeleteClick(fb)}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
            <Trash2 size={12} /> Delete Reply
          </button>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* Main card */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
            <MessageSquare size={14} className="text-[#E8C110]" />
            <span className="text-white font-bold text-sm">Feedback Details</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-y-3 text-sm mb-5">
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
                <span className="text-xs font-medium text-gray-700">March 3, 2026 • 10:30 AM</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Source</span>
                <CategoryBadge cat={fb.category} />
                <span className="text-xs text-gray-400">{fb.source}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rating</span>
                <Stars rating={fb.rating} />
                <span className="text-xs font-bold text-gray-600">{fb.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comment</p>
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed border border-gray-100">{fb.comment}</div>
            </div>

            {fb.status === "REPLIED" && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#1B4965" }}>Library Reply</p>
                <p className="text-xs text-gray-400 mb-2">Replied by Sokha Chen (Librarian) • March 4, 2026 at 9:00 AM</p>
                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-green-800 leading-relaxed">
                  Thank you for your feedback! We are glad you enjoyed the books. We will look into adding more Science Fiction titles soon. Stay tuned!
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Activity size={12} className="text-[#E8C110]" /> Activity Log
              </p>
              <div className="flex flex-col gap-3">
                {fb.status === "REPLIED" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    <div><p className="text-xs font-bold text-gray-700">Replied by Sokha Chen</p><p className="text-xs text-gray-400 mt-0.5">March 4, 2026 at 9:00 AM</p></div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div><p className="text-xs font-bold text-gray-700">Feedback submitted</p><p className="text-xs text-gray-400 mt-0.5">March 3, 2026 at 10:30 AM</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="rounded-xl p-5 text-white" style={{ backgroundColor: "#1B4965", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">User Profile</p>
            <div className="flex items-center gap-3 mb-5">
              <Avatar initials={fb.avatar} />
              <div>
                <div className="font-bold text-sm">{fb.user}</div>
                <div className="text-xs text-white/60 mt-0.5">Member since 2023</div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 mb-4">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Feedback Stats</p>
              <div className="flex justify-between">
                {[["8","Total"],["4.8","Avg Rating"],["6","Replied"]].map(([v,l]) => (
                  <div key={l} className="text-center">
                    <div className="text-xl font-bold" style={{ color: "#E8C110" }}>{v}</div>
                    <div className="text-xs text-white/60 mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Recent Feedbacks</p>
              {[
                { label: "Book: ប្រភិទសញ្ញសៀវ...",      date: "March 3, 2026",  rating: 5 },
                { label: "Event: Reading Week 2026",    date: "Feb 20, 2026",   rating: 4 },
                { label: "General: Library Facilities", date: "Jan 15, 2026",   rating: 4 },
              ].map((r, i) => (
                <div key={i} className="bg-white/10 rounded-lg px-3 py-2 mb-2 text-xs">
                  <div className="font-semibold mb-1">{r.label}</div>
                  <div className="text-white/60 flex items-center gap-1">{r.date} • <Stars rating={r.rating} size={10} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REPLY VIEW ───────────────────────────────────────────────────────────────
function ReplyView({ fb, onCancel, onSend }) {
  const [reply, setReply] = useState(
    fb.status === "REPLIED"
      ? "Thank you for your feedback! We are glad you enjoyed the books. We will look into adding more Science Fiction titles to our collection very soon."
      : ""
  );
  const MAX = 500;

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-gray-100"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">
          {/* Back Arrow navigation shortcut */}
          <button 
            onClick={onCancel} 
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 mr-1 transition"
            title="Back to Feedback List"
          >
            <ChevronLeft size={18} />
          </button>
          <StatusBadge status={fb.status} />
          <span className="text-xs font-bold tracking-wider" style={{ color: "#055E83" }}>#{fb.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 transition">
            Cancel
          </button>
          <button onClick={() => onSend(reply)}
            className="flex items-center gap-1.5 text-white text-xs font-bold px-5 py-2 rounded-lg hover:opacity-90 transition shadow-sm"
            style={{ backgroundColor: "#1B4965" }}>
            <Send size={12} /> Send Reply
          </button>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        <div className="flex-1 space-y-4">
          {/* Replying-to Profile Header */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
              <MessageSquare size={14} className="text-[#E8C110]" />
              <span className="text-white font-bold text-sm">Replying To</span>
            </div>
            <div className="p-5 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm" style={{ color: "#1B4965" }}>{fb.user}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Stars rating={fb.rating} size={12} />
                  <span className="text-xs font-bold text-gray-600">{fb.rating.toFixed(1)} / 5.0</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CategoryBadge cat={fb.category} />
                  <span className="text-xs text-gray-400">{fb.source}</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-[200px] text-right italic">"{fb.comment.slice(0, 40)}..."</p>
            </div>
          </div>

          {/* Compose Text Area */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
              <Send size={14} className="text-[#E8C110]" />
              <span className="text-white font-bold text-sm">Compose Reply</span>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Quick Templates</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {Object.keys(QUICK_TEMPLATES).map((t) => (
                  <button key={t} onClick={() => setReply(QUICK_TEMPLATES[t])}
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#1B4965] hover:text-[#1B4965] transition">
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Your Reply</p>
              <textarea value={reply} onChange={(e) => setReply(e.target.value.slice(0, MAX))} rows={5}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1B4965] transition resize-none font-medium leading-relaxed" />
              <div className="text-right text-xs text-gray-400 mt-1">{reply.length} / {MAX} characters</div>
            </div>
          </div>
        </div>

        {/* Informational Sidebar */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p className="font-bold text-sm mb-3" style={{ color: "#1B4965" }}>Reply Guidelines</p>
            {["Be professional and courteous","Acknowledge the feedback directly","Provide actionable information","Keep reply under 500 characters","Avoid personal information"].map((g) => (
              <div key={g} className="flex items-start gap-2 mb-2 text-xs text-gray-500">
                <Check size={12} className="text-green-500 flex-shrink-0 mt-0.5" /> {g}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p className="font-bold text-sm text-gray-700 mb-2">Status after reply</p>
            <StatusBadge status="REPLIED" />
            <p className="text-xs text-gray-400 mt-2">This feedback will be marked as replied.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const [view,         setView]         = useState("list");
  const [selected,     setSelected]     = useState(null);
  const [feedbacks,    setFeedbacks]    = useState(FEEDBACKS);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleView(fb)        { setSelected(fb); setView("detail"); }
  function handleReply(fb)       { setSelected(fb); setView("reply"); }
  function handleDeleteClick(fb) { setDeleteTarget(fb); }

  function handleDeleteConfirm() {
    setFeedbacks((prev) => prev.map((f) => f.id === deleteTarget.id ? { ...f, status: "NOT REPLIED" } : f));
    setDeleteTarget(null);
    if (view === "detail") setView("list");
  }

  function handleSendReply() {
    setFeedbacks((prev) => prev.map((f) => f.id === selected.id ? { ...f, status: "REPLIED" } : f));
    setSelected((s) => s ? { ...s, status: "REPLIED" } : s);
    setView("detail");
  }

  const getBreadcrumb = () => {
    if (view === "list")   return "Welcome back, Admin!";
    if (view === "detail") return "Feedback › Details";
    return "Feedback › Reply";
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Feedback" breadcrumb={getBreadcrumb()} />
        <div className="px-6 py-5">
          {view === "list" && <FeedbackList feedbacks={feedbacks} onView={handleView} onReply={handleReply} onDeleteClick={handleDeleteClick} />}
          {view === "detail" && selected && <FeedbackDetail fb={feedbacks.find((f) => f.id === selected.id) || selected} onReply={handleReply} onDeleteClick={handleDeleteClick} />}
          {view === "reply"  && selected && <ReplyView fb={selected} onCancel={() => setView("list")} onSend={handleSendReply} />}
          {deleteTarget && <DeleteModal feedbackId={deleteTarget.id} onCancel={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />}
        </div>
      </main>
    </div>
  );
}