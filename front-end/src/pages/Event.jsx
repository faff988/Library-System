import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  ArrowLeft,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

// ─── Color tokens ───────────────────────────────────────────────────────────
const colors = {
  navy: "#1a4a5e",
  navyDark: "#163d4f",
  gold: "#e6a817",
  goldHover: "#cf9510",
  white: "#ffffff",
  bg: "#f5f7f9",
  border: "#e2e8f0",
  textPrimary: "#1e293b",
  textSecondary: "#64748b",
  tagBg: "#e8f4f8",
  tagText: "#1a4a5e",
  progressTrack: "#e2e8f0",
};

const CATEGORIES = ["Discussion", "Special Events", "Children", "Workshop"];

const initialEvents = [
  {
    id: 1,
    title: "Khmer New Year",
    category: "Special Events",
    date: "14-04-2026",
    time: "9:00 AM",
    location: "Sieamreap Bannalay",
    maxAttendances: 50,
    joined: 30,
    description:
      "Welcome to the Khmer New Year celebration at Siemreap Bannalay. This traditional festival, also known as Chol Chnam Thmey, marks the end of the harvesting season and the beginning of the new year in the Buddhist calendar.",
    highlights: [
      "Traditional Dance Ceremony",
      "Community Blessing Rituals",
      "Khmer Folk Games",
      "Local Culinary Workshop",
    ],
  },
  {
    id: 2,
    title: "Author Meet & Greet",
    category: "Discussion",
    date: "14-03-2026",
    time: "9:00 AM",
    location: "Sieamreap Bannalay",
    maxAttendances: 50,
    joined: 30,
    description:
      "Join us for an engaging discussion with a local author about their latest work and inspiration.",
    highlights: [],
  },
  {
    id: 3,
    title: "Kids Story Hour",
    category: "Children",
    date: "20-04-2026",
    time: "10:00 AM",
    location: "Sieamreap Bannalay",
    maxAttendances: 30,
    joined: 12,
    description: "A fun storytime session for children ages 4–10.",
    highlights: [],
  },
  {
    id: 4,
    title: "Bookbinding Workshop",
    category: "Workshop",
    date: "25-04-2026",
    time: "2:00 PM",
    location: "Sieamreap Bannalay",
    maxAttendances: 20,
    joined: 5,
    description: "Learn the art of traditional bookbinding in this hands-on workshop.",
    highlights: [],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function categoryColor(cat) {
  const map = {
    Discussion: { bg: "#dbeafe", text: "#1e40af" },
    "Special Events": { bg: "#fef3c7", text: "#92400e" },
    Children: { bg: "#dcfce7", text: "#166534" },
    Workshop: { bg: "#f3e8ff", text: "#6b21a8" },
  };
  return map[cat] || { bg: colors.tagBg, text: colors.tagText };
}

function pct(joined, max) {
  return Math.round((joined / max) * 100);
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const { bg, text } = categoryColor(category);
  return (
    <span
      style={{
        background: bg,
        color: text,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 20,
        display: "inline-block",
        marginBottom: 8,
      }}
    >
      {category}
    </span>
  );
}

function ProgressBar({ joined, max }) {
  const p = pct(joined, max);
  return (
    <div style={{ marginTop: 4 }}>
      <div
        style={{
          height: 6,
          background: colors.progressTrack,
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${p}%`,
            height: "100%",
            background: colors.gold,
            borderRadius: 9999,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, display: "block" }}>
        {p}% full
      </span>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
      }}
    >
      <Icon size={18} color={colors.navy} />
      <div>
        <div style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary }}>{value}</div>
      </div>
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, type = "button", style: extra = {} }) {
  const base = {
    border: "none",
    borderRadius: 10,
    padding: "10px 22px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    transition: "opacity 0.15s",
    ...extra,
  };
  const styles = {
    primary: { background: colors.navy, color: colors.white },
    gold: { background: colors.gold, color: colors.white },
    outline: { background: "transparent", border: `1.5px solid ${colors.navy}`, color: colors.navy },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...base, ...styles[variant] }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

// ─── Views ───────────────────────────────────────────────────────────────────

/** LIST VIEW */
function EventList({ events, onView, onEdit, onCreateClick }) {
  const categoryCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = events.filter((e) => e.category === c).length;
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Event cards */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            background: colors.white,
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>
              Upcoming Events
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: colors.textSecondary }}>
              Manage and organize library events
            </p>
          </div>
          <Btn variant="gold" onClick={onCreateClick}>
            <Plus size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Create Event
          </Btn>
        </div>

        {events.map((ev) => (
          <div
            key={ev.id}
            style={{
              background: colors.white,
              borderRadius: 16,
              padding: "20px 24px",
              marginBottom: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <CategoryBadge category={ev.category} />
            <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700, color: colors.navy }}>
              {ev.title}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 0",
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 10,
              }}
            >
              <span>
                <Calendar size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                {ev.date}
              </span>
              <span>
                <Clock size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                {ev.time}
              </span>
              <span>
                <MapPin size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                {ev.location}
              </span>
              <span>
                <Users size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                {ev.joined}/{ev.maxAttendances} joined
              </span>
            </div>
            <ProgressBar joined={ev.joined} max={ev.maxAttendances} />
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <Btn variant="outline" onClick={() => onEdit(ev)}>
                Edit
              </Btn>
              <Btn variant="primary" onClick={() => onView(ev)}>
                View Detail
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar categories */}
      <div
        style={{
          width: 240,
          background: colors.white,
          borderRadius: 16,
          padding: "20px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}
      >
        <h4
          style={{
            margin: "0 0 16px",
            fontSize: 16,
            fontWeight: 700,
            color: colors.textPrimary,
          }}
        >
          Event Categories
        </h4>
        {CATEGORIES.map((c) => {
          const { bg, text } = categoryColor(c);
          return (
            <div
              key={c}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              <span>{c}</span>
              <span
                style={{
                  background: colors.navy,
                  color: colors.white,
                  borderRadius: 9999,
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {categoryCounts[c]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** DETAIL VIEW */
function EventDetail({ event, onBack, onEdit }) {
  const p = pct(event.joined, event.maxAttendances);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: colors.textPrimary,
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Event Detail</h2>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Main content */}
        <div
          style={{
            flex: 1,
            background: colors.white,
            borderRadius: 16,
            padding: "28px 32px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Tag size={20} color={colors.navy} />
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: colors.textPrimary }}>
              {event.title}
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${colors.border}`,
              paddingBottom: 12,
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 15 }}>About this Event</span>
            <button
              onClick={() => onEdit(event)}
              style={{
                background: "none",
                border: "none",
                color: colors.navy,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Edit Details
            </button>
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.7, color: colors.textSecondary, marginBottom: 20 }}>
            {event.description}
          </p>

          {event.highlights.length > 0 && (
            <>
              <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Highlights</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {event.highlights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: 12,
                      padding: "12px 16px",
                      fontSize: 13,
                      color: colors.textPrimary,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkles size={14} color={colors.gold} />
                    {h}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <InfoChip icon={Calendar} label="Date" value={event.date} />
          <InfoChip icon={Clock} label="Time" value={event.time} />
          <InfoChip icon={MapPin} label="Location" value={event.location} />

          <div
            style={{
              background: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: "16px 18px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>Attendance</span>
              <span style={{ color: colors.gold, fontWeight: 600, fontSize: 13 }}>
                {event.joined}/{event.maxAttendances} joined
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: colors.progressTrack,
                borderRadius: 9999,
                overflow: "hidden",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: `${p}%`,
                  height: "100%",
                  background: colors.gold,
                  borderRadius: 9999,
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: colors.textSecondary }}>
              {p}% of capacity reached
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** FORM VIEW (Create / Edit) */
function EventForm({ initial, onSave, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial || {
      title: "",
      date: "",
      category: "",
      time: "",
      maxAttendances: "",
      description: "",
    }
  );
  const [errors, setErrors] = useState({});

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.date.trim()) e.date = "Required";
    if (!form.category) e.category = "Required";
    if (!form.time.trim()) e.time = "Required";
    if (!form.maxAttendances) e.maxAttendances = "Required";
    if (!form.description.trim()) e.description = "Required";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  }

  const inputStyle = (hasErr) => ({
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1.5px solid ${hasErr ? "#ef4444" : colors.border}`,
    fontSize: 14,
    color: colors.textPrimary,
    outline: "none",
    boxSizing: "border-box",
    background: colors.white,
    fontFamily: "inherit",
  });

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: 6,
    display: "block",
  };

  const errStyle = { fontSize: 11, color: "#ef4444", marginTop: 3 };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={onCancel}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: colors.textPrimary }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{isEdit ? "Edit Event" : "Create Event"}</h2>
      </div>

      <div
        style={{
          background: colors.white,
          borderRadius: 16,
          padding: "32px 36px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <Tag size={20} color={colors.navy} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.navy }}>
            Basic Information
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px" }}>
          {/* Event Title */}
          <div>
            <label style={labelStyle}>
              Event Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              style={inputStyle(errors.title)}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Khmer New Year"
            />
            {errors.title && <p style={errStyle}>{errors.title}</p>}
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>
              Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              style={inputStyle(errors.date)}
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              placeholder="DD-MM-YYYY"
            />
            {errors.date && <p style={errStyle}>{errors.date}</p>}
          </div>

          {/* Categories */}
          <div>
            <label style={labelStyle}>
              Categories <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle(errors.category), appearance: "none", paddingRight: 36 }}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: colors.textSecondary,
                }}
              >
                ▾
              </span>
            </div>
            {errors.category && <p style={errStyle}>{errors.category}</p>}
          </div>

          {/* Time */}
          <div>
            <label style={labelStyle}>
              Time <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              style={inputStyle(errors.time)}
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              placeholder="e.g. 9:00 AM"
            />
            {errors.time && <p style={errStyle}>{errors.time}</p>}
          </div>

          {/* Max Attendances */}
          <div>
            <label style={labelStyle}>
              Max Attendances <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              style={inputStyle(errors.maxAttendances)}
              type="number"
              value={form.maxAttendances}
              onChange={(e) => set("maxAttendances", e.target.value)}
              placeholder="e.g. 50"
            />
            {errors.maxAttendances && <p style={errStyle}>{errors.maxAttendances}</p>}
          </div>

          {/* Action buttons placed in grid */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", paddingBottom: 2 }}>
            <Btn variant="primary" onClick={onCancel}>
              Cancel
            </Btn>
            <Btn variant="gold" onClick={handleSubmit}>
              {isEdit ? "Save change" : "Save"}
            </Btn>
          </div>
        </div>

        {/* Description full width */}
        <div style={{ marginTop: 20 }}>
          <label style={labelStyle}>
            Description <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            style={{
              ...inputStyle(errors.description),
              height: 160,
              resize: "vertical",
            }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the event…"
          />
          {errors.description && <p style={errStyle}>{errors.description}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Root component ──────────────────────────────────────────────────────────
export default function EventsPage() {
  const [view, setView] = useState("list"); // "list" | "detail" | "create" | "edit"
  const [events, setEvents] = useState(initialEvents);
  const [selected, setSelected] = useState(null);

  function handleView(ev) { setSelected(ev); setView("detail"); }
  function handleEdit(ev) { setSelected(ev); setView("edit"); }
  function handleCreate() { setSelected(null); setView("create"); }
  function handleBack() { setView("list"); setSelected(null); }

  function handleSave(form) {
    if (view === "edit") {
      setEvents((evs) =>
        evs.map((e) =>
          e.id === selected.id
            ? {
                ...e,
                title: form.title,
                date: form.date,
                category: form.category,
                time: form.time,
                maxAttendances: Number(form.maxAttendances),
                description: form.description,
              }
            : e
        )
      );
    } else {
      setEvents((evs) => [
        ...evs,
        {
          id: Date.now(),
          ...form,
          maxAttendances: Number(form.maxAttendances),
          joined: 0,
          location: "Sieamreap Bannalay",
          highlights: [],
        },
      ]);
    }
    setView("list");
    setSelected(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        padding: "32px 40px",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {view === "list" && (
        <EventList
          events={events}
          onView={handleView}
          onEdit={handleEdit}
          onCreateClick={handleCreate}
        />
      )}
      {view === "detail" && selected && (
        <EventDetail event={selected} onBack={handleBack} onEdit={handleEdit} />
      )}
      {(view === "create" || view === "edit") && (
        <EventForm
          initial={
            view === "edit"
              ? {
                  title: selected.title,
                  date: selected.date,
                  category: selected.category,
                  time: selected.time,
                  maxAttendances: String(selected.maxAttendances),
                  description: selected.description,
                }
              : null
          }
          onSave={handleSave}
          onCancel={handleBack}
        />
      )}
    </div>
  );
  return (
      <div className="flex h-screen overflow-hidden antialiased">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
          {renderPage()}
        </main>
      </div>
    );
}