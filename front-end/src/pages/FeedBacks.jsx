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
} from "lucide-react";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const C = {
  navy: "#1a4a5e",
  navyDark: "#163d4f",
  gold: "#e6a817",
  white: "#ffffff",
  bg: "#f5f7f9",
  border: "#e2e8f0",
  text: "#1e293b",
  muted: "#64748b",
  repliedBg: "#dcfce7",
  repliedText: "#166534",
  notRepliedBg: "#fef3c7",
  notRepliedText: "#92400e",
  bookBg: "#ede9fe",
  bookText: "#6d28d9",
  eventBg: "#fce7f3",
  eventText: "#9d174d",
  generalBg: "#e0f2fe",
  generalText: "#0369a1",
};

// ─── Sample data ─────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function categoryStyle(cat) {
  if (cat === "Book") return { bg: C.bookBg, color: C.bookText };
  if (cat === "Event") return { bg: C.eventBg, color: C.eventText };
  return { bg: C.generalBg, color: C.generalText };
}

function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? C.gold : "none"}
          color={i <= Math.round(rating) ? C.gold : "#d1d5db"}
        />
      ))}
    </span>
  );
}

function StatusBadge({ status }) {
  const replied = status === "REPLIED";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 6,
        background: replied ? C.repliedBg : C.notRepliedBg,
        color: replied ? C.repliedText : C.notRepliedText,
        letterSpacing: 0.3,
        border: `1px solid ${replied ? "#bbf7d0" : "#fde68a"}`,
      }}
    >
      {status}
    </span>
  );
}

function CategoryBadge({ cat }) {
  const s = categoryStyle(cat);
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 600,
        padding: "2px 10px",
        borderRadius: 6,
      }}
    >
      {cat}
    </span>
  );
}

