
import { Search, Bell, User, ArrowLeft } from "lucide-react";

export default function Navbar({ title, breadcrumb, onBack }) {
  return (
    <div className="flex items-center justify-between px-6 py-8 bg-white border-b border-gray-100 shadow-sm select-none sticky top-0 z-10 ">
      <div className="flex items-center gap-3.5">
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
          {/* Matches the solid, clean font-bold scaling of the title header */}
          <h1 className="text-[32px] font-bold tracking-tight text-[#1B4965] leading-tight">
            {title}
          </h1>
          {breadcrumb && (
            <p className="text-[16px] text-gray-400 mt-0.5 font-normal tracking-wide">
              {breadcrumb}
            </p>
          )}
        </div>
      </div>

      {/* Right side controls matching the exact density of the layout */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-4 bg-gray-50 border border-gray-200/80 rounded-lg px-4 py-2 w-[300px]">
          <Search size={32} className="text-gray-400" />
          <input
            placeholder="Search books, members..."
            className="text-md outline-none w-full bg-transparent text-gray-600 placeholder-gray-400 font-normal"
          />
        </div>
        <button className="relative p-1.5 rounded-full hover:bg-gray-100 transition">
          <Bell size={26} className="text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#F5C842] rounded-full border border-white" />
        </button>
        <button className="w-8 h-8 rounded-full bg-[#1B4965] flex items-center justify-center hover:bg-[#14374d] transition shadow-inner">
          <User size={26} className="text-white" />
        </button>
      </div>
    </div>
  );
}