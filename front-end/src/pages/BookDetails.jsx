import { ArrowLeft, Edit2, Trash2, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

const BOOKS = [
  { id: "001", code: "LIB-CHD-001", title: "The Little Prince", author: "Antoine de Saint-Exupéry", isbn: "978-0-15-246227-0", publisher: "Reynal & Hitchcock, New York", category: "Children / Classic Fiction", totalCopies: 12, available: 8, borrowed: 4, language: "French / Khmer Translation", year: 1943, description: "A young pilot stranded in the Sahara Desert encounters a small boy — The Little Prince — who has fallen to Earth from a tiny asteroid. A timeless tale of friendship, love, and human nature.", status: "AVAILABLE", addedDate: "January 15, 2024", history: [{ name: "Sophea Mao", borrowed: "Mar 1, 2026", returned: "Mar 14, 2026" }, { name: "Vireak Chan", borrowed: "Feb 10, 2026", returned: "Feb 24, 2026" }, { name: "Lina Phal", borrowed: "Jan 22, 2026", returned: "Feb 5, 2026" }] },
  { id: "002", code: "LIB-HIS-002", title: "Khmer History Vol.1", author: "Chheng Phon", isbn: "978-99950-60-1-2", publisher: "National Library", category: "History", totalCopies: 5, available: 0, borrowed: 5, language: "Khmer", year: 2010, description: "A comprehensive account of Khmer history.", status: "BORROWED", addedDate: "February 3, 2024", history: [] },
  { id: "003", code: "LIB-SCI-003", title: "Science for Kids", author: "Dr. Sophea Mao", isbn: "978-99950-72-3-4", publisher: "Phnom Penh Press", category: "Science", totalCopies: 10, available: 10, borrowed: 0, language: "Khmer", year: 2018, description: "An illustrated science book for young readers.", status: "AVAILABLE", addedDate: "March 10, 2024", history: [] },
  { id: "004", code: "LIB-REL-004", title: "Buddhism & Modern Life", author: "Ven. Sithan", isbn: "978-99950-41-8-6", publisher: "Buddhist Institute", category: "Religion", totalCopies: 6, available: 3, borrowed: 3, language: "Khmer", year: 2015, description: "Buddhist teachings in modern Cambodian life.", status: "AVAILABLE", addedDate: "April 1, 2024", history: [] },
  { id: "005", code: "LIB-HIS-005", title: "Angkor Wat Architecture", author: "Kim Seng", isbn: "978-99950-55-2-9", publisher: "Heritage Press", category: "History", totalCopies: 4, available: 2, borrowed: 2, language: "English / Khmer", year: 2012, description: "Architectural heritage of Angkor Wat.", status: "LOW STOCK", addedDate: "May 5, 2024", history: [] },
  { id: "006", code: "LIB-FIC-006", title: "Cambodian Folk Tales", author: "Ly Theam Teng", isbn: "978-99950-33-7-1", publisher: "Cultural Ministry", category: "Fiction", totalCopies: 8, available: 7, borrowed: 1, language: "Khmer", year: 2008, description: "Traditional Cambodian folk stories.", status: "AVAILABLE", addedDate: "June 12, 2024", history: [] },
  { id: "007", code: "LIB-SCI-007", title: "Mathematics Grade 9", author: "MoEYS", isbn: "978-99950-10-4-5", publisher: "Ministry of Education", category: "Science", totalCopies: 15, available: 15, borrowed: 0, language: "Khmer", year: 2020, description: "Official grade 9 mathematics textbook.", status: "AVAILABLE", addedDate: "July 20, 2024", history: [] },
  { id: "008", code: "LIB-NF-008", title: "English for Beginners", author: "Sokha Vann", isbn: "978-99950-88-9-3", publisher: "English Center Press", category: "Non-Fiction", totalCopies: 6, available: 0, borrowed: 6, language: "English / Khmer", year: 2019, description: "Beginner's guide to English for Cambodian students.", status: "OUT OF STOCK", addedDate: "August 8, 2024", history: [] },
];

const statusStyle = {
  "AVAILABLE":    { bg: "#DCFCE7", text: "#16A34A" },
  "BORROWED":     { bg: "#FEF9C3", text: "#CA8A04" },
  "LOW STOCK":    { bg: "#FFEDD5", text: "#EA580C" },
  "OUT OF STOCK": { bg: "#FEE2E2", text: "#DC2626" },
};

export default function BookDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const book = BOOKS.find((b) => b.id === id) || BOOKS[0];
  const availPct = Math.round((book.available / book.totalCopies) * 100);

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Inventory" breadcrumb="Inventory › Book Details" onBack={() => navigate("/inventory")} />
        <div className="px-8 py-6">

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              <ArrowLeft size={14} /> Back to List
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/inventory/${book.id}/edit`)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 transition" style={{ backgroundColor: "#1B4965" }}>
                <Edit2 size={14} /> Edit Book
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition">
                <Trash2 size={14} /> Delete Book
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_300px] gap-5">

            {/* Left: Book Details */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
                <h2 className="text-white font-bold text-sm">Book Details</h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: statusStyle[book.status]?.bg, color: statusStyle[book.status]?.text }}>
                  {book.status}
                </span>
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{book.title}</h1>
                <p className="text-sm text-gray-400 mb-6">{book.author}</p>

                <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                  {[
                    ["Library Code",        book.code,                        "#055E83"],
                    ["ISBN (Optional)",     book.isbn,                        null],
                    ["Publisher (Optional)",book.publisher,                   null],
                    ["Publication Year",    String(book.year),                null],
                    ["Category",            book.category,                    null],
                    ["Language",            book.language,                    null],
                    ["Total Copies",        `${book.totalCopies} copies`,     null],
                    ["Available",           `${book.available} copies`,       "#16A34A"],
                    ["Currently Borrowed",  `${book.borrowed} copies`,        "#EA580C"],
                    ["Added to Library",    book.addedDate,                   null],
                  ].map(([label, val, color]) => (
                    <div key={label} className="grid grid-cols-[180px_1fr] gap-2">
                      <span className="text-sm text-gray-400">{label}</span>
                      <span className="text-sm font-semibold" style={{ color: color || "#1E293B" }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">Description</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{book.description}</p>
                </div>

                {book.history.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Borrow History (Last 3)</h3>
                    <div className="space-y-2">
                      {book.history.map((h, i) => (
                        <p key={i} className="text-sm text-gray-500">
                          <span className="font-semibold text-gray-700">{h.name}</span> · Borrowed {h.borrowed} · Returned {h.returned}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Stock Overview */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                <div className="px-5 py-4" style={{ backgroundColor: "#1B4965" }}>
                  <h3 className="text-white font-bold text-sm">Stock Overview</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Book Cover</p>
                  <div className="w-full h-44 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                    <BookOpen size={40} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-400 mb-5">No cover uploaded</p>

                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-bold mb-1" style={{ color: "#055E83" }}>Copy Availability</p>
                    <p className="text-sm text-gray-500 mb-2">{book.available} of {book.totalCopies} available</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: `${availPct}%` }} />
                    </div>
                  </div>

                  <p className="text-sm font-bold text-gray-700 mb-3">Quick Actions</p>
                  <div className="space-y-2">
                    {["Borrow This Book", "Reserve for Member", "Print Book Label", "View All Borrows"].map((action) => (
                      <button key={action} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 text-sm text-gray-600 hover:bg-gray-50 transition">
                        {action} <ChevronRight size={14} className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                <p className="text-sm font-bold text-gray-700 mb-3">Recent Activity</p>
                <div className="space-y-2">
                  {book.history.length > 0 ? book.history.slice(0, 3).map((h, i) => (
                    <p key={i} className="text-xs text-gray-400">
                      {i % 2 === 0 ? "Borrowed by" : "Returned by"} {h.name} — {i % 2 === 0 ? h.borrowed : h.returned}
                    </p>
                  )) : <p className="text-xs text-gray-400">No recent activity</p>}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}