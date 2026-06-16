import { useState } from "react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Search,
  ChevronDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  AlertTriangle,
  X,
  Activity,
  Plus,
  BookOpen,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  Printer,
} from "lucide-react";

// ─── Sample data ──────────────────────────────────────────────────────────────
const FEEDBACKS = [
  { id: "FBK-2026-0301", user: "សូខ សោម៉ារតី", category: "Book", source: "Book: ប្រភិទសញ្ញសៀវ...", comment: "សៀវភៅល្ហណមាន់ ប្រទួចចាលបញ្ហេចញ្ចី...", date: "2026-03-03", status: "REPLIED", rating: 5.0, avatar: "ស.ស" },
  { id: "FBK-2026-0302", user: "La Vita", category: "Event", source: "Event: Reading Week 2026", comment: "Great event!", date: "2026-03-03", status: "NOT REPLIED", rating: 4.0, avatar: "LV" },
  { id: "FBK-2026-0303", user: "Anonymous", category: "General", source: "General: Library Facilities", comment: "Need more seats", date: "2026-03-03", status: "NOT REPLIED", rating: 3.0, avatar: "AN" },
  { id: "FBK-2026-0304", user: "La Vita", category: "Book", source: "Book: ប្រភិទសញ្ញសៀវ...", comment: "សៀវភៅល្ហណមាន់ ប្រទួចចាលបញ្ហេចញ្ចី...", date: "2026-03-03", status: "REPLIED", rating: 4.5, avatar: "LV" },
  { id: "FBK-2026-0305", user: "La Vita", category: "Event", source: "Event: Reading Week 2026", comment: "Great event!", date: "2026-03-03", status: "REPLIED", rating: 5.0, avatar: "LV" },
  { id: "FBK-2026-0306", user: "Anonymous", category: "General", source: "General: Library Facilities", comment: "Hard to understand", date: "2026-03-03", status: "NOT REPLIED", rating: 2.0, avatar: "AN" },
  { id: "FBK-2026-0307", user: "ម៉ៃ សូខរេង", category: "Book", source: "Book: ប្រភិទសញ្ញសៀវ...", comment: "សៀវភៅល្ហណមាន់ ប្រទួចចាលបញ្ហេចញ្ចី...", date: "2026-03-03", status: "REPLIED", rating: 4.8, avatar: "ម.ស" },
  { id: "FBK-2026-0308", user: "La Vita", category: "General", source: "General: Library Facilities", comment: "Hard to understand", date: "2026-03-03", status: "REPLIED", rating: 4.0, avatar: "LV" },
];

const QUICK_TEMPLATES = {
  "Thank You": "Thank you for your feedback! We appreciate you taking the time to share your thoughts with us.",
  "We'll Look Into It": "Thank you for your feedback! We will look into this matter and make the necessary improvements soon.",
  "Coming Soon": "Thank you for your feedback! We are glad you enjoyed the books. We will look into adding more Science Fiction titles to our collection very soon.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function categoryIcon(cat) {
  if (cat === "Book") return <BookOpen size={11} />;
  if (cat === "Event") return <Calendar size={11} />;
  return <Building2 size={11} />;
}

function categoryStyle(cat) {
  if (cat === "Book") return "bg-violet-50 text-violet-700";
  if (cat === "Event") return "bg-pink-50 text-pink-700";
  return "bg-sky-50 text-sky-700";
}

function Stars({ rating, size = 14 }) {
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? "#E8C110" : "none"}
          color={i <= Math.round(rating) ? "#E8C110" : "#d1d5db"}
        />
      ))}
    </span>
  );
}

function StatusBadge({ status }) {
  const replied = status === "REPLIED";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
        replied ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-800"
      }`}
    >
      {replied ? <CheckCircle2 size={11} /> : <Clock size={11} />}
      {status}
    </span>
  );
}

function CategoryBadge({ cat }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${categoryStyle(cat)}`}>
      {categoryIcon(cat)}
      {cat}
    </span>
  );
}

