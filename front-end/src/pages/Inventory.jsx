import { useState } from "react";
import { Library, Plus, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

const BOOKS = [
  { id: "001", code: "LIB-CHD-001", title: "The Little Prince", author: "Antoine de Saint-Exupéry", category: "Children", available: 8, totalCopies: 12, status: "AVAILABLE" },
  { id: "002", code: "LIB-HIS-002", title: "Khmer History Vol.1", author: "Chheng Phon", category: "History", available: 0, totalCopies: 5, status: "BORROWED" },
  { id: "003", code: "LIB-SCI-003", title: "Science for Kids", author: "Dr. Sophea Mao", category: "Science", available: 10, totalCopies: 10, status: "AVAILABLE" },
  { id: "004", code: "LIB-REL-004", title: "Buddhism & Modern Life", author: "Ven. Sithan", category: "Religion", available: 3, totalCopies: 6, status: "AVAILABLE" },
  { id: "005", code: "LIB-HIS-005", title: "Angkor Wat Architecture", author: "Kim Seng", category: "History", available: 2, totalCopies: 4, status: "LOW STOCK" },
  { id: "006", code: "LIB-FIC-006", title: "Cambodian Folk Tales", author: "Ly Theam Teng", category: "Fiction", available: 7, totalCopies: 8, status: "AVAILABLE" },
  { id: "007", code: "LIB-SCI-007", title: "Mathematics Grade 9", author: "MoEYS", category: "Science", available: 15, totalCopies: 15, status: "AVAILABLE" },
  { id: "008", code: "LIB-NF-008", title: "English for Beginners", author: "Sokha Vann", category: "Non-Fiction", available: 0, totalCopies: 6, status: "OUT OF STOCK" },
];

const CATEGORIES = ["All Categories", "Children", "History", "Science", "Religion", "Fiction", "Non-Fiction"];
const STATUSES = ["All Status", "AVAILABLE", "BORROWED", "LOW STOCK", "OUT OF STOCK"];

const statusStyle = {
  "AVAILABLE":    { bg: "#DCFCE7", text: "#16A34A" },
  "BORROWED":     { bg: "#FEF9C3", text: "#CA8A04" },
  "LOW STOCK":    { bg: "#FFEDD5", text: "#EA580C" },
  "OUT OF STOCK": { bg: "#FEE2E2", text: "#DC2626" },
};

const stats = [
  { label: "Total Books",        value: "2,847", sub: "+24 this month",          subColor: "#055E83", border: "#055E83" },
  { label: "Available",          value: "2,103", sub: "73.9% availability rate", subColor: "#16A34A", border: "#16A34A" },
  { label: "Currently Borrowed", value: "611",   sub: "18 overdue returns",      subColor: "#EA580C", border: "#EA580C" },
  { label: "Categories",         value: "12",    sub: "6 active genres",         subColor: "#CA8A04", border: "#E8C110" },
];

export default function Inventory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 356;

  const filtered = BOOKS.filter((b) =>
    (search === "" || `${b.title} ${b.author}`.toLowerCase().includes(search.toLowerCase())) &&
    (category === "All Categories" || b.category === category) &&
    (status === "All Status" || b.status === status)
  );

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Inventory" breadcrumb="Welcome back, Admin!" />
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
                placeholder="Search by title, author, ISBN..."
                className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <Filter size={12} className="text-gray-400" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-xs outline-none bg-transparent text-gray-600">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
              <span className="text-xs text-gray-600">Sort: Title</span>
            </div>
            <p className="ml-auto text-xs text-gray-400">Showing 1–{filtered.length} of 2,847 books</p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#1B4965" }}>
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <Library size={15} /> Book Catalog
              </h2>
              <button onClick={() => navigate("/inventory/add")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition"
                style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
                <Plus size={13} /> Add Book
              </button>
            </div>

            {/* Column Headers */}
            <div className="grid px-5 py-2.5 border-b border-gray-100 bg-gray-50/60 text-xs font-bold uppercase tracking-wider"
              style={{ gridTemplateColumns: "44px 1fr 130px 100px 70px 120px 100px", color: "#055E83" }}>
              {["#", "Title / Author", "Code", "Category", "Copies", "Status", "Actions"].map(h => (
                <span key={h}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((book) => (
              <div key={book.id}
                className="grid px-5 py-3 items-center border-b border-gray-50 hover:bg-blue-50/20 transition text-sm"
                style={{ gridTemplateColumns: "44px 1fr 130px 100px 70px 120px 100px" }}>
                <span className="text-xs text-gray-400">{book.id}</span>
                <span className="text-sm text-gray-800 font-medium">{book.title} — {book.author}</span>
                <span className="text-xs font-semibold" style={{ color: "#055E83" }}>{book.code}</span>
                <span className="text-xs text-gray-600">{book.category}</span>
                <span className="text-xs text-gray-600">{book.available} / {book.totalCopies}</span>
                <span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: statusStyle[book.status]?.bg, color: statusStyle[book.status]?.text }}>
                    {book.status}
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => navigate(`/inventory/${book.id}`)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold hover:opacity-80 transition"
                    style={{ backgroundColor: "#1B4965", color: "#fff" }}>
                    <Eye size={11} /> View
                  </button>
                  <button onClick={() => navigate(`/inventory/${book.id}/edit`)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold hover:opacity-80 transition"
                    style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
                    <Pencil size={11} /> Edit
                  </button>
                </div>
              </div>
            ))}

            {/* Bottom padding row */}
            <div className="h-6" />
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
      </main>
    </div>
  );
}