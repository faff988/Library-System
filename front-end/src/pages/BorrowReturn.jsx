import { useState } from "react";
import {
  Search, Plus, Calendar, User, BookOpen, DollarSign,
  CheckCircle, ArrowLeft, ChevronRight, AlertCircle
} from "lucide-react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

// ─── Sample Data ──────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  { id: "TXN-0847", member: "Sophea Keo",    memberId: "MEM-0042", book: "Introduction to Programming", borrowDate: "01 Jun 2025", dueDate: "15 Jun 2025", returnDate: "14 Jun 2025", status: "ACTIVE",    deweyCode: "BK-10045", author: "John Doe",      category: "Computer Science", phone: "+855 12 345 678", memberType: "Active Member" },
  { id: "TXN-0846", member: "Dara Pich",     memberId: "MEM-0031", book: "Khmer History Vol. 2",        borrowDate: "28 May 2025", dueDate: "11 Jun 2025", returnDate: null,           status: "OVERDUE",   deweyCode: "BK-10032", author: "Chheng Phon",  category: "History",          phone: "+855 23 456 789", memberType: "Active Member" },
  { id: "TXN-0845", member: "Maly Sok",      memberId: "MEM-0028", book: "Mathematics for Engineers",   borrowDate: "25 May 2025", dueDate: "08 Jun 2025", returnDate: "07 Jun 2025", status: "RETURNED",  deweyCode: "BK-10021", author: "MoEYS",         category: "Science",          phone: "+855 34 567 890", memberType: "Active Member" },
  { id: "TXN-0844", member: "Ratha Lim",     memberId: "MEM-0019", book: "English Grammar in Use",      borrowDate: "20 May 2025", dueDate: "03 Jun 2025", returnDate: null,           status: "ACTIVE",    deweyCode: "BK-10018", author: "Raymond Murphy",category: "Language",         phone: "+855 45 678 901", memberType: "Active Member" },
  { id: "TXN-0843", member: "Bopha Chan",    memberId: "MEM-0055", book: "Data Structures & Algorithms",borrowDate: "18 May 2025", dueDate: "01 Jun 2025", returnDate: null,           status: "OVERDUE",   deweyCode: "BK-10009", author: "Thomas Cormen", category: "Computer Science", phone: "+855 56 789 012", memberType: "Active Member" },
  { id: "TXN-0842", member: "Visal Heng",    memberId: "MEM-0037", book: "Chemistry Fundamentals",      borrowDate: "15 May 2025", dueDate: "29 May 2025", returnDate: "28 May 2025", status: "RETURNED",  deweyCode: "BK-10014", author: "Dr. Chan Sothy",category: "Science",          phone: "+855 67 890 123", memberType: "Active Member" },
  { id: "TXN-0841", member: "Sreyleak Noun", memberId: "MEM-0011", book: "World Atlas 2024",            borrowDate: "10 May 2025", dueDate: "24 May 2025", returnDate: null,           status: "ACTIVE",    deweyCode: "BK-10003", author: "National Geo",  category: "Reference",        phone: "+855 78 901 234", memberType: "Active Member" },
  { id: "TXN-0840", member: "Kosal Ean",     memberId: "MEM-0044", book: "Physics Concepts",            borrowDate: "05 May 2025", dueDate: "19 May 2025", returnDate: "18 May 2025", status: "RETURNED",  deweyCode: "BK-10007", author: "Dr. Sophea Mao",category: "Science",          phone: "+855 89 012 345", memberType: "Active Member" },
];

const statusStyle = {
  "ACTIVE":   { bg: "#E8F5E9", text: "#2E7D32" },
  "OVERDUE":  { bg: "#FFEBEE", text: "#C62828" },
  "RETURNED": { bg: "#F1F5F9", text: "#64748B" },
};

const TAB_COUNTS = { "All Transactions": 1284, "Active": 324, "Overdue": 12, "Returned": 948 };

