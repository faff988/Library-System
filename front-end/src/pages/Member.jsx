import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import {
  Users, BookOpen, UserPlus, ChevronLeft, ChevronRight, Edit3, Trash2,
  ChevronDown, Crown, Star, X, Save, Check, Camera, Phone, Mail, MapPin,
  Calendar, RotateCcw, User, Clock, CheckCircle2, AlertCircle, Eye, Search,
  ArrowUpDown, Filter, Info
} from "lucide-react";

const INITIAL_MEMBERS = [
  { id: "MB-2023-8841", name: "Lim Sokha",     joined: "Jan 2023",  email: "lim.sokha@example.com",     status: "Active", membership: "Premium", initials: "LS", color: "bg-orange-100 text-orange-600" },
  { id: "MB-2023-8842", name: "Yeak Sopheak",  joined: "Sep 2023",  email: "yeak.sopheak@example.com",  status: "Active", membership: "Basic",   initials: "YS", color: "bg-blue-100 text-blue-600"   },
  { id: "MB-2023-8847", name: "Thoeun Dara",   joined: "Jul 2023",  email: "thoeun.dara@example.com",   status: "Active", membership: "Basic",   initials: "TD", color: "bg-blue-100 text-blue-600"   },
  { id: "MB-2023-8849", name: "Reng Sreypov",  joined: "Feb 2023",  email: "reng.sreypov@example.com",  status: "Active", membership: "Premium", initials: "RS", color: "bg-orange-100 text-orange-600" },
];

const AVATAR_COLORS = [
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#FEE2E2", text: "#991B1B" },
];

const SORT_OPTIONS = ["Newest to Oldest", "Oldest to Newest", "Name A-Z", "Name Z-A", "Premium Members", "Basic Members"];
const STATUSES     = ["All Status", "Active", "Inactive", "Suspended"];
const PAGE_SIZE    = 6;

const toDateInput = (d) => new Date(d).toISOString().split("T")[0];
const todayStr    = () => toDateInput(new Date());

const inputCls = "w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#055E83] transition text-gray-800 placeholder:text-gray-400";
const inputWithIconCls = "w-full border-2 border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#055E83] transition text-gray-800 placeholder:text-gray-400";
const filterPillCls = "flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2";

