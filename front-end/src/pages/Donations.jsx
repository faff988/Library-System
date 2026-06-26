import { useState } from "react";
import { Heart, BookOpen, DollarSign, TrendingUp, Plus, Printer, Edit2, Trash2, CheckCircle, Mail, Phone, MapPin, Calendar, Check, AlertCircle, User, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

const DONATIONS = [
  { id: "1", code: "DON-2026-0303", donor: "Margaret Wilson", type: "Books", items: "25 books", date: "2026-03-03", value: 450, email: "m.wilson@example.com", phone: "+855 12 345 678", address: "123 Riverside Road, Siem Reap, Cambodia", itemDesc: "25 Children's Books", qty: 25, notes: "A collection of gently used English and Khmer bilingual children's books. Requested that they be placed in the early reading section. Excellent condition.", receivedBy: "Sokha Chen (Librarian)", status: "Acknowledged", history: { count: 4, lifetime: 1250 } },
  { id: "2", code: "DON-2026-0302", donor: "John Stevens", type: "Money", items: "Cash donation", date: "2026-03-02", value: 500, email: "john@example.com", phone: "+855 23 456 789", address: "45 Angkor Road, Siem Reap", itemDesc: "Cash Donation", qty: 1, notes: "", receivedBy: "Sokha Chen (Librarian)", status: "Acknowledged", history: { count: 2, lifetime: 800 } },
  { id: "3", code: "DON-2026-0301", donor: "Sarah Parker", type: "Books", items: "10 children's books", date: "2026-03-01", value: 180, email: "sparker@example.com", phone: "+855 34 567 890", address: "78 Temple St, Siem Reap", itemDesc: "10 Children's Books", qty: 10, notes: "", receivedBy: "Dara Kim (Librarian)", status: "Acknowledged", history: { count: 1, lifetime: 180 } },
  { id: "4", code: "DON-2026-0228", donor: "Anonymous", type: "Money", items: "Online donation", date: "2026-02-28", value: 1000, email: "", phone: "", address: "", itemDesc: "Online Donation", qty: 1, notes: "", receivedBy: "System", status: "Acknowledged", history: { count: 1, lifetime: 1000 } },
  { id: "5", code: "DON-2026-0227", donor: "Community Center", type: "Books", items: "50 textbooks", date: "2026-02-27", value: 850, email: "center@community.org", phone: "+855 45 678 901", address: "Community Center, Siem Reap", itemDesc: "50 Textbooks", qty: 50, notes: "", receivedBy: "Sokha Chen (Librarian)", status: "Acknowledged", history: { count: 3, lifetime: 2100 } },
];

const TYPES = ["All Types", "Books", "Money"];
const STATUSES = ["All Status", "Acknowledged", "Pending"];

const stats = [
  { label: "Total Donations", value: "$12,450", sub: "+18% this month", subColor: "#E11D48", border: "#E11D48" },
  { label: "Books Donated",   value: "342",     sub: "+25 this week",   subColor: "#055E83", border: "#055E83" },
  { label: "Cash Donations",  value: "$8,650",  sub: "+12% this month", subColor: "#16A34A", border: "#16A34A" },
  { label: "Total Donors",    value: "156",     sub: "+8 new donors",   subColor: "#CA8A04", border: "#E8C110" },
];

const typeStyle = {
  Books: { bg: "#EFF6FF", text: "#1D4ED8" },
  Money: { bg: "#F0FDF4", text: "#166534" },
};

const statusStyle = {
  Acknowledged: { bg: "#E8F5E9", text: "#2E7D32" },
  Pending:      { bg: "#FFFDE7", text: "#B78103" },
};

const gridLayout = "grid-cols-[50px_1fr_170px_150px_100px_160px_140px] items-center gap-4 px-6";

// ─── Page 1: Donations List ───────────────────────────────────────────────────
function DonationsList({ onAdd, onView, onEdit }) {
  const [search, setSearch]   = useState("");
  const [type, setType]       = useState("All Types");
  const [status, setStatus]   = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 32;

  const filtered = DONATIONS.filter((d) =>
    (search === "" || `${d.donor} ${d.code}`.toLowerCase().includes(search.toLowerCase())) &&
    (type === "All Types" || d.type === type) &&
    (status === "All Status" || d.status === status)
  );

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Welcome back, Admin!" />
      <div className="px-6 py-5 space-y-4">

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map(({ label, value, sub, subColor, border }) => (
            <div key={label} className="bg-white rounded-xl px-5 py-4" style={{ borderTop: `3px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-2xl font-bold leading-tight" style={{ color: subColor }}>{value}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: subColor }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-60">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by donor, ID, type..."
              className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Filter size={12} className="text-gray-400" />
            <select value={type} onChange={(e) => setType(e.target.value)} className="text-xs outline-none bg-transparent text-gray-600">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Filter size={12} className="text-gray-400" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs outline-none bg-transparent text-gray-600">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <ArrowUpDown size={12} className="text-gray-400" />
            <span className="text-xs text-gray-600">Sort: Date</span>
          </div>
          <p className="ml-auto text-xs text-gray-400">Showing 1–{filtered.length} of 156 donations</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
          {/* Header Title Bar */}
          <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#1B4965" }}>
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <Heart size={15} /> Donation Catalog
            </h2>
            <button onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition"
              style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
              <Plus size={13} /> Add Donation
            </button>
          </div>

          {/* Column Headers */}
          <div className={`grid ${gridLayout} py-3 border-b border-gray-100 bg-gray-50/70 text-xs font-bold uppercase tracking-wider`}
            style={{ color: "#055E83" }}>
            <span>D.ID</span>
            <span>Donor </span>
            <span>Type</span>
            <span>Items</span>
            <span>Date</span>
            <span className="text-center">Status</span>
            <span className="text-center">Actions</span>
          </div>

          {/* Rows */}
          {filtered.map((d) => (
            <div key={d.id} className={`grid ${gridLayout} py-3.5 border-b border-gray-100 hover:bg-slate-50/60 transition text-sm text-gray-700`}>
              <span className="text-xs text-gray-400 font-medium">{d.id}</span>
              <div>
                <p className="text-sm text-gray-900 font-semibold leading-tight">{d.donor}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: "#055E83" }}>{d.code}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md w-fit"
                style={{ backgroundColor: typeStyle[d.type]?.bg, color: typeStyle[d.type]?.text }}>
                {d.type === "Books" ? <BookOpen size={11} /> : <DollarSign size={11} />} {d.type}
              </span>
              <span className="text-xs font-medium text-gray-600">{d.items}</span>
              <span className="text-xs text-gray-500">{d.date}</span>

              {/* Status */}
              <div className="text-center">
                <span className="inline-block text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-md min-w-[100px] text-center"
                  style={{ backgroundColor: statusStyle[d.status]?.bg, color: statusStyle[d.status]?.text }}>
                  {d.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={() => onView(d)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                  style={{ backgroundColor: "#1B4965", color: "#fff" }}>
                  <Eye size={12} /> View
                </button>
                <button onClick={() => onEdit(d)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm"
                  style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
                  <Pencil size={12} /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pb-2">
          <p className="text-xs text-gray-400">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
              <ChevronLeft size={12} /> Prev
            </button>
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => setCurrentPage(n)}
                className="w-7 h-7 rounded-lg text-xs font-semibold transition"
                style={{ backgroundColor: currentPage === n ? "#1B4965" : "transparent", color: currentPage === n ? "#fff" : "#64748B", border: currentPage === n ? "none" : "1px solid #E2E8F0" }}>
                {n}
              </button>
            ))}
            <span className="text-gray-400 text-xs px-1">...</span>
            <button className="w-7 h-7 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500">{totalPages}</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={{ backgroundColor: "#1B4965", color: "#fff" }}>
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Page 2: Add Donation ─────────────────────────────────────────────────────
function AddDonation({ onCancel, onSave }) {
  const [donationType, setDonationType] = useState("books");
  const [anon, setAnon] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "+855", desc: "", qty: "", value: "", date: "", notes: "" });

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Donations › Add New Donation" onBack={onCancel} />
      <div className="px-14 py-10 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1B4965]">Add New Donation</h2>
            <p className="text-sm text-gray-400 mt-0.5">Record a new donation from a community member or organization.</p>
          </div>
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 font-semibold px-2 py-1 transition">Cancel</button>
        </div>

        {/* Donor Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
            <User size={15} className="text-[#E8C110]" />
            <h3 className="text-white font-bold text-sm tracking-wide">Donor Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Donor Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name or organization"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer">
                  <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="w-4 h-4 accent-[#1B4965] rounded" />
                  Make donation anonymous
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address (Optional)</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="For tax receipt"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone Number (Optional)</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
            </div>
          </div>
        </div>

        {/* Donation Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
            <BookOpen size={15} className="text-[#E8C110]" />
            <h3 className="text-white font-bold text-sm tracking-wide">Donation Details</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Donation Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDonationType("books")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition ${donationType === "books" ? "border-[#1B4965] bg-[#1B4965]/5 text-[#1B4965]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <BookOpen size={14} /> Books & Materials
                </button>
                <button onClick={() => setDonationType("money")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition ${donationType === "money" ? "border-[#1B4965] bg-[#1B4965]/5 text-[#1B4965]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <DollarSign size={14} /> Financial Contribution
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Item Description</label>
                <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder="e.g., Children's books, Textbooks"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Quantity</label>
                <input value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })}
                  placeholder="Number of items"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Estimated Value (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Date Received</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Additional Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions or details..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition resize-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition">Clear Form</button>
          <button onClick={onSave}
            className="flex items-center gap-2 text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition shadow-sm"
            style={{ backgroundColor: "#1B4965" }}>
            <Check size={14} /> Save Donation
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page 3: Donor Detail ─────────────────────────────────────────────────────
function DonorDetail({ donation, onEdit, onDelete, onBackToList }) {
  return (
    <div>
      <Navbar title="Donations" breadcrumb="Donations › Donor Information" onBack={onBackToList} />
      <div className="px-6 py-5">

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 mb-5 border border-gray-100"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md"
              style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
              <CheckCircle size={12} /> {donation.status}
            </span>
            <span className="text-xs font-bold tracking-wider" style={{ color: "#055E83" }}>#{donation.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
              <Printer size={12} /> Print Receipt
            </button>
            <button onClick={onEdit}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-85 transition"
              style={{ backgroundColor: "#E8C110", color: "#1B4965", border: "none" }}>
              <Edit2 size={12} /> Edit
            </button>
            <button onClick={onDelete}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 flex flex-col gap-4">

            {/* Donor Info Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
                <User size={14} className="text-[#E8C110]" />
                <h3 className="text-white font-bold text-sm tracking-wide">Donor Information</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: "#1B4965/10", background: "#EEF4F8", color: "#1B4965" }}>
                    {donation.donor === "Anonymous" ? "?" : donation.donor.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{donation.donor}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Community Member · Donor since 2024</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {donation.email && <div className="flex items-center gap-2 text-xs text-gray-500"><Mail size={13} className="text-gray-400" /> {donation.email}</div>}
                  {donation.phone && <div className="flex items-center gap-2 text-xs text-gray-500"><Phone size={13} className="text-gray-400" /> {donation.phone}</div>}
                  {donation.address && <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin size={13} className="text-gray-400" /> {donation.address}</div>}
                </div>
              </div>
            </div>

            {/* Donation Details Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-[#E8C110]" />
                  <h3 className="font-bold text-sm" style={{ color: "#1B4965" }}>Donation Details</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: typeStyle[donation.type]?.bg, color: typeStyle[donation.type]?.text }}>
                  {donation.type === "Books" ? <BookOpen size={11} /> : <DollarSign size={11} />}
                  {donation.type === "Books" ? "Books & Materials" : "Financial Contribution"}
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-4">
                  {[
                    { label: "Items Donated",    value: donation.itemDesc },
                    { label: "Estimated Value",  value: `$${donation.value.toFixed(2)}` },
                    { label: "Date Received",    value: donation.date, icon: <Calendar size={12} className="text-gray-400" /> },
                    { label: "Received By",      value: donation.receivedBy },
                  ].map(({ label, value, icon }) => (
                    <div key={label}>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="font-bold text-gray-700 text-sm flex items-center gap-1.5">{icon}{value}</p>
                    </div>
                  ))}
                </div>
                {donation.notes && (
                  <div className="mt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Notes</p>
                    <div className="bg-gray-50 rounded-lg p-3.5 text-xs text-gray-600 leading-relaxed border border-gray-100">{donation.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-5 text-white" style={{ backgroundColor: "#1B4965", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Donor History</p>
              <p className="text-2xl font-bold">{donation.history.count}</p>
              <p className="text-xs text-white/60 mb-4">Total Donations</p>
              <div className="border-t border-white/10 pt-3">
                <p className="text-2xl font-bold" style={{ color: "#E8C110" }}>${donation.history.lifetime.toLocaleString()}</p>
                <p className="text-xs text-white/60 mt-0.5">Lifetime Value</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="font-bold text-gray-700 text-sm mb-4">Activity Log</p>
              <div className="flex flex-col gap-4">
                {[
                  { label: "Thank You Sent",    date: "March 4, 2026 · 10:30 AM", color: "#4ADE80" },
                  { label: "Items Cataloged",   date: "March 3, 2026 · 4:15 PM",  color: "#60A5FA" },
                  { label: "Donation Received", date: "March 3, 2026 · 2:00 PM",  color: "#D1D5DB" },
                ].map(({ label, date, color }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                    <div>
                      <p className="text-xs font-bold text-gray-700">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page 4: Edit Donation ────────────────────────────────────────────────────
function EditDonation({ donation, onCancel, onUpdate }) {
  const [donationType, setDonationType] = useState(donation.type === "Books" ? "books" : "money");
  const [form, setForm] = useState({
    name: donation.donor, email: donation.email, phone: donation.phone,
    desc: donation.itemDesc, qty: String(donation.qty), value: String(donation.value),
    date: donation.date, notes: donation.notes, anon: false,
  });

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Donations › Donor Information › Edit" onBack={onCancel} />
      <div className="px-6 py-5">

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 mb-5 border border-gray-100"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md"
              style={{ backgroundColor: "#FFFDE7", color: "#B78103" }}>
              <AlertCircle size={12} /> In Progress
            </span>
            <span className="text-xs font-bold tracking-wider" style={{ color: "#055E83" }}>#{donation.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 transition">Cancel</button>
            <button onClick={onUpdate}
              className="flex items-center gap-1.5 text-white text-xs font-bold px-5 py-2 rounded-lg hover:opacity-90 transition shadow-sm"
              style={{ backgroundColor: "#1B4965" }}>
              Update Donation
            </button>
          </div>
        </div>

        {/* Donor Info */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
            <User size={14} className="text-[#E8C110]" />
            <h3 className="text-white font-bold text-sm tracking-wide">Donor Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Donor Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer">
                  <input type="checkbox" checked={form.anon} onChange={(e) => setForm({ ...form, anon: e.target.checked })} className="w-4 h-4 accent-[#1B4965]" />
                  Make donation anonymous
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Details */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
            <BookOpen size={14} className="text-[#E8C110]" />
            <h3 className="text-white font-bold text-sm tracking-wide">Donation Details</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Donation Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDonationType("books")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition ${donationType === "books" ? "border-[#1B4965] bg-[#1B4965]/5 text-[#1B4965]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <BookOpen size={14} /> Books & Materials
                </button>
                <button onClick={() => setDonationType("money")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition ${donationType === "money" ? "border-[#1B4965] bg-[#1B4965]/5 text-[#1B4965]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <DollarSign size={14} /> Financial Contribution
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Item Description</label>
                <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Quantity</label>
                <input value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Estimated Value (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Date Received</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Additional Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition resize-none" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Main Router ──────────────────────────────────────────────────────────────
export default function Donations() {
  const [page, setPage] = useState("list");
  const [selectedDonation, setSelectedDonation] = useState(null);

  const renderPage = () => {
    if (page === "add") return <AddDonation onCancel={() => setPage("list")} onSave={() => setPage("list")} />;
    if (page === "detail" && selectedDonation) return <DonorDetail donation={selectedDonation} onEdit={() => setPage("edit")} onDelete={() => setPage("list")} onBackToList={() => setPage("list")} />;
    if (page === "edit" && selectedDonation) return <EditDonation donation={selectedDonation} onCancel={() => setPage("detail")} onUpdate={() => setPage("detail")} />;
    return <DonationsList onAdd={() => setPage("add")} onView={(d) => { setSelectedDonation(d); setPage("detail"); }}onEdit={(d) => {setSelectedDonation(d);setPage("edit");}}  />;
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        {renderPage()}
      </main>
    </div>
  );
}