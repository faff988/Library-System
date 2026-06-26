import { useState } from "react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";
import {
  Users, BookOpen, UserPlus, ChevronLeft, ChevronRight, Edit3, Trash2,
  ChevronDown, Crown, Star, X, Save, Check, Camera, Phone, Mail, MapPin,
  Calendar, RotateCcw, User, Clock, CheckCircle2, AlertCircle, Eye, Search,
  ArrowUpDown, Filter,
} from "lucide-react";

const INITIAL_MEMBERS = [
  { id: "MB-2023-8841", name: "Lim Sokha",     joined: "Jan 2023",  email: "lim.sokha@example.com",     status: "Active", membership: "Premium", initials: "LS", color: "bg-orange-100 text-orange-600" },
  { id: "MB-2023-8842", name: "Yeak Sopheak",  joined: "Sep 2023",  email: "yeak.sopheak@example.com",  status: "Active", membership: "Basic",   initials: "YS", color: "bg-blue-100 text-blue-600"   },
  { id: "MB-2023-8847", name: "Thoeun Dara",   joined: "Jul 2023",  email: "thoeun.dara@example.com",   status: "Active", membership: "Basic",   initials: "TD", color: "bg-blue-100 text-blue-600"   },
  { id: "MB-2023-8849", name: "Reng Sreypov",  joined: "Feb 2023",  email: "reng.sreypov@example.com",  status: "Active", membership: "Premium", initials: "RS", color: "bg-orange-100 text-orange-600" },
];

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600", "bg-green-100 text-green-600", "bg-yellow-100 text-yellow-600",
  "bg-purple-100 text-purple-600", "bg-pink-100 text-pink-600", "bg-red-100 text-red-600",
  "bg-indigo-100 text-indigo-600", "bg-teal-100 text-teal-600", "bg-gray-100 text-gray-600",
  "bg-orange-100 text-orange-600",
];

const SORT_OPTIONS = ["Newest to Oldest", "Oldest to Newest", "Name A-Z", "Name Z-A", "Premium Members", "Basic Members"];
const MEMBERSHIPS  = ["All Memberships", "Premium", "Basic"];
const STATUSES     = ["All Status", "Active", "Inactive", "Suspended"];
const PAGE_SIZE    = 6;

const MOCK_BORROWS = {
  "MB-2023-8841": {
    active:  [{ id: "BK-7721", title: "The Great Gatsby",      borrowDate: "Oct 24, 2023", dueDate: "Nov 07, 2023", status: "On Time"  },
              { id: "BK-8092", title: "Principles of Physics", borrowDate: "Oct 28, 2023", dueDate: "Nov 04, 2023", status: "Near Due" }],
    history: [{ id: "BK-4451", title: "Sapiens: A Brief History", returnDate: "Sep 15, 2023" },
              { id: "BK-2231", title: "The Art of War",            returnDate: "Aug 22, 2023" },
              { id: "BK-1099", title: "Cambodian History Vol. 1",  returnDate: "Jul 05, 2023" }],
  },
  "MB-2023-8842": {
    active:  [{ id: "BK-3301", title: "Introduction to Chemistry", borrowDate: "Nov 01, 2023", dueDate: "Nov 15, 2023", status: "On Time" }],
    history: [{ id: "BK-2201", title: "World History Atlas", returnDate: "Oct 10, 2023" }],
  },
  "MB-2023-8847": {
    active:  [],
    history: [{ id: "BK-1101", title: "English Grammar Today", returnDate: "Sep 30, 2023" },
              { id: "BK-0991", title: "Basic Mathematics",     returnDate: "Aug 14, 2023" }],
  },
  "MB-2023-8849": {
    active:  [{ id: "BK-5512", title: "Khmer Literature Vol. 2", borrowDate: "Nov 03, 2023", dueDate: "Nov 10, 2023", status: "Near Due" }],
    history: [{ id: "BK-4400", title: "Modern Economics", returnDate: "Oct 20, 2023" }],
  },
};
const getBorrows = (id) => MOCK_BORROWS[id] || { active: [], history: [] };

