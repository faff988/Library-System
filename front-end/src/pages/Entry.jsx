import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users, Building2, LogOut, UserPlus, Plus, Search, Calendar,
  ChevronLeft, ChevronRight, User, Phone, Info, X, Check, AlertCircle, Loader2,
  Edit3, Trash2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const VISIT_PURPOSES = ["Research", "Study", "Reading", "Event", "Other"];

const purposeStyle = {
  Research: { bg: "#E7F1F7", text: "#055E83" },
  Study:    { bg: "#FEF6E0", text: "#B78103" },
  Reading:  { bg: "#E8F5E9", text: "#2E7D32" },
  Event:    { bg: "#FCE7F3", text: "#9D174D" },
  Other:    { bg: "#F1F5F9", text: "#475569" },
};

const tableGridStyle = {
  display: "grid",
  gridTemplateColumns: "130px 1.6fr 110px 110px 100px 110px 150px",
  alignItems: "center",
  gap: "1rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

const Label = ({ children }) => (
  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
    {children}
  </label>
);

const inputWithIconCls = "w-full border-2 border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#055E83] transition";
const readOnlyWithIconCls = "w-full border-2 border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-500 cursor-not-allowed";

const getInitials = (name) => (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#FEE2E2", text: "#991B1B" },
];

const getAvatarColor = (name) => AVATAR_COLORS[(name || "?").charCodeAt(0) % AVATAR_COLORS.length];

function formatDate(d) {
  return d ? new Date(d).toISOString().split("T")[0] : "—";
}
function formatTime(d) {
  return d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}
function computeAge(dob) {
  if (!dob) return "";
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function mapEntry(row) {
  return {
    id: `#ATT-${row.entry_id}`,
    entryId: row.entry_id,
    member_name: row.attendee_name,
    age: row.age,
    dob: row.age != null ? `Age ${row.age}` : "—",
    address: row.address,
    phone: row.phone_number,
    date: formatDate(row.entry_time),
    check_in: formatTime(row.entry_time),
    purpose: row.purpose || null,
  };
}

// ─── Delete confirmation ─────────────────────────────────────────────────
function DeleteModal({ entry, deleting, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden border-2 border-gray-400">
        <div className="bg-red-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Delete Entry</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition"><X size={18} /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 font-medium">
            Are you sure you want to delete the entry for{" "}
            <span className="font-bold text-gray-800">{entry.member_name}</span> ({entry.id})? This action cannot be undone.
          </p>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition">Cancel</button>
          <button disabled={deleting} onClick={onConfirm} className="flex items-center gap-2 bg-red-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-red-600 transition shadow-sm disabled:opacity-60">
            <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EntryList ───────────────────────────────────────────────────────────
function EntryList({ data, loading, onAdd, onEdit, onDelete }) {
  const [search, setSearch]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const liveStats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const totalToday = data.filter((a) => a.date === todayStr).length;
    return [
      { label: "Total Visitors Today", value: String(totalToday), sub: "logged today", subColor: "#16A34A", border: "#055E83", icon: Users,    iconBg: "#E7F1F7", iconColor: "#055E83" },
      { label: "Total Records",        value: String(data.length), sub: "all-time entries", subColor: "#B78103", border: "#E8C110", icon: Building2, iconBg: "#FEF6E0", iconColor: "#B78103" },
      { label: "With Known Purpose",   value: String(data.filter((a) => a.purpose).length), sub: "purpose recorded", subColor: "#71717A", border: "#1B4965", icon: LogOut,    iconBg: "#E7F1F7", iconColor: "#055E83" },
      { label: "New Visitors",         value: String(totalToday), sub: "checked in today", subColor: "#DF4A4A", border: "#DF4A4A", icon: UserPlus,  iconBg: "#FDEAEA", iconColor: "#DF4A4A" },
    ];
  }, [data]);

  const filtered = data.filter(
    (a) => search === "" || `${a.member_name} ${a.id}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages    = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const paginatedData = filtered.slice((currentPageClamped - 1) * itemsPerPage, currentPageClamped * itemsPerPage);

  return (
    <div>
      <Navbar title="Entry" breadcrumb="Welcome back, Admin!" />
      <div className="px-6 py-5 space-y-4">

        <div className="grid grid-cols-4 gap-3">
          {liveStats.map(({ label, value, sub, subColor, border, icon: Icon, iconBg, iconColor }) => (
            <div
              key={label}
              className="bg-white rounded-xl px-5 py-4 flex items-start justify-between"
              style={{ borderTop: `3px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
            >
              <div>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-bold leading-tight text-gray-800">{value}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: subColor }}>{sub}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>
                <Icon size={18} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 w-72">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search member ID or name..."
              className="text-xs outline-none w-full bg-transparent text-gray-600"
            />
          </div>
          <p className="ml-auto text-xs text-gray-400">Showing {filtered.length} entries</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-300" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)", overflow: "hidden" }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#055E83" }}>
            <h2 className="text-white font-bold text-sm">Attendance History</h2>
            <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition" style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
              <Plus size={13} /> New Entry
            </button>
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <div style={{ minWidth: "960px" }}>
              <div style={{ ...tableGridStyle, paddingTop: "0.75rem", paddingBottom: "0.75rem" }} className="border-b border-gray-300 bg-gray-50/70 text-xs font-bold uppercase tracking-wider">
                <span style={{ color: "#055E83" }}>Attendance ID</span>
                <span style={{ color: "#055E83" }}>Member</span>
                <span style={{ color: "#055E83" }}>Age</span>
                <span style={{ color: "#055E83" }}>Date</span>
                <span style={{ color: "#055E83" }}>Check-In</span>
                <span style={{ color: "#055E83", textAlign: "center" }}>Purpose</span>
                <span style={{ color: "#055E83", textAlign: "center" }}>Actions</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading attendance records...</div>
              ) : paginatedData.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">No attendance records match your filter criteria.</div>
              ) : (
                paginatedData.map((a) => {
                  const avatarColor = getAvatarColor(a.member_name);
                  return (
                    <div key={a.id} style={{ ...tableGridStyle, paddingTop: "0.875rem", paddingBottom: "0.875rem" }} className="border-b border-gray-200 hover:bg-slate-50/60 transition">
                      <span className="text-[11px] font-bold tracking-wide" style={{ color: "#055E83" }}>{a.id}</span>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>
                          {getInitials(a.member_name)}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{a.member_name}</p>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{a.dob}</span>
                      <span className="text-xs font-medium text-gray-600">{a.date}</span>
                      <span className="text-xs font-semibold text-gray-700">{a.check_in}</span>
                      <div style={{ textAlign: "center" }}>
                        {a.purpose ? (
                          <span
                            className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md uppercase"
                            style={{ backgroundColor: purposeStyle[a.purpose]?.bg, color: purposeStyle[a.purpose]?.text, minWidth: "90px" }}
                          >
                            {a.purpose}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(a)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                          style={{ backgroundColor: "#E8C110", color: "#055E83" }}
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => onDelete(a)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm bg-red-50 text-red-500 border border-red-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 pt-2">
            <button disabled={currentPageClamped === 1} onClick={() => setCurrentPage((p) => p - 1)} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"><ChevronLeft size={14} /></button>
            <span className="text-xs text-gray-500 font-medium px-2">Page {currentPageClamped} of {totalPages}</span>
            <button disabled={currentPageClamped === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AddEntry (also used for editing when `entry` is passed) ─────────────
function AddEntry({ entry, onCancel, onSave }) {
  const isEdit = Boolean(entry);

  const [isMemberMode, setIsMemberMode] = useState(false); // ON = search existing member, OFF = manual walk-in
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [form, setForm] = useState(() =>
    isEdit
      ? {
          fullName: entry.member_name || "",
          age: entry.age != null ? String(entry.age) : "",
          phone: entry.phone || "",
          purpose: entry.purpose || "",
        }
      : { fullName: "", age: "", phone: "", purpose: "" }
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // Live member search while in member mode and nothing selected yet
  useEffect(() => {
    if (!isMemberMode || selectedMember) { setMemberResults([]); return; }
    const query = memberQuery.trim();
    if (query.length < 2) { setMemberResults([]); return; }

    const timer = setTimeout(async () => {
      try {
        setSearchingMembers(true);
        const response = await api.get(`/members?search=${encodeURIComponent(query)}&limit=8`);
        if (response.data?.success) setMemberResults(response.data.data);
      } catch (err) {
        console.error("Member search failed:", err);
        setMemberResults([]);
      } finally {
        setSearchingMembers(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [memberQuery, isMemberMode, selectedMember]);

  const handleToggleMode = () => {
    setIsMemberMode((v) => !v);
    setSelectedMember(null);
    setMemberQuery("");
    setMemberResults([]);
    setForm({ fullName: "", age: "", phone: "", purpose: "" });
    setError("");
  };

  const handleSelectMember = (m) => {
    setSelectedMember(m);
    setMemberQuery(m.full_name);
    setMemberResults([]);
    setForm((f) => ({
      ...f,
      fullName: m.full_name,
      age: String(computeAge(m.date_of_birth)),
      phone: m.phone_number || "",
    }));
  };

  const handleClearSelectedMember = () => {
    setSelectedMember(null);
    setMemberQuery("");
    setForm((f) => ({ ...f, fullName: "", age: "", phone: "" }));
  };

  const clearForm = () => {
    setForm(
      isEdit
        ? { fullName: entry.member_name || "", age: entry.age != null ? String(entry.age) : "", phone: entry.phone || "", purpose: entry.purpose || "" }
        : { fullName: "", age: "", phone: "", purpose: "" }
    );
    setMemberQuery("");
    setSelectedMember(null);
    setMemberResults([]);
    setError("");
  };

  const handleSave = async () => {
    if (isMemberMode && !selectedMember) {
      setError("Please search for and select a member.");
      return;
    }
    if (!form.fullName.trim() || !form.purpose) {
      setError("Full name and visit purpose are required.");
      return;
    }
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 0) {
      setError("A valid age is required.");
      return;
    }
    setError("");
    try {
      setSaving(true);
      const payload = {
        attendeeName: form.fullName.trim(),
        age: Number(form.age),
        phoneNumber: form.phone,
        purpose: form.purpose,
      };
      if (isEdit) {
        await api.put(`/library-entries/${entry.entryId}`, payload);
      } else {
        await api.post("/library-entries", payload);
      }
      onSave();
    } catch (err) {
      console.error("Failed to save entry:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setError(backendMessage || "Failed to save the entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar title="Entry" breadcrumb={isEdit ? "Entry > Edit Entry" : "Entry > Add Entry"} onBack={onCancel} />
      <div className="px-14 py-10 max-w-5xl mx-auto space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-[#055E83]">{isEdit ? "Edit Entry" : "Add Entry"}</h2>
          <p className="text-sm text-gray-400">
            {isEdit
              ? `Update the details for ${entry.id}.`
              : "Log a new visitor or member check-in to the attendance record."}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-400 overflow-hidden shadow-md">
          <div className="p-6 space-y-6">

            {/* MEMBER TOGGLE BANNER (new entries only) */}
            {!isEdit && (
              <div
                onClick={handleToggleMode}
                className="flex items-center gap-3 rounded-xl border border-[#DCEAF3] bg-[#EEF6FB] px-4 py-3 cursor-pointer select-none"
              >
                <button
                  type="button"
                  className={`relative w-9 h-5 rounded-full transition shrink-0 ${isMemberMode ? "bg-[#055E83]" : "bg-gray-400"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${isMemberMode ? "left-4" : "left-0.5"}`} />
                </button>
                <p className="text-xs font-bold text-[#055E83]">
                  {isMemberMode ? "Existing Member — search to autofill" : "Walk-in Visitor — enter details manually"}
                </p>
                <Info size={13} className="text-[#055E83]/60" />
              </div>
            )}

            {isMemberMode && !isEdit ? (
              <>
                {/* MEMBER SEARCH MODE */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#055E83] text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <h3 className="text-sm font-bold text-gray-800">Member Search</h3>
                  </div>
                  <div className="relative">
                    <Label>Member Name or Phone Number</Label>
                    <div className="relative">
                      {searchingMembers ? (
                        <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                      ) : (
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      )}
                      <input
                        value={memberQuery}
                        onChange={(e) => { setMemberQuery(e.target.value); setSelectedMember(null); }}
                        placeholder="Type at least 2 characters to search..."
                        className={inputWithIconCls}
                      />
                    </div>

                    {memberResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                        {memberResults.map((m) => (
                          <button
                            key={m.member_id}
                            type="button"
                            onClick={() => handleSelectMember(m)}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#EEF6FB] transition border-b border-gray-100 last:border-0"
                          >
                            <p className="text-sm font-semibold text-gray-800">{m.full_name}</p>
                            <p className="text-xs text-gray-400">{m.phone_number || "No phone on file"}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {!searchingMembers && memberQuery.trim().length >= 2 && memberResults.length === 0 && !selectedMember && (
                      <p className="text-[11px] text-gray-400 mt-1.5">No matching members found.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-300" />

                {/* AUTOFILLED INFO */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#055E83] text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                    <h3 className="text-sm font-bold text-gray-800">Attendee Information</h3>
                    {selectedMember && (
                      <button type="button" onClick={handleClearSelectedMember} className="ml-auto text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
                        <X size={12} /> Clear selection
                      </button>
                    )}
                  </div>

                  {selectedMember ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={form.fullName} readOnly className={readOnlyWithIconCls} />
                        </div>
                      </div>
                      <div>
                        <Label>Age (from date of birth)</Label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={form.age} readOnly className={readOnlyWithIconCls} />
                        </div>
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={form.phone} readOnly className={readOnlyWithIconCls} />
                        </div>
                      </div>
                      <div>
                        <Label>Visit Purpose</Label>
                        <div className="relative">
                          <Info size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <select value={form.purpose} onChange={updateField("purpose")} className={`${inputWithIconCls} appearance-none cursor-pointer`}>
                            <option value="">Select visit purpose</option>
                            {VISIT_PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <p className="text-sm text-gray-400">Search and select a member above to autofill their details.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* MANUAL ENTRY MODE (also used for editing) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#055E83] text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <h3 className="text-sm font-bold text-gray-800">Attendee Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={form.fullName} onChange={updateField("fullName")} placeholder="Full Name" className={inputWithIconCls} />
                      </div>
                    </div>
                    <div>
                      <Label>Age</Label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="number" min="0" value={form.age} onChange={updateField("age")} placeholder="Enter age" className={inputWithIconCls} />
                      </div>
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={form.phone} onChange={updateField("phone")} placeholder="Phone Number" className={inputWithIconCls} />
                      </div>
                    </div>
                    <div>
                      <Label>Visit Purpose</Label>
                      <div className="relative">
                        <Info size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select value={form.purpose} onChange={updateField("purpose")} className={`${inputWithIconCls} appearance-none cursor-pointer`}>
                          <option value="">Select visit purpose</option>
                          {VISIT_PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={clearForm} disabled={saving} className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold px-4 py-2 hover:text-gray-700 transition disabled:opacity-60">
            <X size={14} /> {isEdit ? "Reset" : "Clear Form"}
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-[#055E83] text-white text-sm font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 transition disabled:opacity-60">
            <Check size={14} /> {saving ? "Saving..." : isEdit ? "Save Changes" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Root Router ─────────────────────────────────────────────────────────
export default function Entry() {
  const [page, setPage] = useState("list"); // "list" | "add" | "edit"
  const [entriesList, setEntriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/library-entries?limit=500");
      if (response.data?.success) {
        setEntriesList(response.data.data.map(mapEntry));
      }
    } catch (err) {
      console.error("Failed to load entries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/library-entries/${toDelete.entryId}`);
      await fetchEntries();
    } catch (err) {
      console.error("Failed to delete entry:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Failed to delete the entry.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const renderPage = () => {
    switch (page) {
      case "add":
        return (
          <AddEntry
            onCancel={() => setPage("list")}
            onSave={async () => {
              await fetchEntries();
              setPage("list");
            }}
          />
        );
      case "edit":
        return (
          <AddEntry
            entry={editing}
            onCancel={() => { setEditing(null); setPage("list"); }}
            onSave={async () => {
              await fetchEntries();
              setEditing(null);
              setPage("list");
            }}
          />
        );
      default:
        return (
          <EntryList
            data={entriesList}
            loading={loading}
            onAdd={() => setPage("add")}
            onEdit={(a) => { setEditing(a); setPage("edit"); }}
            onDelete={(a) => setToDelete(a)}
          />
        );
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-[#E9EEF4]">
        {renderPage()}
        {toDelete && (
          <DeleteModal
            entry={toDelete}
            deleting={deleting}
            onClose={() => setToDelete(null)}
            onConfirm={handleDelete}
          />
        )}
    </div>
  );
}