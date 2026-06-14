import { useState } from "react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";
import {
  User,
  Settings2,
  Edit2,
  CheckCircle2,
  Save,
  Lock,
  Bell,
  Library,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  LogOut,
  Activity,
  Mail,
  BookOpen,
  Plus,
  Edit3,
  AlertCircle
} from "lucide-react";

const TABS = [
  { id: "general",  label: "General",        icon: Settings2 },
  { id: "security", label: "Security",       icon: Shield    },
  { id: "notifs",   label: "Notifications",  icon: Bell      },
  { id: "config",   label: "Library Config", icon: Library   },
];

const INITIAL_FORM = {
  libraryName:  "Siem Reap Bannalay",
  libraryEmail: "info@siemreap-library.kh",
  phone:        "+855 63 555 0001",
  address:      "Kandal Village, Siem Reap, Cambodia",
  openingHours: "Mon – Sat: 8:00 AM – 5:00 PM",
  maxBorrow:    "7",
};

const GENERAL_FIELDS = [
  { label: "Library Name",               field: "libraryName",  type: "text"   },
  { label: "Library Email",              field: "libraryEmail", type: "email"  },
  { label: "Phone Number",               field: "phone",        type: "text"   },
  { label: "Address",                    field: "address",      type: "text"   },
  { label: "Opening Hours",              field: "openingHours", type: "text"   },
  { label: "Max Borrow Duration (days)", field: "maxBorrow",    type: "number" },
];


function SectionHeader({ icon: Icon, title, light = false }) {
  return (
    <div className={`px-6 py-3 flex items-center gap-2 ${light ? "bg-[#EBF4F8]" : "bg-[#1B4965]"}`}>
      <Icon size={15} className={light ? "text-[#1B4965]" : "text-[#F5C842]"} />
      <h3 className={`font-bold text-sm tracking-wide ${light ? "text-[#1B4965]" : "text-white"}`}>
        {title}
      </h3>
    </div>
  );
}


