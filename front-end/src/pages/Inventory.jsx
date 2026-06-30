import { useState } from "react";
import { Upload, Image as ImageIcon, Edit2, Trash2, ChevronRight, X, AlertTriangle, Library, Plus, Search, Filter, ArrowUpDown, ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";


export function DeleteBookModal({ isOpen, onClose, onConfirm, book }) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Viewport breakout overlay drop mask */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Structured Warning Panel Box */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col">

        {/* Absolute Exit cross icon trigger */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          <X size={16} />
        </button>

        {/* Coral Trash Emblem */}
        <div className="mb-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 border border-red-100 shadow-3xs">
            <Trash2 size={18} />
          </div>
        </div>

        {/* Target warning messages definitions labels */}
        <h3 className="text-base font-black text-gray-900 mb-1">Delete Book Record?</h3>
        <p className="text-xs font-bold text-gray-400 mb-4">You are about to permanently delete:</p>

        {/* Target Asset Identity Card display box banner matching mockup layout precisely */}
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-3.5 mb-4 text-left">
          <h4 className="text-xs font-black text-red-900 mb-0.5">{book.title}</h4>
          <p className="text-[11px] font-bold text-red-600/80 leading-normal">
            {book.author} <span className="mx-1.5 text-red-200">•</span> ISBN: {book.isbn || "N/A"} <span className="mx-1.5 text-red-200">•</span> {book.totalCopies || book.totalCopies === 0 ? book.totalCopies : "0"} copies
          </p>
        </div>

        {/* Action Warning Label Context Alert Block */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5 mb-6 text-left">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-amber-700 leading-normal">
            This action cannot be undone. All borrow history will be lost.
          </p>
        </div>

        {/* Binary choice control row panels panel */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-500 hover:bg-gray-50 transition tracking-wide shadow-3xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm(book.id);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-[#DF4A4A] hover:bg-red-700 text-xs font-black text-white transition tracking-wide shadow-xs"
          >
            Yes, Delete Permanently
          </button>
        </div>

      </div>
    </div>
  );
}


const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#055E83] transition text-gray-800 bg-white placeholder-gray-400";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";


export function AddBook() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    deweyCode: "843.914",
    sectionCode: "SEC-CHD",
    borrowable: true,
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    isbn: "978-0-15-246227-0",
    publisher: "Reynal & Hitchcock",
    category: "Children",
    totalCopies: "12",
    year: "1943",
    language: "French / Khmer",
    description: "A young pilot stranded in the desert meets a little prince who has fallen to Earth from a tiny asteroid. A classic tale about love, loss, and the importance of seeing with the heart.",
  });

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const toggleBorrowable = () => setForm((prev) => ({ ...prev, borrowable: !prev.borrowable }));

  return (
    <div className="flex h-screen overflow-hidden antialiased bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <Navbar title="Inventory" breadcrumb="Inventory › Add New Book" onBack={() => navigate("/inventory")} />

        <div className="px-8 py-6">
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-7xl mx-auto">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#055E83]">
              <h2 className="text-white font-bold text-lg">Add New Book</h2>
              <span className="text-white/80 text-xs">Fill in book details below</span>
            </div>

            <div className="p-6 space-y-6">

              {/* COVER IMAGE CONTAINER */}
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center justify-center w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400 shrink-0 select-none">
                  <ImageIcon size={20} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-medium text-center px-1">Upload Cover</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-800">Book Cover Image</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
                    Upload a cover image for this book. Accepted formats: JPG, PNG, WEBP. Max size: 5MB. Recommended size: 300×400px.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#055E83] hover:opacity-95 transition">
                      <Upload size={14} /> Choose File
                    </button>
                    <span className="text-xs text-gray-400">Or drag and drop your image here</span>
                  </div>
                </div>
              </div>

              {/* CORE IDENTIFIERS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label className={labelCls}>Dewey Code</label>
                  <input value={form.deweyCode} onChange={updateField("deweyCode")} className={`${inputCls} font-bold text-[#055E83]`} />
                </div>
                <div className="md:col-span-4">
                  <label className={labelCls}>Section Code</label>
                  <input value={form.sectionCode} onChange={updateField("sectionCode")} className={inputCls} />
                </div>
                <div className="md:col-span-3">
                  <label className={labelCls}>Borrowable</label>
                  <div onClick={toggleBorrowable} className="w-28 h-[38px] bg-slate-100 border border-gray-200 rounded-md p-1 flex items-center cursor-pointer select-none">
                    <div className={`h-full px-3 rounded flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs ${
                      form.borrowable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 ml-auto"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${form.borrowable ? "bg-green-600" : "bg-red-600"}`} />
                      {form.borrowable ? "ON" : "OFF"}
                    </div>
                  </div>
                </div>
              </div>

              {/* BOOK INFORMATION */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#055E83] uppercase tracking-wider border-b border-gray-100 pb-1">Book Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Book Title</label>
                    <input value={form.title} onChange={updateField("title")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Author</label>
                    <input value={form.author} onChange={updateField("author")} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>ISBN (Optional)</label>
                    <input value={form.isbn} onChange={updateField("isbn")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Publisher (Optional)</label>
                    <input value={form.publisher} onChange={updateField("publisher")} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* CLASSIFICATION & STOCK */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#055E83] uppercase tracking-wider border-b border-gray-100 pb-1">Classification & Stock</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <input value={form.category} onChange={updateField("category")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Total Copies</label>
                    <input value={form.totalCopies} onChange={updateField("totalCopies")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Publication Year</label>
                    <input value={form.year} onChange={updateField("year")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Language</label>
                    <input value={form.language} onChange={updateField("language")} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={updateField("description")} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#055E83] transition resize-none text-gray-800 bg-white" />
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <p className="text-xs text-gray-400">* All fields marked are required</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => navigate("/inventory")} className="px-5 py-2 border border-gray-300 text-gray-600 font-semibold rounded-md text-sm bg-white hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="button" className="px-5 py-2 rounded-md text-sm font-semibold transition bg-[#EAB308] text-slate-900 hover:opacity-95">
                  Save as Draft
                </button>
                <button type="button" onClick={() => navigate("/inventory")} className="px-5 py-2 rounded-md text-sm font-semibold text-white bg-[#055E83] hover:opacity-95 transition">
                  Add Book to Inventory
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}


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

export function BookDetails() {
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

export function EditBook() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    deweyCode: "843.914",
    sectionCode: "SEC-CHD",
    borrowable: true,
    title: "The Little Prince (Revised Edition)",
    author: "Antoine de Saint-Exupéry",
    isbn: "978-0-15-246227-0",
    publisher: "Reynal & Hitchcock",
    category: "Children",
    totalCopies: "14",
    year: "1943",
    language: "French / Khmer",
    description:
      "A young pilot stranded in the Sahara Desert encounters a small boy — The Little Prince — who has fallen to Earth from a tiny asteroid. A timeless tale of friendship, love, and human nature. (Revised Khmer edition 2024)",
  });

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const toggleBorrowable = () => setForm((prev) => ({ ...prev, borrowable: !prev.borrowable }));

  return (
    <div className="flex h-screen overflow-hidden antialiased bg-[#F8FAFC]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <Navbar title="Inventory" breadcrumb="Inventory › Book Details › Edit Book" onBack={() => navigate(`/inventory/${id}`)} />

        <div className="px-8 py-6">
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-7xl mx-auto">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#055E83]">
              <h2 className="text-white font-bold text-lg">Edit Book</h2>
              <span className="text-white/80 text-xs">The Little Prince • ID: BK-001</span>
            </div>

            {/* UNSAVED WARNING BANNER */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-4 py-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <p className="text-xs font-semibold text-amber-800">
                  You have unsaved changes. Review and save before leaving.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* COVER IMAGE CONTAINER */}
              <div className="flex gap-6 items-start">
                <img src="/little-prince-cover.jpg" alt="Cover" className="w-24 h-32 rounded-lg border border-gray-200 object-cover bg-gray-50 shrink-0" onError={(e) => { e.target.style.display='none'; }} />
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-800">Book Cover Image</h3>
                  <p className="text-xs text-gray-500">
                    Current: little-prince-cover.jpg · 2.1 MB · Uploaded Jan 15, 2024
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#055E83] hover:opacity-95 transition">
                      <Upload size={14} /> Change Cover
                    </button>
                    <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    JPG, PNG or WEBP · Max 5MB · Recommended 300×400px
                  </p>
                </div>
              </div>

              {/* CORE IDENTIFIERS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label className={labelCls}>Dewey Code</label>
                  {/* Distinct light blue field background for edit focus context */}
                  <input value={form.deweyCode} onChange={updateField("deweyCode")} className={`${inputCls} font-bold text-[#055E83] bg-[#F0F7FA] border-[#BCE0FD]`} />
                </div>
                <div className="md:col-span-4">
                  <label className={labelCls}>Section Code</label>
                  <input value={form.sectionCode} onChange={updateField("sectionCode")} className={inputCls} />
                </div>
                <div className="md:col-span-3">
                  <label className={labelCls}>Borrowable</label>
                  <div onClick={toggleBorrowable} className="w-28 h-[38px] bg-slate-100 border border-gray-200 rounded-md p-1 flex items-center cursor-pointer select-none">
                    <div className={`h-full px-3 rounded flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs ${
                      form.borrowable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 ml-auto"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${form.borrowable ? "bg-green-600" : "bg-red-600"}`} />
                      {form.borrowable ? "ON" : "OFF"}
                    </div>
                  </div>
                </div>
              </div>

              {/* BOOK INFORMATION */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#055E83] uppercase tracking-wider border-b border-gray-100 pb-1">Book Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Book Title</label>
                    <input value={form.title} onChange={updateField("title")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Author</label>
                    <input value={form.author} onChange={updateField("author")} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>ISBN (Optional)</label>
                    <input value={form.isbn} onChange={updateField("isbn")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Publisher (Optional)</label>
                    <input value={form.publisher} onChange={updateField("publisher")} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* CLASSIFICATION & STOCK */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#055E83] uppercase tracking-wider border-b border-gray-100 pb-1">Classification & Stock</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <input value={form.category} onChange={updateField("category")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Total Copies</label>
                    <input value={form.totalCopies} onChange={updateField("totalCopies")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Publication Year</label>
                    <input value={form.year} onChange={updateField("year")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Language</label>
                    <input value={form.language} onChange={updateField("language")} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={updateField("description")} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#055E83] transition resize-none text-gray-800 bg-white" />
                </div>
              </div>

              {/* EDIT HISTORY PANEL */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-50 px-4 py-2 font-bold text-gray-700 text-xs border-b border-gray-200">
                  Edit History
                </div>
                <div className="p-4 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Admin Sokha Chen</span>
                    <span className="text-gray-300">•</span>
                    <span>Title updated</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400">Mar 3, 2026 at 10:24 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Admin Sokha Chen</span>
                    <span className="text-gray-300">•</span>
                    <span>Total copies changed from 12 → 14</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400">Mar 3, 2026 at 10:20 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Admin Sokha Chen</span>
                    <span className="text-gray-300">•</span>
                    <span>Book first added to inventory</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400">Jan 15, 2024 at 09:00 AM</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ACTION FOOTER */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <p className="text-xs text-gray-400 font-medium">Last edited: Mar 3, 2026 at 10:24 AM by Admin</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => navigate(`/inventory/${id}`)} className="px-5 py-2 border border-red-200 text-red-500 font-semibold rounded-md text-sm bg-white hover:bg-red-50 transition">
                  Discard Changes
                </button>
                <button type="button" className="px-5 py-2 rounded-md text-sm font-semibold text-white bg-[#055E83] hover:opacity-95 transition">
                  Save & Update Book
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

const INVENTORY_BOOKS = [
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

const inventoryStatusStyle = {
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

export function Inventory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const totalPages = 356;

  const filtered = INVENTORY_BOOKS.filter((b) =>
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
                      style={{ backgroundColor: inventoryStatusStyle[book.status.toUpperCase()]?.bg || "#f3f4f6", color: inventoryStatusStyle[book.status.toUpperCase()]?.text || "#1f2937" }}>
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

export default { Inventory, AddBook, BookDetails, EditBook, DeleteBookModal };