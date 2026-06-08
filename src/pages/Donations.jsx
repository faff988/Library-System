import { useState } from "react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";
import {
  Heart,
  BookOpen,
  DollarSign,
  TrendingUp,
  Plus,
  Printer,
  Edit2,
  Trash2,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
  AlertCircle,
  User,
} from "lucide-react";

const DONATIONS = [
  {
    id: "DON-2026-0303",
    donor: "Margaret Wilson",
    type: "Books",
    items: "25 books",
    date: "2026-03-03",
    value: 450,
    email: "m.wilson@example.com",
    phone: "+855 12 345 678",
    address: "123 Riverside Road, Siem Reap, Cambodia",
    itemDesc: "25 Children's Books",
    qty: 25,
    notes:
      "A collection of gently used English and Khmer bilingual children's books. Requested that they be placed in the early reading section. Excellent condition.",
    receivedBy: "Sokha Chen (Librarian)",
    status: "Acknowledged",
    history: { count: 4, lifetime: 1250 },
  },
  {
    id: "DON-2026-0302",
    donor: "John Stevens",
    type: "Money",
    items: "Cash donation",
    date: "2026-03-02",
    value: 500,
    email: "john@example.com",
    phone: "+855 23 456 789",
    address: "45 Angkor Road, Siem Reap",
    itemDesc: "Cash Donation",
    qty: 1,
    notes: "",
    receivedBy: "Sokha Chen (Librarian)",
    status: "Acknowledged",
    history: { count: 2, lifetime: 800 },
  },
  {
    id: "DON-2026-0301",
    donor: "Sarah Parker",
    type: "Books",
    items: "10 children's books",
    date: "2026-03-01",
    value: 180,
    email: "sparker@example.com",
    phone: "+855 34 567 890",
    address: "78 Temple St, Siem Reap",
    itemDesc: "10 Children's Books",
    qty: 10,
    notes: "",
    receivedBy: "Dara Kim (Librarian)",
    status: "Acknowledged",
    history: { count: 1, lifetime: 180 },
  },
  {
    id: "DON-2026-0228",
    donor: "Anonymous",
    type: "Money",
    items: "Online donation",
    date: "2026-02-28",
    value: 1000,
    email: "",
    phone: "",
    address: "",
    itemDesc: "Online Donation",
    qty: 1,
    notes: "",
    receivedBy: "System",
    status: "Acknowledged",
    history: { count: 1, lifetime: 1000 },
  },
  {
    id: "DON-2026-0227",
    donor: "Community Center",
    type: "Books",
    items: "50 textbooks",
    date: "2026-02-27",
    value: 850,
    email: "center@community.org",
    phone: "+855 45 678 901",
    address: "Community Center, Siem Reap",
    itemDesc: "50 Textbooks",
    qty: 50,
    notes: "",
    receivedBy: "Sokha Chen (Librarian)",
    status: "Acknowledged",
    history: { count: 3, lifetime: 2100 },
  },
];

