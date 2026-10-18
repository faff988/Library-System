import { useState, useEffect } from "react";
import {
  Upload, Image as ImageIcon, Edit2, Trash2, ChevronRight, X, AlertTriangle,
  Library, Plus, Search, Filter, ArrowUpDown, ChevronLeft, CheckCircle2,
  Clock, XCircle, Eye,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api, { assetUrl } from "../utils/api";
import { useAuth } from "../hooks/useAuth";

const LANGUAGES = ["All Languages", "Khmer", "English", "French"];
const CATEGORIES = [
  "All Categories",
  "Computer Science, Information & General Works",
  "Philosophy & Psychology",
  "Religion",
  "Social Sciences",
  "Language",
  "Science",
  "Technology",
  "Arts & Recreation",
  "Literature",
  "History & Geography"
];
const STATUSES = ["All Status", "AVAILABLE", "BORROWED", "LOW STOCK", "OUT OF STOCK"];

// Sort options map to the backend's sortBy / sortDir query params.
// booksController.js whitelists "title" and "added_at" (among others).
const SORT_OPTIONS = [
  { value: "title_asc",  label: "Title: A → Z",    sortBy: "title",    sortDir: "asc"  },
  { value: "title_desc", label: "Title: Z → A",    sortBy: "title",    sortDir: "desc" },
  { value: "added_desc", label: "Newest → Oldest", sortBy: "added_at", sortDir: "desc" },
  { value: "added_asc",  label: "Oldest → Newest", sortBy: "added_at", sortDir: "asc"  },
];

// Same 10 Dewey Decimal main classes as booksController.js's list — kept
// identical so the form preview always matches what the backend will
// actually save. The backend is the source of truth; this is a preview.
const DDC_CATEGORIES = [
  "Computer Science, Information & General Works", // 000–099
  "Philosophy & Psychology",                        // 100–199
  "Religion",                                        // 200–299
  "Social Sciences",                                 // 300–399
  "Language",                                        // 400–499
  "Science",                                          // 500–599
  "Technology",                                       // 600–699
  "Arts & Recreation",                                // 700–799
  "Literature",                                       // 800–899
  "History & Geography",                              // 900–999
];

function categoryFromDeweyCode(rawCode) {
  if (!rawCode) return "";
  const match = String(rawCode).trim().match(/^(\d{1,3})/);
  if (!match) return "";
  const wholePart = match[1].padEnd(3, "0").slice(0, 3);
  const mainClass = Math.floor(Number(wholePart) / 100);
  return DDC_CATEGORIES[mainClass] || "";
}

//Shared Theme Constants (matched to Feedback page style)
const HEAD_COLOR = "#055E83"; // kept as the Inventory module's table-head color
const cardShadow = { boxShadow: "0 2px 12px rgba(0,0,0,0.12)" };
const filterPillCls = "flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2";

const inputCls = "w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#055E83] transition text-gray-800 bg-white placeholder-gray-400";
const labelCls = "block text-xs font-bold text-gray-500 mb-1.5";

//Status Badge (icon + tint, Feedback-style) 
const inventoryStatusStyle = {
  "AVAILABLE":    { bg: "#E8F5E9", text: "#2E7D32", icon: CheckCircle2 },
  "BORROWED":     { bg: "#FFFDE7", text: "#B78103", icon: Clock },
  "LOW STOCK":    { bg: "#FFF3E0", text: "#E65100", icon: AlertTriangle },
  "OUT OF STOCK": { bg: "#FFEBEE", text: "#C62828", icon: XCircle },
};

function StatusBadge({ status }) {
  const key = (status || "").toUpperCase();
  const s = inventoryStatusStyle[key] || inventoryStatusStyle["AVAILABLE"];
  const Icon = s.icon;
  return (
    <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md text-center"
      style={{ backgroundColor: s.bg, color: s.text }}>
      <span className="inline-flex items-center gap-1"><Icon size={11} /> {status}</span>
    </span>
  );
}

function BorrowableBadge({ on }) {
  return on ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-50 text-green-700 border-2 border-green-100">
      <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> ON
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-600 border-2 border-red-100">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> OFF
    </span>
  );
}