const getInitials = (name) => (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
const getAvatarColor = (name) => AVATAR_COLORS[(name || "?").charCodeAt(0) % AVATAR_COLORS.length];

const membershipStyle = {
  Premium: { bg: "#FFFDE7", text: "#B45309", icon: Crown },
  Basic:   { bg: "#EFF6FF", text: "#1D4ED8", icon: Star  },
};

const defaultMembershipStyle = { bg: "#F1F5F9", text: "#475569", icon: Star };
const getMembershipStyle = (name) => membershipStyle[name] || defaultMembershipStyle;


const statusStyle = {
  Active:    { bg: "#E8F5E9", text: "#2E7D32" },
  Inactive:  { bg: "#F1F5F9", text: "#64748B" },
  Suspended: { bg: "#FFEBEE", text: "#C62828" },
};

const tableGridStyle = {
  display: "grid",
  gridTemplateColumns: "150px 1.8fr 1.6fr 130px 110px 220px",
  alignItems: "center",
  gap: "1rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

function mapMember(m) {
  const year = m.created_at ? new Date(m.created_at).getFullYear() : new Date().getFullYear();
  return {
    dbId: m.member_id,
    id: `MB-${year}-${String(m.member_id).padStart(4, "0")}`,
    name: m.full_name,
    email: m.email,
    phone: m.phone_number || "",
    dob: m.date_of_birth ? String(m.date_of_birth).slice(0, 10) : "",
    status: m.status || "Active",
    membershipTypeId: m.membership_type_id ?? "",
    membership: m.membership_types?.type_name || "—",
    joined: m.created_at ? new Date(m.created_at).toLocaleString("en-US", { month: "short", year: "numeric" }) : "—",
    expiryDate: m.expiration_date ? String(m.expiration_date).slice(0, 10) : "",
  };
}

// ── Warning Modal ─────────────────────────────────────────────────────────────
function WarningModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border-2 border-gray-400">
        <div className="px-6 py-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-3">
            <AlertCircle size={22} className="text-amber-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Missing Information</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">{message}</p>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition shadow-sm"
            style={{ backgroundColor: "#055E83" }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared form components 
function Label({ children, required }) {
  return (
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
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
function ProfileModal({ member, onClose, onEdit }) {
  const { can } = useAuth();
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const avatarColor = getAvatarColor(member.name);

  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async() => {
      try{
        setLoading(true);
        const response = await api.get(`/members/${member.dbId}`);
        if(!cancelled && response.data?.success){
          setActive(response.data.data.activeBorrows || []);
          setHistory(response.data.data.borrowHistory || []);
        }
      } catch(err){
        console.error("Failed to load member borrow history", err);
      }finally {
        if(!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => {cancelled = true; };
  }, [member.dbId]);
  
  const totalBorrowed = active.length + history.length;
  const totalReturned = history.length;
  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-US", {month:"short", day:"2-digit", year:"numeric"}): "-");
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border-2 border-gray-400">
        <div className="px-8 py-5 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-[#055E83]">Member Profile</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-8 space-y-6">
          <div className="flex gap-6">
            <div className="flex flex-col items-center flex-shrink-0 w-48 bg-[#055E83] rounded-2xl pt-7 pb-6 px-4">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg flex items-center justify-center text-2xl font-black" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>
                {getInitials(member.name)}
              </div>
              <p className="text-white font-bold text-base mt-3 text-center leading-tight">{member.name}</p>
              <p className="text-white/50 text-[10px] mt-1 font-medium italic">{member.id}</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${member.status === "Active" ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-200 text-slate-500 border-slate-300"}`}>{member.status}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${member.membership === "Premium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-blue-100 text-blue-600 border-blue-200"}`}>{member.membership}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-gray-50 rounded-xl border-2 border-gray-300 divide-y-2 divide-gray-200 overflow-hidden">
                {[
                  { icon: User, label: "Member ID", value: member.id },
                  { icon: Mail, label: "Email", value: member.email },
                  { icon: Phone, label: "Phone", value: member.phone || "—" },
                  { icon: Crown, label: "Membership", value: member.membership },
                  { icon: Calendar, label: "Joined", value: member.joined },
                  { icon: Calendar, label: "Expiry Date", value: member.expiryDate || "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2.5 text-gray-400">
                      <Icon size={13} /><span className="text-xs font-semibold text-gray-500">{label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{value}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#E8C110] rounded-xl p-4 flex items-center justify-between border-2 border-yellow-500">
                  <div>
                    <p className="text-[10px] font-bold text-[#055E83]/60 uppercase tracking-wider mb-0.5">Times Borrowed</p>
                    <p className="text-3xl font-black text-[#055E83]">{totalBorrowed}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/25 rounded-xl flex items-center justify-center">
                    <BookOpen size={22} className="text-[#055E83]" />
                  </div>
                </div>
                <div className="bg-[#EEF6FB] rounded-xl p-4 flex items-center justify-between border-2 border-[#DCEAF3]">
                  <div>
                    <p className="text-[10px] font-bold text-[#055E83]/50 uppercase tracking-wider mb-0.5">Times Returned</p>
                    <p className="text-3xl font-black text-[#055E83]">{totalReturned}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#055E83]/10 rounded-xl flex items-center justify-center">
                    <RotateCcw size={22} className="text-[#055E83]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-sm text-gray-400 py-6 font-medium">Loading borrow history...</div>
          ) : (
            <>
              {/* Currently Borrowed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center"><Clock size={14} className="text-orange-600" /></div>
                    <h4 className="text-sm font-bold text-gray-800">Currently Borrowed</h4>
                  </div>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border-2 border-orange-200">{active.length} Active</span>
                </div>
                <div className="border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm">
                  {active.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6 font-medium">No books currently borrowed.</p>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="text-[10px] font-bold text-[#055E83] uppercase tracking-wider bg-[#EBF4F8] border-b-2 border-gray-300">
                        <tr><th className="px-5 py-3">Book Title / ID</th><th className="px-5 py-3">Borrowed On</th><th className="px-5 py-3">Due Date</th><th className="px-5 py-3">Status</th></tr>
                      </thead>
                      <tbody className="divide-y border-gray-200">
                        {active.map((item) => {
                          const now = new Date();
                          const due = new Date(item.due_date);
                          const isOverdue = item.status === "Overdue" || due < now;
                          const isNearDue = !isOverdue && (due - now) <= 3 * 24 * 60 * 60 * 1000;
                          const label = isOverdue ? "Overdue" : isNearDue ? "Near Due" : "On Time";
                          const warn = isOverdue || isNearDue;
                          return (
                            <tr key={item.borrow_id} className="hover:bg-gray-50/60 transition">
                              <td className="px-5 py-3.5"><p className="text-sm font-bold text-gray-800">{item.books?.title || "Unknown Book"}</p><p className="text-[10px] text-gray-400 italic">Book #{item.book_id}</p></td>
                              <td className="px-5 py-3.5 text-xs text-gray-500">{fmt(item.borrow_date)}</td>
                              <td className="px-5 py-3.5 text-xs font-bold text-gray-700">{fmt(item.due_date)}</td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${warn ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                                  {warn ? <AlertCircle size={10} /> : <Clock size={10} />} {label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Return History */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle2 size={14} className="text-green-600" /></div>
                  <h4 className="text-sm font-bold text-gray-800">Return History</h4>
                </div>
                <div className="border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm">
                  {history.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6 font-medium">No return history yet.</p>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="text-[10px] font-bold text-[#055E83] uppercase tracking-wider bg-[#EBF4F8] border-b-2 border-gray-300">
                        <tr><th className="px-5 py-3">Book Title / ID</th><th className="px-5 py-3">Returned On</th><th className="px-5 py-3">Status</th></tr>
                      </thead>
                      <tbody className="divide-y border-gray-200">
                        {history.map((item) => (
                          <tr key={item.borrow_id} className="hover:bg-gray-50/60 transition">
                            <td className="px-5 py-3.5"><p className="text-sm font-bold text-gray-800">{item.books?.title || "Unknown Book"}</p><p className="text-[10px] text-gray-400 italic">Book #{item.book_id}</p></td>
                            <td className="px-5 py-3.5 text-xs text-gray-500">{fmt(item.return_date)}</td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-600 border border-green-100">
                                <CheckCircle2 size={10} /> Returned
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-8 py-4 border-t-2 border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">Close</button>
          {can("members", "update") && (
            <button onClick={onEdit} className="flex items-center gap-2 bg-[#055E83] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-sm">
              <Edit3 size={14} /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
const makeEmptyForm = () => ({
  firstName: "", lastName: "", dob: "", phone: "", email: "",
  membershipTypeId: "", status: "Active",
});

function MemberModal({ member, membershipTypes, saving, onClose, onSave }) {
  const isEdit = Boolean(member);
  const [form, setForm] = useState(() =>
    isEdit ? {
      firstName: member.name.split(" ")[0] || "",
      lastName: member.name.split(" ").slice(1).join(" ") || "",
      dob: member.dob || "",
      phone: member.phone || "",
      email: member.email || "",
      membershipTypeId: member.membershipTypeId || "",
      status: member.status || "Active",
    } : makeEmptyForm()
  );
  const [warning, setWarning] = useState("");
  const set   = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const reset = () => setForm(makeEmptyForm());

  const handleSave = () => {
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    if (!fullName || !form.phone.trim() || !form.dob) {
      alert("Please fill in First Name, Last Name, Date of Birth, and Phone Number.");
      return;
    }
    onSave({ ...form, name: fullName });
  };
  const statusColor = form.status === "Active" ? "text-green-600" : form.status === "Suspended" ? "text-red-500" : "text-gray-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border-2 border-gray-400">
        <div className="px-8 py-5 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#055E83]">Member Information</h2>
            <p className="text-xs text-red-400 font-medium mt-0.5">* Required fields</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">
          <div className="flex gap-10">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 bg-[#EBF4F8] rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <User size={52} className="text-[#055E83]/25" />
                </div>
                <button className="absolute bottom-1 right-1 p-2 bg-[#055E83] text-white rounded-full shadow-lg hover:opacity-90 transition"><Camera size={14} /></button>
              </div>
              <button className="mt-4 flex items-center gap-1.5 bg-[#055E83] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition shadow-sm"><Camera size={12} /> Upload Photo</button>
              <p className="text-[10px] text-gray-400 mt-1">JPG, PNG up to 2MB</p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-x-5 gap-y-4">
              <div>
                <Label required>First Name</Label>
                <input type="text" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Enter first name" className={inputCls} />
              </div>
              <div>
                <Label required>Last Name</Label>
                <input type="text" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Enter last name" className={inputCls} />
              </div>
              <div>
                <Label required>Date of Birth</Label>
                <IconInput icon={Calendar} type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
              </div>
              <div>
                <Label required>Phone Number</Label>
                <IconInput icon={Phone} type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+855 XX XXX XXXX" />
              </div>
              <div>
                <Label >Email Address</Label>
                <IconInput icon={Mail} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="example@email.com" />
              </div>
              <div>
                <Label>Membership Type</Label>
                <SelectInput icon={Crown} value={form.membershipTypeId} onChange={(e) => set("membershipTypeId", e.target.value)}>
                  <option value="">No membership type</option>
                  {membershipTypes.map((t) => (
                    <option key={t.membership_type_id} value={t.membership_type_id}>{t.type_name}</option>
                  ))}
                </SelectInput>
              </div>
              {isEdit && (
                <div>
                  <Label required>Membership Status</Label>
                  <SelectInput icon={Info} colorCls={`font-bold ${statusColor}`} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Expired">Expired</option>
                  </SelectInput>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-8 py-4 border-t-2 border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={reset} className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition"><RotateCcw size={14} /> Reset</button>
          <button disabled={saving} onClick={handleSave} className="flex items-center gap-2 bg-[#E8C110] text-[#055E83] px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition shadow-md disabled:opacity-60">
            <Save size={14} /> {saving ? "Saving..." : isEdit ? "Save Changes" : "Save New Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ member, deleting, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden border-2 border-gray-400">
        <div className="bg-red-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Remove Member</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition"><X size={18} /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 font-medium">
            Are you sure you want to remove <span className="font-bold text-gray-800">{member.name}</span>? This action cannot be undone.
          </p>
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
export default function Member() {
  const { can } = useAuth();
  const [members,    setMembers]  = useState([]);
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting,setDeleting] = useState(false);

  const [search,     setSearch]   = useState("");
  const [membership, setMembership] = useState("All Memberships");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy,     setSortBy]   = useState("Newest to Oldest");
  const [sortOpen,   setSortOpen] = useState(false);
  const [page,       setPage]     = useState(1);
  const [modal,      setModal]    = useState(null);
  const [selected,   setSelected] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchMembers();
    fetchMembershipTypes();
  }, []);

  // Opens a member's profile when arriving from the navbar search (/member?open=ID)
  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId || loading) return;

    const target = members.find((m) => String(m.dbId) === openId);
    if (target) {
      setSelected(target);
      setModal("profile");
    }
    setSearchParams({}, { replace: true }); // clear ?open so a refresh doesn't reopen it
  }, [searchParams, members, loading]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // limit=500 stands in for "fetch everything" so the existing client-side
      // sort/filter/paginate below keeps working. Move to server-side paging
      // (page/limit params the backend already supports) if the member count grows.
      const response = await api.get("/members?limit=500");
      if (response.data?.success) {
        setMembers(response.data.data.map(mapMember));
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  };

   const fetchMembershipTypes = async () => {
    try {
      const response = await api.get("/membership-types");
      if (response.data?.success) setMembershipTypes(response.data.data);
    } catch (err) {
      console.error("Failed to load membership types:", err);
    }
  };

    const membershipOptions = ["All Memberships", ...membershipTypes.map((t) => t.type_name)];


  const filtered = members
    .filter((m) =>
      (search === "" || `${m.name} ${m.id} ${m.email}`.toLowerCase().includes(search.toLowerCase())) &&
      (membership === "All Memberships" || m.membership === membership) &&
      (statusFilter === "All Status" || m.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === "Name A-Z") return a.name.localeCompare(b.name);
      if (sortBy === "Name Z-A") return b.name.localeCompare(a.name);
      if (sortBy === "Oldest to Newest") return a.dbId - b.dbId;
      return b.dbId - a.dbId; // Newest to Oldest
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const total   = members.length;
  const active  = members.filter((m) => m.status === "Active").length;
  const premium = members.filter((m) => m.membership === "Premium").length;
  const basic   = members.filter((m) => m.membership === "Basic").length;

  const openProfile = (m) => { setSelected(m); setModal("profile"); };
  const openAdd     = () => { setSelected(null); setModal("add"); };
  const openEdit    = (m) => { setSelected(m); setModal("edit"); };
  const openDelete  = (m) => { setSelected(m); setModal("delete"); };
  const closeModal  = () => { setModal(null); setSelected(null); };

  const handleSave = async (form) => {
    try {
      setSaving(true);
      const payload = {
        fullName: form.name,
        dateOfBirth: form.dob,
        phoneNumber: form.phone.trim() || null,
        email: form.email.trim() || null,
        membershipTypeId: form.membershipTypeId || null,
        ...(modal === "edit" ? { status: form.status } : {}),
      };

      if (modal === "add") {
        await api.post("/members", payload);
      } else {
        await api.put(`/members/${selected.dbId}`, payload);
      }

      await fetchMembers();
      closeModal();
    } catch (err) {
      console.error("Failed to save member:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Failed to save member. Check your console log.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/members/${selected.dbId}`);
      await fetchMembers();
    } catch (err) {
      console.error("Failed to delete member:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Failed to delete member.");
    } finally {
      setDeleting(false);
      closeModal();
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-[#E9EEF4]">
        <Navbar title="Members" breadcrumb="Welcome back, Admin!" />

        <div className="px-6 py-5 space-y-4">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Members", value: total, border: "#055E83" },
              { label: "Active Members", value: active, border: "#16A34A" },
              { label: "Premium Members", value: premium, border: "#E8C110" },
              { label: "Basic Members", value: basic, border: "#055E83" },
            ].map(({ label, value, border }) => (
              <div key={label} className="bg-white rounded-xl px-5 py-4" style={{ borderTop: `3px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-bold leading-tight text-gray-800">{value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`${filterPillCls} w-72`}>
              <Search size={13} className="text-gray-400 shrink-0" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, ID, email..."
                className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" />
            </div>
            <div className={filterPillCls}>
              <Filter size={12} className="text-gray-400" />
              <select value={membership} onChange={(e) => { setMembership(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600">
                {membershipOptions.map((m) => <option key={m}>{m}</option>)}
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
            <p className="ml-auto text-xs text-gray-400">Showing {filtered.length} members</p>
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-xl border-2 border-gray-300" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)", overflow: "hidden" }}>

            <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#055E83" }}>
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <Users size={15} /> Member List
              </h2>
              {can("members", "create") && (
                <button onClick={openAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition"
                  style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
                  <UserPlus size={13} /> Add New Member
                </button>
              )}
            </div>

            <div style={{ overflowX: "auto", width: "100%" }}>
              <div style={{ minWidth: "960px" }}>
                <div style={{ ...tableGridStyle, paddingTop: "0.75rem", paddingBottom: "0.75rem" }} className="border-b-2 border-gray-300 bg-gray-50/70 text-xs font-bold uppercase tracking-wider">
                  <span style={{ color: "#055E83" }}>Member ID</span>
                  <span style={{ color: "#055E83" }}>Full Name</span>
                  <span style={{ color: "#055E83" }}>Email</span>
                  <span style={{ color: "#055E83" }}>Membership</span>
                  <span style={{ color: "#055E83" }}>Status</span>
                  <span style={{ color: "#055E83", textAlign: "center" }}>Actions</span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-sm text-gray-400">Loading members...</div>
                ) : paged.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400">No member records match your filter criteria.</div>
                ) : (
                  paged.map((m) => {
                    const avatarColor = getAvatarColor(m.name);
                    const mStyle = getMembershipStyle(m.membership);
                    const MIcon = mStyle.icon;
                    return (
                      <div key={m.dbId} style={{ ...tableGridStyle, paddingTop: "0.875rem", paddingBottom: "0.875rem" }} className="border-b border-gray-200 hover:bg-slate-50/60 transition">
                        <span className="text-[11px] font-bold tracking-wide" style={{ color: "#055E83" }}>{m.id}</span>

                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>
                            {getInitials(m.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{m.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Joined {m.joined}</p>
                          </div>
                        </div>

                        <span className="text-xs text-gray-500 truncate">{m.email}</span>

                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md"
                            style={{ backgroundColor: mStyle.bg, color: mStyle.text }}>
                            <MIcon size={10} /> {m.membership}
                          </span>
                        </div>

                        <div>
                          <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md uppercase"
                            style={{ backgroundColor: statusStyle[m.status]?.bg, color: statusStyle[m.status]?.text }}>
                            {m.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openProfile(m)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                            style={{ backgroundColor: "#055E83", color: "#fff" }}>
                            <Eye size={12} /> View
                          </button>
                          {can("members", "update") && (
                            <button onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                              style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
                              <Edit3 size={12} /> Edit
                            </button>
                          )}
                          {can("members", "delete") && (
                            <button onClick={(e) => { e.stopPropagation(); openDelete(m); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm bg-red-50 text-red-500 border border-red-100">
                              <Trash2 size={12} />
                            </button>
                          )}
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

      {modal === "profile" && selected && <ProfileModal member={selected} onClose={closeModal} onEdit={() => setModal("edit")} />}
      {(modal === "add" || modal === "edit") && (
        <MemberModal member={modal === "edit" ? selected : null} membershipTypes={membershipTypes} saving={saving} onClose={closeModal} onSave={handleSave} />
      )}
      {modal === "delete" && selected && <DeleteModal member={selected} deleting={deleting} onClose={closeModal} onConfirm={handleDelete} />}
    </div>
  );
}