function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] focus:ring-1 focus:ring-[#1B4965]/20 transition";


function SaveBtn({ label = "Save Changes", onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-[#1B4965] text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-[#144056] transition shadow-sm"
    >
      <Save size={15} /> {label}
    </button>
  );
}

{/*Reusable: notification toggle row (full-width card style)*/}
function NotifRow({ label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors border-b border-gray-50 last:border-0">
      <div className="pr-8">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-[#1B4965]" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Tab: General ─────────────────────────────────────────────────────────────
function GeneralTab({ form, onChange, onSave, onCancel, saved }) {
  return (
    <>
      {/* Profile Card */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={User} title="Profile Information" />
        <div className="p-7 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#1B4965]/10 flex items-center justify-center font-bold text-lg text-[#1B4965]">
              SC
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-800">Sokha Chen</h4>
              <p className="text-sm text-gray-500 mt-0.5">Library Administrator</p>
              <p className="text-sm text-gray-400 mt-0.5">sokha.chen@siemreap-library.kh</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#1B4965] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#144056] transition shadow-sm">
            <Edit2 size={14} /> Edit Profile
          </button>
        </div>
      </section>

      {/* General Settings Form */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={Settings2} title="General Settings" light />
        <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
          {GENERAL_FIELDS.map(({ label, field, type }) => (
            <Field key={field} label={label}>
              <input
                type={type}
                value={form[field]}
                onChange={(e) => onChange(field, e.target.value)}
                className={inputCls}
              />
            </Field>
          ))}
        </div>
      </section>

      {/* Success Banner */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          <span className="text-sm font-medium">
            Settings saved successfully! Changes will take effect immediately.
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 pb-10">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <SaveBtn onClick={onSave} />
      </div>
    </>
  );
}

// ─── Tab: Security ────────────────────────────────────────────────────────────
function SecurityTab() {
  const [show, setShow]   = useState({ current: false, next: false, confirm: false });
  const [pw, setPw]       = useState({ current: "", next: "", confirm: "" });
  const [twoFA, setTwoFA] = useState(true);

  const strength      = pw.next.length === 0 ? 0 : pw.next.length < 6 ? 25 : pw.next.length < 10 ? 60 : 90;
  const strengthLabel = strength === 0 ? "" : strength <= 25 ? "Weak" : strength <= 60 ? "Fair" : "Strong";
  const strengthColor = strength <= 25 ? "bg-red-400" : strength <= 60 ? "bg-yellow-400" : "bg-green-500";
  const strengthText  = strength <= 25 ? "text-red-500" : strength <= 60 ? "text-yellow-600" : "text-green-600";

  return (
    <div className="space-y-5 pb-10">
      {/* Change Password */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={Lock} title="Change Password" />
        <div className="p-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-5">
            {/* Left col: current + confirm */}
            <div className="space-y-5">
              {["current", "confirm"].map((key) => (
                <Field key={key} label={key === "current" ? "Current Password" : "Confirm New Password"}>
                  <div className="relative">
                    <input
                      type={show[key] ? "text" : "password"}
                      value={pw[key]}
                      onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder="Enter Password"
                      className={inputCls + " pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {show[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
              ))}
            </div>

            {/* Right col: new password + strength */}
            <div className="space-y-4">
              <Field label="New Password">
                <div className="relative">
                  <input
                    type={show.next ? "text" : "password"}
                    value={pw.next}
                    onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                    placeholder="Enter New Password"
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {show.next ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
              {pw.next.length > 0 && (
                <div className="space-y-1.5">
                  <span className={`text-xs font-bold ${strengthText}`}>
                    Password Strength: {strengthLabel}
                  </span>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Use 8+ characters with uppercase, numbers &amp; symbols
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <SaveBtn label="Update Password" />
          </div>
        </div>
      </section>

      {/* 2FA + Active Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Two-Factor Authentication */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader icon={ShieldCheck} title="Two-Factor Authentication" light />
          <div className="p-6">
            <div className="flex justify-between items-start mb-5">
              <div className="pr-4">
                <h4 className="font-bold text-gray-800 text-sm">Enable Two-Factor Authentication</h4>
                <p className="text-gray-400 text-xs mt-1">
                  Add an extra layer of security via SMS or authenticator app
                </p>
              </div>
              <button
                onClick={() => setTwoFA((v) => !v)}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  twoFA ? "bg-[#1B4965]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    twoFA ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {twoFA && (
              <div className="bg-green-50 border border-green-100 px-4 py-3 rounded-lg flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                  ✓
                </div>
                <span className="text-green-700 text-xs font-medium">
                  2FA is currently enabled. Last verified: March 1, 2026 at 9:14 AM
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Active Sessions */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader icon={Monitor} title="Active Sessions" light />
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1B4965]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Monitor size={16} className="text-[#1B4965]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Chrome on Windows 11</p>
                  <p className="text-xs text-gray-400 mt-0.5">IP: 192.168.1.42 • Siem Reap, Cambodia</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-[#1B4965] text-white text-[10px] font-bold rounded uppercase tracking-wide">
                Current
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1B4965]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone size={16} className="text-[#1B4965]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Firefox on Android</p>
                  <p className="text-xs text-gray-400 mt-0.5">IP: 10.0.0.5 • Last active: 2 hours ago</p>
                </div>
              </div>
              <button className="px-2.5 py-1 border border-red-200 text-red-500 text-[10px] font-bold rounded uppercase tracking-wide hover:bg-red-50 transition">
                Revoke
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Security Activity */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={Activity} title="Recent Security Activity" light />
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {[
            { title: "Password changed",   date: "March 1, 2026 at 10:22 AM", sub: "Chrome / Windows"  },
            { title: "New login detected", date: "Feb 28, 2026 at 8:05 AM",   sub: "Firefox / Android" },
            { title: "2FA enabled",        date: "Feb 25, 2026 at 2:48 PM",   sub: "Chrome / Windows"  },
          ].map(({ title, date, sub }) => (
            <div key={title} className="p-6">
              <p className="text-sm font-bold text-gray-800">{title}</p>
              <p className="text-xs text-gray-400 mt-1">{date}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sign Out All Devices */}
      <div className="flex justify-start">
        <button className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-100 transition">
          <LogOut size={15} /> Sign Out All Devices
        </button>
      </div>
    </div>
  );
}


function NotificationsTab({ onCancel }) {
  const [email, setEmail] = useState({
    newDonation:    true,
    feedbackReview: true,
    overdueAlert:   false,
    securityAlerts: true,
  });
  const [inApp, setInApp] = useState({
    desktopNotifs: true,
    soundAlerts:   false,
    badgeCount:    true,
  });

  const EMAIL_ROWS = [
    { key: "newDonation",    label: "New Donation Received",       sub: "Notify when a new donation is submitted or approved"   },
    { key: "feedbackReview", label: "Feedback & Review Submitted", sub: "Notify when a patron submits new feedback or a review" },
    { key: "overdueAlert",   label: "Overdue Borrow Alert",        sub: "Send daily digest of overdue borrowing records"        },
    { key: "securityAlerts", label: "System & Security Alerts",    sub: "Login alerts, password changes, and 2FA events"       },
  ];

  const INAPP_ROWS = [
    { key: "desktopNotifs", label: "Show Desktop Notifications", sub: "Pop-up alerts on your browser while logged in"         },
    { key: "soundAlerts",   label: "Sound Alerts",               sub: "Play a sound for each new notification received"       },
    { key: "badgeCount",    label: "Notification Badge Count",   sub: "Show unread count badge on the notification bell icon" },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Email Notifications */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={Mail} title="Email Notifications" />
        <div>
          {EMAIL_ROWS.map(({ key, label, sub }) => (
            <NotifRow
              key={key}
              label={label}
              sub={sub}
              checked={email[key]}
              onChange={() => setEmail((p) => ({ ...p, [key]: !p[key] }))}
            />
          ))}
        </div>
      </section>

      {/* In-App Notifications */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={Bell} title="In-App Notifications" light />
        <div>
          {INAPP_ROWS.map(({ key, label, sub }) => (
            <NotifRow
              key={key}
              label={label}
              sub={sub}
              checked={inApp[key]}
              onChange={() => setInApp((p) => ({ ...p, [key]: !p[key] }))}
            />
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <SaveBtn label="Save Changes" />
      </div>
    </div>
  );
}


{/*Library Config Tab*/}
const INITIAL_BORROW_RULES = {
  maxBooks:      "2",
  borrowDays:    "14",
  renewalLimit:  "2",
  finePerDay:    "0.25",
  reserveHold:   "3",
  maxFineCap:    "10.00",
};
 
const BORROW_FIELDS = [
  { label: "Max Books Per Member",      key: "maxBooks",     type: "number" },
  { label: "Borrow Duration (Days)",    key: "borrowDays",   type: "number" },
  { label: "Renewal Limit (Times)",     key: "renewalLimit", type: "number" },
  { label: "Late Fine Per Day (USD)",   key: "finePerDay",   type: "number" },
  { label: "Reservation Hold (Days)",   key: "reserveHold",  type: "number" },
  { label: "Max Fine Cap (USD)",        key: "maxFineCap",   type: "number" },
];
 
const DEFAULT_CATEGORIES = [
  "Fiction", "Non-Fiction", "Science", "History", "Children", "Religion",
];
 
function LibraryConfigTab({ onCancel }) {
  const [rules, setRules]           = useState(INITIAL_BORROW_RULES);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editVal, setEditVal]       = useState("");
  const [newCat, setNewCat]         = useState("");
  const [addingNew, setAddingNew]   = useState(false);
 
  const startEdit = (idx) => { setEditingIdx(idx); setEditVal(categories[idx]); };
  const saveEdit  = () => {
    if (editVal.trim()) {
      setCategories((c) => c.map((v, i) => (i === editingIdx ? editVal.trim() : v)));
    }
    setEditingIdx(null);
  };
  const addCategory = () => {
    if (newCat.trim()) {
      setCategories((c) => [...c, newCat.trim()]);
      setNewCat("");
    }
    setAddingNew(false);
  };
 
  return (
    <div className="space-y-5 pb-12">
      {/* Borrowing Rules */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={BookOpen} title="Borrowing Rules" />
        <div className="p-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BORROW_FIELDS.map(({ label, key, type }) => (
            <Field key={key} label={label}>
              <input
                type={type}
                value={rules[key]}
                onChange={(e) => setRules((r) => ({ ...r, [key]: e.target.value }))}
                className={inputCls}
              />
            </Field>
          ))}
        </div>
      </section>
 
      {/* Book Categories */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Light header with Add button on the right */}
        <div className="bg-[#EBF4F8] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library size={15} className="text-[#1B4965]" />
            <h3 className="font-bold text-sm text-[#1B4965] tracking-wide">Book Categories</h3>
          </div>
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-1.5 bg-[#1B4965] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#144056] transition"
          >
            <Plus size={13} /> Add Category
          </button>
        </div>
        <div className="p-7">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100/60 transition group"
              >
                {editingIdx === idx ? (
                  <>
                    <input
                      autoFocus
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingIdx(null); }}
                      className="text-sm font-bold text-[#1B4965] bg-transparent outline-none border-b border-[#1B4965] w-24"
                    />
                    <button onClick={saveEdit} className="text-[#1B4965] hover:text-green-600 transition">
                      <Save size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-[#1B4965]">{cat}</span>
                    <button
                      onClick={() => startEdit(idx)}
                      className="text-[#1B4965] opacity-50 group-hover:opacity-100 transition"
                    >
                      <Edit3 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
 
            {/* Inline new category input */}
            {addingNew && (
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-[#1B4965] rounded-lg">
                <input
                  autoFocus
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") setAddingNew(false); }}
                  placeholder="Category name"
                  className="text-sm font-bold text-[#1B4965] bg-transparent outline-none border-b border-[#1B4965] w-28 placeholder:font-normal placeholder:text-[#1B4965]/40"
                />
                <button onClick={addCategory} className="text-green-600 hover:text-green-700 transition">
                  <Save size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
 
      {/* Warning */}
      <div className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium">
        <AlertCircle size={16} className="text-orange-500 flex-shrink-0" />
        Changes to borrowing rules will apply to all new transactions from the next working day.
      </div>
 
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <SaveBtn label="Save Changes" />
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm]           = useState(INITIAL_FORM);
  const [saved, setSaved]         = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };
  const handleSave   = () => setSaved(true);
  const handleCancel = () => { setForm(INITIAL_FORM); setSaved(false); };

  return (
    <div className="flex h-screen overflow-hidden antialiased font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Settings" breadcrumb="Welcome Back!" />

        <div className="px-8 py-6 max-w-5xl mx-auto space-y-5">
          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === id
                    ? "bg-[#1B4965] text-white shadow-sm"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "general" && (
            <GeneralTab
              form={form}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              saved={saved}
            />
          )}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifs"   && <NotificationsTab onCancel={handleCancel} />}
          {activeTab === "config"   && <LibraryConfigTab />}
        </div>
      </main>
    </div>
  );
}