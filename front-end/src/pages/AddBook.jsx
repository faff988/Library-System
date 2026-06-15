import { useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

export default function AddBook() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: "LIB-CHD-001", title: "", author: "", isbn: "",
    publisher: "", category: "", totalCopies: "", year: "", language: "", description: "",
  });
  const up = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition text-gray-700 placeholder-gray-300";
  const labelCls = "block text-sm font-medium text-gray-600 mb-1.5";

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Inventory" breadcrumb="Inventory › Add New Book" onBack={() => navigate("/inventory")} />
        <div className="px-8 py-6">
          <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
              <h2 className="text-white font-bold text-sm">Add New Book</h2>
              <span className="text-white/60 text-xs">Fill in book details below</span>
            </div>

            <div className="p-6 space-y-6">
              {/* Cover Upload */}
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center justify-center w-32 h-40 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 shrink-0 gap-2">
                  <ImageIcon size={24} className="text-gray-300" />
                  <span className="text-xs text-gray-400 font-medium">Upload Cover</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Book Cover Image</p>
                  <p className="text-xs text-gray-400 mb-3">Upload a cover image for this book. Accepted formats: JPG, PNG, WEBP. Max size: 5MB. Recommended size: 300×400px.</p>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: "#1B4965" }}>
                    <Upload size={14} /> Choose File
                  </button>
                  <p className="text-xs text-gray-400 mt-2">Or drag and drop your image here</p>
                </div>
              </div>

              {/* Library Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Library Code</label>
                  <p className="text-xs text-gray-400 mb-1.5">Internal library shelf code (used by staff)</p>
                  <input value={form.code} onChange={up("code")} className={inputCls} style={{ borderColor: "#055E83", color: "#055E83", fontWeight: 600 }} />
                </div>
              </div>

              {/* Book Information */}
              <div>
                <h3 className="text-sm font-bold mb-4" style={{ color: "#055E83" }}>Book Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Book Title</label>
                    <input value={form.title} onChange={up("title")} placeholder="e.g. The Little Prince" className={inputCls} style={{ borderColor: "#055E83" }} />
                  </div>
                  <div>
                    <label className={labelCls}>Author</label>
                    <input value={form.author} onChange={up("author")} placeholder="Author name" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>ISBN (Optional)</label>
                    <input value={form.isbn} onChange={up("isbn")} placeholder="978-x-xx-xxxxxx-x" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Publisher (Optional)</label>
                    <input value={form.publisher} onChange={up("publisher")} placeholder="Publisher name" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Classification & Stock */}
              <div>
                <h3 className="text-sm font-bold mb-4" style={{ color: "#055E83" }}>Classification & Stock</h3>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <input value={form.category} onChange={up("category")} placeholder="e.g. Children" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Total Copies</label>
                    <input value={form.totalCopies} onChange={up("totalCopies")} placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Publication Year</label>
                    <input value={form.year} onChange={up("year")} placeholder="e.g. 2024" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Language</label>
                    <input value={form.language} onChange={up("language")} placeholder="e.g. Khmer" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={up("description")} rows={3} placeholder="Brief description of the book..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition resize-none text-gray-700 placeholder-gray-300" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">* All fields marked are required</p>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate("/inventory")} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button className="px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition" style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
                  Save as Draft
                </button>
                <button onClick={() => navigate("/inventory")} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition" style={{ backgroundColor: "#1B4965" }}>
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