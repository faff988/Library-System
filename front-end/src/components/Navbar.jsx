import { useEffect, useState } from "react";
import { Search, Bell, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Navbar({ title, breadcrumb, onBack }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      // Query server for unread notifications count
      const res = await api.get("/notifications?unreadOnly=true&limit=1");
      const total = res.data?.meta?.totalItems ?? res.data?.meta?.total ?? 0;
      setUnreadCount(total);
    } catch (err) {
      console.error("Failed to fetch notification count:", err);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-6.5 bg-white border-b border-gray-100 shadow-sm select-none sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Render back arrow button if onBack function is present */}
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

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-lg px-3 py-2 w-[240px]">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            placeholder="Search books, members..."
            className="text-sm outline-none w-full bg-transparent text-gray-600 placeholder-gray-400 font-normal"
          />
        </div>

        {/* Bell Button */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 rounded-full hover:bg-gray-100 transition"
        >
          <Bell size={18} className="text-gray-400" />
          
          {/* RED DOT: Appears ONLY when there are unread notifications */}
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        <button className="w-8 h-8 rounded-full bg-[#1B4965] flex items-center justify-center hover:bg-[#14374d] transition shadow-inner">
          <User size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}