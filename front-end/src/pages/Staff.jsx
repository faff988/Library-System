import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import {
  Users, UserPlus, ChevronLeft, ChevronRight, Edit3, Trash2,
  ChevronDown, ShieldCheck, Briefcase, X, Save, Camera, Phone, Mail,
  Calendar, RotateCcw, User, AlertCircle, Eye, Search,
  ArrowUpDown, Filter, Info, IdCard, Lock,
  CheckCircle2, XCircle
} from "lucide-react";

const AVATAR_COLORS = [
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#FEE2E2", text: "#991B1B" },
];

const ROLE_COLORS = [
  { bg: "#EFF6FF", text: "#1D4ED8" },
  { bg: "#F0FDF4", text: "#15803D" },
  { bg: "#FDF4FF", text: "#A21CAF" },
  { bg: "#FFF7ED", text: "#C2410C" },
  { bg: "#F1F5F9", text: "#334155" },
];

const MODULES = [
  { id: "inventory", label: "Inventory / Books" },
  { id: "borrow_return", label: "Borrow & Return" },
  { id: "members", label: "Member Management" },
  { id: "donations", label: "Donations Log" },
  { id: "reports", label: "Reports & Analytics" },
];

const DEFAULT_PERMISSIONS = MODULES.reduce((acc, mod) => {
  acc[mod.id] = { create: false, read: true, update: false, delete: false };
  return acc;
}, {});

const SORT_OPTIONS = ["Newest to Oldest", "Oldest to Newest", "Name A-Z", "Name Z-A", "Admins First"];
const STATUSES     = ["All Status", "Active", "Inactive"];
const PAGE_SIZE    = 6;

const inputCls = "w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#055E83] transition text-gray-800 placeholder:text-gray-400";
const inputWithIconCls = "w-full border-2 border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#055E83] transition text-gray-800 placeholder:text-gray-400";
const filterPillCls = "flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2";

const getInitials = (name) => (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
const getAvatarColor = (name) => AVATAR_COLORS[(name || "?").charCodeAt(0) % AVATAR_COLORS.length];
const getRoleColor = (name) => ROLE_COLORS[(name || "?").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % ROLE_COLORS.length];
const isAdminRole = (roleName) => (roleName || "").toLowerCase() === "admin";

const tableGridStyle = {
  display: "grid",
  gridTemplateColumns: "140px 1.8fr 1.6fr 140px 100px 220px",
  alignItems: "center",
  gap: "1rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

function mapStaff(u) {
  const year = u.created_at ? new Date(u.created_at).getFullYear() : new Date().getFullYear();
  let parsedPermissions = DEFAULT_PERMISSIONS;
  
  if (u.permissions) {
    try {
      parsedPermissions = typeof u.permissions === "string" ? JSON.parse(u.permissions) : u.permissions;
    } catch (e) {
      console.error("Failed to parse user permissions", e);
    }
  }

  return {
    dbId: u.user_id,
    id: `STF-${year}-${String(u.user_id).padStart(4, "0")}`,
    name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
    firstName: u.first_name || "",
    lastName: u.last_name || "",
    email: u.email,
    phone: u.phone_number || "",
    roleId: u.role_id ?? "",
    role: u.roles?.role_name || "Unassigned",
    isActive: u.is_active !== false,
    permissions: parsedPermissions,
    joined: u.created_at ? new Date(u.created_at).toLocaleString("en-US", { month: "short", year: "numeric" }) : "—",
    joinedRaw: u.created_at || null,
  };
}

function Label({ children, required }) {
  return (
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
      {children} {required && <span className="text-red-400">*</span>}
    </label>
  );
}

function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input {...props} className={inputWithIconCls} />
    </div>
  );
}

