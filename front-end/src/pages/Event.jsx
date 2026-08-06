import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import api, { ASSET_BASE_URL } from "../utils/api";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Plus,
  ChevronDown,
  Edit2,
  Eye,
  ArrowLeft,
  Check,
  ImagePlus,
  X,
  AlertCircle,
} from "lucide-react";

// ─── Category display <-> backend enum mapping ───────────────────────────────
const CATEGORIES = ["Discussion", "Special Events", "Children", "Workshop"];
const CATEGORY_DISPLAY = {
  discussion: "Discussion",
  special: "Special Events",
  children: "Children",
  workshop: "Workshop",
};
const CATEGORY_VALUE = {
  Discussion: "discussion",
  "Special Events": "special",
  Children: "children",
  Workshop: "workshop",
};

// Fallback shown only for events saved before the `location` column existed
// (or where an admin left it blank) — new/edited events always carry their
// own real location now.
const DEFAULT_LOCATION = "Siem Reap Bannalay Library";

const cardShadow = { boxShadow: "0 2px 12px rgba(0,0,0,0.12)" };

// ─── Date/time helpers ────────────────────────────────────────────────────────
// event_date/event_time come back as ISO strings anchored at UTC midnight /
// 1970-01-01. Slicing the string directly (rather than using Date getters,
// which apply the browser's local timezone) avoids any off-by-one-hour or
// off-by-one-day shift.
function toDateInputValue(iso) {
  return iso ? String(iso).slice(0, 10) : "";
}
function formatDateOnly(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}
function toTimeInputValue(iso) {
  return iso ? String(iso).slice(11, 16) : "";
}
function formatTimeOnly(iso) {
  if (!iso) return "";
  const [h, m] = String(iso).slice(11, 16).split(":").map(Number);
  return new Date(1970, 0, 1, h, m).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function mapEvent(e) {
  return {
    id: e.event_id,
    title: e.event_title,
    category: CATEGORY_DISPLAY[e.event_category] || e.event_category,
    date: formatDateOnly(e.event_date),
    dateValue: toDateInputValue(e.event_date),
    time: formatTimeOnly(e.event_time),
    timeValue: toTimeInputValue(e.event_time),
    maxAttendance: e.max_attendance,
    description: e.description || "",
    image: e.event_image_url ? `${ASSET_BASE_URL}${e.event_image_url}` : null,
    location: e.location || DEFAULT_LOCATION,
  };
}

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

// ─── Shared components ────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${categoryStyle(category)}`}>
      {category}
    </span>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-gray-300 rounded-xl p-4 flex items-center gap-3" style={cardShadow}>
      <div className="w-10 h-10 rounded-lg bg-[#1B4965]/10 flex items-center justify-center flex-shrink-0">
        <Icon size={17} color="#1B4965" />
      </div>
      <div>
        <div className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-bold text-gray-800 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function EventImageDisplay({ image, category, height = "h-40" }) {
  if (image) {
    return (
      <div className={`w-full ${height} bg-gray-50 flex items-center justify-center overflow-hidden`}>
        <img src={image} alt={category} className="max-w-full max-h-full w-auto h-auto object-contain" />
      </div>
    );
  }
  return <EventImagePlaceholder category={category} height={height} />;
}

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

// ─── Image Upload Field ───────────────────────────────────────────────────────
function ImageUpload({ value, onSelect, onRemove }) {
  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }
    onSelect(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
        Event Image
      </label>
      {value ? (
        <div
          className="relative rounded-xl overflow-hidden border-2 border-gray-300 bg-white flex items-center justify-center"
          style={{ height: 160, ...cardShadow }}
        >
          <img src={value} alt="Event" className="max-w-full max-h-full w-auto h-auto object-contain" />
          <button
            onClick={onRemove}
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
          className="border-2 border-dashed border-gray-300 bg-white rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#055E83] hover:bg-slate-50/50 transition duration-200"
          style={{ height: 160, ...cardShadow }}
        >
          <div className="w-10 h-10 rounded-xl bg-[#1B4965]/10 flex items-center justify-center">
            <ImagePlus size={20} color="#1B4965" />
          </div>
          <p className="text-xs font-bold text-[#1B4965]">Click or drag to upload</p>
          <p className="text-xs text-gray-400">PNG, JPG, WEBP · Max 5MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function EventList({ events, loading, onView, onEdit, onCreateClick }) {
  const categoryCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = events.filter((e) => e.category === c).length;
    return acc;
  }, {});

  return (
    <div className="flex gap-5 items-start" style={{ height: "calc(100vh - 130px)" }}>

      <div className="flex-1 overflow-y-auto pr-1" style={{ height: "100%" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-10 text-center text-gray-400 text-sm font-medium">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="col-span-full p-10 text-center text-gray-400 text-sm font-medium">No events yet — create one to get started.</div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="bg-white rounded-xl border border-gray-300 overflow-hidden" style={cardShadow}>
                <EventImageDisplay image={ev.image} category={ev.category} height="h-40" />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <CategoryBadge category={ev.category} />
                      <h3 className="text-lg font-bold text-[#1B4965] mt-2">{ev.title}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-1.5 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" />{ev.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} className="text-gray-400" />{ev.time}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" />{ev.location}</span>
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-gray-400" />
                      {ev.maxAttendance != null ? `Capacity: ${ev.maxAttendance}` : "No capacity limit"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => onEdit(ev)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-[#1B4965] border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => onView(ev)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition"
                      style={{ background: "#055E83" }}
                    >
                      <Eye size={12} /> View Detail
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-56 flex-shrink-0 flex flex-col gap-4" style={{ position: "sticky", top: 0, height: "fit-content" }}>
        <button
          onClick={onCreateClick}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-3 rounded-xl transition"
          style={{ backgroundColor: "#E8C110", color: "#055E83", ...cardShadow }}
        >
          <Plus size={16} /> Create Event
        </button>

        <div className="bg-[#055E83] rounded-xl p-5" style={cardShadow}>
          <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">Event Categories</p>
          {CATEGORIES.map((c) => (
            <div key={c} className="flex items-center justify-between mb-3 last:mb-0">
              <span className="text-sm text-white/80 font-medium">{c}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#E8C110", color: "#055E83" }}
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
  return (
    <div>
      <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-6 py-4 mb-5" style={cardShadow}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-gray-200">|</span>
          <CategoryBadge category={event.category} />
          <span className="text-sm font-bold text-[#055E83]">{event.title}</span>
        </div>
        <button
          onClick={() => onEdit(event)}
          className="flex items-center gap-1.5 text-sm font-bold text-[#055E83] border border-gray-300 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
        >
          <Edit2 size={13} /> Edit Details
        </button>
      </div>

      <div className="flex gap-5 items-start">
        <div className="flex-1 bg-white rounded-xl border border-gray-300 overflow-hidden" style={cardShadow}>
          <EventImageDisplay image={event.image} category={event.category} height="h-56" />

          <div className="bg-[#055E83] px-6 py-4 flex items-center gap-2">
            <Tag size={16} className="text-[#E8C110]" />
            <span className="text-white font-bold text-sm">Event Details</span>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#055E83] mb-4">{event.title}</h2>
            <p className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">About this Event</p>
            <p className="text-sm text-gray-600 leading-relaxed">{event.description || "No description available."}</p>
          </div>
        </div>

        <div className="w-64 flex-shrink-0 flex flex-col gap-3" style={{ position: "sticky", top: 0 }}>
          <InfoChip icon={Calendar} label="Date" value={event.date} />
          <InfoChip icon={Clock} label="Time" value={event.time} />
          <InfoChip icon={MapPin} label="Location" value={event.location} />
          <div className="bg-[#055E83] rounded-xl p-5" style={cardShadow}>
            <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Capacity</p>
            <p className="text-2xl font-bold text-white">
              {event.maxAttendance != null ? event.maxAttendance : "No limit"}
            </p>
            {event.maxAttendance != null && <p className="text-xs text-white/60 mt-1">maximum attendees</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FORM VIEW ────────────────────────────────────────────────────────────────
function EventForm({ initial, existingImageUrl, onSave, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial || { title: "", date: "", category: "", time: "", maxAttendances: "", description: "", location: "" }
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(existingImageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleImageSelect(file) {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function handleImageRemove() {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setRemoveImage(true);
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.date.trim()) e.date = "Required";
    if (!form.category) e.category = "Required";
    if (!form.time.trim()) e.time = "Required";
    if (!form.location.trim()) e.location = "Required";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitError("");
    try {
      setSubmitting(true);
      await onSave({ form, imageFile, removeImage });
    } catch (err) {
      console.error("Failed to save event:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setSubmitError(backendMessage || "Failed to save the event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = (err) =>
    `w-full border-2 ${
      err ? "border-red-500" : "border-gray-300 focus:border-[#055E83]"
    } rounded-lg px-3 py-2.5 text-sm outline-none transition text-slate-900 bg-white placeholder-slate-400`;

  const labelCls = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="flex gap-5 items-start" style={{ height: "calc(100vh - 180px)" }}>

      <div className="flex-1 overflow-y-auto pr-1" style={{ height: "100%" }}>
        <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-6 py-4 mb-5" style={cardShadow}>
          <div className="flex items-center gap-3">
            <button onClick={onCancel} disabled={submitting} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition">
              <ArrowLeft size={16} /> Back
            </button>
            <span className="text-gray-200">|</span>
            <span className="text-sm font-bold text-[#055E83]">{isEdit ? "Edit Event" : "Create New Event"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} disabled={submitting} className="text-sm font-bold text-gray-500 border border-gray-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition disabled:opacity-60">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg transition disabled:opacity-60"
              style={{ background: "#055E83", color: "#fff" }}
            >
              <Check size={14} /> {submitting ? "Saving..." : isEdit ? "Save Changes" : "Save Event"}
            </button>
          </div>
        </div>

        {submitError && (
          <div className="flex items-start gap-2.5 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden" style={cardShadow}>
          <div className="bg-[#055E83] px-6 py-4 flex items-center gap-2">
            <Tag size={16} className="text-[#E8C110]" />
            <span className="text-white font-bold text-sm">Basic Information</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-5">
              <div>
                <label className={labelCls}>Event Title <span className="text-red-500">*</span></label>
                <input className={inputCls(errors.title)} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Khmer New Year" />
                {errors.title && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.title}</p>}
              </div>
              <div>
                <label className={labelCls}>Date <span className="text-red-500">*</span></label>
                <input type="date" className={inputCls(errors.date)} value={form.date} onChange={(e) => set("date", e.target.value)} />
                {errors.date && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.date}</p>}
              </div>
              <div>
                <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className={`${inputCls(errors.category)} appearance-none pr-8`} value={form.category} onChange={(e) => set("category", e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                {errors.category && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.category}</p>}
              </div>
              <div>
                <label className={labelCls}>Time <span className="text-red-500">*</span></label>
                <input type="time" className={inputCls(errors.time)} value={form.time} onChange={(e) => set("time", e.target.value)} />
                {errors.time && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.time}</p>}
              </div>
              <div>
                <label className={labelCls}>Location <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    className={`${inputCls(errors.location)} pl-9`}
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="e.g. Siem Reap Bannalay Library"
                  />
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {errors.location && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.location}</p>}
              </div>
              <div>
                <label className={labelCls}>Max Attendances</label>
                <input type="number" min="0" className={inputCls(errors.maxAttendances)} value={form.maxAttendances} onChange={(e) => set("maxAttendances", e.target.value)} placeholder="Leave blank for no limit" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                rows={5}
                className={`${inputCls(errors.description)} resize-none leading-relaxed`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the event…"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-56 flex-shrink-0 flex flex-col gap-4" style={{ position: "sticky", top: 0, height: "fit-content" }}>
        <div className="bg-[#055E83] rounded-xl p-5" style={cardShadow}>
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
              style={form.category === c ? { background: "#E8C110", color: "#055E83" } : {}}
            >
              <span>{c}</span>
              {form.category === c && <Check size={13} />}
            </button>
          ))}
          {errors.category && <p className="text-xs text-red-300 mt-2 font-semibold">{errors.category}</p>}
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-4" style={cardShadow}>
          <ImageUpload value={imagePreviewUrl} onSelect={handleImageSelect} onRemove={handleImageRemove} />
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const [view, setView] = useState("list");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // limit=200 stands in for "fetch everything" so the category-count
      // sidebar reflects all events, not just one page. Same tradeoff as
      // Member.jsx's limit=500 — move to server-side counts if this grows.
      const response = await api.get("/events?limit=200");
      if (response.data?.success) setEvents(response.data.data.map(mapEvent));
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  function handleView(ev) { setSelected(ev); setView("detail"); }
  function handleEdit(ev) { setSelected(ev); setView("edit"); }
  function handleCreate() { setSelected(null); setView("create"); }
  function handleBack() { setView("list"); setSelected(null); }

  async function handleSave({ form, imageFile, removeImage }) {
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("category", CATEGORY_VALUE[form.category] || form.category);
    formData.append("description", form.description.trim());
    formData.append("date", form.date);
    formData.append("time", form.time);
    formData.append("location", form.location.trim());
    formData.append("maxAttendance", form.maxAttendances || "");
    if (imageFile) formData.append("eventImage", imageFile);
    if (view === "edit" && removeImage) formData.append("removeImage", "true");

    if (view === "edit") {
      await api.put(`/events/${selected.id}`, formData);
    } else {
      await api.post("/events", formData);
    }
    await fetchEvents();
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
    <div className="flex-1 bg-[#E9EEF4]">
        <Navbar title="Events" breadcrumb={getBreadcrumb()} />
        <div className="px-8 py-6">
          {view === "list" && (
            <EventList events={events} loading={loading} onView={handleView} onEdit={handleEdit} onCreateClick={handleCreate} />
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
                      date: selected.dateValue,
                      category: selected.category,
                      time: selected.timeValue,
                      maxAttendances: selected.maxAttendance != null ? String(selected.maxAttendance) : "",
                      description: selected.description,
                      location: selected.location || "",
                    }
                  : null
              }
              existingImageUrl={view === "edit" ? selected.image : null}
              onSave={handleSave}
              onCancel={handleBack}
            />
          )}
        </div>
    </div>
  );
}