import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  LayoutDashboard,
  Library,
  ArrowLeftRight,
  MessageSquare,
  CalendarDays,
  HeartHandshake,
  BarChart2,
  Settings,
  Star,
  BookOpen,
  BookX,
  Receipt,
  Users,
  UserCog,
  CalendarRange,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Inventory", icon: Library, path: "/inventory" },
  { label: "Member", icon: Users, path: "/member" },
  { label: "Borrow/Return", icon: ArrowLeftRight, path: "/borrow-return" },
  { label: "FeedBack", icon: MessageSquare, path: "/feedback" },
  { label: "Event", icon: CalendarDays, path: "/event" },
  { label: "Donations", icon: HeartHandshake, path: "/donations" },
  {
    label: "Reports",
    icon: BarChart2,
    children: [
      {
        label: "Borrow/Return Report",
        icon: ArrowLeftRight,
        path: "/reports/borrow-return",
      },
      {
        label: "Popular Book Report",
        icon: Star,
        path: "/reports/popular-book",
      },
      {
        label: "Book Inventory Report",
        icon: BookOpen,
        path: "/reports/book-inventory",
      },
      {
        label: "Lost or Damaged Book Report",
        icon: BookX,
        path: "/reports/lost-damaged",
      },
      { label: "Fine Report", icon: Receipt, path: "/reports/fine" },
      { label: "Member Report", icon: Users, path: "/reports/member" },
      {
        label: "Staff Activity Report",
        icon: UserCog,
        path: "/reports/staff-activity",
      },
      {
        label: "Daily / Monthly Transaction Report",
        icon: CalendarRange,
        path: "/reports/transactions",
      },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");
  // FIX: Set Reports to false by default so it stays hidden until clicked
  const [openMenus, setOpenMenus] = useState({ Reports: false });

  const toggleMenu = (label) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    // FIX: Increased width to w-72 so text does not crunch up into 3 lines
    <aside className="flex flex-col h-screen w-90 bg-[#1B4965] text-white select-none font-sans overflow-hidden">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-[#F5C842] flex-shrink-0 overflow-hidden">
          <img
            src={logo}
            alt="Logo"
            className="w-full h-full object-contain p-0"
          />
        </div>
        <div className="leading-tight">
          <p className="text-2xl font-bold tracking-wide">Sieamreap</p>
          <p className="text-2xl font-bold tracking-wide">Bannalay</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-5 flex-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, children, path }) => {
          const isActive = active === label;
          const isOpen = openMenus[label];

          return (
            <div key={label}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (children) {
                    toggleMenu(label);
                  } else {
                    setActive(label);
                    navigate(path);
                  }
                }}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-xl text-2xl font-bold
                  transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-[#F5C842] text-[#1B4965] shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon
                  size={28}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    isActive
                      ? "text-[#1B4965]"
                      : "text-white/70 group-hover:text-white"
                  }`}
                />
                <span className="flex-1">{label}</span>
                {children && (
                  <ChevronDown
                    size={26}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                )}
              </a>

              {/* Sub-menu */}
              {children && isOpen && (
                <div className="mt-1.5 ml-4 flex flex-col gap-1 border-l border-white/10 pl-3">
                  {children.map(
                    ({
                      label: childLabel,
                      icon: ChildIcon,
                      path: childPath,
                    }) => {
                      const isChildActive = active === childLabel;
                      return (
                        <a
                          key={childLabel}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setActive(childLabel);
                            navigate(childPath);
                          }}
                          className={`
                          flex items-start gap-3 px-3 py-2.5 rounded-lg text-lg font-semibold
                          transition-all duration-200 group leading-snug
                          ${
                            isChildActive
                              ? "text-[#F5C842] font-bold bg-white/5"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          }
                        `}
                        >
                          <ChildIcon
                            size={24}
                            strokeWidth={2}
                            className="flex-shrink-0 mt-0.5"
                          />
                          <span className="flex-1">{childLabel}</span>
                        </a>
                      );
                    },
                  )}
                </div>
              )}
            </div>
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
            flex items-center gap-4 px-4 py-3.5 rounded-xl text-xl font-bold
            transition-all duration-200 group
            ${
              active === "Settings"
                ? "bg-[#F5C842] text-[#1B4965] shadow-sm"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <Settings
            size={28}
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
