import { useState } from "react";
import logo from "../assets/logo.png";
import {
  LayoutDashboard,
  ArrowLeftRight,
  MessageSquare,
  CalendarDays,
  HeartHandshake,
  BarChart2,
  Settings,
  BookOpen,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "#" },
  { label: "Borrow/Return", icon: ArrowLeftRight, href: "#" },
  { label: "FeedBack", icon: MessageSquare, href: "#" },
  { label: "Event", icon: CalendarDays, href: "#" },
  { label: "Donations", icon: HeartHandshake, href: "#" },
  { label: "Reports", icon: BarChart2, href: "#" },
];

export default function Sidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <aside className="flex flex-col h-screen w-64 bg-[#1B4965] text-white select-none font-sans">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#F5C842] flex-shrink-0 overflow-hidden">
          <img
            src={logo}
            alt="Logo"
            className="w-full h-full object-contain p-1"
          />
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-wide">Sieamreap</p>
          <p className="text-sm font-medium text-white/70">Bannalay</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-5 flex-1">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = active === label;
          return (
            <a
              key={label}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                setActive(label);
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                transition-all duration-200 group
                ${
                  isActive
                    ? "bg-white text-[#1B4965] shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.4 : 2}
                className={`flex-shrink-0 transition-colors duration-200 ${
                  isActive
                    ? "text-[#1B4965]"
                    : "text-white/70 group-hover:text-white"
                }`}
              />
              {label}
            </a>
          );
        })}
      </nav>

      {/* Settings — pinned to bottom */}
      <div className="px-3 pb-6 border-t border-white/10 pt-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActive("Settings");
          }}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
            transition-all duration-200 group
            ${
              active === "Settings"
                ? "bg-white text-[#1B4965] shadow-sm"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <Settings
            size={19}
            strokeWidth={active === "Settings" ? 2.4 : 2}
            className={`flex-shrink-0 transition-colors duration-200 ${
              active === "Settings"
                ? "text-[#1B4965]"
                : "text-white/70 group-hover:text-white"
            }`}
          />
          Settings
        </a>
      </div>
    </aside>
  );
}
