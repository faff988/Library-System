import { useState } from "react";
import { Library, Plus, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";
import DeleteBookModal from "./DeleteBookModal"; // Local directory import hook setup

const BOOKS = [
  { id: "0001", deweyCode: "843.914", title: "The Little Prince", author: "Antoine de Saint-Exupéry", category: "Children / Classic Fiction", isbn: "978-0-15-246227-0", available: 8, totalCopies: 12, sectionCode: "SEC-CHD", borrowable: true, status: "AVAILABLE" },
  { id: "0002", deweyCode: "959.6", title: "Khmer History Vol.1", author: "Chheng Phon", category: "History", isbn: "978-99950-60-1-2", available: 5, totalCopies: 5, sectionCode: "SEC-HIS", borrowable: true, status: "BORROWED" },
  { id: "0003", deweyCode: "500.1", title: "Science for Kids", author: "Dr. Sophea Mao", category: "Science", isbn: "N/A", available: 10, totalCopies: 10, sectionCode: "SEC-SCI", borrowable: false, status: "AVAILABLE" },
  { id: "0004", deweyCode: "294.3", title: "Buddhism & Modern Life", author: "Ven. Sithan", category: "Religion", isbn: "N/A", available: 3, totalCopies: 6, sectionCode: "SEC-REL", borrowable: true, status: "AVAILABLE" },
  { id: "0005", deweyCode: "722.4", title: "Angkor Wat Architecture", author: "Kim Seng", category: "History", isbn: "N/A", available: 2, totalCopies: 4, sectionCode: "SEC-HIS", borrowable: false, status: "LOW STOCK" },
  { id: "0006", deweyCode: "398.2", title: "Cambodian Folk Tales", author: "Ly Theam Teng", category: "Fiction", isbn: "N/A", available: 7, totalCopies: 8, sectionCode: "SEC-FIC", borrowable: true, status: "AVAILABLE" },
  { id: "0007", deweyCode: "510.7", title: "Mathematics Grade 9", author: "MoEYS", category: "Science", isbn: "N/A", available: 15, totalCopies: 15, sectionCode: "SEC-SCI", borrowable: true, status: "AVAILABLE" },
  { id: "0008", deweyCode: "428.2", title: "English for Beginners", author: "Sokha Vann", category: "Non-Fiction", isbn: "N/A", available: 0, totalCopies: 6, sectionCode: "SEC-NF", borrowable: false, status: "OUT OF STOCK" },
];

const CATEGORIES = ["All Categories", "Children", "History", "Science", "Religion", "Fiction", "Non-Fiction"];
const STATUSES = ["All Status", "AVAILABLE", "BORROWED", "LOW STOCK", "OUT OF STOCK"];

const statusStyle = {
  "AVAILABLE": { bg: "#E8F5E9", text: "#2E7D32" },
  "BORROWED": { bg: "#FFFDE7", text: "#B78103" },
  "LOW STOCK": { bg: "#FFF3E0", text: "#E65100" }, 
  "OUT OF STOCK": { bg: "#FFEBEE", text: "#C62828" },
};

const stats = [
  { label: "Total Books", value: "2,847", sub: "+24 this month", subColor: "#16A34A", border: "#055E83" },
  { label: "Available", value: "2,103", sub: "73.9% availability rate", subColor: "#16A34A", border: "#22C55E" },
  { label: "Currently Borrowed", value: "611", sub: "18 overdue returns", subColor: "#EF4444", border: "#F97316" },
  { label: "Categories", value: "12", sub: "6 active genres", subColor: "#71717A", border: "#E8C110" },
];

export default function Inventory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const totalPages = 356;

  const filtered = BOOKS.filter((b) =>
    (search === "" || `${b.title} ${b.author} ${b.deweyCode}`.toLowerCase().includes(search.toLowerCase())) &&
    (category === "All Categories" || b.category.includes(category)) &&
    (status === "All Status" || b.status.toUpperCase() === status.toUpperCase())
  );

  // Exact 10-column custom structure breakdown grid width definitions 
  const gridLayout = "grid grid-cols-[55px_1.8fr_1.4fr_1fr_1fr_80px_1fr_1fr_1.2fr_150px] items-center gap-2 px-6";

  const openDeleteProcess = (book, e) => {
    e.stopPropagation();
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased select-none bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Navbar title="Inventory" breadcrumb="Welcome back, Admin!" />
        
        <div className="px-6 py-5 space-y-5">

          {/* Metric Summary Rows Blocks */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map(({ label, value, sub, subColor, border }) => (
              <div key={label} className="bg-white rounded-xl px-5 py-4 border-l-4 shadow-3xs" style={{ borderLeftColor: border }}>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-black leading-tight text-gray-800">{value}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: subColor }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Table Filters Utilities Controls Section */}
          <div className="flex items-center gap-2.5 flex-wrap bg-white p-3 rounded-xl border border-gray-100 shadow-3xs">
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-gray-200 rounded-lg px-3 py-2 w-72 focus-within:border-[#1B4965] transition">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, Dewey code..."
                className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" 
              />
            </div>
            
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-gray-200 rounded-lg px-2.5 py-2">
              <Filter size={12} className="text-gray-400" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-xs outline-none bg-transparent text-gray-600 font-medium cursor-pointer">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-gray-200 rounded-lg px-2.5 py-2">
              <Filter size={12} className="text-gray-400" />
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs outline-none bg-transparent text-gray-600 font-medium cursor-pointer">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition">
              <ArrowUpDown size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600 font-medium">Sort: Title</span>
            </div>

            <p className="ml-auto text-xs text-gray-400 font-medium mr-1">
              Showing 1–{filtered.length} of 2,847 books
            </p>
          </div>

          {/* Central Catalog Table Container Segment Block */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-xs">
            
            {/* Dark Blue Title Header Toolbar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-[#055E83]">
              <h2 className="text-white font-bold text-sm tracking-wide">
                Book Catalog
              </h2>
              <button 
                onClick={() => navigate("/inventory/add")}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition hover:opacity-95 shadow-3xs bg-[#E8C110] text-[#1B4965]"
              >
                + Add Book
              </button>
            </div>

            {/* Table Header Fields Labels styling row line */}
            <div className={`${gridLayout} py-3 bg-[#9BC1D2]/30 text-[11px] font-bold text-[#055E83] border-b border-gray-200/80 uppercase tracking-wider`}>
              <span>ID</span>
              <span>Title</span>
              <span>Author</span>
              <span>Dewey Code</span>
              <span>Category</span>
              <span>Copies</span>
              <span>Section Code</span>
              <span>Borrowable</span>
              <span className="text-center">Status</span>
              <span className="text-center">Actions</span>
            </div>

            {/* Catalog Matrix Collection Mapping list loop rows */}
            <div className="divide-y divide-gray-100 bg-white">
              {filtered.map((book) => (
                <div 
                  key={book.id} 
                  onClick={() => navigate(`/inventory/${book.id}`)}
                  className={`${gridLayout} py-3 hover:bg-slate-50/60 transition text-xs text-gray-600 items-center cursor-pointer`}
                >
                  <span className="text-gray-400 font-mono font-medium">{book.id}</span>
                  <span className="font-bold text-gray-900 truncate">{book.title}</span>
                  <span className="text-gray-500 truncate">{book.author}</span>
                  <span className="font-mono text-gray-600 font-medium">{book.deweyCode}</span>
                  <span className="text-gray-600 font-medium truncate">{book.category}</span>
                  <span className="font-semibold text-gray-700">{book.available} / {book.totalCopies}</span>
                  <span className="font-mono text-gray-400 font-bold">{book.sectionCode}</span>
                  
                  {/* Status pills dot toggle representation switch elements */}
                  <div>
                    {book.borrowable ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-50 text-green-700 border border-green-100 shadow-3xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> ON
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100 shadow-3xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> OFF
                      </span>
                    )}
                  </div>

                  <div className="text-center">
                    <span className="inline-block text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md min-w-[95px] text-center uppercase shadow-3xs"
                      style={{ backgroundColor: statusStyle[book.status.toUpperCase()]?.bg || "#f3f4f6", color: statusStyle[book.status.toUpperCase()]?.text || "#1f2937" }}>
                      {book.status}
                    </span>
                  </div>

                  {/* Operational block style button setups buttons grouped neatly links click connection */}
                  <div className="flex items-center justify-center gap-1.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/inventory/${book.id}`); }}
                      className="px-3 py-1 bg-[#055E83] text-white font-bold text-[11px] rounded hover:bg-[#044d6c] transition shadow-3xs"
                    >
                      View
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/inventory/${book.id}/edit`); }}
                      className="px-3 py-1 bg-[#E8C110] text-[#1B4965] font-bold text-[11px] rounded hover:bg-[#d4b00f] transition shadow-3xs"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => openDeleteProcess(book, e)}
                      className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition ml-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Viewport Pagination Controls */}
          <div className="flex items-center justify-between pt-1 pb-4">
            <p className="text-xs text-gray-400 font-medium">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 transition shadow-3xs"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              {[1, 2, 3].map(n => (
                <button 
                  key={n} 
                  onClick={() => setCurrentPage(n)}
                  className="w-7 h-7 rounded-lg text-xs font-bold transition shadow-3xs"
                  style={{ 
                    backgroundColor: currentPage === n ? "#055E83" : "#fff", 
                    color: currentPage === n ? "#fff" : "#64748B", 
                    border: currentPage === n ? "none" : "1px solid #E2E8F0" 
                  }}
                >
                  {n}
                </button>
              ))}
              <span className="text-gray-300 text-xs px-0.5">...</span>
              <button className="w-8 h-7 rounded-lg text-xs font-bold border border-gray-200 bg-white text-gray-500 shadow-3xs">{totalPages}</button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90 bg-[#055E83] shadow-xs"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>

        </div>
      </main>

      <DeleteBookModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => { setIsDeleteModalOpen(false); setSelectedBook(null); }} 
        book={selectedBook} 
      />
    </div>
  );
}