import { useState, useEffect, useMemo } from "react";
import {
  Search, Plus, Calendar, User, BookOpen, RefreshCcw,
  CheckCircle, ArrowLeft, ChevronRight, AlertCircle, X
} from "lucide-react";
import Navbar from "../components/Navbar";
import api, { ASSET_BASE_URL } from "../utils/api";

// Shared helpers 
const statusStyle = {
  Borrowed: { bg: "#E8F5E9", text: "#2E7D32", label: "ACTIVE" },
  Overdue:  { bg: "#FFEBEE", text: "#C62828", label: "OVERDUE" },
  Returned: { bg: "#F1F5F9", text: "#64748B", label: "RETURNED" },
};

const TABS = [
  { label: "All Transactions", value: "All" },
  { label: "Active", value: "Borrowed" },
  { label: "Overdue", value: "Overdue" },
  { label: "Returned", value: "Returned" },
];

const PAGE_SIZE = 8;

const inputCls = "w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#055E83] transition text-gray-800 placeholder:text-gray-400";
const filterPillCls = "flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2";

const tableGridStyle = {
  display: "grid",
  gridTemplateColumns: "90px 1.4fr 1.6fr 120px 120px 110px 190px",
  alignItems: "center",
  gap: "1rem",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—");

function mapRecord(r) {
  const effectiveStatus = r.status === "Borrowed" && r.isOverdue ? "Overdue" : r.status;
  return {
    borrow_id: r.borrow_id,
    member: r.members?.full_name || "Unknown Member",
    book: r.books?.title || "Unknown Book",
    borrowDate: r.borrow_date,
    dueDate: r.due_date,
    returnDate: r.return_date,
    return_condition: r.return_condition,
    status: effectiveStatus,
    rawStatus: r.status,
  };
}

// Fuzzy matching helpers
function levenshteinDistance(a, b) {
  a = a || "";
  b = b || "";
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function fuzzyScore(query, target) {
  const q = (query || "").toLowerCase().trim();
  const t = (target || "").toLowerCase().trim();
  if (!q || !t) return 0;
  if (t.includes(q)) return 1;

  const words = t.split(/\s+/);
  let best = 0;
  for (const candidate of [t, ...words]) {
    if (!candidate) continue;
    const dist = levenshteinDistance(q, candidate);
    const sim = 1 - dist / Math.max(q.length, candidate.length);
    if (sim > best) best = sim;
  }
  return best;
}

const FUZZY_THRESHOLD = 0.5;

function rankMembers(query, members, limit = 6) {
  if (!query.trim()) return members.slice(0, limit);
  return members
    .map((m) => ({ m, score: Math.max(fuzzyScore(query, m.full_name), fuzzyScore(query, m.email)) }))
    .filter((x) => x.score >= FUZZY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.m);
}

function rankBooks(query, books, limit = 6) {
  if (!query.trim()) return books.slice(0, limit);
  return books
    .map((b) => ({
      b,
      score: Math.max(
        fuzzyScore(query, b.title),
        fuzzyScore(query, b.author),
        fuzzyScore(query, b.dewey_code),
        fuzzyScore(query, b.isbn)
      ),
    }))
    .filter((x) => x.score >= FUZZY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.b);
}

// Page 1: Transaction List 
function TransactionList({ onNewBorrow, onViewDetails, onReturn, refreshKey }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRecords();
  }, [refreshKey]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Added page=1 alongside limit=500 to satisfy backend pagination checks
      const response = await api.get("/borrow-records?page=1&limit=500");
      if (response.data?.success) {
        setRecords(response.data.data.map(mapRecord));
      }
    } catch (err) {
      console.error("Failed to load borrow records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshOverdue = async () => {
    try {
      setRefreshing(true);
      await api.post("/borrow-records/refresh-overdue");
      await fetchRecords();
    } catch (err) {
      console.error("Failed to refresh overdue status:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const counts = {
    All: records.length,
    Borrowed: records.filter((r) => r.status === "Borrowed").length,
    Overdue: records.filter((r) => r.status === "Overdue").length,
    Returned: records.filter((r) => r.status === "Returned").length,
  };

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = search === "" || `${r.member} ${r.book} TXN-${r.borrow_id}`.toLowerCase().includes(q);
    const matchTab = activeTab === "All" || r.status === activeTab;
    return matchSearch && matchTab;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <Navbar title="Borrow / Return" breadcrumb="Welcome back, Librarian" />
      <div className="px-6 py-5 space-y-4">

        {/* Search + Refresh Overdue */}
        <div className="flex items-center gap-3">
          <div className={`${filterPillCls} flex-1`}>
            <Search size={14} className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by member name, book title, or transaction ID..."
              className="text-xs outline-none w-full bg-transparent text-gray-600 placeholder-gray-400" />
          </div>
          <button onClick={handleRefreshOverdue} disabled={refreshing} className={`${filterPillCls} hover:bg-gray-50 transition disabled:opacity-60`}>
            <RefreshCcw size={13} className={`text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
            <span className="text-xs font-bold text-gray-600">{refreshing ? "Refreshing..." : "Refresh Overdue Status"}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b-2 border-gray-300">
          {TABS.map(({ label, value }) => (
            <button key={value} onClick={() => { setActiveTab(value); setPage(1); }}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold transition border-b-2 -mb-[2px] ${activeTab === value ? "border-[#055E83] text-[#055E83]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {label}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                value === "Overdue" ? "bg-red-100 text-red-600" :
                activeTab === value ? "bg-[#055E83] text-white" : "bg-white border border-gray-300 text-gray-500"
              }`}>{counts[value] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border-2 border-gray-300" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)", overflow: "hidden" }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#055E83" }}>
            <h2 className="text-white font-bold text-sm">Recent Transactions</h2>
            <button onClick={onNewBorrow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition"
              style={{ backgroundColor: "#E8C110", color: "#055E83" }}>
              <Plus size={13} /> New Borrow
            </button>
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <div style={{ minWidth: "960px" }}>
              <div style={{ ...tableGridStyle, paddingTop: "0.75rem", paddingBottom: "0.75rem" }} className="border-b-2 border-gray-300 bg-gray-50/70 text-xs font-bold uppercase tracking-wider">
                <span style={{ color: "#055E83" }}>ID</span>
                <span style={{ color: "#055E83" }}>Member Name</span>
                <span style={{ color: "#055E83" }}>Book Title</span>
                <span style={{ color: "#055E83" }}>Borrow Date</span>
                <span style={{ color: "#055E83" }}>Due Date</span>
                <span style={{ color: "#055E83" }}>Status</span>
                <span style={{ color: "#055E83", textAlign: "center" }}>Actions</span>
              </div>

              {loading ? (
                <div className="p-10 text-center text-sm text-gray-400">Loading transactions...</div>
              ) : paged.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400">No transactions match your filter criteria.</div>
              ) : (
                paged.map((t) => (
                  <div key={t.borrow_id} style={{ ...tableGridStyle, paddingTop: "0.875rem", paddingBottom: "0.875rem" }} className="border-b border-gray-200 hover:bg-slate-50/60 transition">
                    <span className="text-xs text-gray-500 font-bold">TXN-{t.borrow_id}</span>
                    <span className="text-sm font-bold text-gray-800 truncate">{t.member}</span>
                    <span className="text-sm text-gray-600 truncate">{t.book}</span>
                    <span className="text-xs text-gray-500">{formatDate(t.borrowDate)}</span>
                    <span className="text-xs text-gray-500">{formatDate(t.dueDate)}</span>
                    <div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md uppercase"
                        style={{ backgroundColor: statusStyle[t.status]?.bg, color: statusStyle[t.status]?.text }}>
                        {statusStyle[t.status]?.label || t.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onViewDetails(t.borrow_id)}
                        className="px-3 py-1.5 rounded-md text-xs font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition shadow-sm">
                        View Details
                      </button>
                      <button onClick={() => onReturn(t)} disabled={t.status === "Returned"}
                        className="px-3 py-1.5 rounded-md text-xs font-bold text-white hover:opacity-90 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#055E83" }}>
                        Return
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 border-2 border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">Prev</button>
            <span className="text-xs text-gray-500 font-medium px-2">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 border-2 border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Page 2: New Borrow Transaction 
function NewBorrow({ onCancel, onSave }) {
  const [allMembers, setAllMembers] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(true);

  const [memberQuery, setMemberQuery] = useState("");
  const [memberFocused, setMemberFocused] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [bookQuery, setBookQuery] = useState("");
  const [bookFocused, setBookFocused] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const todayStr = formatDate(new Date());
  const estimatedDueStr = formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));

  useEffect(() => {
    fetchAllMembers();
    fetchAllBooks();
  }, []);

  const fetchAllMembers = async () => {
    try {
      setMembersLoading(true);
      const response = await api.get("/members?page=1&limit=500");
      if (response.data?.success) setAllMembers(response.data.data);
    } catch (err) {
      console.error("Failed to load member directory:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchAllBooks = async () => {
    try {
      setBooksLoading(true);
      const response = await api.get("/books?page=1&limit=500");
      if (response.data?.success) setAllBooks(response.data.data);
    } catch (err) {
      console.error("Failed to load book catalog:", err);
    } finally {
      setBooksLoading(false);
    }
  };

  const memberResults = useMemo(() => {
    if (selectedMember || !memberFocused) return [];
    return rankMembers(memberQuery, allMembers);
  }, [memberQuery, allMembers, selectedMember, memberFocused]);

  const bookResults = useMemo(() => {
    if (selectedBook || !bookFocused) return [];
    return rankBooks(bookQuery, allBooks);
  }, [bookQuery, allBooks, selectedBook, bookFocused]);

  const pickMember = (m) => {
    setSelectedMember(m);
    setMemberQuery(m.full_name);
    setMemberFocused(false);
  };

  const pickBook = (b) => {
    setSelectedBook(b);
    setBookQuery(b.title);
    setBookFocused(false);
  };

  const clearMember = () => {
    setSelectedMember(null);
    setMemberQuery("");
  };

  const clearBook = () => {
    setSelectedBook(null);
    setBookQuery("");
  };

  const handleSave = async () => {
    setError("");
    if (!selectedMember || !selectedBook) {
      setError("Please select both a member and a book before saving.");
      return;
    }
    try {
      setSaving(true);
      const response = await api.post("/borrow-records", {
        memberId: selectedMember.member_id,
        bookId: selectedBook.book_id,
      });
      if (response.data?.success) onSave();
    } catch (err) {
      console.error("Failed to create borrow record:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setError(backendMessage || "Failed to create the transaction. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar title="Transactions" breadcrumb="Manage all borrow and return records" />
      <div className="px-6 py-5">

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#055E83] font-bold cursor-pointer hover:underline" onClick={onCancel}>Borrow / Return</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-700 font-bold">New Borrow Transaction</span>
          </div>
          <button onClick={onCancel} className="px-5 py-2 rounded-xl border-2 border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50 transition bg-white">Cancel</button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
          <div className="space-y-4">

            {/* Section 1: Borrower Information */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#055E83" }}>
                <span className="w-5 h-5 rounded-full bg-[#055E83] text-white text-xs flex items-center justify-center font-bold">1</span>
                Borrower Information
              </h3>
              <div className="border-b-2 border-gray-200 mb-5" />

              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Find Member</label>
              <div className="relative mb-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={memberQuery}
                  onChange={(e) => { setMemberQuery(e.target.value); setSelectedMember(null); }}
                  onFocus={() => setMemberFocused(true)}
                  onBlur={() => setTimeout(() => setMemberFocused(false), 150)}
                  placeholder="Type a name or email — small typos are OK"
                  className={`${inputCls} pl-9 pr-9`}
                />
                {selectedMember && (
                  <button type="button" onClick={clearMember} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {memberFocused && !selectedMember && (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden mb-4 max-h-52 overflow-y-auto shadow-sm">
                  {membersLoading ? (
                    <div className="px-4 py-3 text-xs text-gray-400">Loading member directory...</div>
                  ) : memberResults.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-400">
                      {memberQuery.trim() ? "No close matches found." : "Start typing to find a member."}
                    </div>
                  ) : (
                    memberResults.map((m) => (
                      <button key={m.member_id} onMouseDown={() => pickMember(m)}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition border-b border-gray-100 last:border-0 flex items-center justify-between">
                        <span>
                          <span className="font-bold text-gray-800">{m.full_name}</span>
                          <span className="text-gray-400 ml-2">{m.email}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold shrink-0 ${m.status === "Active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{m.status}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
              <p className="text-[11px] text-gray-400 mb-4 -mt-1">Results update as you type, even with small spelling mistakes.</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Member ID</label>
                  <input value={selectedMember ? `#${selectedMember.member_id}` : ""} placeholder="Select a member above" readOnly
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Membership Type</label>
                  <input value={selectedMember?.membership_types?.type_name || ""} placeholder="Auto-filled after selection" readOnly
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Member Status</label>
                  <input value={selectedMember?.status || ""} placeholder="Auto-filled after selection" readOnly
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input value={selectedMember?.phone_number || ""} placeholder="Auto-filled after selection" readOnly
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* Section 2: Book Information */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#055E83" }}>
                <span className="w-5 h-5 rounded-full bg-[#055E83] text-white text-xs flex items-center justify-center font-bold">2</span>
                Book Information
              </h3>
              <div className="border-b-2 border-gray-200 mb-5" />

              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Find Book</label>
              <div className="relative mb-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={bookQuery}
                  onChange={(e) => { setBookQuery(e.target.value); setSelectedBook(null); }}
                  onFocus={() => setBookFocused(true)}
                  onBlur={() => setTimeout(() => setBookFocused(false), 150)}
                  placeholder="Type a title, author, or Dewey code — small typos are OK"
                  className={`${inputCls} pl-9 pr-9`}
                />
                {selectedBook && (
                  <button type="button" onClick={clearBook} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {bookFocused && !selectedBook && (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden mb-4 max-h-52 overflow-y-auto shadow-sm">
                  {booksLoading ? (
                    <div className="px-4 py-3 text-xs text-gray-400">Loading book catalog...</div>
                  ) : bookResults.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-400">
                      {bookQuery.trim() ? "No close matches found." : "Start typing to find a book."}
                    </div>
                  ) : (
                    bookResults.map((b) => {
                      const disabled = !b.is_borrowable || b.available_copies <= 0;
                      return (
                        <button key={b.book_id} onMouseDown={() => !disabled && pickBook(b)} disabled={disabled}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition border-b border-gray-100 last:border-0 flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed">
                          <span>
                            <span className="font-bold text-gray-800">{b.title}</span>
                            <span className="text-gray-400 ml-2">{b.author} · {b.dewey_code}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-bold shrink-0 ${b.available_copies > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                            {b.available_copies}/{b.total_copies} available
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
              <p className="text-[11px] text-gray-400 mb-4 -mt-1">Results update as you type, even with small spelling mistakes.</p>

              <div className="flex gap-4">
                <div className="w-28 h-36 rounded-xl border-2 border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedBook?.cover_image_url ? (
                    <img src={`${ASSET_BASE_URL}${selectedBook.cover_image_url}`} alt={selectedBook.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={32} className="text-gray-200" />
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dewey Code</label>
                    <input value={selectedBook?.dewey_code || ""} placeholder="Auto-filled after selection" readOnly
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Author</label>
                    <input value={selectedBook?.author || ""} placeholder="Auto-filled after selection" readOnly
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea value={selectedBook?.description || ""} placeholder="Auto-filled after selection" readOnly rows={3}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed resize-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Borrow Information */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#055E83" }}>
                <span className="w-5 h-5 rounded-full bg-[#055E83] text-white text-xs flex items-center justify-center font-bold">3</span>
                Borrow Information
              </h3>
              <div className="border-b-2 border-gray-200 mb-5" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Borrow Date</label>
                  <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium">{todayStr}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Due Date (estimated)</label>
                  <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium">{estimatedDueStr}</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">The exact due date is set automatically to 14 days from today when the transaction is saved.</p>
            </div>
          </div>

          {/* Right Side: Summary */}
          <div className="space-y-3 sticky top-6 self-start">
            <div className="bg-white rounded-xl border-2 border-gray-300 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold text-[#055E83] mb-4">Transaction Summary</h3>
              <div className="space-y-3">
                {[
                  ["Borrower", selectedMember?.full_name || "Not selected"],
                  ["Book", selectedBook?.title || "Not selected"],
                  ["Borrow Date", todayStr],
                  ["Due Date", estimatedDueStr],
                  ["Duration", "14 days"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-baseline border-b border-gray-100 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-xs text-gray-400 font-semibold">{label}</span>
                    <span className="text-xs font-bold text-gray-700 text-right max-w-[140px] truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition shadow-md disabled:opacity-60"
              style={{ backgroundColor: "#055E83" }}>
              <BookOpen size={15} /> {saving ? "Saving..." : "Save Transaction"}
            </button>

            <button onClick={onCancel}
              className="w-full py-3 rounded-xl text-sm font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition bg-white shadow-sm">
              Cancel — Back to Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page 3: Return Book (Confirm) 
const CONDITION_OPTIONS = [
  { value: "Good", label: "Good", dot: "bg-green-500", border: "border-green-500", bg: "bg-green-50", text: "text-green-700" },
  { value: "Fair", label: "Fair", dot: "bg-yellow-500", border: "border-yellow-400", bg: "bg-yellow-50", text: "text-yellow-700" },
  { value: "Damaged", label: "Damaged", dot: "bg-red-500", border: "border-red-400", bg: "bg-red-50", text: "text-red-700" },
];

function ReturnBook({ transaction, onCancel, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [condition, setCondition] = useState("Good");

  const daysOverdue = transaction.status === "Overdue"
    ? Math.max(0, Math.ceil((new Date() - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError("");
      await api.put(`/borrow-records/${transaction.borrow_id}/return`, {
        condition,
      });
      onConfirm();
    } catch (err) {
      console.error("Failed to process return:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setError(backendMessage || "Failed to process the return. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar title="Transactions" breadcrumb="Manage all borrow and return records" />
      <div className="px-6 py-5">

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#055E83] font-bold cursor-pointer hover:underline" onClick={onCancel}>Borrow / Return</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-700 font-bold">Return Book</span>
          </div>
          <button onClick={onCancel} className="px-5 py-2 rounded-xl border-2 border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50 transition bg-white">Cancel</button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
          <div className="space-y-4">
            <div className="bg-white rounded-xl border-2 border-gray-300 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#055E83]">Borrow Record Details</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: statusStyle[transaction.status]?.bg, color: statusStyle[transaction.status]?.text }}>
                  {statusStyle[transaction.status]?.label}
                </span>
              </div>
              <div className="border-b-2 border-gray-200 mb-5" />
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {[
                  ["Transaction ID", `TXN-${transaction.borrow_id}`],
                  ["Borrow Date", formatDate(transaction.borrowDate)],
                  ["Member Name", transaction.member],
                  ["Due Date", formatDate(transaction.dueDate)],
                  ["Book Title", transaction.book],
                  ["Days Overdue", <span className={daysOverdue > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>{daysOverdue} days</span>],
                ].map(([label, val], i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-400 mb-0.5 font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-5">
                Confirming will mark this book as returned and automatically restock it in inventory. To log detailed damage notes or a lost book, use the Damage Reports page after confirming.
              </p>
            </div>

            {/* Book Return Condition */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold text-[#055E83] mb-4">Book Return Condition</h3>
              <div className="border-b-2 border-gray-200 mb-5" />
              <div className="grid grid-cols-3 gap-3">
                {CONDITION_OPTIONS.map((opt) => {
                  const active = condition === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCondition(opt.value)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                        active ? `${opt.border} ${opt.bg} ${opt.text}` : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${active ? opt.dot : "bg-gray-300"}`} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {condition === "Damaged" && (
                <p className="text-[11px] text-amber-600 mt-3">
                  Marked as damaged. After confirming, add a full damage report from the Damage Reports page.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-gray-300 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold text-[#055E83] mb-4">Return Summary</h3>
              <div className="space-y-3">
                {[
                  ["Return Date", formatDate(new Date())],
                  ["Days Overdue", `${daysOverdue} days`],
                  ["Condition", condition],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-baseline border-b border-gray-100 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-xs text-gray-400 font-semibold">{label}</span>
                    <span className="text-xs font-bold text-gray-700">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleConfirm} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition shadow-md disabled:opacity-60">
              <CheckCircle size={15} /> {submitting ? "Processing..." : "Confirm Return"}
            </button>

            <button onClick={onCancel}
              className="w-full py-3 rounded-xl text-sm font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition bg-white shadow-sm">
              Cancel — Back to Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page 4: Transaction Detail 
function ReturnBookDetail({ transactionId, onBack }) {
  const [t, setT] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/borrow-records/${transactionId}`);
        if (!cancelled && response.data?.success) setT(response.data.data);
      } catch (err) {
        console.error("Failed to load transaction detail:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => { cancelled = true; };
  }, [transactionId]);

  if (loading || !t) {
    return (
      <div>
        <Navbar title="Transaction Details" breadcrumb="Manage all borrow and return records" />
        <div className="px-6 py-5">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50 transition bg-white shadow-sm mb-5">
            <ArrowLeft size={13} /> Back to Transactions
          </button>
          <div className="p-10 text-center text-sm text-gray-400">Loading transaction...</div>
        </div>
      </div>
    );
  }

  const effectiveStatus = t.status === "Borrowed" && t.isOverdue ? "Overdue" : t.status;
  const bannerByStatus = {
    Returned: { bg: "bg-green-50 border-green-200", dot: "bg-green-500", text: "text-green-700", label: "RETURNED", message: `This transaction has been completed. Book was returned on ${formatDate(t.return_date)}.` },
    Overdue: { bg: "bg-red-50 border-red-200", dot: "bg-red-500", text: "text-red-700", label: "OVERDUE", message: `This book is overdue. It was due on ${formatDate(t.due_date)}.` },
    Borrowed: { bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500", text: "text-blue-700", label: "ACTIVE", message: `This book is currently borrowed and due on ${formatDate(t.due_date)}.` },
  };
  const banner = bannerByStatus[effectiveStatus];

  const duration = t.return_date
    ? Math.round((new Date(t.return_date) - new Date(t.borrow_date)) / (1000 * 60 * 60 * 24))
    : Math.round((new Date() - new Date(t.borrow_date)) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <Navbar title="Transaction Details" breadcrumb="Manage all borrow and return records" />
      <div className="px-6 py-5">

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#055E83] font-bold cursor-pointer hover:underline" onClick={onBack}>Borrow / Return</span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-700 font-bold">TXN-{t.borrow_id}</span>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50 transition bg-white shadow-sm">
            <ArrowLeft size={13} /> Back to Transactions
          </button>
        </div>

        <div className={`flex items-center gap-3 border-2 rounded-xl px-5 py-3.5 mb-5 shadow-sm ${banner.bg}`}>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${banner.dot}`}>{banner.label}</span>
          <p className={`text-sm font-bold ${banner.text}`}>{banner.message}</p>
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
          <div className="space-y-4">
            {/* Borrower Information */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold text-[#055E83] flex items-center gap-2 mb-4">
                <User size={15} /> Borrower Information
              </h3>
              <div className="border-b-2 border-gray-200 mb-4" />
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {[
                  ["Member Name", t.members?.full_name || "—"],
                  ["Phone Number", t.members?.phone_number || "—"],
                  ["Member ID", `#${t.members?.member_id ?? "—"}`],
                  ["Member Status", <span className={t.members?.status === "Active" ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{t.members?.status || "—"}</span>],
                ].map(([label, val], i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-400 mb-0.5 font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Information */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold text-[#055E83] flex items-center gap-2 mb-4">
                <BookOpen size={15} /> Book Information
              </h3>
              <div className="border-b-2 border-gray-200 mb-4" />
              <div className="flex gap-4">
                <div className="w-20 h-28 rounded-lg border-2 border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                  {t.books?.cover_image ? (
                    <img src={`${ASSET_BASE_URL}/uploads/covers/${t.books.cover_image}`} alt={t.books.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={24} className="text-gray-200" />
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    ["Book Title", t.books?.title || "—"],
                    ["Author", t.books?.author || "—"],
                    ["Dewey Code", t.books?.dewey_code || "—"],
                    ["Category", t.books?.category || "—"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 mb-0.5 font-bold uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold text-gray-800">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Damage Reports, if any exist for this borrow */}
            {t.damage_reports?.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-300 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
                <h3 className="text-sm font-bold text-red-600 flex items-center gap-2 mb-4">
                  <AlertCircle size={15} /> Damage Reports
                </h3>
                <div className="border-b-2 border-gray-200 mb-4" />
                <div className="space-y-3">
                  {t.damage_reports.map((d) => (
                    <div key={d.report_id} className="border-2 border-red-100 bg-red-50/50 rounded-lg p-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-red-600 uppercase">{d.book_condition}</span>
                        <span className="text-[10px] text-gray-400">{formatDate(d.reported_at)}</span>
                      </div>
                      {d.damage_description && <p className="text-xs text-gray-600">{d.damage_description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border-2 border-gray-300 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
                <CheckCircle size={14} className="text-green-500" /> Borrow Timeline
              </h3>
              <div className="space-y-3">
                {[
                  ["Borrow Date", formatDate(t.borrow_date)],
                  ["Due Date", formatDate(t.due_date)],
                  ["Return Date", t.return_date ? formatDate(t.return_date) : "Not yet returned"],
                  ["Duration", `${duration} day${duration === 1 ? "" : "s"}`],
                  ...(t.return_date
                    ? [
                        [
                          "Condition",
                          <span
                            className={
                              t.return_condition === "Damaged"
                                ? "text-red-600 font-bold"
                                : t.return_condition === "Fair"
                                ? "text-yellow-600 font-bold"
                                : "text-green-600 font-bold"
                            }
                          >
                            {t.return_condition || "—"}
                          </span>,
                        ],
                      ]
                    : []),
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b border-gray-100 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-xs text-gray-400 font-semibold">{label}</span>
                    <span className="text-xs font-bold text-gray-700">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-300 p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <h3 className="text-sm font-bold text-gray-700 mb-4">Processed By</h3>
              <p className="text-sm font-bold text-gray-800">
                {t.users ? `${t.users.first_name} ${t.users.last_name}` : "System"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Router 
export default function BorrowReturn() {
  const [page, setPage] = useState("list");
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const backToList = () => { setPage("list"); setSelected(null); setRefreshKey((k) => k + 1); };

  const render = () => {
    if (page === "new") return <NewBorrow onCancel={backToList} onSave={backToList} />;
    if (page === "return" && selected) return <ReturnBook transaction={selected} onCancel={backToList} onConfirm={backToList} />;
    if (page === "detail" && selected) return <ReturnBookDetail transactionId={selected} onBack={backToList} />;
    return (
      <TransactionList
        refreshKey={refreshKey}
        onNewBorrow={() => setPage("new")}
        onViewDetails={(borrowId) => { setSelected(borrowId); setPage("detail"); }}
        onReturn={(t) => { setSelected(t); setPage("return"); }}
      />
    );
  };

  return (
    <div className="flex-1 min-w-0 bg-[#E9EEF4]">
        {render()}
    </div>
  );
}