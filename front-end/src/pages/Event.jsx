import { useState, useRef } from "react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Plus,
  Sparkles,
  ChevronDown,
  Edit2,
  Eye,
  ArrowLeft,
  Check,
  ImagePlus,
  X,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
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
    image: null,
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
    image: null,
    description: "Join us for an engaging discussion with a local author about their latest work and inspiration.",
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
    image: null,
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
    image: null,
    description: "Learn the art of traditional bookbinding in this hands-on workshop.",
    highlights: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function categoryStyle(cat) {
  const map = {
    Discussion: "bg-blue-50 text-blue-700",
    "Special Events": "bg-yellow-50 text-yellow-800",
    Children: "bg-green-50 text-green-700",
    Workshop: "bg-violet-50 text-violet-700",
  };
  return map[cat] || "bg-sky-50 text-sky-700";
}

function pct(joined, max) {
  return Math.round((joined / max) * 100);
}

// ─── Shared components ────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${categoryStyle(category)}`}>
      {category}
    </span>
  );
}

function ProgressBar({ joined, max }) {
  const p = pct(joined, max);
  return (
    <div className="mt-1">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: "#E8C110" }} />
      </div>
      <span className="text-xs text-gray-400 mt-1 block">{p}% full</span>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-dashed border-[#1B4965]/25 rounded-xl p-4 flex items-center gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-[#1B4965]/10 flex items-center justify-center flex-shrink-0">
        <Icon size={17} color="#1B4965" />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</div>
        <div className="text-sm font-bold text-gray-800 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

// ─── Image Upload Field ───────────────────────────────────────────────────────
function ImageUpload({ value, onChange }) {
  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
        Event Image
      </label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: 160 }}>
          <img src={value} alt="Event" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-[#1B4965]/30 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#1B4965]/60 hover:bg-blue-50/30 transition"
          style={{ height: 160 }}
        >
          <div className="w-10 h-10 rounded-xl bg-[#1B4965]/10 flex items-center justify-center">
            <ImagePlus size={20} color="#1B4965" />
          </div>
          <p className="text-xs font-bold text-[#1B4965]">Click or drag to upload</p>
          <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ─── Event Image Placeholder ──────────────────────────────────────────────────
// Shown in list cards and detail when no image has been uploaded yet
function EventImagePlaceholder({ category, height = "h-40" }) {
  const gradients = {
    Discussion: "from-blue-100 to-blue-200",
    "Special Events": "from-yellow-100 to-yellow-200",
    Children: "from-green-100 to-green-200",
    Workshop: "from-violet-100 to-violet-200",
  };
  const icons = {
    Discussion: "💬",
    "Special Events": "🎉",
    Children: "🧒",
    Workshop: "🛠️",
  };
  const grad = gradients[category] || "from-gray-100 to-gray-200";
  const icon = icons[category] || "📌";
  return (
    <div className={`w-full ${height} bg-gradient-to-br ${grad} flex flex-col items-center justify-center gap-2`}>
      <span style={{ fontSize: 36 }}>{icon}</span>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{category}</span>
    </div>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function EventList({ events, onView, onEdit, onCreateClick }) {
  const categoryCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = events.filter((e) => e.category === c).length;
    return acc;
  }, {});

  return (
    // Outer wrapper: full viewport height minus navbar, overflow hidden so
    // only the event cards column scrolls independently.
    <div className="flex gap-5 items-start" style={{ height: "calc(100vh - 130px)" }}>

      {/* ── Scrollable main column ── */}
      <div className="flex-1 overflow-y-auto pr-1" style={{ height: "100%" }}>
        {/* Event cards */}
        {events.map((ev) => (
          <div key={ev.id} className="bg-white rounded-xl border border-dashed border-[#1B4965]/25 shadow-sm mb-4 overflow-hidden">
            {/* Image / placeholder */}
            {ev.image ? (
              <div className="w-full h-40 overflow-hidden">
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <EventImagePlaceholder category={ev.category} height="h-40" />
            )}

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <CategoryBadge category={ev.category} />
                  <h3 className="text-lg font-bold text-[#1B4965] mt-2">{ev.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button
                    onClick={() => onEdit(ev)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#1B4965] border border-[#1B4965]/30 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => onView(ev)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition"
                    style={{ background: "#1B4965" }}
                  >
                    <Eye size={12} /> View Detail
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-1.5 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" />{ev.date}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} className="text-gray-400" />{ev.time}</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" />{ev.location}</span>
                <span className="flex items-center gap-1.5"><Users size={13} className="text-gray-400" />{ev.joined}/{ev.maxAttendances} joined</span>
              </div>

              <ProgressBar joined={ev.joined} max={ev.maxAttendances} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Sticky sidebar (never scrolls) ── */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-4" style={{ position: "sticky", top: 0, height: "fit-content" }}>
        {/* Create Event button */}
        <button
          onClick={onCreateClick}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-3 rounded-xl transition shadow-sm"
          style={{ backgroundColor: "#E8C110", color: "#1B4965" }}
        >
          <Plus size={16} /> Create Event
        </button>

        {/* Categories panel */}
        <div className="bg-[#1B4965] rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">Event Categories</p>
          {CATEGORIES.map((c) => (
            <div key={c} className="flex items-center justify-between mb-3 last:mb-0">
              <span className="text-sm text-white/80 font-medium">{c}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#E8C110", color: "#1B4965" }}
              >
                {categoryCounts[c]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL VIEW ──────────────────────────────────────────────────────────────
function EventDetail({ event, onBack, onEdit }) {
  const p = pct(event.joined, event.maxAttendances);
  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-6 py-4 mb-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-gray-200">|</span>
          <CategoryBadge category={event.category} />
          <span className="text-sm font-bold text-[#1B4965]">{event.title}</span>
        </div>
        <button
          onClick={() => onEdit(event)}
          className="flex items-center gap-1.5 text-sm font-bold text-[#1B4965] border border-[#1B4965]/30 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
        >
          <Edit2 size={13} /> Edit Details
        </button>
      </div>

      <div className="flex gap-5 items-start">
        {/* Main content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Image / placeholder hero */}
          {event.image ? (
            <div className="w-full h-56 overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <EventImagePlaceholder category={event.category} height="h-56" />
          )}

          <div className="bg-[#1B4965] px-6 py-4 flex items-center gap-2">
            <Tag size={16} className="text-[#E8C110]" />
            <span className="text-white font-bold text-sm">Event Details</span>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#1B4965] mb-4">{event.title}</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">About this Event</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{event.description}</p>
            {event.highlights.length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Highlights</p>
                <div className="grid grid-cols-2 gap-3">
                  {event.highlights.map((h, i) => (
                    <div key={i} className="border border-dashed border-[#1B4965]/25 rounded-xl px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
                      <Sparkles size={13} style={{ color: "#E8C110", flexShrink: 0 }} />
                      {h}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info sidebar — sticky */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-3" style={{ position: "sticky", top: 0 }}>
          <InfoChip icon={Calendar} label="Date" value={event.date} />
          <InfoChip icon={Clock} label="Time" value={event.time} />
          <InfoChip icon={MapPin} label="Location" value={event.location} />
          <div className="bg-[#1B4965] rounded-xl p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Attendance</p>
            <p className="text-2xl font-bold text-white">
              {event.joined}
              <span className="text-sm text-white/60 font-medium">/{event.maxAttendances}</span>
            </p>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden my-2">
              <div className="h-full rounded-full" style={{ width: `${p}%`, background: "#E8C110" }} />
            </div>
            <p className="text-xs text-white/60">{p}% of capacity reached</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FORM VIEW ────────────────────────────────────────────────────────────────
function EventForm({ initial, onSave, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial || { title: "", date: "", category: "", time: "", maxAttendances: "", description: "", image: null }
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

  const inputCls = (err) =>
    `w-full border ${err ? "border-red-400" : "border-gray-200"} rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition`;

  const labelCls = "text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block";

  return (
    // Same height trick as list view so sidebar stays fixed
    <div className="flex gap-5 items-start" style={{ height: "calc(100vh - 180px)" }}>

      {/* ── Scrollable main form ── */}
      <div className="flex-1 overflow-y-auto pr-1" style={{ height: "100%" }}>
        {/* Action bar */}
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-6 py-4 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition">
              <ArrowLeft size={16} /> Back
            </button>
            <span className="text-gray-200">|</span>
            <span className="text-sm font-bold text-[#1B4965]">{isEdit ? "Edit Event" : "Create New Event"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="text-sm font-bold text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg transition shadow-sm"
              style={{ background: "#1B4965", color: "#fff" }}
            >
              <Check size={14} /> {isEdit ? "Save Changes" : "Save Event"}
            </button>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#1B4965] px-6 py-4 flex items-center gap-2">
            <Tag size={16} className="text-[#E8C110]" />
            <span className="text-white font-bold text-sm">Basic Information</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-5">
              <div>
                <label className={labelCls}>Event Title <span className="text-red-400">*</span></label>
                <input className={inputCls(errors.title)} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Khmer New Year" />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className={labelCls}>Date <span className="text-red-400">*</span></label>
                <input className={inputCls(errors.date)} value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="DD-MM-YYYY" />
                {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select className={`${inputCls(errors.category)} appearance-none pr-8`} value={form.category} onChange={(e) => set("category", e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className={labelCls}>Time <span className="text-red-400">*</span></label>
                <input className={inputCls(errors.time)} value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="e.g. 9:00 AM" />
                {errors.time && <p className="text-xs text-red-400 mt-1">{errors.time}</p>}
              </div>
              <div>
                <label className={labelCls}>Max Attendances <span className="text-red-400">*</span></label>
                <input type="number" className={inputCls(errors.maxAttendances)} value={form.maxAttendances} onChange={(e) => set("maxAttendances", e.target.value)} placeholder="e.g. 50" />
                {errors.maxAttendances && <p className="text-xs text-red-400 mt-1">{errors.maxAttendances}</p>}
              </div>
            </div>
            <div>
              <label className={labelCls}>Description <span className="text-red-400">*</span></label>
              <textarea
                rows={5}
                className={`${inputCls(errors.description)} resize-none leading-relaxed`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the event…"
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky right sidebar ── */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-4" style={{ position: "sticky", top: 0, height: "fit-content" }}>
        {/* Categories — also acts as selector */}
        <div className="bg-[#1B4965] rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">Event Categories</p>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => set("category", c)}
              className={`w-full flex items-center justify-between mb-2 last:mb-0 px-3 py-2 rounded-lg text-sm font-medium transition ${
                form.category === c
                  ? "font-bold"
                  : "text-white/80 hover:bg-white/10"
              }`}
              style={form.category === c ? { background: "#E8C110", color: "#1B4965" } : {}}
            >
              <span>{c}</span>
              {form.category === c && <Check size={13} />}
            </button>
          ))}
          {errors.category && <p className="text-xs text-red-300 mt-2">{errors.category}</p>}
        </div>

        {/* Image upload */}
        <div className="bg-white rounded-xl border border-dashed border-[#1B4965]/25 shadow-sm p-4">
          <ImageUpload value={form.image} onChange={(v) => set("image", v)} />
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const [view, setView] = useState("list");
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
            ? { ...e, title: form.title, date: form.date, category: form.category, time: form.time, maxAttendances: Number(form.maxAttendances), description: form.description, image: form.image }
            : e
        )
      );
    } else {
      setEvents((evs) => [
        ...evs,
        { id: Date.now(), ...form, maxAttendances: Number(form.maxAttendances), joined: 0, location: "Sieamreap Bannalay", highlights: [] },
      ]);
    }
    setView("list");
    setSelected(null);
  }

  const getBreadcrumb = () => {
    if (view === "list") return "Welcome Back!";
    if (view === "detail") return "Events › Details";
    if (view === "create") return "Events › Create New Event";
    if (view === "edit") return "Events › Edit Event Details";
    return "Welcome Back!";
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Events" breadcrumb={getBreadcrumb()} />
        <div className="px-8 py-6">
          

          {view === "list" && (
            <EventList events={events} onView={handleView} onEdit={handleEdit} onCreateClick={handleCreate} />
          )}
          {view === "detail" && selected && (
            <EventDetail event={selected} onBack={handleBack} onEdit={handleEdit} />
          )}
          {(view === "create" || view === "edit") && (
            <EventForm
              initial={
                view === "edit"
                  ? { title: selected.title, date: selected.date, category: selected.category, time: selected.time, maxAttendances: String(selected.maxAttendances), description: selected.description, image: selected.image || null }
                  : null
              }
              onSave={handleSave}
              onCancel={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  );
}