// ─── Page 1: Donations List ───────────────────────────────────────────────────
function DonationsList({ onAdd, onView }) {
  return (
    <div>
      <Navbar title="Donations" breadcrumb="Welcome Back!" />
      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              icon: Heart,
              color: "bg-rose-100 text-rose-500",
              label: "Total Donations",
              value: "$12,450",
              sub: "+18% this month",
            },
            {
              icon: BookOpen,
              color: "bg-blue-100 text-blue-500",
              label: "Books Donated",
              value: "342",
              sub: "+25 this week",
            },
            {
              icon: DollarSign,
              color: "bg-yellow-100 text-yellow-500",
              label: "Cash Donations",
              value: "$8,650",
              sub: "+12% this month",
            },
            {
              icon: TrendingUp,
              color: "bg-green-100 text-green-500",
              label: "Total Donors",
              value: "156",
              sub: "+8 new donors",
            },
          ].map(({ icon: Icon, color, label, value, sub }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-dashed border-[#1B4965]/25 p-5 flex items-center gap-4 shadow-sm"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}
              >
                <Icon size={20} />
              </div>
              <div>
                <p className="text-lg font-semibold uppercase tracking-wider text-gray-400">
                  {label}
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-0.5">
                  {value}
                </p>
                <p className="text-md text-green-500 font-medium mt-0.5">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-5">
          <div className="flex-1 bg-white rounded-xl border border-dashed border-[#1B4965]/25 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-700">
                Recent Donations
              </h2>
              <button
                onClick={onAdd}
                className="flex items-center gap-2 bg-[#1B4965] text-white text-lg font-semibold px-4 py-2 rounded-lg hover:bg-[#144056] transition shadow-sm"
              >
                <Plus size={18} /> Add Donation
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-md font-bold text-gray-400 uppercase border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3.5 tracking-wider">
                    Donor
                  </th>
                  <th className="text-left px-6 py-3.5 tracking-wider">Type</th>
                  <th className="text-left px-6 py-3.5 tracking-wider">
                    Items
                  </th>
                  <th className="text-left px-6 py-3.5 tracking-wider">Date</th>
                  <th className="text-left px-6 py-3.5 tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {DONATIONS.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => onView(d)}
                    className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 font-bold text-gray-700 text-lg">
                      {d.donor}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${d.type === "Books" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}
                      >
                        {d.type === "Books" ? (
                          <BookOpen size={11} />
                        ) : (
                          <DollarSign size={11} />
                        )}{" "}
                        {d.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-lg text-gray-500 font-medium">
                      {d.items}
                    </td>
                    <td className="px-6 py-4 text-lg text-gray-500 font-medium">
                      {d.date}
                    </td>
                    <td className="px-6 py-4 text-lg font-bold text-[#1B4965]">
                      ${d.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "+855",
    desc: "",
    qty: "",
    value: "",
    date: "",
    notes: "",
  });

  return (
    <div>
      <Navbar
        title="Donations"
        breadcrumb="Donations › Add new Donation"
        onBack={onCancel}
      />
      <div className="px-14 py-10 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#1B4965]">
              Add New Donation
            </h2>
            <p className="text-lg text-gray-400 mt-0.5">
              Record a new donation from a community member or organization.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-xl text-gray-500 hover:text-gray-700 font-semibold px-2 py-1 transition"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <User size={16} className="text-[#F5C842]" />
            <h3 className="text-xl font-bold text-[#1B4965]">
              Donor Information
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Donor Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name or organization"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-lg text-gray-600 font-medium cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={anon}
                  onChange={(e) => setAnon(e.target.checked)}
                  className="w-4 h-4 accent-[#1B4965] rounded"
                />
                Make donation anonymous
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Email Address (Optional)
              </label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="For tax receipt"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
              />
            </div>
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Phone Number (Optional)
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={16} className="text-[#F5C842]" />
            <h3 className="text-xl font-bold text-[#1B4965]">
              Donation Details
            </h3>
          </div>
          <div className="mb-4">
            <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Donation Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDonationType("books")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-lg font-bold transition ${donationType === "books" ? "border-[#1B4965] bg-[#1B4965]/5 text-[#1B4965]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                <BookOpen size={15} /> Books & Materials
              </button>
              <button
                onClick={() => setDonationType("money")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-lg font-bold transition ${donationType === "money" ? "border-[#1B4965] bg-[#1B4965]/5 text-[#1B4965]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                <DollarSign size={15} /> Financial Contribution
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Item Description
              </label>
              <input
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="e.g., Children's books, Textbooks"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
              />
            </div>
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Quantity
              </label>
              <input
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                placeholder="Number of items"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Estimated Value (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-md font-medium">
                  $
                </span>
                <input
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
                />
              </div>
            </div>
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Date Received
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
              />
            </div>
          </div>
          <div>
            <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Additional Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any special instructions or details..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-lg outline-none focus:border-[#1B4965] transition resize-none font-medium"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-lg font-bold text-gray-500 hover:text-gray-700 transition"
          >
            Clear Form
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 bg-[#1B4965] text-white text-lg font-bold px-6 py-2.5 rounded-lg hover:bg-[#144056] transition shadow-sm"
          >
            <Check size={15} /> Save Donation
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
      <Navbar
        title="Donations"
        breadcrumb="Donations › Donor Information"
        onBack={onBackToList}
      />
      <div className="px-8 py-6">
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-8 py-6 mb-7 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-lg font-bold px-3 py-1.5 rounded-full">
              <CheckCircle size={12} /> Status: {donation.status}
            </span>
            <span className="text-md text-gray-400 font-bold tracking-wider">
              ID: #{donation.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-lg font-bold text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
              <Printer size={13} /> Print Receipt
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-lg font-bold text-[#1B4965] border border-[#1B4965]/30 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
            >
              <Edit2 size={13} /> Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-lg font-bold text-red-500 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 flex flex-col gap-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1B4965] px-7 py-5 flex items-center gap-2">
                <User size={15} className="text-[#F5C842]" />
                <h3 className="text-white font-bold text-lg tracking-wide">
                  Donor Information
                </h3>
              </div>
              <div className="p-7">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#1B4965]/10 flex items-center justify-center font-bold text-lg text-[#1B4965]">
                    {donation.donor === "Anonymous"
                      ? "?"
                      : donation.donor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      {donation.donor}
                    </p>
                    <p className="text-md font-medium text-gray-400 mt-0.5">
                      Community Member • Donor since 2024
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 mt-2">
                  {donation.email && (
                    <div className="flex items-center gap-2 text-md font-medium text-gray-500">
                      <Mail size={14} className="text-gray-400" />{" "}
                      {donation.email}
                    </div>
                  )}
                  {donation.phone && (
                    <div className="flex items-center gap-2 text-md font-medium text-gray-500">
                      <Phone size={14} className="text-gray-400" />{" "}
                      {donation.phone}
                    </div>
                  )}
                  {donation.address && (
                    <div className="flex items-center gap-2 text-md font-medium text-gray-500">
                      <MapPin size={14} className="text-gray-400" />{" "}
                      {donation.address}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-[#F5C842]" />
                  <h3 className="font-bold text-[#1B4965] text-lg">
                    Donation Details
                  </h3>
                </div>
                <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-lg font-bold px-2.5 py-1 rounded-full">
                  <BookOpen size={11} />{" "}
                  {donation.type === "Books"
                    ? "Books & Materials"
                    : "Financial Contribution"}
                </span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-4">
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Items Donated
                    </p>
                    <p className="font-bold text-gray-800 text-md">
                      {donation.itemDesc}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Estimated Value
                    </p>
                    <p className="font-bold text-gray-800 text-md">
                      ${donation.value.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Date Received
                    </p>
                    <p className="font-bold text-gray-700 text-md flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />{" "}
                      {donation.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Received By
                    </p>
                    <p className="font-bold text-gray-700 text-md">
                      {donation.receivedBy}
                    </p>
                  </div>
                </div>
                {donation.notes && (
                  <div className="mt-4 pt-2">
                    <p className="text-md font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Notes
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3.5 text-md font-medium text-gray-600 leading-relaxed border border-gray-100">
                      {donation.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="bg-[#1B4965] rounded-xl p-5 text-white shadow-sm">
              <p className="text-lg font-semibold text-white/60 uppercase tracking-wider mb-1">
                Donor History
              </p>
              <p className="text-3xl font-bold tracking-tight mb-0.5">
                {donation.history.count}
              </p>
              <p className="text-lg font-medium text-white/60 mb-4">
                Total Donations
              </p>
              <div className="border-t border-white/10 pt-3">
                <p className="text-2xl font-bold text-[#F5C842] tracking-tight">
                  ${donation.history.lifetime.toLocaleString()}
                </p>
                <p className="text-lg font-medium text-white/60 mt-0.5">
                  Lifetime Value
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="font-bold text-gray-700 text-lg mb-4">
                Activity Log
              </p>
              <div className="flex flex-col gap-5">
                {[
                  {
                    label: "Thank You Sent",
                    date: "March 4, 2026 • 10:30 AM",
                    color: "bg-green-400",
                  },
                  {
                    label: "Items Cataloged",
                    date: "March 3, 2026 • 4:15 PM",
                    color: "bg-blue-400",
                  },
                  {
                    label: "Donation Received",
                    date: "March 3, 2026 • 2:00 PM",
                    color: "bg-gray-300",
                  },
                ].map(({ label, date, color }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${color}`}
                    />
                    <div>
                      <p className="text-md font-bold text-gray-700">{label}</p>
                      <p className="text-sm font-medium text-gray-400 mt-0.5">
                        {date}
                      </p>
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
  const [donationType, setDonationType] = useState(
    donation.type === "Books" ? "books" : "money",
  );
  const [form, setForm] = useState({
    name: donation.donor,
    email: donation.email,
    phone: donation.phone,
    desc: donation.itemDesc,
    qty: String(donation.qty),
    value: String(donation.value),
    date: donation.date,
    notes: donation.notes,
    anon: false,
  });

  return (
    <div>
      <Navbar
        title="Donations"
        breadcrumb="Donations › Donor Information › Edit"
        onBack={onCancel}
      />
      <div className="px-14 py-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-3 mb-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-lg font-bold px-3 py-1.5 rounded-full">
              <AlertCircle size={12} /> Status: In Progress
            </span>
            <span className="text-md text-gray-400 font-bold tracking-wider">
              ID: #{donation.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="text-lg font-bold text-gray-500 hover:text-gray-700 px-3 py-2 transition"
            >
              Cancel
            </button>
            <button
              onClick={onUpdate}
              className="flex items-center gap-2 bg-[#1B4965] text-white text-md font-bold px-5 py-2.5 rounded-lg hover:bg-[#144056] transition shadow-sm"
            >
              Update Donation
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="bg-[#1B4965] px-7 py-5 flex items-center gap-2">
            <User size={15} className="text-[#F5C842]" />
            <h3 className="text-white font-bold text-lg tracking-wide">
              Donor Information
            </h3>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Donor Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
                />
              </div>
              <div>
                <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Phone Number
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Email Address
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-md text-gray-600 font-medium cursor-pointer mb-1">
                  <input
                    type="checkbox"
                    checked={form.anon}
                    onChange={(e) =>
                      setForm({ ...form, anon: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#1B4965] rounded"
                  />
                  Make donation anonymous
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={16} className="text-[#F5C842]" />
            <h3 className="text-base font-bold text-[#1B4965]">
              Donation Details
            </h3>
          </div>
          <div className="mb-4">
            <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Donation Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDonationType("books")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-md font-bold transition ${donationType === "books" ? "border-[#1B4965] bg-[#1B4965]/5 text-[#1B4965]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                <BookOpen size={15} /> Books & Materials
              </button>
              <button
                onClick={() => setDonationType("money")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-md font-bold transition ${donationType === "money" ? "border-[#1B4965] bg-[#1B4965]/5 text-[#1B4965]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                <DollarSign size={15} /> Financial Contribution
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Item Description
              </label>
              <input
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
              />
            </div>
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Quantity
              </label>
              <input
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Estimated Value (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-md font-medium">
                  $
                </span>
                <input
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
                />
              </div>
            </div>
            <div>
              <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Date Received
              </label>
              <div className="relative">
                <Calendar
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-md font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Additional Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-md outline-none focus:border-[#1B4965] transition resize-none font-medium"
            />
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
    if (page === "add") {
      return (
        <AddDonation
          onCancel={() => setPage("list")}
          onSave={() => setPage("list")}
        />
      );
    }
    if (page === "detail" && selectedDonation) {
      return (
        <DonorDetail
          donation={selectedDonation}
          onEdit={() => setPage("edit")}
          onDelete={() => setPage("list")}
          onBackToList={() => setPage("list")}
        />
      );
    }
    if (page === "edit" && selectedDonation) {
      return (
        <EditDonation
          donation={selectedDonation}
          onCancel={() => setPage("detail")}
          onUpdate={() => setPage("detail")}
        />
      );
    }
    return (
      <DonationsList
        onAdd={() => setPage("add")}
        onView={(d) => {
          setSelectedDonation(d);
          setPage("detail");
        }}
      />
    );
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