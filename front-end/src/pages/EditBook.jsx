import { useState } from "react";
import { AlertTriangle, Upload, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

export default function EditBook() {
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

  // Shared Master Style Classes
  const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#055E83] transition text-gray-800 bg-white placeholder-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

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