import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
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
  Users,
  UserCog,
  CalendarRange,
  ChevronDown,
  DoorOpen,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["admin", "librarian"] },
  { label: "Staff", icon: UserCog, path: "/staff", roles: ["admin"] },
  { label: "Entry", icon: DoorOpen, path: "/entry", roles: ["admin", "librarian"]},
  { label: "Catalogue", icon: Library, path: "/inventory", roles: ["admin", "librarian"] },
  { label: "Member", icon: Users, path: "/member", roles: ["admin", "librarian"] },
  { label: "Borrow/Return", icon: ArrowLeftRight, path: "/borrow-return", roles: ["admin", "librarian"] },
  { label: "Donations", icon: HeartHandshake, path: "/donations", roles: ["admin", "librarian"] },
  { label: "Feedback", icon: MessageSquare, path: "/feedback", roles: ["admin", "librarian"], module: "feedback" },
  { label: "Event", icon: CalendarDays, path: "/event", roles: ["admin"] },
  
  {
    label: "Reports",
    icon: BarChart2,
    roles: ["admin", "librarian"],
    children: [
      { label: "Entry Report", icon: DoorOpen, path: "/reports/entry-report", roles: ["admin", "librarian"] },
      { label: "Borrow/Return Report", icon: ArrowLeftRight, path: "/reports/borrow-return", roles: ["admin", "librarian"] },
      { label: "Popular Book Report", icon: Star, path: "/reports/popular-book", roles: ["admin", "librarian"] },
      { label: "Book Inventory Report", icon: BookOpen, path: "/reports/book-inventory", roles: ["admin", "librarian"] },
      { label: "Lost or Damaged Book Report", icon: BookX, path: "/reports/lost-damaged", roles: ["admin", "librarian"] },
      { label: "Member Report", icon: Users, path: "/reports/member", roles: ["admin", "librarian"] },
      { label: "Staff Activity Report", icon: UserCog, path: "/reports/staff-activity", roles: ["admin"] },
      { label: "Daily / Monthly Transaction Report", icon: CalendarRange, path: "/reports/transactions", roles: ["admin", "librarian"] },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const userRole = role?.toLowerCase() || "librarian";

  const [openOverrides, setOpenOverrides] = useState({});

  // Filter items based on user role
  const filteredNavItems = navItems
    .filter((item) => item.roles.includes(userRole))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => child.roles.includes(userRole)),
        };
      }
      return item;
    });

  const toggleMenu = (label) =>
    setOpenOverrides((prev) => ({ ...prev, [label]: !getIsOpen(label) }));

  const getIsOpen = (label) => {
    const item = filteredNavItems.find((n) => n.label === label);
    const childActive = item?.children?.some((c) => location.pathname === c.path);
    if (label in openOverrides) return openOverrides[label];
    return !!childActive;
  };

  return (
    <aside className="flex flex-col h-screen w-64 bg-[#055E83] text-white select-none font-sans overflow-hidden">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#F5C842] flex-shrink-0 overflow-hidden">
          <img src={logo} alt="Logo" className="w-full h-full object-contain p-0" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-wide">Sieamreap</p>
          <p className="text-base font-bold tracking-wide">Bannalay</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-2 py-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredNavItems.map(({ label, icon: Icon, children, path }) => {
          const isActive = children
            ? children.some((c) => location.pathname === c.path)
            : location.pathname === path;
          const isOpen = children ? getIsOpen(label) : false;

          return (
            <div key={label}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (children) {
                    toggleMenu(label);
                  } else {
                    navigate(path);
                  }
                }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-[#F5C842] text-[#1B4965] shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    isActive ? "text-[#1B4965]" : "text-white/70 group-hover:text-white"
                  }`}
                />
                <span className="flex-1 truncate">{label}</span>
                {children && (
                  <ChevronDown
                    size={16}
                    className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                )}
              </a>

              {/* Sub-menu */}
              {children && isOpen && (
                <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                  {children.map(({ label: childLabel, icon: ChildIcon, path: childPath }) => {
                    const isChildActive = location.pathname === childPath;
                    return (
                      <a
                        key={childLabel}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(childPath);
                        }}
                        className={`
                          flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold
                          transition-all duration-200 group leading-snug
                          ${
                            isChildActive
                              ? "text-[#F5C842] font-bold bg-white/5"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          }
                        `}
                      >
                        <ChildIcon size={16} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{childLabel}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-5 border-t border-white/10 pt-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/settings");
          }}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
            transition-all duration-200 group
            ${
              location.pathname === "/settings"
                ? "bg-[#F5C842] text-[#1B4965] shadow-sm"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <Settings
            size={20}
            strokeWidth={location.pathname === "/settings" ? 2.4 : 2}
            className={`flex-shrink-0 transition-colors duration-200 ${
              location.pathname === "/settings" ? "text-[#1B4965]" : "text-white/70 group-hover:text-white"
            }`}
          />
          Settings
        </a>
      </div>
    </aside>
  );
}