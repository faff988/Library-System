import { useState } from "react";
import { Library, Plus, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

const BOOKS = [
  { id: "001", title: "The Little Prince", author: "Antoine de Saint-Exupéry", isbn: "978-0-15-246227-0", category: "Children",    copies: "8/12",  status: "AVAILABLE"   },
  { id: "002", title: "Khmer History Vol.1", author: "Chheng Phon",             isbn: "978-99950-60-1-2", category: "History",     copies: "5/5",   status: "BORROWED"    },
  { id: "003", title: "Science for Kids",   author: "Dr. Sophea Mao",           isbn: "978-99950-72-3-4", category: "Science",     copies: "10/10", status: "AVAILABLE"   },
  { id: "004", title: "Buddhism & Modern Life", author: "Ven. Sithan",          isbn: "978-99950-41-8-6", category: "Religion",    copies: "3/6",   status: "AVAILABLE"   },
  { id: "005", title: "Angkor Wat Architecture", author: "Kim Seng",            isbn: "978-99950-55-2-9", category: "History",     copies: "2/4",   status: "LOW STOCK"   },
  { id: "006", title: "Cambodian Folk Tales", author: "Ly Theam Teng",          isbn: "978-99950-33-7-1", category: "Fiction",     copies: "7/8",   status: "AVAILABLE"   },
  { id: "007", title: "Mathematics Grade 9", author: "MoEYS",                  isbn: "978-99950-10-4-5", category: "Science",     copies: "15/15", status: "AVAILABLE"   },
  { id: "008", title: "English for Beginners", author: "Sokha Vann",            isbn: "978-99950-88-9-3", category: "Non-Fiction", copies: "0/6",   status: "OUT OF STOCK" },
];

const CATEGORIES = ["All Categories", "Children", "History", "Science", "Religion", "Fiction", "Non-Fiction"];
const STATUSES   = ["All Status", "AVAILABLE", "BORROWED", "LOW STOCK", "OUT OF STOCK"];

const statusStyle = {
  "AVAILABLE":    { bg: "#DCFCE7", text: "#16A34A" },
  "BORROWED":     { bg: "#FEF9C3", text: "#CA8A04" },
  "LOW STOCK":    { bg: "#FFEDD5", text: "#EA580C" },
  "OUT OF STOCK": { bg: "#FEE2E2", text: "#DC2626" },
};

const stats = [
  { label: "Total Books",       value: "2,847", sub: "+24 this month",      subColor: "#055E83", border: "#055E83" },
  { label: "Available",         value: "2,103", sub: "73.9% availability rate", subColor: "#16A34A", border: "#16A34A" },
  { label: "Currently Borrowed",value: "611",   sub: "18 overdue returns",  subColor: "#EA580C", border: "#EA580C" },
  { label: "Categories",        value: "12",    sub: "6 active genres",     subColor: "#CA8A04", border: "#E8C110" },
];

export default function Inventory() {
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All Categories");
  const [status, setStatus]       = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 356;

  const filtered = BOOKS.filter((b) => {
    const matchSearch   = search === "" || `${b.title} ${b.author} ${b.isbn}`.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All Categories" || b.category === category;
    const matchStatus   = status === "All Status" || b.status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Inventory" breadcrumb="Welcome back, Admin!" />

        <div className="px-8 py-6 space-y-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map(({ label, value, sub, subColor, border }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5"
                style={{
                  borderTop: `4px solid ${border}`,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-4xl font-bold" style={{ color: subColor }}>{value}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: subColor }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-72">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, ISBN..."
                className="text-sm outline-none w-full bg-transparent text-gray-600 placeholder-gray-400"
              />
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <Filter size={14} className="text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-sm outline-none bg-transparent text-gray-600"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <Filter size={14} className="text-gray-400" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-sm outline-none bg-transparent text-gray-600"
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <ArrowUpDown size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">Sort: Title</span>
            </div>

            {/* Count */}
            <p className="ml-auto text-sm text-gray-400">
              Showing 1–{filtered.length} of 2,847 books
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <Library size={18} /> Book Catalog
              </h2>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition hover:opacity-90"
                style={{ backgroundColor: "#E8C110", color: "#1B4965" }}
              >
                <Plus size={16} /> Add Book
              </button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[60px_300px_180px_150px_150px_170px_1fr] px-6 py-3 border-b border-gray-100 bg-gray-50">
              {["#", "Title / Author", "ISBN", "Category", "Copies", "Status", "Actions"].map((h) => (
                <span key={h} className="text-xs font-bold uppercase tracking-wide" style={{ color: "#055E83" }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((book, i) => (
              <div
                key={book.id}
                className="grid grid-cols-[60px_300px_180px_150px_150px_170px_1fr] px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50 transition">
                <span className="text-sm text-gray-400">{book.id}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{book.title}</p>
                  <p className="text-xs text-gray-400">— {book.author}</p>
                </div>
                <span className="text-sm text-gray-500">{book.isbn}</span>
                <span className="text-sm text-gray-600">{book.category}</span>
                <span className="text-sm text-gray-600">{book.copies}</span>
                <span>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: statusStyle[book.status]?.bg,
                      color: statusStyle[book.status]?.text,
                    }}
                  >
                    {book.status}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                    style={{ backgroundColor: "#1B4965", color: "#fff" }}
                  >
                    <Eye size={13} /> View
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                    style={{ backgroundColor: "#E8C110", color: "#1B4965" }}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pb-4">
            <p className="text-sm text-gray-400">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className="w-8 h-8 rounded-lg text-sm font-semibold transition"
                  style={{
                    backgroundColor: currentPage === n ? "#1B4965" : "transparent",
                    color: currentPage === n ? "#fff" : "#64748B",
                    border: currentPage === n ? "none" : "1px solid #E2E8F0",
                  }}
                >
                  {n}
                </button>
              ))}
              <span className="text-gray-400 text-sm px-1">...</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-8 h-8 rounded-lg text-sm font-semibold transition"
                style={{
                  backgroundColor: currentPage === totalPages ? "#1B4965" : "transparent",
                  color: currentPage === totalPages ? "#fff" : "#64748B",
                  border: currentPage === totalPages ? "none" : "1px solid #E2E8F0",
                }}
              >
                {totalPages}
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                style={{ backgroundColor: "#1B4965", color: "#fff" }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}