function SelectInput({ children, icon: Icon = ChevronDown, colorCls = "text-gray-800", ...props }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <select {...props} className={`${inputWithIconCls} appearance-none cursor-pointer ${colorCls}`}>{children}</select>
    </div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ staff, onClose, onEdit }) {
  const avatarColor = getAvatarColor(staff.name);
  const admin = isAdminRole(staff.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border-2 border-gray-400">
        <div className="px-8 py-5 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-[#055E83]">Staff Profile</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-8 space-y-6">
          <div className="flex gap-6">
            <div className="flex flex-col items-center flex-shrink-0 w-48 bg-[#055E83] rounded-2xl pt-7 pb-6 px-4">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg flex items-center justify-center text-2xl font-black" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>
                {getInitials(staff.name)}
              </div>
              <p className="text-white font-bold text-base mt-3 text-center leading-tight">{staff.name}</p>
              <p className="text-white/50 text-[10px] mt-1 font-medium italic">{staff.id}</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${staff.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-200 text-slate-500 border-slate-300"}`}>
                  {staff.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {staff.isActive ? "Active" : "Inactive"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${admin ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-blue-100 text-blue-600 border-blue-200"}`}>{staff.role}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-gray-50 rounded-xl border-2 border-gray-300 divide-y-2 divide-gray-200 overflow-hidden">
                {[
                  { icon: IdCard, label: "Staff ID", value: staff.id },
                  { icon: Mail, label: "Email", value: staff.email },
                  { icon: Phone, label: "Phone", value: staff.phone || "—" },
                  { icon: Briefcase, label: "Role", value: staff.role },
                  { icon: Calendar, label: "Joined", value: staff.joined },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2.5 text-gray-400">
                      <Icon size={13} /><span className="text-xs font-semibold text-gray-500">{label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 border-t-2 border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">Close</button>
          <button onClick={onEdit} className="flex items-center gap-2 bg-[#055E83] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-sm">
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Modal with CRUD Permissions ─────────────────────────────────────
const makeEmptyForm = () => ({
  firstName: "", lastName: "", phone: "", email: "",
  password: "", roleId: "", isActive: true,
  permissions: DEFAULT_PERMISSIONS,
});

function StaffModal({ staff, roles, saving, onClose, onSave }) {
  const isEdit = Boolean(staff);
  const [form, setForm] = useState(() =>
    isEdit ? {
      firstName: staff.firstName || "",
      lastName: staff.lastName || "",
      phone: staff.phone || "",
      email: staff.email || "",
      password: "",
      roleId: staff.roleId || "",
      isActive: staff.isActive,
      permissions: staff.permissions || DEFAULT_PERMISSIONS,
    } : makeEmptyForm()
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const reset = () => setForm(makeEmptyForm());

  const handlePermissionToggle = (moduleId, action) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: {
          ...(prev.permissions[moduleId] || { create: false, read: true, update: false, delete: false }),
          [action]: !prev.permissions[moduleId]?.[action],
        },
      },
    }));
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      alert("Please fill in First Name, Last Name, and Email.");
      return;
    }
    if (!isEdit && !form.password.trim()) {
      alert("Please set a password for the new staff account.");
      return;
    }
    if (!form.roleId) {
      alert("Please select a Role.");
      return;
    }
    onSave(form);
  };

  const statusColor = form.isActive ? "text-green-600" : "text-gray-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border-2 border-gray-400">
        <div className="px-8 py-5 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#055E83]">{isEdit ? "Edit Staff & Permissions" : "New Staff Account"}</h2>
            <p className="text-xs text-red-400 font-medium mt-0.5">* Required fields</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          {/* User Details */}
          <div className="flex gap-8">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative">
                <div className="w-28 h-28 bg-[#EBF4F8] rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <User size={48} className="text-[#055E83]/25" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[#055E83] text-white rounded-full shadow-lg hover:opacity-90 transition"><Camera size={13} /></button>
              </div>
              <button className="mt-3 flex items-center gap-1 bg-[#055E83] text-white px-3 py-1 rounded-lg text-xs font-bold hover:opacity-90 transition shadow-sm"><Camera size={11} /> Upload</button>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-3">
              <div>
                <Label required>First Name</Label>
                <input type="text" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="First name" className={inputCls} />
              </div>
              <div>
                <Label required>Last Name</Label>
                <input type="text" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Last name" className={inputCls} />
              </div>
              <div>
                <Label required>Email Address</Label>
                <IconInput icon={Mail} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@domain.com" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <IconInput icon={Phone} type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+855 XX XXX XXX" />
              </div>
              <div>
                <Label required={!isEdit}>{isEdit ? "New Password" : "Password"}</Label>
                <IconInput icon={Lock} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={isEdit ? "Keep blank to retain" : "Set password"} />
              </div>
              <div>
                <Label required>Role</Label>
                <SelectInput icon={Briefcase} value={form.roleId} onChange={(e) => set("roleId", e.target.value)}>
                  <option value="">Select a role</option>
                  {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                  ))}
                </SelectInput>
              </div>
              {isEdit && (
                <div>
                  <Label required>Account Status</Label>
                  <SelectInput icon={Info} colorCls={`font-bold ${statusColor}`} value={form.isActive ? "Active" : "Inactive"} onChange={(e) => set("isActive", e.target.value === "Active")}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </SelectInput>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Module Access Control (CRUD Matrix) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-[#055E83]" />
              <h3 className="text-sm font-bold text-gray-800">Module Permissions (CRUD Options)</h3>
            </div>

            <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="grid grid-cols-5 bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-600 border-b border-gray-200">
                <span>Module Name</span>
                <span className="text-center">Create</span>
                <span className="text-center">Read / View</span>
                <span className="text-center">Update / Edit</span>
                <span className="text-center">Delete</span>
              </div>

              <div className="divide-y divide-gray-100">
                {MODULES.map((mod) => (
                  <div key={mod.id} className="grid grid-cols-5 px-4 py-2.5 items-center hover:bg-slate-50 transition">
                    <span className="text-xs font-semibold text-gray-800">{mod.label}</span>
                    {["create", "read", "update", "delete"].map((action) => (
                      <div key={action} className="text-center">
                        <input
                          type="checkbox"
                          checked={form.permissions[mod.id]?.[action] || false}
                          onChange={() => handlePermissionToggle(mod.id, action)}
                          className="w-4 h-4 accent-[#055E83] rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 border-t-2 border-gray-200 flex justify-end gap-3 flex-shrink-0 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={reset} className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition"><RotateCcw size={14} /> Reset</button>
          <button disabled={saving} onClick={handleSave} className="flex items-center gap-2 bg-[#E8C110] text-[#055E83] px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-md disabled:opacity-60">
            <Save size={14} /> {saving ? "Saving..." : isEdit ? "Save Changes" : "Save New Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ staff, deleting, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden border-2 border-gray-400">
        <div className="bg-red-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Remove Staff Member</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition"><X size={18} /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 font-medium">
            Are you sure you want to remove <span className="font-bold text-gray-800">{staff.name}</span>? This action cannot be undone.
          </p>
          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">If this staff member has issued books, logged donations, or filed reports, deletion will be blocked — set them to Inactive instead.</p>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition">Cancel</button>
          <button disabled={deleting} onClick={onConfirm} className="flex items-center gap-2 bg-red-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-red-600 transition shadow-sm disabled:opacity-60">
            <Trash2 size={14} /> {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy,       setSortBy]       = useState("Newest to Oldest");
  const [sortOpen,     setSortOpen]     = useState(false);
  const [page,         setPage]         = useState(1);
  const [modal,        setModal]        = useState(null);
  const [selected,     setSelected]     = useState(null);

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users?limit=500");
      if (response.data?.success) {
        setStaffList(response.data.data.map(mapStaff));
      }
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles");
      if (response.data?.success) setRoles(response.data.data);
    } catch (err) {
      console.error("Failed to load roles:", err);
    }
  };

  const roleOptions = ["All Roles", ...roles.map((r) => r.role_name)];

  const filtered = staffList
    .filter((s) =>
      (search === "" || `${s.name} ${s.id} ${s.email}`.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter === "All Roles" || s.role === roleFilter) &&
      (statusFilter === "All Status" || (statusFilter === "Active" ? s.isActive : !s.isActive))
    )
    .sort((a, b) => {
      if (sortBy === "Name A-Z") return a.name.localeCompare(b.name);
      if (sortBy === "Name Z-A") return b.name.localeCompare(a.name);
      if (sortBy === "Oldest to Newest") return a.dbId - b.dbId;
      if (sortBy === "Admins First") return isAdminRole(b.role) - isAdminRole(a.role);
      return b.dbId - a.dbId;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const total    = staffList.length;
  const active   = staffList.filter((s) => s.isActive).length;
  const inactive = staffList.filter((s) => !s.isActive).length;
  const admins   = staffList.filter((s) => isAdminRole(s.role)).length;

  const openProfile = (s) => { setSelected(s); setModal("profile"); };
  const openAdd     = () => { setSelected(null); setModal("add"); };
  const openEdit    = (s) => { setSelected(s); setModal("edit"); };
  const openDelete  = (s) => { setSelected(s); setModal("delete"); };
  const closeModal  = () => { setModal(null); setSelected(null); };

  const handleSave = async (form) => {
    try {
      setSaving(true);
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        roleId: form.roleId,
        permissions: form.permissions,
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
        ...(modal === "edit" ? { isActive: form.isActive } : {}),
      };

      if (modal === "add") {
        await api.post("/users", payload);
      } else {
        await api.put(`/users/${selected.dbId}`, payload);
      }

      await fetchStaff();
      closeModal();
    } catch (err) {
      console.error("Failed to save staff:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Failed to save staff member. Check your console log.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/users/${selected.dbId}`);
      await fetchStaff();
    } catch (err) {
      console.error("Failed to delete staff:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Failed to delete staff member.");
    } finally {
      setDeleting(false);
      closeModal();
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-[#E9EEF4]">
        <Navbar title="Staff" breadcrumb="Welcome back, Admin!" />

        <div className="px-6 py-5 space-y-4">

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Staff", value: total, border: "#055E83" },
              { label: "Active Staff", value: active, border: "#16A34A" },
              { label: "Administrators", value: admins, border: "#E8C110" },
              { label: "Inactive", value: inactive, border: "#94A3B8" },
            ].map(({ label, value, border }) => (
              <div key={label} className="bg-white rounded-xl px-5 py-4" style={{ borderTop: `3px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-bold leading-tight text-gray-800">{value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`${filterPillCls} w-72`}>
              <Search size={13} className="text-gray-400 shrink-0" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, ID, email..."
                className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" />
            </div>
            <div className={filterPillCls}>
              <Filter size={12} className="text-gray-400" />
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600">
                {roleOptions.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className={filterPillCls}>
              <Filter size={12} className="text-gray-400" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="relative">
              <button onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-1.5 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition">
                <ArrowUpDown size={12} className="text-gray-400" /> Sort: {sortBy} <ChevronDown size={11} className="text-gray-400" />
              </button>
              {sortOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border-2 border-gray-300 z-10 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => { setSortBy(opt); setSortOpen(false); setPage(1); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition ${sortBy === opt ? "bg-[#055E83]/5 text-[#055E83]" : "text-gray-600 hover:bg-gray-50"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="ml-auto text-xs text-gray-400">Showing {filtered.length} staff</p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border-2 border-gray-300" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)", overflow: "hidden" }}>

            <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#055E83" }}>
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <Users size={15} /> Staff List
              </h2>
              <button onClick={openAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition"
                style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
                <UserPlus size={13} /> Add New Staff
              </button>
            </div>

            <div style={{ overflowX: "auto", width: "100%" }}>
              <div style={{ minWidth: "960px" }}>
                <div style={{ ...tableGridStyle, paddingTop: "0.75rem", paddingBottom: "0.75rem" }} className="border-b-2 border-gray-300 bg-gray-50/70 text-xs font-bold uppercase tracking-wider">
                  <span style={{ color: "#055E83" }}>Staff ID</span>
                  <span style={{ color: "#055E83" }}>Full Name</span>
                  <span style={{ color: "#055E83" }}>Email</span>
                  <span style={{ color: "#055E83" }}>Role</span>
                  <span style={{ color: "#055E83" }}>Status</span>
                  <span style={{ color: "#055E83", textAlign: "center" }}>Actions</span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-sm text-gray-400">Loading staff...</div>
                ) : paged.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400">No staff records match your filter criteria.</div>
                ) : (
                  paged.map((s) => {
                    const avatarColor = getAvatarColor(s.name);
                    const roleColor = getRoleColor(s.role);
                    const admin = isAdminRole(s.role);
                    return (
                      <div key={s.dbId} style={{ ...tableGridStyle, paddingTop: "0.875rem", paddingBottom: "0.875rem" }} className="border-b border-gray-200 hover:bg-slate-50/60 transition">
                        <span className="text-[11px] font-bold tracking-wide" style={{ color: "#055E83" }}>{s.id}</span>

                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>
                            {getInitials(s.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{s.name}</p>
                              {admin && <ShieldCheck size={12} className="text-amber-500 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">Joined {s.joined}</p>
                          </div>
                        </div>

                        <span className="text-xs text-gray-500 truncate">{s.email}</span>

                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md"
                            style={{ backgroundColor: roleColor.bg, color: roleColor.text }}>
                            <Briefcase size={10} /> {s.role}
                          </span>
                        </div>

                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase"
                            style={{ backgroundColor: s.isActive ? "#E8F5E9" : "#F1F5F9", color: s.isActive ? "#2E7D32" : "#64748B" }}>
                            {s.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openProfile(s)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                            style={{ backgroundColor: "#055E83", color: "#fff" }}>
                            <Eye size={12} /> View
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                            style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
                            <Edit3 size={12} /> Edit
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); openDelete(s); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm bg-red-50 text-red-500 border border-red-100">
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
              <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"><ChevronLeft size={14} /></button>
              <span className="text-xs text-gray-500 font-medium px-2">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"><ChevronRight size={14} /></button>
            </div>
          )}

        </div>

      {modal === "profile" && selected && <ProfileModal staff={selected} onClose={closeModal} onEdit={() => setModal("edit")} />}
      {(modal === "add" || modal === "edit") && (
        <StaffModal staff={modal === "edit" ? selected : null} roles={roles} saving={saving} onClose={closeModal} onSave={handleSave} />
      )}
      {modal === "delete" && selected && <DeleteModal staff={selected} deleting={deleting} onClose={closeModal} onConfirm={handleDelete} />}
    </div>
  );
}