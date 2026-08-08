import { useState, useMemo, useEffect } from "react";
import {
  Heart, BookOpen, Plus, Printer, Edit2, Trash2, User,
  Search, Filter, ChevronLeft, ChevronRight,
  Eye, Pencil, X, AlertCircle, AlertTriangle, Check, DollarSign,
  FileClock, Play, Library,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

const cardShadow = { boxShadow: "0 2px 12px rgba(0,0,0,0.12)" };

const tableGridStyle = {
  display: "grid",
  gridTemplateColumns: "110px 1.4fr 1.4fr 100px 220px",
  alignItems: "center",
  gap: "1rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

const LANGUAGES = ["Khmer", "English", "French"];

const Label = ({ children }) => (
  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
    {children}
  </label>
);

const inputCls = "w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#055E83] transition";
const readOnlyCls = "w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed";

const EMPTY_ITEM = { title: "", author: "", deweyCode: "", section: "", quantity: "1" };

const getInitials = (name) => (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#FEE2E2", text: "#991B1B" },
];
const getAvatarColor = (name) => AVATAR_COLORS[(name || "?").charCodeAt(0) % AVATAR_COLORS.length];

// Mirrors booksController.js exactly. Real category assignment happens
// server-side when "Save & Add to Inventory" is used — this is a preview.
const DDC_CATEGORIES = [
  "Computer Science, Information & General Works",
  "Philosophy & Psychology",
  "Religion",
  "Social Sciences",
  "Language",
  "Science",
  "Technology",
  "Arts & Recreation",
  "Literature",
  "History & Geography",
];
function categoryFromDeweyCode(rawCode) {
  if (!rawCode) return "";
  const match = String(rawCode).trim().match(/^(\d{1,3})/);
  if (!match) return "";
  const wholePart = match[1].padEnd(3, "0").slice(0, 3);
  const mainClass = Math.floor(Number(wholePart) / 100);
  return DDC_CATEGORIES[mainClass] || "";
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}
function formatMoney(amount) {
  if (amount === null || amount === undefined) return null;
  const n = Number(amount);
  return isNaN(n) ? null : n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

// ─── Local-only drafts ─────────────────────────────────────────────────────
// Never touches the backend — a donation only becomes real once submitted.
const DRAFTS_KEY = "sr_bannalay_donation_drafts";
function loadDrafts() {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function persistDrafts(drafts) {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.error("Failed to save draft locally:", err);
  }
}

function mapDonation(d) {
  return {
    id: d.donation_id,
    displayId: `DON-${d.donation_id}`,
    donorName: d.donor_name,
    receivedByName: d.users ? `${d.users.first_name} ${d.users.last_name}` : "—",
    date: d.donation_date,
    amount: d.amount,
    items: (d.items || []).map((it) => ({   // was: d.books
      id: it.item_id,
      title: it.title,
      author: it.author,
      deweyCode: it.dewey_code,
      section: it.section,
    })),
  };
}

// ─── Delete Modal ──────────────────────────────────────────────────────────
function DeleteModal({ donation, onCancel, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-80 text-center relative shadow-2xl">
        <button onClick={onCancel} className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Donation Record?</h3>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
          This will permanently delete the record from "{donation.donorName}" ({donation.displayId}) and its {donation.items.length} donated book{donation.items.length === 1 ? "" : "s"}.
        </p>
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 mb-5">
          <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" /> This action cannot be undone. Books already filed into inventory from this donation are not affected.
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-60">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-60">
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Discard Draft Modal ────────────────────────────────────────────────────
function DiscardDraftModal({ draft, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-80 text-center relative shadow-2xl">
        <button onClick={onCancel} className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <FileClock size={24} className="text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Discard This Draft?</h3>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          The draft for "{draft.donor_name}" will be removed from this device. It was never saved to the library database, so this can't be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition">Discard</button>
        </div>
      </div>
    </div>
  );
}

// ─── ItemDialog (add/edit a single donated book) ────────────────────────────
function ItemDialog({ item, onSave, onClose }) {
  const [form, setForm] = useState(item ? { ...item } : { ...EMPTY_ITEM });
  const [error, setError] = useState("");

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const previewCategory = categoryFromDeweyCode(form.deweyCode);

  const handleSave = () => {
    if (!form.title.trim() || !form.author.trim()) {
      setError("Title and author are required.");
      return;
    }
    if (!form.deweyCode.trim()) {
      setError("A Dewey code is required.");
      return;
    }
    onSave({ ...form, quantity: Math.max(1, parseInt(form.quantity) || 1) });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: "#055E83" }}>
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <BookOpen size={14} className="text-[#E8C110]" />
            {item ? "Edit Book" : "Add Book"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Book Title</Label>
              <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g., The Little Prince" className={inputCls} autoFocus />
            </div>
            <div>
              <Label>Author</Label>
              <input value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="e.g., Antoine" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Dewey Code</Label>
              <input value={form.deweyCode} onChange={(e) => update("deweyCode", e.target.value)} placeholder="843.912" className={inputCls} />
            </div>
            <div>
              <Label>Section</Label>
              <input value={form.section} onChange={(e) => update("section", e.target.value)} placeholder="Fiction" maxLength={20} className={inputCls} />
            </div>
            <div>
              <Label>Quantity</Label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} placeholder="Qty" className={inputCls} />
            </div>
          </div>

          <div>
            <Label>Category (auto-generated preview)</Label>
            <input
              value={previewCategory || "Enter a Dewey code to classify"}
              readOnly
              className={`${readOnlyCls} ${previewCategory ? "text-gray-600" : ""}`}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Only applied for real if this donation is added to inventory.
            </p>
          </div>
          <p className="text-[11px] text-gray-400">
            Quantity only affects how many copies are created if this book is filed into inventory — the donation record itself always keeps one entry per title.
          </p>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-300">
          <button onClick={onClose} className="text-sm text-gray-500 px-4 py-2 hover:text-gray-700 font-semibold transition">Cancel</button>
          <button onClick={handleSave} className="flex items-center gap-1.5 text-white text-sm font-bold px-5 py-2 rounded-lg hover:opacity-90 transition" style={{ backgroundColor: "#055E83" }}>
            <Check size={13} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ItemsSection (local list, used before the donation exists yet) ────────
function ItemsSection({ items, setItems }) {
  const [dialog, setDialog] = useState(null);

  const handleSaveItem = (item) => {
    if (dialog === "add") {
      setItems((prev) => [...prev, item]);
    } else {
      setItems((prev) => prev.map((it, i) => (i === dialog ? item : it)));
    }
    setDialog(null);
  };

  return (
    <>
      {dialog !== null && (
        <ItemDialog
          item={typeof dialog === "number" ? items[dialog] : null}
          onSave={handleSaveItem}
          onClose={() => setDialog(null)}
        />
      )}
      <div className="bg-white rounded-xl border border-gray-300 overflow-hidden" style={cardShadow}>
        <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#055E83" }}>
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-[#E8C110]" />
            <h3 className="text-white font-bold text-sm tracking-wide">Books Donated (optional)</h3>
            {items.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-md ml-2" style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
                {items.length} title{items.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <button onClick={() => setDialog("add")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition border border-white/30 text-white bg-white/10">
            <Plus size={12} /> Add Book
          </button>
        </div>

        <div className="p-6">
          {items.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
              <BookOpen size={28} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400 mb-1">No books added yet.</p>
              <p className="text-xs text-gray-400">A donation doesn't need books — leave this empty for a cash-only gift.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((it, i) => {
                const category = categoryFromDeweyCode(it.deweyCode);
                return (
                  <div key={i} className="flex items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/40 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-12 rounded-md shrink-0 bg-gray-100 border border-gray-300 flex items-center justify-center">
                        <BookOpen size={14} className="text-gray-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{it.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {it.author}{it.deweyCode ? ` · Dewey: ${it.deweyCode}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {category && (
                        <span className="hidden md:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: "#F3E8FF", color: "#7C3AED" }}>
                          {category}
                        </span>
                      )}
                      {it.section && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
                          {it.section}
                        </span>
                      )}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: "#EEF4F8", color: "#055E83" }}>
                        x{it.quantity}
                      </span>
                      <button onClick={() => setDialog(i)} className="p-1.5 text-gray-400 hover:text-[#055E83] transition">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── DonationsList ────────────────────────────────────────────────────────
function DonationsList({ data, loading, drafts, onAdd, onView, onEdit, onDeleteClick, onResumeDraft, onDiscardDraft }) {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState("All Records");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const liveStats = useMemo(() => {
    const totalDonations = data.length;
    const bookDonations = data.filter((d) => d.items.length > 0).length;
    const uniqueDonors = new Set(data.map((d) => d.donorName)).size;
    return [
      { label: "Total Records", value: String(totalDonations), sub: `${data.length - bookDonations} cash-only`, border: "#E11D48" },
      { label: "Donations With Books", value: String(bookDonations), sub: "one or more titles", border: "#055E83" },
      { label: "Total Donors", value: String(uniqueDonors), sub: "unique names on record", border: "#E8C110" },
    ];
  }, [data]);

  const filtered = data.filter((d) => {
    const titles = d.items.map((it) => it.title).join(" ");
    const matchesSearch = search === "" || `${d.donorName} ${d.displayId} ${titles}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = bookFilter === "All Records" || (bookFilter === "Books Only" ? d.items.length > 0 : d.items.length === 0);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Welcome back, Admin!" />
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {liveStats.map(({ label, value, sub, border }) => (
            <div key={label} className="bg-white rounded-xl px-5 py-4" style={{ borderTop: `3px solid ${border}`, ...cardShadow }}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-2xl font-bold leading-tight text-gray-800">{value}</p>
              <p className="text-xs mt-1 font-medium text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        {drafts.length > 0 && (
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-200">
              <FileClock size={15} className="text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">Saved Drafts ({drafts.length})</h3>
              <span className="text-[11px] text-amber-600 font-medium ml-1">— on this device only, not yet saved</span>
            </div>
            <div className="divide-y divide-amber-200">
              {drafts.map((d) => (
                <div key={d.draftId} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{d.donor_name || "Unnamed donor"}</p>
                    <p className="text-xs text-amber-700">
                      {d.items?.length || 0} book{d.items?.length === 1 ? "" : "s"} · saved {formatDate(d.savedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => onResumeDraft(d)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition">
                      <Play size={12} /> Resume
                    </button>
                    <button onClick={() => onDiscardDraft(d)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold text-amber-700 hover:bg-amber-100 transition">
                      <Trash2 size={12} /> Discard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 w-64">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search donor, book, or record ID..." className="text-xs outline-none w-full bg-transparent text-gray-600" />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <Filter size={12} className="text-gray-400" />
            <select value={bookFilter} onChange={(e) => { setBookFilter(e.target.value); setCurrentPage(1); }} className="text-xs outline-none bg-transparent text-gray-600">
              {["All Records", "Books Only", "Cash Only"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <p className="ml-auto text-xs text-gray-400">Showing {filtered.length} entries</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-300" style={{ ...cardShadow, overflow: "hidden" }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#055E83" }}>
            <h2 className="text-white font-bold text-sm flex items-center gap-2"><Heart size={15} /> Donation Records</h2>
            {can("donations", "create") && (
              <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition" style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
                <Plus size={13} /> Add Donation
              </button>
            )}
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <div style={{ minWidth: "900px" }}>
              <div style={{ ...tableGridStyle, paddingTop: "0.75rem", paddingBottom: "0.75rem" }} className="border-b border-gray-300 bg-gray-50/70 text-xs font-bold uppercase tracking-wider">
                <span style={{ color: "#055E83" }}>Record ID</span>
                <span style={{ color: "#055E83" }}>Donor</span>
                <span style={{ color: "#055E83" }}>Books</span>
                <span style={{ color: "#055E83", textAlign: "center" }}>Date</span>
                <span style={{ color: "#055E83", textAlign: "center" }}>Actions</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading donation records...</div>
              ) : paginatedData.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">No donation records match your filter criteria.</div>
              ) : (
                paginatedData.map((d) => {
                  const avatarColor = getAvatarColor(d.donorName);
                  const money = formatMoney(d.amount);
                  return (
                    <div key={d.id} style={{ ...tableGridStyle, paddingTop: "0.875rem", paddingBottom: "0.875rem" }} className="border-b border-gray-200 hover:bg-slate-50/60 transition">
                      <span className="text-[11px] font-bold tracking-wide" style={{ color: "#055E83" }}>{d.displayId}</span>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}>
                          {getInitials(d.donorName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{d.donorName}</p>
                          <p className="text-[11px] text-gray-400">Received by {d.receivedByName}</p>
                        </div>
                      </div>
                      <div className="min-w-0">
                        {d.items.length > 0 ? (
                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {d.items[0].title}{d.items.length > 1 ? ` +${d.items.length - 1} more` : ""}
                          </p>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                            <DollarSign size={11} /> {money || "Cash donation"}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 text-center">{formatDate(d.date)}</span>
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => onView(d)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-[#055E83] text-white hover:opacity-85 transition"><Eye size={12} /> View</button>
                        {can("donations", "update") && (
                          <button onClick={() => onEdit(d)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-[#E8C110] text-[#055E83] hover:opacity-85 transition"><Pencil size={12} /> Edit</button>
                        )}
                        {can("donations", "delete") && (
                          <button onClick={() => onDeleteClick(d)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition"><Trash2 size={12} /></button>
                        )}
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

// ─── AddDonation ─────────────────────────────────────────────────────────
function AddDonation({ initialDraft, onCancel, onSave, onSavedDraft }) {
  const currentUser = getCurrentUser();
  const [donor, setDonor] = useState({
    donor_name: initialDraft?.donor_name || "",
    amount: initialDraft?.amount || "",
    donation_date: initialDraft?.donation_date || new Date().toISOString().split("T")[0],
  });
  const [items, setItems] = useState(initialDraft?.items || []);
  const [language, setLanguage] = useState("English");
  const [currentDraftId, setCurrentDraftId] = useState(initialDraft?.draftId || null);
  const [donorError, setDonorError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveDraft = () => {
    if (!donor.donor_name.trim()) { setDonorError("Donor name is required, even for a draft."); return; }
    setDonorError("");
    const id = currentDraftId || `draft-${Date.now()}`;
    const entry = {
      draftId: id,
      donor_name: donor.donor_name.trim(),
      amount: donor.amount,
      donation_date: donor.donation_date,
      items,
      savedAt: new Date().toISOString(),
    };
    const next = [entry, ...loadDrafts().filter((d) => d.draftId !== id)];
    persistDrafts(next);
    setCurrentDraftId(id);
    onSavedDraft();
  };

  const submitDonation = async (fileToInventory) => {
    if (!donor.donor_name.trim()) { setDonorError("Donor name is required."); return; }
    setDonorError("");
    try {
      setSaving(true);
      const payload = {
        donorName: donor.donor_name.trim(),
        donationDate: donor.donation_date,
        ...(donor.amount ? { amount: Number(donor.amount) } : {}),
        items: items.map((it) => ({
          title: it.title,
          author: it.author,
          deweyCode: it.deweyCode,
          section: it.section || undefined,
          quantity: it.quantity,
        })),
        fileToInventory,
        ...(fileToInventory ? { language } : {}),
      };

      await api.post("/donations", payload);

      if (currentDraftId) {
        persistDrafts(loadDrafts().filter((d) => d.draftId !== currentDraftId));
      }

      onSave();
    } catch (err) {
      console.error("Failed to save donation:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setDonorError(backendMessage || "Failed to save the donation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Donations > Add New" onBack={onCancel} />
      <div className="px-14 py-10 max-w-5xl mx-auto space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-[#055E83]">{initialDraft ? "Resume Draft" : "Add New Donation"}</h2>
          <p className="text-sm text-gray-400">Record a gift from a library sponsor or donor.</p>
        </div>

        {donorError && (
          <div className="flex items-start gap-2.5 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{donorError}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden" style={cardShadow}>
          <div className="flex items-center gap-2 px-6 py-4" style={{ backgroundColor: "#055E83" }}>
            <User size={15} className="text-[#E8C110]" />
            <h3 className="text-white font-bold text-sm">Donor Information</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div>
              <Label>Donor Name</Label>
              <input value={donor.donor_name} onChange={(e) => { setDonor({ ...donor, donor_name: e.target.value }); setDonorError(""); }} className={inputCls} placeholder="Individual or Institution" />
            </div>
            <div>
              <Label>Donation Date</Label>
              <input type="date" value={donor.donation_date} onChange={(e) => setDonor({ ...donor, donation_date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <Label>Monetary Amount (optional)</Label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" min="0" step="0.01" value={donor.amount} onChange={(e) => setDonor({ ...donor, amount: e.target.value })} className={`${inputCls} pl-8`} placeholder="0.00" />
              </div>
            </div>
            <div>
              <Label>Received By</Label>
              <input value={currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "—"} readOnly className={readOnlyCls} />
            </div>
          </div>
        </div>

        <ItemsSection items={items} setItems={setItems} />

        {items.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-300 p-6" style={cardShadow}>
            <Label>Language (used only if adding these books to inventory)</Label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Applies to every book in this donation. If titles are in different languages, add them to inventory separately, or fix the language afterward in Inventory.
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-end items-center gap-3 pt-4">
          <button onClick={onCancel} disabled={saving} className="text-sm text-gray-500 font-semibold px-4 py-2 hover:text-gray-700 transition disabled:opacity-60">Cancel</button>
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition disabled:opacity-60"
          >
            <FileClock size={14} /> Save as Draft
          </button>
          <button
            onClick={() => submitDonation(false)}
            disabled={saving}
            className="text-sm font-bold px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Donation Record"}
          </button>
          {items.length > 0 && (
            <button
              onClick={() => submitDonation(true)}
              disabled={saving}
              className="bg-[#055E83] text-white text-sm font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition disabled:opacity-60"
              style={cardShadow}
            >
              <Library size={14} /> {saving ? "Saving..." : "Save & Add to Inventory"}
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-400 text-right">
          "Save Donation Record" only records what was donated. "Save & Add to Inventory" also creates real catalog entries for each book. "Save as Draft" stays on this device only.
        </p>
      </div>
    </div>
  );
}

// ─── DonorDetail ─────────────────────────────────────────────────────────
function DonorDetail({ donation, onEdit, onDeleteClick, onBackToList }) {
  const { can } = useAuth();
  const [history, setHistory] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/donations?search=${encodeURIComponent(donation.donorName)}&limit=500`);
        if (cancelled || !response.data?.success) return;
        const rows = response.data.data.filter((r) => r.donor_name === donation.donorName);
setHistory({
  totalRecords: rows.length,
  totalBooks: rows.reduce((s, r) => s + (r.items?.length || 0), 0),  // was: r.books?.length
});
      } catch (err) {
        console.error("Failed to load donor history:", err);
      }
    };
    fetchHistory();
    return () => { cancelled = true; };
  }, [donation.donorName]);

  const money = formatMoney(donation.amount);

  return (
    <div>
      <Navbar title="Donations" breadcrumb="Donations > Detail" onBack={onBackToList} />
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-gray-300" style={cardShadow}>
          <span className="text-xs font-bold" style={{ color: "#055E83" }}>#{donation.displayId}</span>
          <div className="flex items-center gap-2">
            <button className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              <Printer size={13} /> Receipt
            </button>
            <div className="w-px h-4 bg-gray-300" />
            {can("donations", "update") && (
              <button onClick={onEdit} className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition" style={{ backgroundColor: "#055E83", color: "#fff" }}>
                <Edit2 size={13} /> Edit
              </button>
            )}
            {can("donations", "delete") && (
              <button onClick={() => onDeleteClick(donation)} className="text-xs font-semibold text-red-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-300 overflow-hidden" style={cardShadow}>
              <div className="flex items-center gap-2 px-6 py-4 bg-[#055E83] text-white">
                <User size={14} className="text-[#E8C110]" />
                <h3 className="font-bold text-sm">Donor Information</h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Donor</p><p className="text-sm font-bold text-gray-800 mt-1">{donation.donorName}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Received By</p><p className="text-sm font-bold text-gray-700 mt-1">{donation.receivedByName}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p><p className="text-sm font-bold text-gray-700 mt-1">{formatDate(donation.date)}</p></div>
                {money && (
                  <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monetary Amount</p><p className="text-sm font-bold text-green-700 mt-1">{money}</p></div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-300 overflow-hidden" style={cardShadow}>
              <div className="flex items-center gap-2 px-6 py-4 bg-[#055E83] text-white">
                <BookOpen size={14} className="text-[#E8C110]" />
                <h3 className="font-bold text-sm">Books Donated ({donation.items.length})</h3>
              </div>
              <div className="p-6">
                {donation.items.length === 0 ? (
                  <p className="text-sm text-gray-400">This was a cash-only donation with no books attached.</p>
                ) : (
                  <div className="space-y-3">
                    {donation.items.map((it) => {
                      const category = categoryFromDeweyCode(it.deweyCode);
                      return (
                        <div key={it.id} className="border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-3">
                          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</p><p className="text-sm font-bold text-gray-800 mt-1">{it.title}</p></div>
                          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Author</p><p className="text-sm font-bold text-gray-800 mt-1">{it.author}</p></div>
                          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dewey Code</p><p className="text-sm font-mono font-bold text-gray-800 mt-1">{it.deweyCode}</p></div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Section</p>
                            {it.section ? (
                              <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">{it.section}</span>
                            ) : (
                              <p className="text-sm text-gray-400 mt-1">—</p>
                            )}
                          </div>
                          {category && (
                            <div className="col-span-2">
                              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: "#F3E8FF", color: "#7C3AED" }}>{category}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 text-white h-fit" style={{ backgroundColor: "#055E83", ...cardShadow }}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Donor Profile</p>
            {history ? (
              <>
                <p className="text-2xl font-bold mt-2">{history.totalRecords}</p>
                <p className="text-xs text-white/60 mb-4">Total Donation Records</p>
                <p className="text-2xl font-bold" style={{ color: "#E8C110" }}>{history.totalBooks}</p>
                <p className="text-xs text-white/60">Lifetime Books Donated</p>
              </>
            ) : (
              <p className="text-sm text-white/60 mt-3">Loading donor history...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EditDonation ────────────────────────────────────────────────────────
function EditDonation({ donation, onCancel, onUpdate }) {
  const { can } = useAuth();
  const [form, setForm] = useState({
    donor_name: donation.donorName,
    amount: donation.amount != null ? String(donation.amount) : "",
  });
  const [items, setItems] = useState(donation.items);
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

const refreshItems = async () => {
  const response = await api.get(`/donations/${donation.id}`);
  if (response.data?.success) {
    setItems(response.data.data.items.map((it) => ({   // was: .books
      id: it.item_id, title: it.title, author: it.author, deweyCode: it.dewey_code, section: it.section,
    })));
  }
};

  const handleAddItem = async (item) => {
    try {
      await api.post(`/donations/${donation.id}/items`, {
        title: item.title, author: item.author, deweyCode: item.deweyCode, section: item.section || undefined,
      });
      await refreshItems();
    } catch (err) {
      console.error("Failed to add book:", err);
      alert("Failed to add the book. Please try again.");
    } finally {
      setDialog(null);
    }
  };

  const handleEditItem = async (item) => {
    try {
      await api.put(`/donations/items/${item.id}`, {
        title: item.title, author: item.author, deweyCode: item.deweyCode, section: item.section || null,
      });
      await refreshItems();
    } catch (err) {
      console.error("Failed to update book:", err);
      alert("Failed to update the book. Please try again.");
    } finally {
      setDialog(null);
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      await api.delete(`/donations/items/${item.id}`);
      await refreshItems();
    } catch (err) {
      console.error("Failed to remove book:", err);
      alert("Failed to remove the book. Please try again.");
    }
  };

  const handleUpdate = async () => {
    if (!form.donor_name.trim()) { setError("Donor name is required."); return; }
    setError("");
    try {
      setSaving(true);
      await api.put(`/donations/${donation.id}`, {
        donorName: form.donor_name.trim(),
        amount: form.amount ? Number(form.amount) : null,
      });
      onUpdate();
    } catch (err) {
      console.error("Failed to update donation:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setError(backendMessage || "Failed to update the donation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {dialog !== null && (
        <ItemDialog
          item={dialog === "add" ? null : dialog}
          onSave={(item) => (dialog === "add" ? handleAddItem(item) : handleEditItem({ ...item, id: dialog.id }))}
          onClose={() => setDialog(null)}
        />
      )}
      <Navbar title="Donations" breadcrumb="Donations > Edit" onBack={onCancel} />
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-gray-300" style={cardShadow}>
          <span className="text-xs font-bold" style={{ color: "#055E83" }}>Modifying Record: {donation.displayId}</span>
          <div className="flex gap-2">
            <button onClick={onCancel} disabled={saving} className="text-xs font-bold text-gray-500 px-3 hover:text-gray-700 transition disabled:opacity-60">Cancel</button>
            <button onClick={handleUpdate} disabled={saving} className="bg-[#055E83] text-white text-xs font-bold px-5 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-60">
              {saving ? "Saving..." : "Update Donation"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden" style={cardShadow}>
          <div className="flex items-center gap-2 px-6 py-4 bg-[#055E83] text-white">
            <User size={14} className="text-[#E8C110]" />
            <h3 className="font-bold text-sm">Donor Information</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div>
              <Label>Donor Name</Label>
              <input value={form.donor_name} onChange={(e) => set("donor_name", e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label>Monetary Amount (optional)</Label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} className={`${inputCls} pl-8`} placeholder="0.00" />
              </div>
            </div>
            <div>
              <Label>Received By</Label>
              <input value={donation.receivedByName} readOnly className={readOnlyCls} />
            </div>
            <div>
              <Label>Date</Label>
              <input value={formatDate(donation.date)} readOnly className={readOnlyCls} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-300 overflow-hidden" style={cardShadow}>
          <div className="flex items-center justify-between px-6 py-4 bg-[#055E83] text-white">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-[#E8C110]" />
              <h3 className="font-bold text-sm">Books Donated ({items.length})</h3>
            </div>
            {can("donations", "update") && (
              <button onClick={() => setDialog("add")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition border border-white/30 text-white bg-white/10">
                <Plus size={12} /> Add Book
              </button>
            )}
          </div>
          <div className="p-6">
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No books recorded for this donation.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/40 hover:bg-slate-50 transition">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{it.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{it.author} · Dewey: {it.deweyCode}{it.section ? ` · ${it.section}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {can("donations", "update") && (
                        <button onClick={() => setDialog(it)} className="p-1.5 text-gray-400 hover:text-[#055E83] transition">
                          <Pencil size={13} />
                        </button>
                      )}
                      {can("donations", "delete") && (
                        <button onClick={() => handleRemoveItem(it)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-3">Book changes here save immediately, separately from donor info above.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root Router ─────────────────────────────────────────────────────────
export default function Donations() {
  const [page, setPage] = useState("list");
  const [donationsList, setDonationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [resumeDraft, setResumeDraft] = useState(null);
  const [discardTarget, setDiscardTarget] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    if (page === "list") setDrafts(loadDrafts());
  }, [page]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/donations?limit=500");
      if (response.data?.success) setDonationsList(response.data.data.map(mapDonation));
    } catch (err) {
      console.error("Failed to load donations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (d) => {
    // Refetch to make sure items (edited elsewhere) are current.
    try {
      const response = await api.get(`/donations/${d.id}`);
      if (response.data?.success) {
        setSelectedDonation(mapDonation(response.data.data));
        setPage("detail");
        return;
      }
    } catch (err) {
      console.error("Failed to load donation detail:", err);
    }
    setSelectedDonation(d);
    setPage("detail");
  };
  const handleEdit = (d) => { setSelectedDonation(d); setPage("edit"); };
  const handleDeleteClick = (d) => { setDeleteTarget(d); };
  const handleAdd = () => { setResumeDraft(null); setPage("add"); };
  const handleResumeDraft = (draft) => { setResumeDraft(draft); setPage("add"); };
  const handleDiscardDraftConfirm = () => {
    persistDrafts(loadDrafts().filter((d) => d.draftId !== discardTarget.draftId));
    setDrafts(loadDrafts());
    setDiscardTarget(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await api.delete(`/donations/${deleteTarget.id}`);
      await fetchDonations();
      if (page === "detail" && selectedDonation?.id === deleteTarget.id) {
        setSelectedDonation(null);
        setPage("list");
      }
    } catch (err) {
      console.error("Failed to delete donation:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      alert(backendMessage || "Failed to delete the donation record.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const renderPage = () => {
    switch (page) {
      case "add":
        return (
          <AddDonation
            initialDraft={resumeDraft}
            onCancel={() => { setResumeDraft(null); setPage("list"); }}
            onSave={async () => { setResumeDraft(null); await fetchDonations(); setPage("list"); }}
            onSavedDraft={() => { setResumeDraft(null); setPage("list"); }}
          />
        );
      case "detail":
        return <DonorDetail donation={selectedDonation} onEdit={() => setPage("edit")} onDeleteClick={handleDeleteClick} onBackToList={() => setPage("list")} />;
      case "edit":
        return (
          <EditDonation
            donation={selectedDonation}
            onCancel={() => setPage("detail")}
            onUpdate={async () => {
              await fetchDonations();
              setPage("list");
              setSelectedDonation(null);
            }}
          />
        );
      default:
        return (
          <DonationsList
            data={donationsList}
            loading={loading}
            drafts={drafts}
            onAdd={handleAdd}
            onView={handleView}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
            onResumeDraft={handleResumeDraft}
            onDiscardDraft={(d) => setDiscardTarget(d)}
          />
        );
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-[#E9EEF4]">
        {renderPage()}
      {deleteTarget && (
        <DeleteModal
          donation={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
        />
      )}
      {discardTarget && (
        <DiscardDraftModal
          draft={discardTarget}
          onCancel={() => setDiscardTarget(null)}
          onConfirm={handleDiscardDraftConfirm}
        />
      )}
    </div>
  );
}