// ─── Page 1: Transaction List ─────────────────────────────────────────────────
function TransactionList({ onNewBorrow, onViewDetails, onReturn }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Transactions");

  const filtered = TRANSACTIONS.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = search === "" || `${t.member} ${t.book} ${t.id}`.toLowerCase().includes(q);
    const matchTab = activeTab === "All Transactions" || t.status === activeTab.toUpperCase() ||
      (activeTab === "Returned" && t.status === "RETURNED");
    return matchSearch && matchTab;
  });

  return (
    <div>
      <Navbar title="Borrow / Return" breadcrumb="Welcome back, Librarian" />
      <div className="px-6 py-5 space-y-4">

        {/* Search + Date */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by member name, book title, or transaction ID..."
              className="text-sm outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">Jun 2025</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200">
          {Object.entries(TAB_COUNTS).map(([tab, count]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold transition border-b-2 ${activeTab === tab ? "border-[#1B4965] text-[#1B4965]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {tab}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                tab === "Overdue" ? "bg-red-100 text-red-600" :
                activeTab === tab ? "bg-[#1B4965] text-white" : "bg-gray-100 text-gray-500"
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: "#1B4965" }}>
            <h2 className="text-white font-bold text-sm">Recent Transactions</h2>
            <button onClick={onNewBorrow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition"
              style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
              <Plus size={13} /> New Borrow
            </button>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-[120px_1fr_1fr_110px_110px_100px_160px] px-5 py-3 bg-gray-50/70 border-b border-gray-100 text-xs font-bold uppercase tracking-wider" style={{ color: "#055E83" }}>
            <span>ID</span>
            <span>Member Name</span>
            <span>Book Title</span>
            <span>Borrow Date</span>
            <span>Due Date</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.map((t) => (
            <div key={t.id} className="grid grid-cols-[120px_1fr_1fr_110px_110px_100px_160px] px-5 py-3.5 border-b border-gray-50 hover:bg-slate-50/60 transition items-center">
              <span className="text-xs text-gray-500 font-medium">{t.id}</span>
              <span className="text-sm font-bold text-gray-800">{t.member}</span>
              <span className="text-sm text-gray-600">{t.book}</span>
              <span className="text-xs text-gray-500">{t.borrowDate}</span>
              <span className="text-xs text-gray-500">{t.dueDate}</span>
              <span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: statusStyle[t.status]?.bg, color: statusStyle[t.status]?.text }}>
                  {t.status}
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onViewDetails(t)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                  View Details
                </button>
                <button onClick={() => onReturn(t)}
                  className="px-3 py-1.5 rounded-md text-xs font-bold text-white hover:opacity-90 transition"
                  style={{ backgroundColor: "#1B4965" }}>
                  Return
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page 2: New Borrow Transaction ──────────────────────────────────────────
function NewBorrow({ onCancel, onSave }) {
  const [memberName, setMemberName] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [borrowDate] = useState("01 Jun 2025");
  const [dueDate] = useState("15 Jun 2025");
  const [notes, setNotes] = useState("");
  const [bookSearched, setBookSearched] = useState(false);

  const handleBookSearch = () => setBookSearched(true);

  return (
    <div>
      <Navbar title="Transactions" breadcrumb="Manage all borrow and return records" />
      <div className="px-6 py-5">

        {/* Breadcrumb + Cancel */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#055E83] font-medium cursor-pointer hover:underline" onClick={onCancel}>Borrow / Return</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-700 font-semibold">New Borrow Transaction</span>
          </div>
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
          {/* Left */}
          <div className="space-y-4">

            {/* Section 1: Borrower Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#055E83" }}>
                <span className="w-5 h-5 rounded-full bg-[#055E83] text-white text-xs flex items-center justify-center font-bold">1</span>
                Borrower Information
              </h3>
              <div className="border-b border-gray-100 mb-5" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Member Name</label>
                  <input value={memberName} onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g. MEM-0001"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition text-gray-700 placeholder-gray-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Member ID</label>
                  <input placeholder="Auto-filled after search" readOnly
                    className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Member Type</label>
                  <input placeholder="Active Member" readOnly
                    className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Date Of Birth</label>
                  <input placeholder="Auto-filled after search" readOnly
                    className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                  <input placeholder="Auto-filled after search" readOnly
                    className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Section 2: Book Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#055E83" }}>
                <span className="w-5 h-5 rounded-full bg-[#055E83] text-white text-xs flex items-center justify-center font-bold">2</span>
                Book Information
              </h3>
              <div className="border-b border-gray-100 mb-5" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Book Title</label>
                  <div className="flex gap-2">
                    <input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. BK-10045"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition text-gray-700 placeholder-gray-300" />
                    <button onClick={handleBookSearch}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
                      style={{ backgroundColor: "#1B4965" }}>Search</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Dewey Code</label>
                  <div className="flex gap-2">
                    <input placeholder="Auto-filled after search" readOnly
                      className="flex-1 border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400" />
                    <button className="px-4 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
                      style={{ backgroundColor: "#1B4965" }}>Search</button>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-28 h-36 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                  {bookSearched ? (
                    <BookOpen size={32} className="text-gray-300" />
                  ) : (
                    <BookOpen size={32} className="text-gray-200" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Author</label>
                    <input placeholder="Auto-filled after search" readOnly
                      className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Descriptions</label>
                    <textarea placeholder="Auto-filled after search" readOnly rows={3}
                      className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 resize-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Borrow Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#055E83" }}>
                <span className="w-5 h-5 rounded-full bg-[#055E83] text-white text-xs flex items-center justify-center font-bold">3</span>
                Borrow Information
              </h3>
              <div className="border-b border-gray-100 mb-5" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Borrow Date</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{borrowDate}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Due Date</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{dueDate}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (Optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special notes or remarks..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition resize-none text-gray-700 placeholder-gray-300" />
              </div>
            </div>
          </div>

          {/* Right: Transaction Summary */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-bold text-[#055E83] mb-4">Transaction Summary</h3>
              <div className="space-y-3">
                {[["Borrower", "Sophea Keo"], ["Book", "Intro to Programming"], ["Borrow Date", "01 Jun 2025"], ["Due Date", "15 Jun 2025"], ["Duration", "14 days"]].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-baseline">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-semibold text-gray-700 text-right max-w-[140px]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={onSave}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
              style={{ backgroundColor: "#1B4965" }}>
              <BookOpen size={15} /> Save Transaction
            </button>

            <button onClick={onCancel}
              className="w-full py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
              Cancel — Back to Transactions
            </button>

            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">After saving, the transaction will appear in the Transactions page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page 3: Return Book (Confirm) ────────────────────────────────────────────
function ReturnBook({ transaction, onCancel, onConfirm }) {
  const [condition, setCondition] = useState("Good");

  return (
    <div>
      <Navbar title="Transactions" breadcrumb="Manage all borrow and return records" />
      <div className="px-6 py-5">

        {/* Breadcrumb + Cancel */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#055E83] font-medium cursor-pointer hover:underline" onClick={onCancel}>Borrow / Return</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-700 font-semibold">Return Book</span>
          </div>
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
          {/* Left */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#055E83]">Borrow Record Details</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: statusStyle[transaction.status]?.bg, color: statusStyle[transaction.status]?.text }}>
                  {transaction.status}
                </span>
              </div>
              <div className="border-b border-gray-100 mb-5" />
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {[
                  ["Transaction ID", transaction.id],
                  ["Borrow Date", transaction.borrowDate],
                  ["Member Name", transaction.member],
                  ["Due Date", transaction.dueDate],
                  ["Book Title", transaction.book],
                  ["Days Overdue", <span className="text-green-600 font-bold">0 days</span>],
                ].map(([label, val], i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Return Condition */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Book Return Condition</h3>
              <div className="grid grid-cols-3 gap-3">
                {["Good", "Fair", "Damaged"].map((c) => (
                  <button key={c} onClick={() => setCondition(c)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                      condition === c
                        ? c === "Damaged"
                          ? "border-red-400 bg-red-50 text-red-600"
                          : "border-green-400 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                    }`}>
                    <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                      condition === c
                        ? c === "Damaged" ? "border-red-500 bg-red-500" : "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }`}>
                      {condition === c && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Return Summary */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-bold text-gray-700 mb-4">Return Summary</h3>
              <div className="space-y-3">
                {[["Return Date", "01 Jun 2025"], ["Days Overdue", "0 days"], ["Fine Amount", "$0.00"], ["Condition", condition]].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-baseline border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-semibold text-gray-700">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={onConfirm}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition">
              <CheckCircle size={15} /> Confirm Return
            </button>

            <button onClick={onCancel}
              className="w-full py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
              Cancel — Back to Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page 4: Return Book Detail (Completed) ───────────────────────────────────
function ReturnBookDetail({ transaction, onBack }) {
  return (
    <div>
      <Navbar title="Return Book" breadcrumb="Process a book return" />
      <div className="px-6 py-5">

        {/* Breadcrumb + Back */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#055E83] font-medium cursor-pointer hover:underline" onClick={onBack}>Borrow / Return</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-[#055E83] font-medium cursor-pointer hover:underline" onClick={onBack}>Transactions</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-700 font-semibold">{transaction.id}</span>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            <ArrowLeft size={13} /> Back to Transactions
          </button>
        </div>

        {/* Returned banner */}
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3.5 mb-5">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500 text-white">RETURNED</span>
          <p className="text-sm text-green-700 font-medium">This transaction has been completed. Book was returned on 01 Jun 2025.</p>
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
          {/* Left */}
          <div className="space-y-4">
            {/* Borrower Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-bold text-[#055E83] flex items-center gap-2 mb-4">
                <User size={15} /> Borrower Information
              </h3>
              <div className="border-b border-gray-100 mb-4" />
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {[
                  ["Member Name", transaction.member],
                  ["Phone Number", transaction.phone],
                  ["Member ID", transaction.memberId],
                  ["Member Type", <span className="text-green-600 font-semibold">{transaction.memberType}</span>],
                ].map(([label, val], i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-bold text-[#055E83] flex items-center gap-2 mb-4">
                <BookOpen size={15} /> Book Information
              </h3>
              <div className="border-b border-gray-100 mb-4" />
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {[
                  ["Book Title", transaction.book],
                  ["Author", transaction.author],
                  ["Dewey Code", transaction.deweyCode],
                  ["Category", transaction.category],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Borrow Timeline */}
            <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
                <CheckCircle size={14} className="text-green-500" /> Borrow Timeline
              </h3>
              <div className="space-y-3">
                {[["Borrow Date", transaction.borrowDate], ["Due Date", transaction.dueDate], ["Return Date", "14 Jun 2025"], ["Duration", "13 days"]].map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b border-gray-50 pb-2.5 last:border-0">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-semibold text-gray-700">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fine Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
                <DollarSign size={14} className="text-yellow-500" /> Fine Information
              </h3>
              <div className="space-y-3">
                {[
                  ["Days Overdue", <span className="text-blue-600 font-bold">0 days</span>],
                  ["Fine Rate",    <span className="text-blue-600 font-bold">$0.50/day</span>],
                  ["Total Fine",   <span className="text-blue-600 font-bold">$0.00</span>],
                  ["Book Condition", <span className="text-green-600 font-bold">Good</span>],
                  ["Processed By",  <span className="text-green-600 font-bold">Admin</span>],
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between border-b border-gray-50 pb-2.5 last:border-0">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-semibold text-gray-700">{val}</span>
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

// ─── Main Router ──────────────────────────────────────────────────────────────
export default function BorrowReturn() {
  const [page, setPage] = useState("list");
  const [selected, setSelected] = useState(null);

  const render = () => {
    if (page === "new")    return <NewBorrow onCancel={() => setPage("list")} onSave={() => setPage("list")} />;
    if (page === "return" && selected) return <ReturnBook transaction={selected} onCancel={() => setPage("list")} onConfirm={() => setPage("list")} />;
    if (page === "detail" && selected) return <ReturnBookDetail transaction={selected} onBack={() => setPage("list")} />;
    return (
      <TransactionList
        onNewBorrow={() => setPage("new")}
        onViewDetails={(t) => { setSelected(t); setPage("detail"); }}
        onReturn={(t) => { setSelected(t); setPage("return"); }}
      />
    );
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        {render()}
      </main>
    </div>
  );
}