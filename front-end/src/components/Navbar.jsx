import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  User,
  ArrowLeft,
  LogOut,
  Edit2,
  Mail,
  Shield,
  BookOpen,
  Users,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

// ─── Logout Confirm Dialog (centered) ─────────────────────────────────────
function LogoutModal({ open, onCancel, onConfirm, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="p-6 space-y-3">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
            <LogOut size={18} className="text-red-500" />
          </div>
          <h4 className="text-base font-bold text-gray-800">
            Log out of your account?
          </h4>
          <p className="text-sm text-gray-500">
            You'll need to sign in again to access the admin dashboard.
          </p>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            <LogOut size={14} /> {loading ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Dropdown ──────────────────────────────────────────────────────
function ProfileMenu({ currentUser, onEditProfile, onRequestLogout }) {
  const initials = currentUser
    ? `${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`.toUpperCase()
    : "U";
  const fullName = currentUser
    ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim()
    : "Library Staff";

  return (
    <div className="absolute right-0 top-[calc(100%+10px)] w-72 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-50">
      <div className="p-5 flex items-center gap-3 bg-[#1B4965]">
        <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{fullName}</p>
          <p className="text-xs text-white/70 truncate">
            {currentUser?.roles?.role_name || "Librarian"}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-2 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail size={13} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {currentUser?.email || "No email assigned"}
          </span>
        </div>
        {currentUser?.roles?.role_name && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield size={13} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{currentUser.roles.role_name}</span>
          </div>
        )}
      </div>

      <div className="p-2">
        <button
          onClick={onEditProfile}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
        >
          <Edit2 size={15} className="text-gray-400" /> Edit Profile
        </button>
        <button
          onClick={onRequestLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={15} /> Log Out
        </button>
      </div>
    </div>
  );
}

export default function Navbar({ title, breadcrumb, onBack }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  // ── Global search (books + members) ──
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ books: [], members: [] });
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const requestId = useRef(0);

  useEffect(() => {
    fetchUnreadCount();
    fetchProfile();
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search: waits 300ms after typing stops
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      requestId.current++; // invalidate any in-flight request
      setResults({ books: [], members: [] });
      setSearching(false);
      return;
    }

    setSearching(true);
    const myRequest = ++requestId.current;

    const timer = setTimeout(async () => {
      const [booksRes, membersRes] = await Promise.allSettled([
        api.get(`/books?search=${encodeURIComponent(q)}&limit=5`),
        api.get(`/members?search=${encodeURIComponent(q)}&limit=5`), // ASSUMPTION: endpoint exists
      ]);

      // Ignore stale responses if the user kept typing
      if (myRequest !== requestId.current) return;

      setResults({
        books:
          booksRes.status === "fulfilled"
            ? booksRes.value.data?.data || []
            : [],
        members:
          membersRes.status === "fulfilled"
            ? membersRes.value.data?.data || []
            : [],
      });
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications?unreadOnly=true&limit=1");
      const total = res.data?.meta?.totalItems ?? res.data?.meta?.total ?? 0;
      setUnreadCount(total);
    } catch (err) {
      console.error("Failed to fetch notification count:", err);
    }
  };

  // Calls GET /api/auth/me so the dropdown has real profile data
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data?.data) setCurrentUser(res.data.data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const handleEditProfile = () => {
    setProfileOpen(false);
    navigate("/settings");
  };

  // Calls POST /api/auth/logout, clears local session, then redirects to /login
  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const goToBook = (id) => {
    setSearchOpen(false);
    setQuery("");
    navigate(`/inventory/${id}`);
  };

  const goToMember = (id) => {
    setSearchOpen(false);
    setQuery("");
    navigate(`/member?open=${id}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") setSearchOpen(false);
    if (e.key === "Enter") {
      if (results.books[0]) goToBook(results.books[0].book_id);
      else if (results.members[0]) goToMember(results.members[0].member_id);
    }
  };

  const hasResults = results.books.length > 0 || results.members.length > 0;
  const showDropdown = searchOpen && query.trim().length >= 2;

  return (
    <div className="flex items-center justify-between px-6 py-6.5 bg-white border-b border-gray-100 shadow-sm select-none sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 transition shadow-sm flex items-center justify-center group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform duration-150"
            />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1B4965] leading-tight">
            {title}
          </h1>
          {breadcrumb && (
            <p className="text-xs text-gray-400 mt-0.5 font-normal tracking-wide">
              {breadcrumb}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Global search */}
        <div className="relative" ref={searchRef}>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-400 focus-within:border-[#1B4965] rounded-lg px-3 py-2 w-[260px] transition-colors">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search books, members..."
              className="text-sm outline-none w-full bg-transparent text-gray-600 placeholder-gray-400 font-normal"
            />
            {searching && (
              <Loader2
                size={14}
                className="text-gray-400 animate-spin flex-shrink-0"
              />
            )}
          </div>

          {showDropdown && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[340px] bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50 max-h-[420px] overflow-y-auto">
              {!searching && !hasResults && (
                <p className="px-4 py-5 text-sm text-gray-400 text-center">
                  No books or members found for "{query.trim()}"
                </p>
              )}

              {results.books.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <BookOpen size={12} /> Books
                  </p>
                  {results.books.map((b) => (
                    <button
                      key={b.book_id}
                      onClick={() => goToBook(b.book_id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition"
                    >
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {b.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {b.author} · ID {b.book_id} · {b.available_copies}/
                        {b.total_copies} available
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {results.members.length > 0 && (
                <div
                  className={
                    results.books.length > 0 ? "border-t border-gray-100" : ""
                  }
                >
                  <p className="px-4 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Users size={12} /> Members
                  </p>
                  {results.members.map((m) => (
                    <button
                      key={m.member_id}
                      onClick={() => goToMember(m.member_id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition"
                    >
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {m.full_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        ID {m.member_id} ·{" "}
                        {m.phone_number || m.email || "No contact"} · {m.status}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 rounded-full hover:bg-gray-100 transition"
        >
          <Bell size={18} className="text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Profile trigger + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="w-8 h-8 rounded-full bg-[#1B4965] flex items-center justify-center hover:bg-[#14374d] transition shadow-inner"
          >
            <User size={16} className="text-white" />
          </button>

          {profileOpen && (
            <ProfileMenu
              currentUser={currentUser}
              onEditProfile={handleEditProfile}
              onRequestLogout={() => {
                setProfileOpen(false);
                setLogoutOpen(true);
              }}
            />
          )}
        </div>
      </div>

      <LogoutModal
        open={logoutOpen}
        loading={loggingOut}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}