export function SuccessModal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-gray-300 overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        style={cardShadow}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          <X size={16} />
        </button>

        <div className="mb-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border-2 border-green-100">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <h3 className="text-base font-black text-gray-900 mb-1">{title || "Success"}</h3>
        <p className="text-xs font-bold text-gray-400 mb-6 leading-relaxed">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-black text-white hover:opacity-95 transition tracking-wide shadow-sm"
          style={{ backgroundColor: HEAD_COLOR }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10; // matches booksController.js's own default limit

export function Inventory() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [view, setView] = useState("list");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [language, setLanguage] = useState("All Languages");
  const [status, setStatus] = useState("All Status");
  const [sort, setSort] = useState("title_asc");

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [liveStats, setLiveStats] = useState({
    totalBooks: 0,
    availableCopies: 0,
    borrowedCopies: 0,
    availabilityRate: 0,
  });

  const [selectedBook, setSelectedBook] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchStats();
  }, [search, category, language, status, sort, page]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "All Categories") params.append("category", category);
      if (language !== "All Languages") params.append("language", language);
      if (status !== "All Status") params.append("status", status);

      const sortOpt = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0];
      params.append("sortBy", sortOpt.sortBy);
      params.append("sortDir", sortOpt.sortDir);

      params.append("page", page);
      params.append("limit", PAGE_SIZE);

      const response = await api.get(`/books?${params.toString()}`);
      if (response.data?.success) {
        setBooks(response.data.data);
        const meta = response.data.meta || {};
        setTotalItems(meta.totalItems ?? meta.total ?? meta.totalCount ?? response.data.data.length);
      }
    } catch (err) {
      console.error("Failed to load inventory books data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/books/stats");
      if (response.data?.success) {
        setLiveStats(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch library inventory stats:", err);
    }
  };

  const openDeleteProcess = (book, e) => {
    e.stopPropagation();
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/books/${selectedBook.book_id}`);
      fetchBooks();
      fetchStats();
    } catch (err) {
      console.error("Failed to delete book:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Failed to delete book. It may have existing borrow history.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const gridLayout = "grid grid-cols-[55px_1.6fr_1.2fr_1fr_1fr_1.4fr_80px_80px_1fr_1.2fr_140px] items-center gap-2 px-6";

  const displayStats = [
    { label: "Total Books", value: liveStats.totalBooks.toLocaleString(), sub: "Total Unique Titles", subColor: "#16A34A", border: HEAD_COLOR },
    { label: "Available Copies", value: liveStats.availableCopies.toLocaleString(), sub: `${liveStats.availabilityRate}% availability rate`, subColor: "#16A34A", border: "#22C55E" },
    { label: "Currently Borrowed", value: liveStats.borrowedCopies.toLocaleString(), sub: `${liveStats.overdueCount || 0} overdue returns`, subColor: "#EF4444", border: "#F97316" },
    { label: "System Sections", value: liveStats.sectionsInUse || "0", sub: "Active physical shelves", subColor: "#71717A", border: "#E8C110" },
  ];

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <>
      {view === "add" ? (
        <main className="flex-1 select-none bg-[#E9EEF4]">
          <AddBook onCancel={() => { setView("list"); fetchBooks(); fetchStats(); }} />
        </main>
      ) : (
        <main className="flex-1 select-none bg-[#E9EEF4]">
          <Navbar title="Inventory" breadcrumb="Welcome back, Admin!" />

          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {displayStats.map(({ label, value, sub, subColor, border }) => (
                <div key={label} className="bg-white rounded-xl px-5 py-4 border-2 border-gray-300" style={{ borderTop: `4px solid ${border}`, ...cardShadow }}>
                  <p className="text-xs text-gray-400 mb-1 font-bold">{label}</p>
                  <p className="text-2xl font-bold leading-tight text-gray-800">{value}</p>
                  <p className="text-xs mt-1 font-bold" style={{ color: subColor }}>{sub}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[260px]">
                <div className={filterPillCls}>
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by title, author, Dewey code..."
                    className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400"
                  />
                </div>
              </div>
              <div className={filterPillCls}>
                <Filter size={13} className="text-gray-400" />
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600 font-bold cursor-pointer">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className={filterPillCls}>
                <Filter size={13} className="text-gray-400" />
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600 font-bold cursor-pointer">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className={filterPillCls}>
                <Filter size={13} className="text-gray-400" />
                <select value={language} onChange={(e) => { setLanguage(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600 font-bold cursor-pointer">
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className={filterPillCls}>
                <ArrowUpDown size={13} className="text-gray-400" />
                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="text-xs outline-none bg-transparent text-gray-600 font-bold cursor-pointer">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-300" style={cardShadow}>
              <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: HEAD_COLOR }}>
                <h2 className="text-white font-bold text-sm flex items-center gap-2"><Library size={15} /> Book Catalog</h2>
                {can("inventory", "create") && (
                  <button onClick={() => navigate("/inventory/add")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition hover:opacity-95 bg-[#E8C110] text-[#1B4965]">
                    <Plus size={12} /> Add Book
                  </button>
                )}
              </div>

              <div className="overflow-x-auto w-full">
                <div style={{ minWidth: "1200px" }}>
                  <div className={`${gridLayout} py-3 border-b-2 border-gray-300 bg-gray-50/70 text-[11px] font-bold uppercase`} style={{ color: HEAD_COLOR }}>
                    <span>ID</span><span>Title</span><span>Author</span><span>Dewey Code</span>
                    <span>Language</span>
                    <span>Category</span><span>Copies</span><span>Section</span><span>Borrowable</span>
                    <span className="text-center">Status</span><span className="text-center">Actions</span>
                  </div>

                  {loading ? (
                    <div className="p-10 text-center text-gray-500 font-medium">Loading books from system inventory...</div>
                  ) : books.length > 0 ? books.map((book) => (
                    <div key={book.book_id} className={`${gridLayout} py-4 border-b border-gray-200 hover:bg-slate-50/60 transition text-xs text-gray-600`}>
                      <span className="font-mono font-bold">{book.book_id}</span>
                      <span className="font-bold text-gray-900 truncate">{book.title}</span>
                      <span className="text-gray-500 truncate">{book.author}</span>
                      <span className="font-mono">{book.dewey_code}</span>
                      <span className="font-semibold text-gray-700">{book.language}</span>
                      <span className="truncate">{book.category}</span>
                      <span className="font-bold">{book.available_copies} / {book.total_copies}</span>
                      <span className="font-mono">{book.section || "N/A"}</span>
                      <div><BorrowableBadge on={book.is_borrowable} /></div>
                      <div className="text-center"><StatusBadge status={book.status} /></div>
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => navigate(`/inventory/${book.book_id}`)} className="px-2.5 py-1.5 rounded bg-[#055E83] text-white"><Eye size={12} /></button>
                        {can("inventory", "update") && (
                          <button onClick={() => navigate(`/inventory/${book.book_id}/edit`)} className="px-2.5 py-1.5 rounded bg-[#E8C110] text-[#1B4965]"><Edit2 size={12} /></button>
                        )}
                        {can("inventory", "delete") && (
                          <button onClick={(e) => openDeleteProcess(book, e)} className="px-2.5 py-1.5 rounded bg-red-50 text-red-500 border border-red-100"><Trash2 size={12} /></button>
                        )}
                      </div>
                    </div>
                  )) : <div className="p-10 text-center text-gray-400">No books found matching your criteria.</div>}
                </div>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-400 font-bold">
                  Showing {books.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, totalItems)} of {totalItems.toLocaleString()} books
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition bg-white"
                  >
                    <ChevronLeft size={14} className="text-gray-500" />
                  </button>
                  <span className="text-xs text-gray-500 font-bold px-2">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition bg-white"
                  >
                    <ChevronRight size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      <DeleteBookModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        book={selectedBook}
      />
    </>
  );
}

//Delete Modal 
export function DeleteBookModal({ isOpen, onClose, onConfirm, book }) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-gray-300 overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col" style={cardShadow}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition">
          <X size={16} />
        </button>

        <div className="mb-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 border-2 border-red-100">
            <Trash2 size={18} />
          </div>
        </div>

        <h3 className="text-base font-black text-gray-900 mb-1">Delete Book Record?</h3>
        <p className="text-xs font-bold text-gray-400 mb-4">You are about to permanently delete:</p>

        <div className="bg-red-50/50 border-2 border-red-100 rounded-xl p-3.5 mb-4 text-left">
          <h4 className="text-xs font-black text-red-900 mb-0.5">{book.title}</h4>
          <p className="text-[11px] font-bold text-red-600/80 leading-normal">
            {book.author} <span className="mx-1.5 text-red-200">•</span> ISBN: {book.isbn || "N/A"} <span className="mx-1.5 text-red-200">•</span> {book.total_copies ?? 0} copies
          </p>
        </div>

        <div className="bg-amber-50 border-2 border-amber-100 rounded-xl p-3 flex items-start gap-2.5 mb-6 text-left">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-amber-700 leading-normal">
            This action cannot be undone. All borrow history will be lost.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl border-2 border-gray-300 bg-white text-xs font-black text-gray-500 hover:bg-gray-50 transition tracking-wide shadow-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-[#DF4A4A] hover:bg-red-700 text-xs font-black text-white transition tracking-wide shadow-sm"
          >
            Yes, Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

// ADD BOOK 
export function AddBook({ onCancel }) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { can } = useAuth();

  const [sectionSuggestions, setSectionSuggestions] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    api.get("/books/options/sections")
      .then((res) => { if (res.data?.success) setSectionSuggestions(res.data.data); })
      .catch((err) => console.error("Failed to load section suggestions:", err));
  }, []);

  // Guards against a librarian without inventory.create hitting this route
  // directly by URL — the button is already hidden, this covers the gap.
  useEffect(() => {
    if (!can("inventory", "create")) navigate("/inventory", { replace: true });
  }, [can, navigate]);

  const handleClose = () => {
    if (typeof onCancel === "function") {
      onCancel();
    } else {
      navigate("/inventory");
    }
  };

  const [form, setForm] = useState({
    deweyCode: "",
    section: "",
    isBorrowable: true,
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    totalCopies: "1",
    publicationYear: new Date().getFullYear().toString(),
    language: "English",
    description: "",
  });

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const toggleBorrowable = () => setForm((prev) => ({ ...prev, isBorrowable: !prev.isBorrowable }));

  const previewCategory = categoryFromDeweyCode(form.deweyCode);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Cover image must be under 5MB.");
      return;
    }
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(null);
  };

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("author", form.author.trim());
      formData.append("deweyCode", form.deweyCode.trim());
      formData.append("language", form.language);
      if (form.section.trim()) formData.append("section", form.section.trim());
      if (form.isbn.trim()) formData.append("isbn", form.isbn.trim());
      if (form.publisher.trim()) formData.append("publisher", form.publisher.trim());
      if (form.description.trim()) formData.append("description", form.description.trim());
      if (form.publicationYear) formData.append("publicationYear", form.publicationYear);
      formData.append("totalCopies", form.totalCopies || "1");
      formData.append("isBorrowable", form.isBorrowable);
      if (coverFile) formData.append("coverImage", coverFile);
      // Category is intentionally NOT sent — the backend always derives it
      // from deweyCode, so submitting one here would just be ignored.

      await api.post("/books", formData);
      setShowSuccess(true);
    } catch (err) {
      console.error("Submission failed details:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Validation failed. Check your console log.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#E9EEF4] p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl overflow-hidden border-2 border-gray-300 max-w-7xl mx-auto" style={cardShadow}>

        <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: HEAD_COLOR }}>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Library size={17} className="text-[#E8C110]" /> Add New Book
          </h2>
          <span className="text-white/80 text-xs">Fill in book details below</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Cover Image */}
          <div className="flex gap-6 items-start">
            <div className="w-28 h-36 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={28} className="text-gray-300" />
              )}
            </div>
            <div className="space-y-2 pt-1">
              <h3 className="text-sm font-bold text-gray-800">Book Cover</h3>
              <p className="text-[11px] text-gray-400 font-medium">JPG, PNG or WEBP · Max 5MB · Recommended 300×400px</p>
              <div className="flex gap-2 pt-1">
                <label className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white hover:opacity-95 transition shadow-sm cursor-pointer" style={{ backgroundColor: HEAD_COLOR }}>
                  <Upload size={14} /> {coverFile ? "Change Cover" : "Upload Cover"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
                </label>
                {coverFile && (
                  <button type="button" onClick={removeCover} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition shadow-sm">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Classification & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className={labelCls}>Dewey Code *</label>
              <input required value={form.deweyCode} onChange={updateField("deweyCode")} className={`${inputCls} font-bold`} style={{ color: HEAD_COLOR }} placeholder="e.g. 823.912" />
            </div>
            <div className="md:col-span-4">
              <label className={labelCls}>Category (auto-generated)</label>
              <input
                value={previewCategory || "Enter a Dewey code to classify"}
                readOnly
                className={`${inputCls} bg-gray-50 ${previewCategory ? "text-gray-600" : "text-gray-400"} cursor-not-allowed`}
              />
            </div>
            <div className="md:col-span-4">
              <label className={labelCls}>Section</label>
              <input
                list="section-suggestions"
                value={form.section}
                onChange={updateField("section")}
                placeholder="e.g. K1, Fiction-A..."
                className={inputCls}
                maxLength={20}
              />
              <datalist id="section-suggestions">
                {sectionSuggestions.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 -mt-3">
            Category follows the Dewey Decimal Classification's 10 main classes. Section is a free-text shelf label — start typing to see ones already in use.
          </p>

          <div className="flex items-center gap-3">
            <label className={labelCls}>Borrowable</label>
            <div onClick={toggleBorrowable} className="w-28 h-[42px] bg-slate-100 border-2 border-gray-300 rounded-lg p-1 flex items-center cursor-pointer select-none">
              <div className={`h-full px-3 rounded-md flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm ${form.isBorrowable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 ml-auto"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${form.isBorrowable ? "bg-green-600" : "bg-red-600"}`} />
                {form.isBorrowable ? "ON" : "OFF"}
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b-2 border-gray-200 pb-1.5" style={{ color: HEAD_COLOR }}>Book Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Book Title *</label>
                <input required value={form.title} onChange={updateField("title")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Author *</label>
                <input required value={form.author} onChange={updateField("author")} className={inputCls} />
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

          {/* Stock Parameters */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b-2 border-gray-200 pb-1.5" style={{ color: HEAD_COLOR }}>Classification & Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Total Copies *</label>
                <input required type="number" min="1" value={form.totalCopies} onChange={updateField("totalCopies")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Publication Year</label>
                <input type="number" value={form.publicationYear} onChange={updateField("publicationYear")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Language *</label>
                <select required value={form.language} onChange={updateField("language")} className={inputCls}>
                  {LANGUAGES.filter((l) => l !== "All Languages").map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={updateField("description")} rows={4} className={`${inputCls} resize-none leading-relaxed`} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-gray-300 bg-gray-50/50">
          <p className="text-xs text-gray-400 font-bold">* All fields marked are required</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleClose} className="px-5 py-2.5 border-2 border-gray-300 text-gray-600 font-bold rounded-lg text-xs bg-white hover:bg-gray-50 transition shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg text-xs font-bold text-white hover:opacity-95 transition shadow-sm" style={{ backgroundColor: HEAD_COLOR }}>
              {loading ? "Adding Asset..." : "Add Book to Inventory"}
            </button>
          </div>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          handleClose();
        }}
        title="Book Added Successfully"
        message={`"${form.title}" has been added to the library inventory.`}
      />
    </div>
  );
}

export function BookDetails() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchBook();
    fetchHistory();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books/${id}`);
      if (response.data?.success) setBook(response.data.data);
    } catch (err) {
      console.error("Failed to load book details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/books/${id}/history?limit=3`);
      if (response.data?.success) setHistory(response.data.data);
    } catch (err) {
      console.error("Failed to load book borrow history:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/books/${id}`);
      navigate("/inventory");
    } catch (err) {
      console.error("Failed to delete book:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Failed to delete book. It may have existing borrow history.");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 select-none bg-[#E9EEF4]">
        <Navbar title="Inventory" breadcrumb="Inventory › Book Details" onBack={() => navigate("/inventory")} />
        <div className="p-10 text-center text-gray-500 font-medium">Loading book details...</div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="flex-1 select-none bg-[#E9EEF4]">
        <Navbar title="Inventory" breadcrumb="Inventory › Book Details" onBack={() => navigate("/inventory")} />
        <div className="p-10 text-center text-gray-400">Book not found.</div>
      </main>
    );
  }

  const availPct = book.total_copies ? Math.round((book.available_copies / book.total_copies) * 100) : 0;

  return (
    <>
      <main className="flex-1 select-none bg-[#E9EEF4]">
        <Navbar title="Inventory" breadcrumb="Inventory › Book Details" onBack={() => navigate("/inventory")} />

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/inventory")} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition">
              <span className="text-gray-400">Inventory</span>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-gray-700 font-bold">Book Details</span>
            </button>

            <div className="flex items-center gap-2">
              {can("inventory", "update") && (
                <button
                  onClick={() => navigate(`/inventory/${book.book_id}/edit`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white hover:opacity-85 transition shadow-sm"
                  style={{ backgroundColor: HEAD_COLOR }}
                >
                  <Edit2 size={12} /> Edit Book
                </button>
              )}
              {can("inventory", "delete") && (
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-85 transition shadow-sm bg-red-50 text-red-500 border-2 border-red-100"
                >
                  <Trash2 size={12} /> Delete Book
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-5 items-start">

            <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden" style={cardShadow}>
              <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: HEAD_COLOR }}>
                <h2 className="text-white font-bold text-sm flex items-center gap-2"><Library size={14} className="text-[#E8C110]" /> Book Details</h2>
                <StatusBadge status={book.status} />
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{book.title}</h1>
                <p className="text-xs font-bold text-gray-400 mb-6">{book.author}</p>

                <div className="space-y-4 mb-6 border-b-2 border-gray-200 pb-6">
                  <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dewey Code</span>
                    <span className="text-xs font-mono font-bold" style={{ color: HEAD_COLOR }}>{book.dewey_code}</span>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Section</span>
                    <span className="text-xs font-mono font-bold text-gray-600">{book.section || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Borrowable</span>
                    <BorrowableBadge on={book.is_borrowable} />
                  </div>

                  {[
                    ["ISBN", book.isbn || "N/A", null],
                    ["Publisher", book.publisher || "N/A", null],
                    ["Publication Year", book.publication_year ? String(book.publication_year) : "N/A", null],
                    ["Category", book.category, null],
                    ["Language", book.language, null],
                    ["Total Copies", `${book.total_copies} copies`, null],
                    ["Available", `${book.available_copies} copies`, "#16A34A"],
                    ["Currently Borrowed", `${book.borrowed_copies} copies`, "#EA580C"],
                    ["Added to Library", book.added_at ? new Date(book.added_at).toLocaleDateString() : "N/A", null],
                  ].map(([label, val, color]) => (
                    <div key={label} className="grid grid-cols-[180px_1fr] gap-2 items-baseline">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                      <span className="text-xs font-semibold" style={{ color: color || "#475569" }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Description</h3>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-600 leading-relaxed border-2 border-gray-200 font-medium max-w-3xl">
                    {book.description || "No description available."}
                  </div>
                </div>

                {history.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Borrow History (Last 3)</h3>
                    <div className="space-y-2.5">
                      {history.map((h) => (
                        <p key={h.borrow_id} className="text-xs text-gray-500 font-medium">
                          <span className="font-bold text-gray-700">{h.member_name}</span>
                          <span className="text-gray-300 mx-2">·</span> Borrowed {new Date(h.borrow_date).toLocaleDateString()}
                          <span className="text-gray-300 mx-2">·</span>{" "}
                          {h.return_date ? `Returned ${new Date(h.return_date).toLocaleDateString()}` : `Due ${new Date(h.due_date).toLocaleDateString()}`}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden" style={cardShadow}>
                <div className="px-5 py-4" style={{ backgroundColor: HEAD_COLOR }}>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2"><ImageIcon size={14} className="text-[#E8C110]" /> Stock Overview</h3>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Book Cover</p>
                  <div className="w-full h-56 bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center p-4 mb-5 overflow-hidden">
                    {book.cover_image_url ? (
                      <img src={assetUrl(book.cover_image_url)} alt={`${book.title} cover`} className="h-full object-contain rounded-md" />
                    ) : (
                      <ImageIcon size={32} className="text-gray-300" />
                    )}
                  </div>

                  <div className="rounded-xl p-4 border-2" style={{ backgroundColor: "#F4F9FC", borderColor: "#E1EEF4" }}>
                    <p className="text-xs font-bold mb-0.5" style={{ color: HEAD_COLOR }}>Copy Availability</p>
                    <p className="text-xs text-gray-500 font-semibold mb-2.5">{book.available_copies} of {book.total_copies} available</p>
                    <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full bg-[#16A34A] transition-all duration-300" style={{ width: `${availPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <DeleteBookModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        book={book}
      />
    </>
  );
}

// ─── EDIT BOOK ────────────────────────────────────────────────────────────────
export function EditBook() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    if (!can("inventory", "update")) navigate("/inventory", { replace: true });
  }, [can, navigate]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [sectionSuggestions, setSectionSuggestions] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);
  const [removeCoverFlag, setRemoveCoverFlag] = useState(false);

  const [form, setForm] = useState({
    deweyCode: "",
    section: "",
    isBorrowable: true,
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    totalCopies: "1",
    publicationYear: "",
    language: "English",
    description: "",
  });

  useEffect(() => {
    fetchBook();
    api.get("/books/options/sections")
      .then((res) => { if (res.data?.success) setSectionSuggestions(res.data.data); })
      .catch((err) => console.error("Failed to load section suggestions:", err));
  }, [id]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books/${id}`);
      if (response.data?.success) {
        const b = response.data.data;
        setForm({
          deweyCode: b.dewey_code || "",
          section: b.section || "",
          isBorrowable: !!b.is_borrowable,
          title: b.title || "",
          author: b.author || "",
          isbn: b.isbn || "",
          publisher: b.publisher || "",
          totalCopies: String(b.total_copies ?? 1),
          publicationYear: b.publication_year ? String(b.publication_year) : "",
          language: b.language || "English",
          description: b.description || "",
        });
        setExistingCoverUrl(assetUrl(b.cover_image_url));
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error("Failed to load book for editing:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const toggleBorrowable = () => setForm((prev) => ({ ...prev, isBorrowable: !prev.isBorrowable }));

  const previewCategory = categoryFromDeweyCode(form.deweyCode);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Cover image must be under 5MB.");
      return;
    }
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setRemoveCoverFlag(false);
  };

  const handleRemoveCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCoverUrl(null);
    setRemoveCoverFlag(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("author", form.author.trim());
      formData.append("deweyCode", form.deweyCode.trim());
      formData.append("language", form.language);
      formData.append("section", form.section.trim());
      formData.append("isbn", form.isbn.trim());
      formData.append("publisher", form.publisher.trim());
      formData.append("description", form.description.trim());
      if (form.publicationYear) formData.append("publicationYear", form.publicationYear);
      if (form.totalCopies) formData.append("totalCopies", form.totalCopies);
      formData.append("isBorrowable", form.isBorrowable);
      if (coverFile) {
        formData.append("coverImage", coverFile);
      } else if (removeCoverFlag) {
        formData.append("removeCover", "true");
      }
      // Category is intentionally NOT sent — the backend re-derives it from
      // deweyCode whenever deweyCode is included in the update.

      await api.put(`/books/${id}`, formData);
      alert("Book updated successfully!");
      navigate(`/inventory/${id}`);
    } catch (err) {
      console.error("Failed to update book:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Failed to update book. Check your console log.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 bg-[#E9EEF4]">
        <Navbar title="Inventory" breadcrumb="Inventory › Edit Book" onBack={() => navigate("/inventory")} />
        <div className="p-10 text-center text-gray-500 font-medium">Loading book...</div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex-1 bg-[#E9EEF4]">
        <Navbar title="Inventory" breadcrumb="Inventory › Edit Book" onBack={() => navigate("/inventory")} />
        <div className="p-10 text-center text-gray-400">Book not found.</div>
      </main>
    );
  }

  const displayCover = coverPreview || existingCoverUrl;

  return (
    <main className="flex-1 bg-[#E9EEF4]">
      <Navbar title="Inventory" breadcrumb="Inventory › Book Details › Edit Book" onBack={() => navigate(`/inventory/${id}`)} />

        <div className="px-6 py-5">
          <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-300 max-w-7xl mx-auto" style={cardShadow}>

            <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: HEAD_COLOR }}>
              <h2 className="text-white font-bold text-lg flex items-center gap-2"><Edit2 size={16} className="text-[#E8C110]" /> Edit Book</h2>
              <span className="text-white/80 text-xs">{form.title} • ID: {id}</span>
            </div>

            <div className="p-6 space-y-6">

              <div className="flex gap-6 items-start">
                <div className="w-24 h-32 rounded-lg border-2 border-gray-300 bg-gray-50 shrink-0 overflow-hidden flex items-center justify-center">
                  {displayCover ? (
                    <img src={displayCover} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-800">Book Cover Image</h3>
                  <div className="flex gap-2 pt-1">
                    <label className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white hover:opacity-95 transition shadow-sm cursor-pointer" style={{ backgroundColor: HEAD_COLOR }}>
                      <Upload size={14} /> Change Cover
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
                    </label>
                    {displayCover && (
                      <button type="button" onClick={handleRemoveCover} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition shadow-sm">
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium mt-1">JPG, PNG or WEBP · Max 5MB · Recommended 300×400px</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className={labelCls}>Dewey Code *</label>
                  <input required value={form.deweyCode} onChange={updateField("deweyCode")} className={`${inputCls} font-bold`} style={{ color: HEAD_COLOR }} />
                </div>
                <div className="md:col-span-4">
                  <label className={labelCls}>Category (auto-generated)</label>
                  <input
                    value={previewCategory || "Enter a Dewey code to classify"}
                    readOnly
                    className={`${inputCls} bg-gray-50 ${previewCategory ? "text-gray-600" : "text-gray-400"} cursor-not-allowed`}
                  />
                </div>
                <div className="md:col-span-4">
                  <label className={labelCls}>Section</label>
                  <input
                    list="section-suggestions-edit"
                    value={form.section}
                    onChange={updateField("section")}
                    placeholder="e.g. K1, Fiction-A..."
                    className={inputCls}
                    maxLength={20}
                  />
                  <datalist id="section-suggestions-edit">
                    {sectionSuggestions.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 -mt-3">
                Category follows the Dewey Decimal Classification's 10 main classes and updates automatically if you change the Dewey code.
              </p>

              <div className="flex items-center gap-3">
                <label className={labelCls}>Borrowable</label>
                <div onClick={toggleBorrowable} className="w-28 h-[42px] bg-slate-100 border-2 border-gray-300 rounded-lg p-1 flex items-center cursor-pointer select-none">
                  <div className={`h-full px-3 rounded-md flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm ${
                    form.isBorrowable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 ml-auto"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${form.isBorrowable ? "bg-green-600" : "bg-red-600"}`} />
                    {form.isBorrowable ? "ON" : "OFF"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider border-b-2 border-gray-200 pb-1.5" style={{ color: HEAD_COLOR }}>Book Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Book Title *</label>
                    <input required value={form.title} onChange={updateField("title")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Author *</label>
                    <input required value={form.author} onChange={updateField("author")} className={inputCls} />
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

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider border-b-2 border-gray-200 pb-1.5" style={{ color: HEAD_COLOR }}>Stock</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Total Copies *</label>
                    <input required type="number" min="0" value={form.totalCopies} onChange={updateField("totalCopies")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Publication Year</label>
                    <input type="number" value={form.publicationYear} onChange={updateField("publicationYear")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Language *</label>
                    <select required value={form.language} onChange={updateField("language")} className={inputCls}>
                      {LANGUAGES.filter((l) => l !== "All Languages").map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={updateField("description")} rows={4} className={`${inputCls} resize-none leading-relaxed`} />
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t-2 border-gray-300 bg-gray-50/50">
              <p className="text-xs text-gray-400 font-bold">* All fields marked are required</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => navigate(`/inventory/${id}`)} className="px-5 py-2.5 border-2 border-red-200 text-red-500 font-bold rounded-lg text-xs bg-white hover:bg-red-50 transition shadow-sm">
                  Discard Changes
                </button>
                <button type="button" disabled={saving} onClick={handleSave} className="px-5 py-2.5 rounded-lg text-xs font-bold text-white hover:opacity-95 transition shadow-sm" style={{ backgroundColor: HEAD_COLOR }}>
                  {saving ? "Saving..." : "Save & Update Book"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}

export default { Inventory, AddBook, BookDetails, EditBook, DeleteBookModal, SuccessModal };