function Avatar({ initials }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: C.navy,
        color: C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, sub, subColor }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 14,
        padding: "20px 24px",
        flex: 1,
        display: "flex",
        gap: 16,
        alignItems: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: "#f0f9ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: subColor || C.gold, fontWeight: 500, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ feedbackId, onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 16,
          padding: "36px 32px 28px",
          width: 340,
          textAlign: "center",
          position: "relative",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.muted,
          }}
        >
          <X size={18} />
        </button>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Trash2 size={24} color="#ef4444" />
        </div>
        <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700 }}>Delete Reply?</h3>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 12px", lineHeight: 1.6 }}>
          This will permanently delete the reply to "{feedbackId}". The feedback status will revert to Not Replied.
        </p>
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#92400e",
            marginBottom: 20,
          }}
        >
          <AlertTriangle size={14} color="#f59e0b" />
          This action cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: `1.5px solid ${C.border}`,
              background: C.white,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "#ef4444",
              color: C.white,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Yes, Delete Reply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LIST VIEW ───────────────────────────────────────────────────────────────
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
      <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
        <StatCard
          icon={<Star size={22} fill={C.gold} color={C.gold} />}
          label="Average Rating"
          value="4.2 / 5"
          sub="★★★★☆ 4.2"
        />
        <StatCard
          icon={<MessageSquare size={22} color={C.navy} />}
          label="Total Feedback"
          value="156"
          sub="+12 this month"
          subColor={C.muted}
        />
        <StatCard
          icon={<ThumbsUp size={22} color={C.navy} />}
          label="Satisfaction Rate"
          value="89%"
          sub="Above target (85%)"
          subColor="#16a34a"
        />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} color={C.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search specific books..."
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              borderRadius: 8,
              border: `1.5px solid ${C.border}`,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        {[
          { label: "Category", value: catFilter, set: setCatFilter, opts: ["All", "Book", "Event", "General"] },
          { label: "Status", value: statusFilter, set: setStatusFilter, opts: ["All", "REPLIED", "NOT REPLIED"] },
        ].map(({ label, value, set, opts }) => (
          <div key={label} style={{ position: "relative" }}>
            <select
              value={value}
              onChange={(e) => set(e.target.value)}
              style={{
                padding: "9px 32px 9px 12px",
                borderRadius: 8,
                border: `1.5px solid ${C.border}`,
                fontSize: 13,
                outline: "none",
                appearance: "none",
                cursor: "pointer",
                background: C.white,
              }}
            >
              {opts.map((o) => (
                <option key={o}>{o === "All" ? `${label}: All` : o}</option>
              ))}
            </select>
            <ChevronDown size={13} color={C.muted} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: C.white, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ background: C.navy, padding: "14px 24px" }}>
          <span style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>Feedback Information</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {filtered.map((f, i) => (
              <tr
                key={f.id}
                style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : "#fafbfc" }}
              >
                <td style={{ padding: "14px 24px", width: 160 }}>
                  <button
                    onClick={() => onView(f)}
                    style={{ background: "none", border: "none", color: C.navy, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0, textAlign: "left" }}
                  >
                    {f.user}
                  </button>
                </td>
                <td style={{ padding: "14px 12px", width: 90 }}>
                  <CategoryBadge cat={f.category} />
                </td>
                <td style={{ padding: "14px 12px", fontSize: 13, color: C.muted, maxWidth: 180 }}>
                  {f.comment.length > 28 ? f.comment.slice(0, 28) + "..." : f.comment}
                </td>
                <td style={{ padding: "14px 12px", fontSize: 13, color: C.muted }}>{f.date}</td>
                <td style={{ padding: "14px 12px" }}>
                  <StatusBadge status={f.status} />
                </td>
                <td style={{ padding: "14px 20px 14px 12px", textAlign: "right" }}>
                  <button
                    onClick={() => onReply(f)}
                    style={{ background: "none", border: "none", cursor: "pointer", marginRight: 8 }}
                    title="Edit / Reply"
                  >
                    <Pencil size={16} color={C.muted} />
                  </button>
                  <button
                    onClick={() => onDeleteClick(f)}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                    title="Delete"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 13, color: C.muted }}>Showing 1 to {filtered.length} of 12,450 entries</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage(Math.max(1, page - 1))} style={paginBtn(false)}>
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3].map((p) => (
              <button key={p} onClick={() => setPage(p)} style={paginBtn(page === p)}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} style={paginBtn(false)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function paginBtn(active) {
  return {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: active ? "none" : `1.5px solid ${C.border}`,
    background: active ? C.navy : C.white,
    color: active ? C.white : C.text,
    fontWeight: active ? 700 : 400,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

// ─── DETAIL VIEW ─────────────────────────────────────────────────────────────
function FeedbackDetail({ fb, onBack, onReply, onDeleteClick }) {
  return (
    <div>
      {/* Action bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => onReply(fb)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 8,
            border: `1.5px solid ${C.border}`, background: C.white,
            fontWeight: 600, fontSize: 13, cursor: "pointer", color: C.text,
          }}
        >
          <Pencil size={14} /> Edit Reply
        </button>
        <button
          onClick={() => onDeleteClick(fb)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 8,
            border: "1.5px solid #fca5a5", background: "#fff1f2",
            fontWeight: 600, fontSize: 13, cursor: "pointer", color: "#b91c1c",
          }}
        >
          <Trash2 size={14} /> Delete Reply
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Main card */}
        <div style={{ flex: 1, background: C.white, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* Card header */}
          <div style={{ background: C.navy, padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
            <MessageSquare size={18} color={C.white} />
            <span style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>Feedback Details</span>
            <StatusBadge status={fb.status} />
          </div>

          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 0", fontSize: 14, marginBottom: 16 }}>
              <div><span style={{ color: C.muted }}>Feedback ID</span><span style={{ marginLeft: 12, fontWeight: 600 }}>{fb.id}</span></div>
              <div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.muted }}>User:</span>
                <span style={{ color: C.navy, fontWeight: 600 }}>{fb.user}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.muted }}>Date:</span>
                <span style={{ fontWeight: 500 }}>March 3, 2026 • 10:30 AM</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <span style={{ color: C.muted }}>Source:</span>
                <CategoryBadge cat={fb.category} /> <span style={{ fontSize: 13, color: C.muted }}>{fb.source}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <span style={{ color: C.muted }}>Rating:</span>
                <Stars rating={fb.rating} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{fb.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
              <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Comment</p>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: C.text, lineHeight: 1.7, minHeight: 60 }}>
                {fb.comment}
              </div>
            </div>

            {fb.status === "REPLIED" && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
                <p style={{ fontWeight: 700, color: C.navy, marginBottom: 6, fontSize: 14 }}>Library Reply</p>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                  Replied by Sokha Chen (Librarian) • March 4, 2026 at 9:00 AM
                </p>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", fontSize: 14, color: "#166534", lineHeight: 1.7 }}>
                  Thank you for your feedback! We are glad you enjoyed the books. We will look into adding more Science Fiction titles soon. Stay tuned!
                </div>
              </div>
            )}

            {/* Activity Log */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
              <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={14} /> Activity Log
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fb.status === "REPLIED" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.muted }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                    Replied by Sokha Chen • March 4, 2026 at 9:00 AM
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.muted }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                  Feedback submitted • March 3, 2026 at 10:30 AM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User profile sidebar */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div style={{ background: C.navy, borderRadius: 14, padding: "20px", color: C.white, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            <p style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, opacity: 0.85 }}>User Profile</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <Avatar initials={fb.avatar} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{fb.user}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Library Member since 2023</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 14, marginBottom: 14 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, opacity: 0.85 }}>Feedback Stats</p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {[["8", "Total Feedbacks"], ["4.8", "Avg Rating Given"], ["6", "Replied"]].map(([v, l]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{v}</div>
                    <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 14 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, opacity: 0.85 }}>Recent Feedbacks</p>
              {[
                { label: "Book: ប្រភិទសញ្ញសៀវ...", date: "March 3, 2026", rating: 5 },
                { label: "Event: Reading Week 2026", date: "Feb 20, 2026", rating: 4 },
                { label: "General: Library Facilities", date: "Jan 15, 2026", rating: 4 },
              ].map((r, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 10px", marginBottom: 8, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 3 }}>{r.label}</div>
                  <div style={{ opacity: 0.7 }}>{r.date} • <Stars rating={r.rating} size={11} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REPLY VIEW ──────────────────────────────────────────────────────────────
function ReplyView({ fb, onCancel, onSend }) {
  const [reply, setReply] = useState(
    fb.status === "REPLIED"
      ? "Thank you for your feedback! We are glad you enjoyed the books. We will look into adding more Science Fiction titles to our collection very soon."
      : ""
  );
  const MAX = 500;

  function applyTemplate(key) {
    setReply(QUICK_TEMPLATES[key]);
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>Reply to Feedback</h2>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Main */}
        <div style={{ flex: 1 }}>
          {/* Replying-to card */}
          <div style={{ background: C.white, borderRadius: 12, padding: "16px 20px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Replying to:</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: C.navy, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{fb.user}</div>
                <Stars rating={fb.rating} />
                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 600 }}>{fb.rating.toFixed(1)} / 5.0</span>
                <div style={{ marginTop: 8 }}>
                  <CategoryBadge cat={fb.category} />
                  <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>{fb.source}</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.muted, maxWidth: 200, textAlign: "right" }}>
                "{fb.comment.slice(0, 40)}..."
              </div>
            </div>
          </div>

          {/* Compose */}
          <div style={{ background: C.white, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ background: C.navy, padding: "13px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <Send size={16} color={C.white} />
              <span style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>Compose Reply</span>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Quick Templates</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                {Object.keys(QUICK_TEMPLATES).map((t) => (
                  <button
                    key={t}
                    onClick={() => applyTemplate(t)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: `1.5px solid ${C.border}`,
                      background: C.white,
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: 500,
                      color: C.text,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Your Reply</p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value.slice(0, MAX))}
                style={{
                  width: "100%",
                  height: 130,
                  resize: "vertical",
                  borderRadius: 10,
                  border: `1.5px solid ${C.border}`,
                  padding: "12px 14px",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                }}
              />
              <div style={{ textAlign: "right", fontSize: 12, color: C.muted, marginTop: 4 }}>
                {reply.length} / {MAX} characters
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.muted }}>Reply will be sent to the user and logged in activity.</span>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={onCancel}
                    style={{ padding: "9px 20px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onSend(reply)}
                    style={{
                      padding: "9px 20px", borderRadius: 8, border: "none",
                      background: C.navy, color: C.white, fontWeight: 700,
                      fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 7,
                    }}
                  >
                    <Send size={14} /> Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines sidebar */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: C.white, borderRadius: 12, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 }}>
            <p style={{ fontWeight: 700, color: C.navy, marginBottom: 14, fontSize: 14 }}>Reply Guidelines</p>
            {[
              "Be professional and courteous",
              "Acknowledge the feedback directly",
              "Provide actionable information",
              "Keep reply under 500 characters",
              "Avoid personal information",
            ].map((g) => (
              <div key={g} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 9, fontSize: 13, color: C.muted }}>
                <Check size={13} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />
                {g}
              </div>
            ))}
          </div>
          <div style={{ background: C.white, borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Status after reply</p>
            <StatusBadge status="REPLIED" />
            <p style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>This feedback will be marked as replied.</p>
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

  // Handlers
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

  // Determine breadcrumb based on view
  const getBreadcrumb = () => {
    if (view === "list") return "Home › Feedback";
    if (view === "detail") return "Home › Feedback › Details";
    return "Home › Feedback › Reply";
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f5f7f9]">
        <Navbar title="Feedback" breadcrumb={getBreadcrumb()} />

        <div style={{ padding: "28px 36px" }}>
          {/* Page Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>Feedback Management</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
              Review, manage, and respond to library user feedback.
            </p>
          </div>

          {/* View Router */}
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

          {/* Delete Modal */}
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