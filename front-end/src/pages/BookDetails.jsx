import { useState } from "react";
import { Edit2, Trash2, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";
import DeleteBookModal from "./DeleteBookModal"; // Local view reference setup

const BOOKS = [
  { id: "001", deweyCode: "843.914", sectionCode: "SEC-CHD", title: "The Little Prince", author: "Antoine de Saint-Exupéry", isbn: "978-0-15-246227-0", publisher: "Reynal & Hitchcock, New York", category: "Children / Classic Fiction", totalCopies: 12, available: 8, borrowed: 4, language: "French / Khmer Translation", year: 1943, description: "A young pilot stranded in the Sahara Desert encounters a small boy — The Little Prince — who has fallen to Earth from a tiny asteroid. A timeless tale of friendship, love, and human nature.", status: "AVAILABLE", borrowable: true, addedDate: "January 15, 2024", history: [{ name: "Sophea Mao", borrowed: "Mar 1, 2026", returned: "Mar 14, 2026" }, { name: "Vireak Chan", borrowed: "Feb 10, 2026", returned: "Feb 24, 2026" }, { name: "Lina Phal", borrowed: "Jan 22, 2026", returned: "Feb 5, 2026" }] },
  { id: "002", deweyCode: "959.6", sectionCode: "SEC-HIS", title: "Khmer History Vol.1", author: "Chheng Phon", isbn: "978-99950-60-1-2", publisher: "National Library", category: "History", totalCopies: 5, available: 0, borrowed: 5, language: "Khmer", year: 2010, description: "A comprehensive account of Khmer history.", status: "BORROWED", borrowable: true, addedDate: "February 3, 2024", history: [] },
];

const statusStyle = {
  "AVAILABLE":    { bg: "#E8F5E9", text: "#2E7D32" },
  "BORROWED":     { bg: "#FFFDE7", text: "#B78103" },
  "LOW STOCK":    { bg: "#FFF3E0", text: "#E65100" },
  "OUT OF STOCK": { bg: "#FFEBEE", text: "#C62828" },
};

export default function BookDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const book = BOOKS.find((b) => b.id === id) || BOOKS[0];
  const availPct = Math.round((book.available / book.totalCopies) * 100);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDeleteConfirmExecution = (bookId) => {
    console.log("Completely dropping database asset row item index reference code:", bookId);
    navigate("/inventory");
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased select-none bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Navbar title="Inventory" breadcrumb="Inventory › Book Details" onBack={() => navigate("/inventory")} />
        
        <div className="px-8 py-6 space-y-5">
          {/* Top Sub-Header Breadcrumb Action Navigation Bar */}
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">
              <span className="text-gray-400">Inventory</span>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-gray-700 font-bold">Book Details</span>
            </button>
            
            {/* Top Action Header Controls Buttons grouped neatly */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(`/inventory/${book.id}/edit`)} 
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#055E83] hover:opacity-95 transition shadow-3xs"
              >
                <Edit2 size={13} /> Edit Book
              </button>
              <button 
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#DF4A4A] hover:bg-red-700 transition shadow-3xs"
              >
                <Trash2 size={13} /> Delete Book
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-6 items-start">

            {/* Left Main Card: Structural Data Fields specifications matrix */}
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-[#055E83]">
                <h2 className="text-white font-bold text-sm">Book Details</h2>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-3xs" style={{ backgroundColor: statusStyle[book.status.toUpperCase()]?.bg, color: statusStyle[book.status.toUpperCase()]?.text }}>
                  {book.status}
                </span>
              </div>
              
              <div className="p-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{book.title}</h1>
                <p className="text-xs font-bold text-gray-400 mb-6">{book.author}</p>

                <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                  <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                    <span className="text-xs font-bold text-gray-400">Dewey Code</span>
                    <span className="text-xs font-mono font-bold text-[#055E83]">{book.deweyCode}</span>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                    <span className="text-xs font-bold text-gray-400">Section Code</span>
                    <span className="text-xs font-mono font-bold text-gray-600">{book.sectionCode}</span>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                    <span className="text-xs font-bold text-gray-400">Borrowable</span>
                    <div className="flex items-center">
                      <div className="px-2.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] rounded-md flex items-center justify-center gap-1.5 text-[10px] font-black tracking-wide shadow-3xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                        ON
                      </div>
                    </div>
                  </div>

                  {[
                    ["Publisher (Optional)", book.publisher, null],
                    ["Publication Year", String(book.year), null],
                    ["Category", book.category, null],
                    ["Language", book.language, null],
                    ["Total Copies", `${book.totalCopies} copies`, null],
                    ["Available", `${book.available} copies`, "#16A34A"],
                    ["Currently Borrowed", `${book.borrowed} copies`, "#EA580C"],
                    ["Added to Library", book.addedDate, null],
                  ].map(([label, val, color]) => (
                    <div key={label} className="grid grid-cols-[180px_1fr] gap-2 items-baseline">
                      <span className="text-xs font-bold text-gray-400">{label}</span>
                      <span className="text-xs font-semibold" style={{ color: color || "#475569" }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Description</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-3xl font-medium">{book.description}</p>
                </div>

                {book.history.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Borrow History (Last 3)</h3>
                    <div className="space-y-2.5">
                      {book.history.map((h, i) => (
                        <p key={i} className="text-xs text-gray-500 font-medium">
                          <span className="font-bold text-gray-700">{h.name}</span> 
                          <span className="text-gray-300 mx-2">·</span> Borrowed {h.borrowed} 
                          <span className="text-gray-300 mx-2">·</span> Returned {h.returned}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Cover profile display thumbnails & copy loops */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 bg-[#055E83]">
                  <h3 className="text-white font-bold text-sm">Stock Overview</h3>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold text-gray-500 mb-2">Book Cover</p>
                  
                  <div className="w-full h-56 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center p-4 mb-2 overflow-hidden shadow-3xs">
                    <img 
                      src="/little-prince-cover.jpg" 
                      alt="The Little Prince Cover" 
                      className="h-full object-contain shadow-xs rounded-md"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <p className="text-[10px] font-mono font-bold text-gray-400 mb-5 text-center">little-prince-cover.jpg · 2.1 MB</p>

                  <div className="bg-[#F4F9FC] rounded-xl p-4 mb-5 border border-[#E1EEF4]">
                    <p className="text-xs font-bold mb-0.5 text-[#055E83]">Copy Availability</p>
                    <p className="text-xs text-gray-500 font-semibold mb-2.5">{book.available} of {book.totalCopies} available</p>
                    <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full bg-[#16A34A] transition-all duration-300" style={{ width: `${availPct}%` }} />
                    </div>
                  </div>

                  <p className="text-xs font-bold text-gray-500 mb-2.5">Quick Actions</p>
                  <div className="space-y-1.5">
                    {["Borrow This Book", "Reserve for Member", "Print Book Label", "View All Borrows"].map((action) => (
                      <button key={action} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50/80 transition text-left shadow-3xs">
                        {action} <ChevronRight size={13} className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feed activity card panel bottom */}
              <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-3.5">Recent Activity</p>
                <div className="space-y-3">
                  <p className="text-[11px] text-gray-500 font-medium leading-normal">
                    Borrowed by <span className="font-bold text-gray-700">Sophea Mao</span> — Mar 1, 2026
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium leading-normal">
                    Returned by <span className="font-bold text-gray-700">Vireak Chan</span> — Feb 24, 2026
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium leading-normal">
                    New copy added — Jan 15, 2026
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <DeleteBookModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirmExecution}
        book={book}
      />
    </div>
  );
}