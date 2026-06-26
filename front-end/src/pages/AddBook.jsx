import { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

export default function AddBook() {
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

  // Shared Master Style Classes
  const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#055E83] transition text-gray-800 bg-white placeholder-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

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