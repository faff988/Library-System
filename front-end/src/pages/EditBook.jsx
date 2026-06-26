import { useState } from "react";
import { AlertTriangle, Upload, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

export default function EditBook() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    code: "LIB-CHD-001",
    title: "The Little Prince (Revised Edition)",
    author: "Antoine de Saint-Exupéry",
    isbn: "978-0-15-246227-0",
    publisher: "Reynal & Hitchcock",
    category: "Children",
    totalCopies: "14",
    year: "1943",
    language: "French / Khmer",
    description:
      "A young pilot stranded in the Sahara Desert encounters a small boy — The Little Prince — who has fallen to Earth from a tiny asteroid. A timeless tale of friendship, love, and human nature.",
  });

  const updateField = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#055E83] transition text-gray-700";

  const labelCls =
    "block text-sm font-medium text-gray-600 mb-1.5";

  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar
          title="Inventory"
          breadcrumb="Inventory › Edit Book"
          onBack={() => navigate("/inventory")}
        />

        <div className="px-8 py-6">
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* HEADER */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ backgroundColor: "#055E83" }}
            >
              <h2 className="text-white text-2xl font-bold">
                Edit Book
              </h2>

              <span className="text-white/80 text-sm">
                The Little Prince • ID: BK-001
              </span>
            </div>

            {/* UNSAVED WARNING */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3">
                <AlertTriangle
                  size={16}
                  className="text-yellow-600"
                />

                <p className="text-sm text-yellow-700">
                  You have unsaved changes. Review and save
                  before leaving.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* COVER IMAGE */}
              <div className="flex gap-5 items-start">
                <img
                  src="/little-prince-cover.jpg"
                  alt="Book Cover"
                  className="w-20 h-28 rounded border object-cover bg-gray-100"
                />

                <div>
                  <h3 className="font-semibold text-gray-800">
                    Book Cover Image
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Current: little-prince-cover.jpg · 2.1 MB
                  </p>

                  <div className="flex gap-3 mt-4">
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90"
                      style={{ backgroundColor: "#055E83" }}
                    >
                      <Upload size={14} />
                      Change Cover
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-500 text-sm font-semibold hover:bg-red-50">
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    JPG, PNG or WEBP · Max 5MB · Recommended
                    300×400px
                  </p>
                </div>
              </div>

              {/* LIBRARY CODE */}
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <label className={labelCls}>
                    Library Code
                  </label>

                  <input
                    value={form.code}
                    onChange={updateField("code")}
                    className={inputCls}
                    style={{
                      color: "#055E83",
                      fontWeight: 600,
                    }}
                  />
                </div>

                <div className="flex items-center">
                  <p className="text-sm text-gray-400">
                    Internal library shelf code (used by staff)
                  </p>
                </div>
              </div>

              {/* BOOK INFORMATION */}
              <div>
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ color: "#055E83" }}
                >
                  Book Information
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>
                      Book Title
                    </label>

                    <input
                      value={form.title}
                      onChange={updateField("title")}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Author
                    </label>

                    <input
                      value={form.author}
                      onChange={updateField("author")}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      ISBN (Optional)
                    </label>

                    <input
                      value={form.isbn}
                      onChange={updateField("isbn")}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Publisher (Optional)
                    </label>

                    <input
                      value={form.publisher}
                      onChange={updateField("publisher")}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* CLASSIFICATION */}
              <div>
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ color: "#055E83" }}
                >
                  Classification & Stock
                </h3>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>
                      Category
                    </label>

                    <input
                      value={form.category}
                      onChange={updateField("category")}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Total Copies
                    </label>

                    <input
                      value={form.totalCopies}
                      onChange={updateField("totalCopies")}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Publication Year
                    </label>

                    <input
                      value={form.year}
                      onChange={updateField("year")}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Language
                    </label>

                    <input
                      value={form.language}
                      onChange={updateField("language")}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    Description
                  </label>

                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={updateField("description")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#055E83] resize-none text-gray-700"
                  />
                </div>
              </div>

              {/* EDIT HISTORY */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-700">
                  Edit History
                </div>

                <div className="p-4 text-sm text-gray-500">
                  Last edited: Mar 3, 2026 at 10:24 AM by
                  Admin
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => navigate(`/inventory/${id}`)}
                className="px-5 py-2.5 rounded-lg border border-red-300 text-red-500 font-semibold hover:bg-red-50 transition"
              >
                Discard Changes
              </button>

              <button
                className="px-5 py-2.5 rounded-lg text-white font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: "#055E83" }}
              >
                Save & Update Book
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}