const toDateInput = (d) => d.toISOString().split("T")[0];
const todayStr    = () => toDateInput(new Date());
const expiryStr   = () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return toDateInput(d); };

const inputCls = "w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1B4965]/10 focus:border-[#1B4965] transition placeholder:text-gray-300";

const membershipStyle = {
  Premium: { bg: "#FFFDE7", text: "#B45309", icon: Crown },
  Basic:   { bg: "#EFF6FF", text: "#1D4ED8", icon: Star  },
};
const statusStyle = {
  Active:    { bg: "#E8F5E9", text: "#2E7D32" },
  Inactive:  { bg: "#F1F5F9", text: "#64748B" },
  Suspended: { bg: "#FFEBEE", text: "#C62828" },
};

// ── Shared form components ────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <input {...props} className={inputCls + " pr-10"} />
      <Icon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
    </div>
  );
}
function SelectInput({ children, colorCls = "text-gray-800", ...props }) {
  return (
    <div className="relative">
      <select {...props} className={`${inputCls} appearance-none cursor-pointer ${colorCls}`}>{children}</select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
    </div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ member, onClose, onEdit }) {
  const { active, history } = getBorrows(member.id);
  const totalBorrowed = active.length + history.length;
  const totalReturned = history.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-[#1B4965]">Member Profile</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-8 space-y-6">
          <div className="flex gap-6">
            <div className="flex flex-col items-center flex-shrink-0 w-48 bg-[#1B4965] rounded-2xl pt-7 pb-6 px-4">
              <div className={`w-20 h-20 rounded-full border-4 border-white/20 shadow-lg flex items-center justify-center text-2xl font-black ${member.color}`}>
                {member.initials}
              </div>
              <p className="text-white font-bold text-base mt-3 text-center leading-tight">{member.name}</p>
              <p className="text-white/50 text-[10px] mt-1 font-medium italic">{member.id}</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${member.status === "Active" ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-200 text-slate-500 border-slate-300"}`}>{member.status}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${member.membership === "Premium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-blue-100 text-blue-600 border-blue-200"}`}>{member.membership}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                {[
                  { icon: User,     label: "Member ID",   value: member.id              },
                  { icon: Mail,     label: "Email",       value: member.email           },
                  { icon: Phone,    label: "Phone",       value: member.phone    || "—" },
                  { icon: Crown,    label: "Membership",  value: member.membership      },
                  { icon: MapPin,   label: "Address",     value: member.address  || "—" },
                  { icon: Calendar, label: "Joined",      value: member.joined          },
                  { icon: Calendar, label: "Expiry Date", value: member.expiryDate || expiryStr() },
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
                <div className="bg-[#E8C110] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[#1B4965]/60 uppercase tracking-wider mb-0.5">Times Borrowed</p>
                    <p className="text-3xl font-black text-[#1B4965]">{totalBorrowed}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/25 rounded-xl flex items-center justify-center">
                    <BookOpen size={22} className="text-[#1B4965]" />
                  </div>
                </div>
                <div className="bg-[#EBF4F8] rounded-xl p-4 flex items-center justify-between border border-[#1B4965]/10">
                  <div>
                    <p className="text-[10px] font-bold text-[#1B4965]/50 uppercase tracking-wider mb-0.5">Times Returned</p>
                    <p className="text-3xl font-black text-[#1B4965]">{totalReturned}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#1B4965]/10 rounded-xl flex items-center justify-center">
                    <RotateCcw size={22} className="text-[#1B4965]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Currently Borrowed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center"><Clock size={14} className="text-orange-600" /></div>
                <h4 className="text-sm font-bold text-gray-800">Currently Borrowed</h4>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">{active.length} Active</span>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              {active.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 font-medium">No books currently borrowed.</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="text-[10px] font-bold text-[#1B4965] uppercase tracking-wider bg-[#EBF4F8]">
                    <tr><th className="px-5 py-3">Book Title / ID</th><th className="px-5 py-3">Borrowed On</th><th className="px-5 py-3">Due Date</th><th className="px-5 py-3">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {active.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-5 py-3.5"><p className="text-sm font-bold text-gray-800">{item.title}</p><p className="text-[10px] text-gray-400 italic">{item.id}</p></td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">{item.borrowDate}</td>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-700">{item.dueDate}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === "Near Due" ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                            {item.status === "Near Due" ? <AlertCircle size={10} /> : <Clock size={10} />} {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              {history.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 font-medium">No return history yet.</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="text-[10px] font-bold text-[#1B4965] uppercase tracking-wider bg-[#EBF4F8]">
                    <tr><th className="px-5 py-3">Book Title / ID</th><th className="px-5 py-3">Returned On</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-5 py-3.5"><p className="text-sm font-bold text-gray-800">{item.title}</p><p className="text-[10px] text-gray-400 italic">{item.id}</p></td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">{item.returnDate}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-600 border border-green-100">
                            <CheckCircle2 size={10} /> Returned
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button className="text-xs font-bold text-[#1B4965] hover:underline">View Receipt</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">Close</button>
          <button onClick={onEdit} className="flex items-center gap-2 bg-[#1B4965] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#144056] transition shadow-sm">
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
const makeEmptyForm = () => ({
  firstName: "", lastName: "", gender: "", dob: "", phone: "", email: "",
  membership: "", regDate: todayStr(), expiryDate: expiryStr(),
  address: "", status: "Active", notes: "",
});

function MemberModal({ member, onClose, onSave }) {
  const isEdit = Boolean(member);
  const [form, setForm] = useState(() =>
    isEdit ? {
      firstName: member.name.split(" ")[0] || "", lastName: member.name.split(" ").slice(1).join(" ") || "",
      gender: member.gender || "", dob: member.dob || "", phone: member.phone || "", email: member.email || "",
      membership: member.membership || "", regDate: member.regDate || todayStr(), expiryDate: member.expiryDate || expiryStr(),
      address: member.address || "", status: member.status || "Active", notes: member.notes || "",
    } : makeEmptyForm()
  );
  const set   = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const reset = () => setForm(makeEmptyForm());
  const handleSave = () => {
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    if (!fullName || !form.email.trim()) return;
    onSave({ ...form, name: fullName });
  };
  const statusColor = form.status === "Active" ? "text-green-600" : form.status === "Suspended" ? "text-red-500" : "text-gray-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#1B4965]">Member Information</h2>
            <p className="text-xs text-red-400 font-medium mt-0.5">* Required fields</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">
          <div className="flex gap-10">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 bg-[#EBF4F8] rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <User size={52} className="text-[#1B4965]/25" />
                </div>
                <button className="absolute bottom-1 right-1 p-2 bg-[#1B4965] text-white rounded-full shadow-lg hover:bg-[#144056] transition"><Camera size={14} /></button>
              </div>
              <button className="mt-4 flex items-center gap-1.5 bg-[#1B4965] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#144056] transition shadow-sm"><Camera size={12} /> Upload Photo</button>
              <p className="text-[10px] text-gray-400 mt-1">JPG, PNG up to 2MB</p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-x-5 gap-y-4">
              <Field label="First Name" required><input type="text" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Enter first name" className={inputCls} /></Field>
              <Field label="Last Name" required><input type="text" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Enter last name" className={inputCls} /></Field>
              <Field label="Gender" required><SelectInput value={form.gender} onChange={(e) => set("gender", e.target.value)}><option value="" disabled>Select gender</option><option>Male</option><option>Female</option><option>Other</option></SelectInput></Field>
              <Field label="Date of Birth" required><IconInput icon={Calendar} type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} /></Field>
              <Field label="Phone Number" required><IconInput icon={Phone} type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+855 XX XXX XXXX" /></Field>
              <Field label="Email Address"><IconInput icon={Mail} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="example@email.com" /></Field>
              <Field label="Membership Type" required><SelectInput value={form.membership} onChange={(e) => set("membership", e.target.value)}><option value="" disabled>Select membership</option><option>Basic</option><option>Premium</option></SelectInput></Field>
              <Field label="Registration Date" required><IconInput icon={Calendar} type="date" value={form.regDate} onChange={(e) => set("regDate", e.target.value)} /></Field>
              <Field label="Expiry Date">
                <div className="relative">
                  <input type="date" value={form.expiryDate} readOnly className={inputCls + " pr-10 bg-gray-50 text-gray-400 cursor-not-allowed"} />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Auto-set: 1 month from today</p>
              </Field>
              <Field label="Address"><IconInput icon={MapPin} type="text" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Enter full address" /></Field>
              <Field label="Membership Status" required><SelectInput colorCls={`font-bold ${statusColor}`} value={form.status} onChange={(e) => set("status", e.target.value)}><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Suspended">Suspended</option></SelectInput></Field>
              <Field label="Notes"><input type="text" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any additional notes..." className={inputCls} /></Field>
            </div>
          </div>
        </div>
        <div className="px-8 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={reset} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition"><RotateCcw size={14} /> Reset</button>
          <button onClick={handleSave} className="flex items-center gap-2 bg-[#E8C110] text-[#1B4965] px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-yellow-400 transition shadow-md">
            <Save size={14} /> {isEdit ? "Save Changes" : "Save New Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ member, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
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
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex items-center gap-2 bg-red-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-red-600 transition shadow-sm">
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Grid layout (header + rows share same template) ───────────────────────────
const gridLayout = "grid-cols-[180px_1fr_220px_150px_140px_170px] items-center";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Member() {
  const [members,    setMembers]  = useState(INITIAL_MEMBERS);
  const [search,     setSearch]   = useState("");
  const [membership, setMembership] = useState("All Memberships");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy,     setSortBy]   = useState("Newest to Oldest");
  const [sortOpen,   setSortOpen] = useState(false);
  const [page,       setPage]     = useState(1);
  const [modal,      setModal]    = useState(null);
  const [selected,   setSelected] = useState(null);

  const filtered = members
    .filter((m) =>
      (search === "" || `${m.name} ${m.id} ${m.email}`.toLowerCase().includes(search.toLowerCase())) &&
      (membership   === "All Memberships" || m.membership === membership) &&
      (statusFilter === "All Status"      || m.status     === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === "Name A-Z")        return a.name.localeCompare(b.name);
      if (sortBy === "Name Z-A")        return b.name.localeCompare(a.name);
      if (sortBy === "Oldest to Newest") return a.id.localeCompare(b.id);
      if (sortBy === "Premium Members") return a.membership === "Premium" ? -1 : 1;
      if (sortBy === "Basic Members")   return a.membership === "Basic"   ? -1 : 1;
      return b.id.localeCompare(a.id);
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

  const handleSave = (form) => {
    const fullName = form.name || `${form.firstName} ${form.lastName}`.trim();
    if (modal === "add") {
      const initials = fullName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
      const color    = AVATAR_COLORS[members.length % AVATAR_COLORS.length];
      const newId    = `MB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const joined   = new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
      setMembers((prev) => [...prev, { id: newId, name: fullName, joined, initials, color, email: form.email, status: form.status, membership: form.membership }]);
    } else {
      setMembers((prev) => prev.map((m) => m.id === selected.id ? { ...m, name: fullName, email: form.email, status: form.status, membership: form.membership } : m));
    }
    closeModal();
  };

  const handleDelete = () => { setMembers((prev) => prev.filter((m) => m.id !== selected.id)); closeModal(); };

  return (
    <div className="flex h-screen overflow-hidden antialiased font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Members" breadcrumb="Welcome back, Admin!" />

        <div className="px-6 py-5 space-y-4">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Members",   value: total,   subColor: "#055E83", border: "#055E83" },
              { label: "Active Members",  value: active,  subColor: "#16A34A", border: "#16A34A" },
              { label: "Premium Members", value: premium, subColor: "#CA8A04", border: "#E8C110" },
              { label: "Basic Members",   value: basic,   subColor: "#055E83", border: "#055E83" },
            ].map(({ label, value, subColor, border }) => (
              <div key={label} className="bg-white rounded-xl px-5 py-4" style={{ borderTop: `3px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-bold leading-tight" style={{ color: subColor }}>{value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-60">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, ID, email..."
                className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <Filter size={12} className="text-gray-400" />
              <select value={membership} onChange={(e) => { setMembership(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600">
                {MEMBERSHIPS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <Filter size={12} className="text-gray-400" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="relative">
              <button onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition">
                <ArrowUpDown size={12} className="text-gray-400" /> Sort: {sortBy} <ChevronDown size={11} className="text-gray-400" />
              </button>
              {sortOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => { setSortBy(opt); setSortOpen(false); setPage(1); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition ${sortBy === opt ? "bg-[#1B4965]/5 text-[#1B4965]" : "text-gray-600 hover:bg-gray-50"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="ml-auto text-xs text-gray-400">Showing 1–{paged.length} of {filtered.length} members</p>
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>

            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#1B4965" }}>
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <Users size={15} /> Member List
              </h2>
              <button onClick={openAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition"
                style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
                <UserPlus size={13} /> Add New Member
              </button>
            </div>

            {/* Column Headers */}
            <div className={`grid ${gridLayout} py-3 border-b border-gray-100 bg-gray-50/70 text-xs font-bold uppercase tracking-wider`}
              style={{ color: "#055E83" }}>
              <span className="pl-6">Member ID</span>
              <span>Full Name</span>
              <span>Email</span>
              <span>Membership</span>
              <span>Status</span>
              <span className="pr-6 text-center">Actions</span>
            </div>

            {/* Rows */}
            {paged.map((m) => (
              <div key={m.id} className={`grid ${gridLayout} py-3.5 border-b border-gray-100 hover:bg-slate-50/60 transition`}>
                <span className="pl-6 text-xs font-semibold" style={{ color: "#055E83" }}>{m.id}</span>

                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.color}`}>
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{m.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Joined {m.joined}</p>
                  </div>
                </div>

                <span className="text-xs text-gray-500 truncate">{m.email}</span>

                <div>
                  {(() => {
                    const s = membershipStyle[m.membership];
                    const Icon = s.icon;
                    return (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md"
                        style={{ backgroundColor: s.bg, color: s.text }}>
                        <Icon size={10} /> {m.membership}
                      </span>
                    );
                  })()}
                </div>

                <div>
                  <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: statusStyle[m.status]?.bg, color: statusStyle[m.status]?.text }}>
                    {m.status}
                  </span>
                </div>

                <div className="pr-6 flex items-center justify-center gap-1.5">
                  <button onClick={() => openProfile(m)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                    style={{ backgroundColor: "#1B4965", color: "#fff" }}>
                    <Eye size={12} /> View
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                    style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
                    <Edit3 size={12} /> Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openDelete(m); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm bg-red-50 text-red-500 border border-red-100">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between pb-2">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                <ChevronLeft size={12} /> Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className="w-7 h-7 rounded-lg text-xs font-semibold transition"
                  style={{ backgroundColor: page === n ? "#1B4965" : "transparent", color: page === n ? "#fff" : "#64748B", border: page === n ? "none" : "1px solid #E2E8F0" }}>
                  {n}
                </button>
              ))}
              {totalPages > 3 && <span className="text-gray-400 text-xs px-1">...</span>}
              {totalPages > 3 && (
                <button className="w-7 h-7 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500">{totalPages}</button>
              )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                style={{ backgroundColor: "#1B4965", color: "#fff" }}>
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>

        </div>
      </main>

      {modal === "profile" && selected && <ProfileModal member={selected} onClose={closeModal} onEdit={() => setModal("edit")} />}
      {(modal === "add" || modal === "edit") && <MemberModal member={modal === "edit" ? selected : null} onClose={closeModal} onSave={handleSave} />}
      {modal === "delete" && selected && <DeleteModal member={selected} onClose={closeModal} onConfirm={handleDelete} />}
    </div>
  );
}