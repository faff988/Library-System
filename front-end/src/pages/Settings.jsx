import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import {
  User, Settings2, Edit2, CheckCircle2, Save, Lock, Bell, Library, Shield,
  ShieldCheck, Eye, EyeOff, Monitor, Mail, BookOpen, Plus, Edit3, AlertCircle,
  X, LogOut, DatabaseBackup, Download, RotateCcw, Trash2, RefreshCw,
} from "lucide-react";

const TABS = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifs", label: "Notifications", icon: Bell },
  { id: "config", label: "Library Config", icon: Library },
  { id: "backup", label: "Backup & Restore", icon: DatabaseBackup },
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

function SaveBtn({ label = "Save Changes", onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 bg-[#1B4965] text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-[#144056] transition shadow-sm disabled:opacity-50"
    >
      <Save size={15} /> {label}
    </button>
  );
}

function NotifRow({ label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors border-b border-gray-50 last:border-0">
      <div className="pr-8">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <button
        type="button"
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

// ─── Logout Confirm Modal ─────────────────────────────────────────────────────
function LogoutModal({ open, onCancel, onConfirm, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="p-6 space-y-3">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
            <LogOut size={18} className="text-red-500" />
          </div>
          <h4 className="text-base font-bold text-gray-800">Log out of your account?</h4>
          <p className="text-sm text-gray-500">
            You'll need to sign in again to access the admin dashboard.
          </p>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            <LogOut size={14} /> {loading ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: General ─────────────────────────────────────────────────────────────
function GeneralTab({ currentUser, onProfileUpdated, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [banner, setBanner] = useState({ type: "", message: "" });
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        firstName: currentUser.first_name || "",
        lastName: currentUser.last_name || "",
        phone: currentUser.phone_number || "",
      });
    }
  }, [currentUser]);

  const initials = currentUser
    ? `${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`.toUpperCase()
    : "U";

  const fullName = currentUser
    ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim()
    : "Library Staff";

  // Updates self-service profile via PUT /api/auth/me
  const handleSaveProfile = async () => {
    setBanner({ type: "", message: "" });
    try {
      setLoading(true);
      const res = await api.put("/auth/me", profileForm);
      if (res.data?.success) {
        setBanner({ type: "success", message: "Profile updated successfully!" });
        setIsEditing(false);
        if (onProfileUpdated) onProfileUpdated(res.data.data);
      }
    } catch (err) {
      setBanner({
        type: "error",
        message: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Success/Error Banner */}
      {banner.message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium border ${
            banner.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          )}
          <span>{banner.message}</span>
        </div>
      )}

      {/* Profile Card */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={User} title="Profile Information" />
        <div className="p-7">
          {!isEditing ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-[#1B4965]/10 flex items-center justify-center font-bold text-lg text-[#1B4965]">
                  {initials}
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-800">{fullName}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {currentUser?.roles?.role_name || "Librarian"}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {currentUser?.email || "No email assigned"}
                  </p>
                  {currentUser?.phone_number && (
                    <p className="text-xs text-gray-400 mt-0.5">Phone: {currentUser.phone_number}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-[#1B4965] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#144056] transition shadow-sm"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name">
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone Number">
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className={inputCls}
                    placeholder="+855 ..."
                  />
                </Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition"
                >
                  <X size={14} /> Cancel
                </button>
                <SaveBtn
                  label={loading ? "Saving..." : "Save Profile"}
                  onClick={handleSaveProfile}
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Log Out */}
      <section className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-6 py-3 flex items-center gap-2 bg-red-50">
          <LogOut size={15} className="text-red-500" />
          <h3 className="font-bold text-sm tracking-wide text-red-600">Log Out</h3>
        </div>
        <div className="p-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            End your current session on this device. You'll be redirected to the login page.
          </p>
          <button
            onClick={() => setLogoutOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-white text-red-500 border border-red-200 text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-50 transition shadow-sm"
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </section>

      <LogoutModal
        open={logoutOpen}
        loading={loggingOut}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}

// ─── Tab: Security ────────────────────────────────────────────────────────────
function SecurityTab() {
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState({ type: "", message: "" });

  const strength =
    pw.next.length === 0 ? 0 : pw.next.length < 6 ? 25 : pw.next.length < 10 ? 60 : 90;
  const strengthLabel =
    strength === 0 ? "" : strength <= 25 ? "Weak" : strength <= 60 ? "Fair" : "Strong";
  const strengthColor =
    strength <= 25 ? "bg-red-400" : strength <= 60 ? "bg-yellow-400" : "bg-green-500";
  const strengthText =
    strength <= 25 ? "text-red-500" : strength <= 60 ? "text-yellow-600" : "text-green-600";

  // Triggers PUT /api/auth/change-password
  const handleUpdatePassword = async () => {
    setBanner({ type: "", message: "" });

    if (!pw.current || !pw.next || !pw.confirm) {
      setBanner({ type: "error", message: "Please fill in all password fields." });
      return;
    }

    if (pw.next !== pw.confirm) {
      setBanner({ type: "error", message: "New passwords do not match." });
      return;
    }

    if (pw.next.length < 6) {
      setBanner({ type: "error", message: "New password must be at least 6 characters long." });
      return;
    }

    try {
      setLoading(true);
      const res = await api.put("/auth/change-password", {
        currentPassword: pw.current,
        newPassword: pw.next,
      });

      if (res.data?.success) {
        setBanner({ type: "success", message: res.data.message || "Password updated successfully!" });
        setPw({ current: "", next: "", confirm: "" });
      }
    } catch (err) {
      setBanner({
        type: "error",
        message: err.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Change Password */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={Lock} title="Change Password" />
        <div className="p-7">
          {banner.message && (
            <div
              className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                banner.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {banner.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {banner.message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-5">
            <div className="space-y-5">
              {["current", "confirm"].map((key) => (
                <Field
                  key={key}
                  label={key === "current" ? "Current Password" : "Confirm New Password"}
                >
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
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <SaveBtn
              label={loading ? "Updating..." : "Update Password"}
              onClick={handleUpdatePassword}
              disabled={loading}
            />
          </div>
        </div>
      </section>

      {/* Active Session Info */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={ShieldCheck} title="Active Session Info" light />
        <div className="p-5">
          <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1B4965]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Monitor size={16} className="text-[#1B4965]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Active Web Session</p>
                <p className="text-xs text-gray-400 mt-0.5">Authenticated via JWT Token</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-green-500 text-white text-[10px] font-bold rounded uppercase tracking-wide">
              Active
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Tab: Notifications ───────────────────────────────────────────────────────
function NotificationsTab() {
  const [email, setEmail] = useState({
    newDonation: true,
    feedbackReview: true,
    overdueAlert: false,
    securityAlerts: true,
  });
  const [inApp, setInApp] = useState({
    desktopNotifs: true,
    soundAlerts: false,
    badgeCount: true,
  });

  const EMAIL_ROWS = [
    { key: "newDonation", label: "New Donation Received", sub: "Notify when a new donation is submitted" },
    { key: "feedbackReview", label: "Feedback Submitted", sub: "Notify when a patron submits new feedback" },
    { key: "overdueAlert", label: "Overdue Borrow Alert", sub: "Send daily digest of overdue borrowing records" },
    { key: "securityAlerts", label: "System & Security Alerts", sub: "Login alerts and password change events" },
  ];

  const INAPP_ROWS = [
    { key: "desktopNotifs", label: "Show Desktop Notifications", sub: "Pop-up alerts on your browser while logged in" },
    { key: "soundAlerts", label: "Sound Alerts", sub: "Play a sound for each new notification received" },
    { key: "badgeCount", label: "Notification Badge Count", sub: "Show unread count badge on the bell icon" },
  ];

  return (
    <div className="space-y-5 pb-12">
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
    </div>
  );
}

// ─── Tab: Config ─────────────────────────────────────────────────────────────
function LibraryConfigTab() {
  const [rules, setRules] = useState({
    maxBooks: "2",
    borrowDays: "14",
    renewalLimit: "2",
    finePerDay: "0.25",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [banner, setBanner] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchConfig();
  }, []);

  // Calls GET /api/library-config
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get("/library-config");
      if (res.data?.data) {
        const d = res.data.data;
        setRules({
          maxBooks: String(d.max_books_per_member),
          borrowDays: String(d.borrow_duration_days),
          renewalLimit: String(d.renewal_limit),
          finePerDay: String(d.fine_per_day),
        });
        setDirty(false);
      }
    } catch (err) {
      setBanner({
        type: "error",
        message: err.response?.data?.message || "Failed to load library settings.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => {
    setRules((r) => ({ ...r, [key]: value }));
    setDirty(true);
    if (banner.message) setBanner({ type: "", message: "" });
  };

  // Calls PUT /api/library-config
  const handleSave = async () => {
    setBanner({ type: "", message: "" });
    try {
      setSaving(true);
      const res = await api.put("/library-config", {
        maxBooksPerMember: Number(rules.maxBooks),
        borrowDurationDays: Number(rules.borrowDays),
        renewalLimit: Number(rules.renewalLimit),
        finePerDay: Number(rules.finePerDay),
      });
      if (res.data?.success) {
        const d = res.data.data;
        setRules({
          maxBooks: String(d.max_books_per_member),
          borrowDays: String(d.borrow_duration_days),
          renewalLimit: String(d.renewal_limit),
          finePerDay: String(d.fine_per_day),
        });
        setDirty(false);
        setBanner({ type: "success", message: "Borrowing rules updated successfully!" });
      }
    } catch (err) {
      setBanner({
        type: "error",
        message: err.response?.data?.message || "Failed to save borrowing rules.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {banner.message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium border ${
            banner.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          )}
          <span>{banner.message}</span>
        </div>
      )}

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader icon={BookOpen} title="Borrowing Rules" />
        <div className="p-7">
          {loading ? (
            <div className="text-sm text-gray-400 py-4">Loading current settings...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Max Books Per Member">
                  <input
                    type="number"
                    min="1"
                    value={rules.maxBooks}
                    onChange={(e) => updateField("maxBooks", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Borrow Duration (Days)">
                  <input
                    type="number"
                    min="1"
                    value={rules.borrowDays}
                    onChange={(e) => updateField("borrowDays", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Renewal Limit (Times)">
                  <input
                    type="number"
                    min="0"
                    value={rules.renewalLimit}
                    onChange={(e) => updateField("renewalLimit", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Late Fine Per Day (USD)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rules.finePerDay}
                    onChange={(e) => updateField("finePerDay", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="flex justify-end mt-6">
                <SaveBtn
                  label={saving ? "Saving..." : "Save Changes"}
                  onClick={handleSave}
                  disabled={saving || !dirty}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatBackupDate(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function RestoreConfirmModal({ backup, onCancel, onConfirm, loading }) {
  const [typed, setTyped] = useState("");
  if (!backup) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-6 space-y-3">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
            <RotateCcw size={18} className="text-red-500" />
          </div>
          <h4 className="text-base font-bold text-gray-800">Restore this backup?</h4>
          <p className="text-sm text-gray-500">
            This will <span className="font-bold text-red-600">permanently overwrite</span> everything currently in the database with the contents of{" "}
            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{backup.filename}</span> (taken {formatBackupDate(backup.createdAt)}).
            Anything added or changed since then will be lost. This cannot be undone.
          </p>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Type RESTORE to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className={inputCls}
              placeholder="RESTORE"
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || typed !== "RESTORE"}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-40"
          >
            <RotateCcw size={14} /> {loading ? "Restoring..." : "Restore Database"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteBackupModal({ backup, onCancel, onConfirm, loading }) {
  if (!backup) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="p-6 space-y-3">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <h4 className="text-base font-bold text-gray-800">Delete this backup?</h4>
          <p className="text-sm text-gray-500">
            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{backup.filename}</span> will be permanently removed from the server.
          </p>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-50">
            <Trash2 size={14} /> {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BackupRestoreTab() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [banner, setBanner] = useState({ type: "", message: "" });
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await api.get("/backups");
      if (res.data?.success) setBackups(res.data.data);
    } catch (err) {
      setBanner({ type: "error", message: err.response?.data?.message || "Failed to load backups." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setBanner({ type: "", message: "" });
    try {
      setCreating(true);
      const res = await api.post("/backups");
      if (res.data?.success) {
        setBanner({ type: "success", message: `Backup "${res.data.data.filename}" created successfully.` });
        await fetchBackups();
      }
    } catch (err) {
      setBanner({ type: "error", message: err.response?.data?.message || "Failed to create backup." });
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      setDownloadingFile(backup.filename);
      const res = await api.get(`/backups/${backup.filename}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = backup.filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setBanner({ type: "error", message: "Failed to download backup." });
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleRestoreConfirm = async () => {
    setRestoring(true);
    try {
      const res = await api.post(`/backups/${restoreTarget.filename}/restore`, { confirm: true });
      if (res.data?.success) {
        setBanner({ type: "success", message: res.data.message || "Database restored successfully." });
      }
    } catch (err) {
      setBanner({ type: "error", message: err.response?.data?.message || "Failed to restore backup." });
    } finally {
      setRestoring(false);
      setRestoreTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/backups/${deleteTarget.filename}`);
      setBanner({ type: "success", message: "Backup deleted." });
      await fetchBackups();
    } catch (err) {
      setBanner({ type: "error", message: err.response?.data?.message || "Failed to delete backup." });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {banner.message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium border ${
          banner.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {banner.type === "success" ? <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> : <AlertCircle size={18} className="text-red-500 flex-shrink-0" />}
          <span>{banner.message}</span>
        </div>
      )}

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-3 flex items-center justify-between bg-[#1B4965]">
          <div className="flex items-center gap-2">
            <DatabaseBackup size={15} className="text-[#F5C842]" />
            <h3 className="font-bold text-sm tracking-wide text-white">Database Backups</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchBackups} className="p-1.5 text-white/70 hover:text-white transition" title="Refresh list">
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-1.5 bg-[#F5C842] text-[#1B4965] text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-60"
            >
              <DatabaseBackup size={13} /> {creating ? "Creating..." : "Create Backup Now"}
            </button>
          </div>
        </div>

        <div className="p-5">
          <p className="text-xs text-gray-400 mb-4">
            Backups include all library data and business logic (triggers), but not uploaded book covers or event images. Available to Admin and Librarian roles.
          </p>

          {loading ? (
            <p className="text-sm text-gray-400 py-6 text-center">Loading backups...</p>
          ) : backups.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No backups yet — create one above.</p>
          ) : (
            <div className="space-y-2">
              {backups.map((b) => (
                <div key={b.filename} className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:bg-slate-50/50 transition">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{formatBackupDate(b.createdAt)}</p>
                    <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{b.filename} · {formatBytes(b.sizeBytes)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-4">
                    <button
                      onClick={() => handleDownload(b)}
                      disabled={downloadingFile === b.filename}
                      className="p-2 text-gray-400 hover:text-[#1B4965] hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                      title="Download"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      onClick={() => setRestoreTarget(b)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Restore"
                    >
                      <RotateCcw size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(b)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <RestoreConfirmModal backup={restoreTarget} loading={restoring} onCancel={() => setRestoreTarget(null)} onConfirm={handleRestoreConfirm} />
      <DeleteBackupModal backup={deleteTarget} loading={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Calls GET /api/auth/me on component load
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data?.data) {
        setCurrentUser(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  // Calls POST /api/auth/logout, clears local session, then redirects to /login
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex-1 bg-[#E9EEF4] font-sans">
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
              currentUser={currentUser}
              onProfileUpdated={setCurrentUser}
              onLogout={handleLogout}
            />
          )}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "notifs" && <NotificationsTab />}
          {activeTab === "config" && <LibraryConfigTab />}
          {activeTab === "backup" && <BackupRestoreTab />}
        </div>
    </div>
  );
}