import { useState, useMemo, useRef } from "react";
import {
  Heart, BookOpen, Plus, Printer, Edit2, Trash2, User,
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Eye, Pencil, X, AlertCircle, AlertTriangle, Check, ImagePlus,
} from "lucide-react";
import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

const INITIAL_DONATIONS = [
  {
    id: "DON-2026-0303",
    donor_name: "Margaret Wilson",
    receive_by: "Sokha Chen",
    donation_date: "2026-03-03",
    status: "Acknowledged",
    books: [
      { book_title: "The Little Prince",         book_author: "Antoine de Saint-Exupéry", book_dewey_code: "843.912", book_section: "Fiction",   amount: 5,  image: null },
      { book_title: "Charlotte's Web",            book_author: "E.B. White",               book_dewey_code: "813.54",  book_section: "Children",  amount: 10, image: null },
      { book_title: "Matilda",                    book_author: "Roald Dahl",               book_dewey_code: "823.914", book_section: "Children",  amount: 10, image: null },
    ],
    history: { count: 4, totalBooks: 85 },
  },
  {
    id: "DON-2026-0301",
    donor_name: "Sarah Parker",
    receive_by: "Dara Kim",
    donation_date: "2026-03-01",
    status: "Acknowledged",
    books: [
      { book_title: "Harry Potter and the Sorcerer's Stone", book_author: "J.K. Rowling", book_dewey_code: "823.914", book_section: "Fiction", amount: 10, image: null },
    ],
    history: { count: 1, totalBooks: 10 },
  },
  {
    id: "DON-2026-0227",
    donor_name: "Community Center",
    receive_by: "Sokha Chen",
    donation_date: "2026-02-27",
    status: "Pending",
    books: [
      { book_title: "Biology Textbook Grade 10",  book_author: "Ministry of Education", book_dewey_code: "570",     book_section: "Science",    amount: 20, image: null },
      { book_title: "Mathematics Grade 9",        book_author: "Ministry of Education", book_dewey_code: "510",     book_section: "Science",    amount: 20, image: null },
      { book_title: "Khmer Literature Anthology", book_author: "Various Authors",       book_dewey_code: "895.932", book_section: "Literature", amount: 10, image: null },
    ],
    history: { count: 3, totalBooks: 120 },
  },
];

const STATUSES = ["All Status", "Acknowledged", "Pending"];

const statusStyle = {
  Acknowledged: { bg: "#E8F5E9", text: "#2E7D32" },
  Pending:      { bg: "#FFFDE7", text: "#B78103" },
};

const EMPTY_BOOK = { book_title: "", book_author: "", book_dewey_code: "", book_section: "", amount: "", image: null };

const tableGridStyle = {
  display: "grid",
  gridTemplateColumns: "130px 1fr 100px 140px 220px",
  alignItems: "center",
  gap: "1rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

const detailGridStyle = {
  display: "grid",
  gridTemplateColumns: "56px 2fr 1.5fr 100px 100px 60px",
  gap: "0.75rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

const Label = ({ children }) => (
  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
    {children}
  </label>
);

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1B4965] transition";

const sumBooks = (books) => books.reduce((s, b) => s + (Number(b.amount) || 0), 0);

const getInitials = (name) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#FEE2E2", text: "#991B1B" },
];

const getAvatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Delete Modal (matches Feedback page pattern) ──────────────────────────
function DeleteModal({ donation, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-80 text-center relative shadow-2xl">
        <button onClick={onCancel} className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Donation?</h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
          This will permanently delete the donation record from "{donation.donor_name}" ({donation.id}) and all {sumBooks(donation.books)} associated book entries.
        </p>
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 mb-5">
          <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" /> This action cannot be undone.
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition">Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// BookDialog
function BookDialog({ book, onSave, onClose }) {
  const [form, setForm] = useState(book ? { ...book } : { ...EMPTY_BOOK });
  const [error, setError] = useState(false);
  const fileInputRef = useRef(null);

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("image", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.book_title.trim() || !form.book_author.trim() || !form.amount) {
      setError(true);
      return;
    }
    onSave({ ...form, amount: parseInt(form.amount) || 1 });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: "#1B4965" }}>
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <BookOpen size={14} className="text-[#E8C110]" />
            {book ? "Edit Book" : "Add Book"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image Upload */}
          <div>
            <Label>Book Cover (optional)</Label>
            <div className="flex items-center gap-4">
              {/* Preview box — click to upload */}
              <div
                className="w-20 h-28 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 bg-gray-50 cursor-pointer hover:border-[#1B4965] transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {form.image ? (
                  <img src={form.image} alt="cover" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-300">
                    <ImagePlus size={22} />
                    <span className="text-[10px] font-semibold text-gray-400">Cover</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#1B4965] hover:text-[#1B4965] transition bg-white"
                >
                  <ImagePlus size={13} />
                  {form.image ? "Change Image" : "Upload Image"}
                </button>
                {form.image && (
                  <button
                    type="button"
                    onClick={() => update("image", null)}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition bg-white"
                  >
                    <X size={12} /> Remove
                  </button>
                )}
                <p className="text-[11px] text-gray-400 leading-snug">
                  JPG, PNG or WEBP<br />Max 5 MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Title + Author */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Book Title</Label>
              <input value={form.book_title} onChange={(e) => update("book_title", e.target.value)} placeholder="e.g., The Little Prince" className={inputCls} autoFocus />
            </div>
            <div>
              <Label>Author</Label>
              <input value={form.book_author} onChange={(e) => update("book_author", e.target.value)} placeholder="e.g., Antoine" className={inputCls} />
            </div>
          </div>

          {/* Dewey + Section + Qty */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Dewey Code</Label>
              <input value={form.book_dewey_code} onChange={(e) => update("book_dewey_code", e.target.value)} placeholder="843.912" className={inputCls} />
            </div>
            <div>
              <Label>Section</Label>
              <input value={form.book_section} onChange={(e) => update("book_section", e.target.value)} placeholder="Fiction" className={inputCls} />
            </div>
            <div>
              <Label>Quantity</Label>
              <input type="number" min="1" value={form.amount} onChange={(e) => update("amount", e.target.value)} placeholder="Qty" className={inputCls} />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <AlertCircle size={12} /> Title, author, and quantity are required.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button onClick={onClose} className="text-sm text-gray-500 px-4 py-2 hover:text-gray-700 font-semibold transition">Cancel</button>
          <button onClick={handleSave} className="flex items-center gap-1.5 text-white text-sm font-bold px-5 py-2 rounded-lg hover:opacity-90 transition shadow-sm" style={{ backgroundColor: "#1B4965" }}>
            <Check size={13} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// BooksSection
function BooksSection({ books, setBooks }) {
  const [dialog, setDialog] = useState(null);
  const totalAmount = sumBooks(books);

  const handleSaveBook = (book) => {
    if (dialog === "add") {
      setBooks((prev) => [...prev, book]);
    } else {
      setBooks((prev) => prev.map((b, i) => (i === dialog ? book : b)));
    }
    setDialog(null);
  };

  return (
    <>
      {dialog !== null && (
        <BookDialog
          book={typeof dialog === "number" ? books[dialog] : null}
          onSave={handleSaveBook}
          onClose={() => setDialog(null)}
        />
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-[#E8C110]" />
            <h3 className="text-white font-bold text-sm tracking-wide">Books Donated</h3>
            {totalAmount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-md ml-2" style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
                {totalAmount} total
              </span>
            )}
          </div>
          <button onClick={() => setDialog("add")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition border border-white/30 text-white bg-white/10">
            <Plus size={12} /> Add Book
          </button>
        </div>

        <div className="p-6">
          {books.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
              <BookOpen size={28} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400 mb-4">No books added yet. Click "Add Book" to record the first title.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {books.map((b, i) => (
                <div key={i} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50/40 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Cover thumbnail in list */}
                    <div className="w-9 h-12 rounded-md overflow-hidden shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {b.image ? (
                        <img src={b.image} alt={b.book_title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={14} className="text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{b.book_title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {b.book_author}{b.book_dewey_code ? ` · Dewey: ${b.book_dewey_code}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {b.book_section && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
                        {b.book_section}
                      </span>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: "#EEF4F8", color: "#1B4965" }}>
                      x{b.amount}
                    </span>
                    <button onClick={() => setDialog(i)} className="p-1.5 text-gray-400 hover:text-[#1B4965] transition">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setBooks((prev) => prev.filter((_, idx) => idx !== i))} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// DonationsList
function DonationsList({ data, onAdd, onView, onEdit, onDeleteClick }) {
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const liveStats = useMemo(() => {
    const totalDonations = data.length;
    const totalBooks     = data.reduce((s, d) => s + sumBooks(d.books), 0);
    const uniqueDonors   = new Set(data.map((d) => d.donor_name)).size;
    return [
      { label: "Total Donations", value: String(totalDonations), sub: "+18% this month", subColor: "#E11D48", border: "#E11D48" },
      { label: "Books Donated",   value: String(totalBooks),     sub: "+25 this week",  subColor: "#055E83", border: "#055E83" },
      { label: "Total Donors",    value: String(uniqueDonors),   sub: "+8 new donors",  subColor: "#CA8A04", border: "#E8C110" },
    ];
  }, [data]);

  const filtered = data.filter(
    (d) =>
      (search === "" || `${d.donor_name} ${d.id}`.toLowerCase().includes(search.toLowerCase())) &&
      (status === "All Status" || d.status === status)
  );

  const totalPages    = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Welcome back, Admin!" />
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {liveStats.map(({ label, value, sub, subColor, border }) => (
            <div key={label} className="bg-white rounded-xl px-5 py-4" style={{ borderTop: `3px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-2xl font-bold leading-tight" style={{ color: subColor }}>{value}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: subColor }}>{sub}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-64">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search donor or record ID..." className="text-xs outline-none w-full bg-transparent text-gray-600" />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Filter size={12} className="text-gray-400" />
            <select value={status} onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }} className="text-xs outline-none bg-transparent text-gray-600">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600">
            <ArrowUpDown size={12} className="text-gray-400" /> Sort: Date
          </div>
          <p className="ml-auto text-xs text-gray-400">Showing {filtered.length} entries</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#1B4965" }}>
            <h2 className="text-white font-bold text-sm flex items-center gap-2"><Heart size={15} /> Donation Catalog</h2>
            <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition" style={{ backgroundColor: "#E8C110", color: "#1B4965" }}>
              <Plus size={13} /> Add Donation
            </button>
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <div style={{ minWidth: "900px" }}>
              <div style={{ ...tableGridStyle, paddingTop: "0.75rem", paddingBottom: "0.75rem" }} className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold uppercase tracking-wider">
                <span style={{ color: "#055E83" }}>Donation ID</span>
                <span style={{ color: "#055E83" }}>Donor</span>
                <span style={{ color: "#055E83" }}>Books</span>
                <span style={{ color: "#055E83", textAlign: "center" }}>Status</span>
                <span style={{ color: "#055E83", textAlign: "center" }}>Actions</span>
              </div>

              {paginatedData.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">No donation records match your filter criteria.</div>
              ) : (
                paginatedData.map((d) => {
                  const avatarColor = getAvatarColor(d.donor_name);
                  return (
                    <div key={d.id} style={{ ...tableGridStyle, paddingTop: "0.875rem", paddingBottom: "0.875rem" }} className="border-b border-gray-100 hover:bg-slate-50/60 transition">
                      <span className="text-[11px] font-bold tracking-wide" style={{ color: "#055E83" }}>{d.id}</span>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>
                          {getInitials(d.donor_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{d.donor_name}</p>
                          <p className="text-[11px] text-gray-400">Donated {d.donation_date}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{sumBooks(d.books)} books</span>
                      <div style={{ textAlign: "center" }}>
                        <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ backgroundColor: statusStyle[d.status]?.bg, color: statusStyle[d.status]?.text, minWidth: "100px" }}>
                          {d.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => onView(d)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-[#1B4965] text-white hover:opacity-85 transition"><Eye size={12} /> View</button>
                        <button onClick={() => onEdit(d)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-[#E8C110] text-[#1B4965] hover:opacity-85 transition"><Pencil size={12} /> Edit</button>
                        <button onClick={() => onDeleteClick(d)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition"><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 pt-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"><ChevronLeft size={14} /></button>
            <span className="text-xs text-gray-500 font-medium px-2">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// AddDonation
function AddDonation({ onCancel, onSave }) {
  const [donor, setDonor] = useState({ donor_name: "", receive_by: "", donation_date: new Date().toISOString().split("T")[0] });
  const [books, setBooks]           = useState([]);
  const [donorError, setDonorError] = useState(false);

  const handleSave = () => {
    if (!donor.donor_name.trim()) { setDonorError(true); return; }
    const nextId = `DON-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    onSave({ id: nextId, ...donor, status: "Pending", books, history: { count: 1, totalBooks: sumBooks(books) } });
  };

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Donations > Add New" onBack={onCancel} />
      <div className="px-14 py-10 max-w-5xl mx-auto space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-[#1B4965]">Add New Donation</h2>
          <p className="text-sm text-gray-400">Record a structural catalog payload from library sponsors.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#1B4965" }}>
            <User size={15} className="text-[#E8C110]" />
            <h3 className="text-white font-bold text-sm">Donor Metadata</h3>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            <div>
              <Label>Donor Name</Label>
              <input value={donor.donor_name} onChange={(e) => { setDonor({ ...donor, donor_name: e.target.value }); setDonorError(false); }} className={inputCls} placeholder="Individual or Institution" />
              {donorError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} /> Donor name is required.</p>}
            </div>
            <div>
              <Label>Received By</Label>
              <input value={donor.receive_by} onChange={(e) => setDonor({ ...donor, receive_by: e.target.value })} className={inputCls} placeholder="Staff Name" />
            </div>
            <div>
              <Label>Donation Date</Label>
              <input type="date" value={donor.donation_date} onChange={(e) => setDonor({ ...donor, donation_date: e.target.value })} className={inputCls} />
            </div>
          </div>
        </div>
        <BooksSection books={books} setBooks={setBooks} />
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button onClick={onCancel} className="text-sm text-gray-500 font-semibold px-4 py-2 hover:text-gray-700 transition">Cancel</button>
          <button onClick={handleSave} className="bg-[#1B4965] text-white text-sm font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 transition">
            <Check size={14} /> Save Record
          </button>
        </div>
      </div>
    </div>
  );
}

// DonorDetail
function DonorDetail({ donation, onEdit, onDeleteClick, onBackToList }) {
  if (!donation) return null;

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Donations > Detail" onBack={onBackToList} />
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1.5 rounded-md" style={{ backgroundColor: statusStyle[donation.status]?.bg, color: statusStyle[donation.status]?.text }}>{donation.status}</span>
            <span className="text-xs font-bold" style={{ color: "#055E83" }}>#{donation.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              <Printer size={13} /> Receipt
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <button onClick={onEdit} className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition" style={{ backgroundColor: "#1B4965", color: "#fff" }}>
              <Edit2 size={13} /> Edit
            </button>
            <button onClick={() => onDeleteClick(donation)} className="text-xs font-semibold text-red-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-6 py-4 bg-[#1B4965] text-white">
                <User size={14} className="text-[#E8C110]" />
                <h3 className="font-bold text-sm">Donor Information</h3>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4">
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donor</p><p className="text-sm font-bold text-gray-800 mt-1">{donation.donor_name}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Receiver Staff</p><p className="text-sm font-bold text-gray-700 mt-1">{donation.receive_by || "—"}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p><p className="text-sm font-bold text-gray-700 mt-1">{donation.donation_date}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div style={{ ...detailGridStyle, paddingTop: "0.625rem", paddingBottom: "0.625rem" }} className="bg-gray-50 border-b text-xs font-bold uppercase">
                <span style={{ color: "#055E83" }}>Cover</span>
                <span style={{ color: "#055E83" }}>Title</span>
                <span style={{ color: "#055E83" }}>Author</span>
                <span style={{ color: "#055E83" }}>Dewey</span>
                <span style={{ color: "#055E83" }}>Section</span>
                <span style={{ color: "#055E83", textAlign: "center" }}>Qty</span>
              </div>
              {donation.books.map((book, i) => (
                <div key={i} style={{ ...detailGridStyle, paddingTop: "0.75rem", paddingBottom: "0.75rem", alignItems: "center" }} className="text-sm text-gray-800 hover:bg-gray-50/40 transition">
                  <div className="w-9 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                    {book.image ? (
                      <img src={book.image} alt={book.book_title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen size={13} className="text-gray-300" />
                    )}
                  </div>
                  <p className="font-semibold truncate">{book.book_title}</p>
                  <p className="text-xs text-gray-500 truncate">{book.book_author}</p>
                  <p className="text-xs font-mono">{book.book_dewey_code || "—"}</p>
                  <div>{book.book_section ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">{book.book_section}</span> : "—"}</div>
                  <p className="font-bold text-center text-[#1B4965]">{book.amount}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5 text-white h-fit shadow-md" style={{ backgroundColor: "#1B4965" }}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Donor Profile</p>
            <p className="text-2xl font-bold mt-2">{donation.history?.count || 1}</p>
            <p className="text-xs text-white/60 mb-4">Total Donations Instance</p>
            <p className="text-2xl font-bold" style={{ color: "#E8C110" }}>{donation.history?.totalBooks ?? sumBooks(donation.books)}</p>
            <p className="text-xs text-white/60">Lifetime Books Donated</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// EditDonation
function EditDonation({ donation, onCancel, onUpdate }) {
  const [donor, setDonor] = useState({ donor_name: donation.donor_name, receive_by: donation.receive_by, donation_date: donation.donation_date });
  const [books, setBooks] = useState(donation.books.map((b) => ({ ...b })));

  const handleUpdate = () => {
    onUpdate({ ...donation, ...donor, books, history: { ...donation.history, totalBooks: sumBooks(books) } });
  };

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Donations > Edit" onBack={onCancel} />
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border shadow-sm">
          <span className="text-xs font-bold" style={{ color: "#055E83" }}>Modifying Entry: #{donation.id}</span>
          <div className="flex gap-2">
            <button onClick={onCancel} className="text-xs font-bold text-gray-500 px-3 hover:text-gray-700 transition">Cancel</button>
            <button onClick={handleUpdate} className="bg-[#1B4965] text-white text-xs font-bold px-5 py-2 rounded-lg hover:opacity-90 transition shadow-sm">Update Donation</button>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6 grid grid-cols-3 gap-4 shadow-sm">
          <div><Label>Donor Name</Label><input value={donor.donor_name} onChange={(e) => setDonor({ ...donor, donor_name: e.target.value })} className={inputCls} /></div>
          <div><Label>Received By</Label><input value={donor.receive_by} onChange={(e) => setDonor({ ...donor, receive_by: e.target.value })} className={inputCls} /></div>
          <div><Label>Donation Date</Label><input type="date" value={donor.donation_date} onChange={(e) => setDonor({ ...donor, donation_date: e.target.value })} className={inputCls} /></div>
        </div>
        <BooksSection books={books} setBooks={setBooks} />
      </div>
    </div>
  );
}

// Root Router
export default function Donations() {
  const [page, setPage]                         = useState("list");
  const [donationsList, setDonationsList]       = useState(INITIAL_DONATIONS);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [deleteTarget, setDeleteTarget]         = useState(null);

  const handleView = (d) => { setSelectedDonation(d); setPage("detail"); };
  const handleEdit = (d) => { setSelectedDonation(d); setPage("edit"); };
  const handleDeleteClick = (d) => { setDeleteTarget(d); };

  const handleDeleteConfirm = () => {
    setDonationsList((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    if (page === "detail" && selectedDonation?.id === deleteTarget.id) {
      setSelectedDonation(null);
      setPage("list");
    }
    setDeleteTarget(null);
  };

  const renderPage = () => {
    switch (page) {
      case "add":
        return <AddDonation onCancel={() => setPage("list")} onSave={(newRecord) => { setDonationsList((prev) => [newRecord, ...prev]); setPage("list"); }} />;
      case "detail":
        return <DonorDetail donation={selectedDonation} onEdit={() => setPage("edit")} onDeleteClick={handleDeleteClick} onBackToList={() => setPage("list")} />;
      case "edit":
        return <EditDonation donation={selectedDonation} onCancel={() => setPage("detail")} onUpdate={(updatedRecord) => { setDonationsList((prev) => prev.map((d) => d.id === updatedRecord.id ? updatedRecord : d)); setSelectedDonation(updatedRecord); setPage("detail"); }} />;
      default:
        return <DonationsList data={donationsList} onAdd={() => setPage("add")} onView={handleView} onEdit={handleEdit} onDeleteClick={handleDeleteClick} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {renderPage()}
      </main>
      {deleteTarget && (
        <DeleteModal
          donation={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}