function Avatar({ initials }) {
  return (
    <div className="w-10 h-10 rounded-full bg-[#1B4965] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, label, value, sub, subColor }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-[#1B4965]/25 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
        <p className={`text-xs font-medium mt-0.5 ${subColor}`}>{sub}</p>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ feedbackId, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-80 text-center relative shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={18} />
        </button>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Reply?</h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
          This will permanently delete the reply to "{feedbackId}". The feedback status will revert to Not Replied.
        </p>
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 mb-5">
          <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" />
          This action cannot be undone.
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function FeedbackList({ feedbacks, onView, onReply, onDeleteClick }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = feedbacks.filter((f) => {
    const matchSearch =
      !search ||
      f.user.toLowerCase().includes(search.toLowerCase()) ||
      f.comment.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || f.category === catFilter;
    const matchStatus = statusFilter === "All" || f.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = 3;

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Star size={20} fill="#E8C110" color="#E8C110" />}
          iconBg="bg-yellow-50"
          label="Average Rating"
          value="4.2 / 5"
          sub="★★★★☆ 4.2"
          subColor="text-yellow-600"
        />
        <StatCard
          icon={<MessageSquare size={20} className="text-blue-500" />}
          iconBg="bg-blue-50"
          label="Total Feedback"
          value="156"
          sub="+12 this month"
          subColor="text-gray-400"
        />
        <StatCard
          icon={<ThumbsUp size={20} className="text-green-500" />}
          iconBg="bg-green-50"
          label="Satisfaction Rate"
          value="89%"
          sub="Above target (85%)"
          subColor="text-green-500"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-dashed border-[#1B4965]/25 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
          <h2 className="text-base font-bold text-white">Feedback Information</h2>
          
        </div>

        {/* Filters */}
        <div className="flex gap-3 px-6 py-3.5 border-b border-gray-100 items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback..."
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-[#1B4965] transition"
            />
          </div>
          {[
            { label: "Category", value: catFilter, set: setCatFilter, opts: ["All", "Book", "Event", "General"] },
            { label: "Status", value: statusFilter, set: setStatusFilter, opts: ["All", "REPLIED", "NOT REPLIED"] },
          ].map(({ label, value, set, opts }) => (
            <div key={label} className="relative">
              <select
                value={value}
                onChange={(e) => set(e.target.value)}
                className="border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm outline-none appearance-none cursor-pointer bg-white text-gray-700 focus:border-[#1B4965] transition"
              >
                {opts.map((o) => (
                  <option key={o}>{o === "All" ? `${label}: All` : o}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#055E83]">User</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#055E83]">Category</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#055E83]">Comment</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#055E83]">Rating</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#055E83]">Date</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#055E83]">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr
                key={f.id}
                onClick={() => onView(f)}
                className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition"
              >
                <td className="px-6 py-4 font-bold text-[#1B4965] text-sm">{f.user}</td>
                <td className="px-6 py-4"><CategoryBadge cat={f.category} /></td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-[180px] truncate">
                  {f.comment.length > 28 ? f.comment.slice(0, 28) + "…" : f.comment}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Stars rating={f.rating} size={12} />
                    <span className="text-xs font-semibold text-gray-500">{f.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{f.date}</td>
                <td className="px-6 py-4"><StatusBadge status={f.status} /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onReply(f)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B4965] hover:bg-blue-50 transition"
                      title="Edit / Reply"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDeleteClick(f)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-3.5 border-t border-gray-100">
          <span className="text-xs text-gray-400">Showing 1 to {filtered.length} of 12,450 entries</span>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(Math.max(1, page - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition ${
                  page === p
                    ? "bg-[#1B4965] text-white border-[#1B4965]"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition">
              <ChevronRight size={14} />
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
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-6 py-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <StatusBadge status={fb.status} />
          <span className="text-sm text-gray-400 font-bold tracking-wider">ID: #{fb.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm font-bold text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
            <Printer size={13} /> Print
          </button>
          <button
            onClick={() => onReply(fb)}
            className="flex items-center gap-1.5 text-sm font-bold text-[#1B4965] border border-[#1B4965]/30 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            <Pencil size={13} /> Edit Reply
          </button>
          <button
            onClick={() => onDeleteClick(fb)}
            className="flex items-center gap-1.5 text-sm font-bold text-red-500 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 size={13} /> Delete Reply
          </button>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* Main card */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#1B4965] px-6 py-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-[#E8C110]" />
            <span className="text-white font-bold text-sm">Feedback Details</span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-y-3 text-sm mb-5">
              <div>
                <span className="text-gray-400 font-medium">Feedback ID</span>
                <span className="ml-3 font-bold text-gray-700">{fb.id}</span>
              </div>
              <div />
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-medium">User:</span>
                <span className="font-bold text-[#1B4965]">{fb.user}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-medium">Date:</span>
                <span className="font-medium text-gray-700">March 3, 2026 • 10:30 AM</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-400 font-medium">Source:</span>
                <CategoryBadge cat={fb.category} />
                <span className="text-xs text-gray-400">{fb.source}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-400 font-medium">Rating:</span>
                <Stars rating={fb.rating} />
                <span className="font-bold text-xs text-gray-600">{fb.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="font-bold text-sm text-gray-700 mb-2">Comment</p>
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed border border-gray-100">
                {fb.comment}
              </div>
            </div>

            {fb.status === "REPLIED" && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="font-bold text-sm text-[#1B4965] mb-1">Library Reply</p>
                <p className="text-xs text-gray-400 mb-2">Replied by Sokha Chen (Librarian) • March 4, 2026 at 9:00 AM</p>
                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-green-800 leading-relaxed">
                  Thank you for your feedback! We are glad you enjoyed the books. We will look into adding more Science Fiction titles soon. Stay tuned!
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-1.5">
                <Activity size={13} className="text-[#E8C110]" /> Activity Log
              </p>
              <div className="flex flex-col gap-3">
                {fb.status === "REPLIED" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-700">Replied by Sokha Chen</p>
                      <p className="text-xs text-gray-400 mt-0.5">March 4, 2026 at 9:00 AM</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-gray-700">Feedback submitted</p>
                    <p className="text-xs text-gray-400 mt-0.5">March 3, 2026 at 10:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User profile sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-[#1B4965] rounded-xl p-5 text-white shadow-sm">
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
                {[["8", "Total"], ["4.8", "Avg Rating"], ["6", "Replied"]].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <div className="text-xl font-bold text-[#E8C110]">{v}</div>
                    <div className="text-xs text-white/60 mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Recent Feedbacks</p>
              {[
                { label: "Book: ប្រភិទសញ្ញសៀវ...", date: "March 3, 2026", rating: 5 },
                { label: "Event: Reading Week 2026", date: "Feb 20, 2026", rating: 4 },
                { label: "General: Library Facilities", date: "Jan 15, 2026", rating: 4 },
              ].map((r, i) => (
                <div key={i} className="bg-white/10 rounded-lg px-3 py-2 mb-2 text-xs">
                  <div className="font-semibold mb-1">{r.label}</div>
                  <div className="text-white/60 flex items-center gap-1">
                    {r.date} • <Stars rating={r.rating} size={10} />
                  </div>
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
    <div>
      <h2 className="text-xl font-bold text-[#1B4965] mb-5">Reply to Feedback</h2>

      <div className="flex gap-5 items-start">
        {/* Main */}
        <div className="flex-1">
          {/* Replying-to card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 mb-4">
            <p className="text-xs text-gray-400 font-medium mb-2">Replying to:</p>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-[#1B4965] text-sm mb-1">{fb.user}</p>
                <div className="flex items-center gap-1.5">
                  <Stars rating={fb.rating} size={13} />
                  <span className="text-xs font-bold text-gray-600">{fb.rating.toFixed(1)} / 5.0</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CategoryBadge cat={fb.category} />
                  <span className="text-xs text-gray-400">{fb.source}</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-[200px] text-right italic">
                "{fb.comment.slice(0, 40)}..."
              </p>
            </div>
          </div>

          {/* Compose card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#1B4965] px-5 py-3.5 flex items-center gap-2">
              <Send size={15} className="text-[#E8C110]" />
              <span className="text-white font-bold text-sm">Compose Reply</span>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Quick Templates</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {Object.keys(QUICK_TEMPLATES).map((t) => (
                  <button
                    key={t}
                    onClick={() => setReply(QUICK_TEMPLATES[t])}
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#1B4965] hover:text-[#1B4965] transition"
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Your Reply</p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value.slice(0, MAX))}
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1B4965] transition resize-none font-medium leading-relaxed"
              />
              <div className="text-right text-xs text-gray-400 mt-1 mb-4">
                {reply.length} / {MAX} characters
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">Reply will be sent to the user and logged in activity.</span>
                <div className="flex gap-2.5">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onSend(reply)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4965] text-white text-sm font-bold hover:bg-[#144056] transition"
                  >
                    <Send size={13} /> Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="font-bold text-[#1B4965] text-sm mb-3">Reply Guidelines</p>
            {[
              "Be professional and courteous",
              "Acknowledge the feedback directly",
              "Provide actionable information",
              "Keep reply under 500 characters",
              "Avoid personal information",
            ].map((g) => (
              <div key={g} className="flex items-start gap-2 mb-2 text-xs text-gray-500">
                <Check size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                {g}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
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
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [feedbacks, setFeedbacks] = useState(FEEDBACKS);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleView(fb) { setSelected(fb); setView("detail"); }
  function handleReply(fb) { setSelected(fb); setView("reply"); }
  function handleDeleteClick(fb) { setDeleteTarget(fb); }

  function handleDeleteConfirm() {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === deleteTarget.id ? { ...f, status: "NOT REPLIED" } : f))
    );
    setDeleteTarget(null);
    if (view === "detail") setView("list");
  }

  function handleSendReply(replyText) {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === selected.id ? { ...f, status: "REPLIED" } : f))
    );
    setSelected((s) => (s ? { ...s, status: "REPLIED" } : s));
    setView("detail");
  }

  const getBreadcrumb = () => {
    if (view === "list") return "Home › Feedback";
    if (view === "detail") return "Home › Feedback › Details";
    return "Home › Feedback › Reply";
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Feedback" breadcrumb={getBreadcrumb()} />

        <div className="px-8 py-6">
          

          {view === "list" && (
            <FeedbackList
              feedbacks={feedbacks}
              onView={handleView}
              onReply={handleReply}
              onDeleteClick={handleDeleteClick}
            />
          )}
          {view === "detail" && selected && (
            <FeedbackDetail
              fb={feedbacks.find((f) => f.id === selected.id) || selected}
              onReply={handleReply}
              onDeleteClick={handleDeleteClick}
            />
          )}
          {view === "reply" && selected && (
            <ReplyView
              fb={selected}
              onCancel={() => setView("detail")}
              onSend={handleSendReply}
            />
          )}

          {deleteTarget && (
            <DeleteModal
              feedbackId={deleteTarget.id}
              onCancel={() => setDeleteTarget(null)}
              onConfirm={handleDeleteConfirm}
            />
          )}
        </div>
      </main>
    </div>
  );
}