import React, { useState } from 'react';
import { 
  LayoutDashboard, BookOpen, RefreshCw, Users, MessageSquare, 
  Calendar, Heart, BarChart3, Settings, Search, Bell, User, 
  ChevronDown, Filter, FileText, Download, MoreVertical, 
  ChevronLeft, ChevronRight, Upload, Clock
} from 'lucide-react';

export default function LibraryReportScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Sidebar Menu Configuration
  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Inventory', icon: BookOpen },
    { name: 'Borrow/Return', icon: RefreshCw },
    { name: 'Members', icon: Users },
    { name: 'Feedback', icon: MessageSquare },
    { name: 'Event', icon: Calendar },
    { name: 'Donations', icon: Heart },
    { 
      name: 'Reports', 
      icon: BarChart3, 
      isActive: true,
      subItems: [
        { name: 'Borrow/Return Report', active: true },
        { name: 'Popular Book Report' },
        { name: 'Book Inventory Report' },
        { name: 'Lost or Damaged Book Report' },
        { name: 'Fine Report' },
        { name: 'Member Report' },
        { name: 'Staff Activity Report' },
        { name: 'Daily / Monthly Transaction Report' },
      ]
    },
    { name: 'Settings', icon: Settings },
  ];

  // Mock Table Data
  const reportData = [
    {
      name: "Samreth Boran",
      uid: "#10922",
      initials: "SB",
      bgColor: "bg-blue-100 text-blue-600",
      book: "The Art of Khmer Architecture",
      status: "Overdue",
      statusColor: "bg-red-100 text-red-600",
      borrowDate: "Oct 12, 2023",
      returnDate: "—",
      dueDate: "Oct 26, 2023",
      dueColor: "text-red-500 font-semibold"
    },
    {
      name: "Chan Vanny",
      uid: "#10855",
      initials: "CV",
      bgColor: "bg-yellow-100 text-yellow-600",
      book: "Angkor Wat: A New History",
      status: "Returned",
      statusColor: "bg-green-100 text-green-600",
      borrowDate: "Oct 15, 2023",
      returnDate: "Oct 29, 2023",
      dueDate: "Oct 30, 2023",
      dueColor: "text-gray-600"
    },
    {
      name: "Keo Pitu",
      uid: "#11004",
      initials: "KP",
      bgColor: "bg-purple-100 text-purple-600",
      book: "Modern Web Development",
      status: "Borrowed",
      statusColor: "bg-pink-100 text-pink-600",
      borrowDate: "Oct 28, 2023",
      returnDate: "—",
      dueDate: "Nov 11, 2023",
      dueColor: "text-gray-600"
    },
    {
      name: "Mealea Arun",
      uid: "#10772",
      initials: "MA",
      bgColor: "bg-teal-100 text-teal-600",
      book: "Introduction to Psychology",
      status: "Returned",
      statusColor: "bg-green-100 text-green-600",
      borrowDate: "Oct 20, 2023",
      returnDate: "Oct 30, 2023",
      dueDate: "Nov 03, 2023",
      dueColor: "text-gray-600"
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans antialiased text-slate-800">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-[#0A6E94] text-white flex flex-col shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-4">
          <div className="bg-amber-400 p-2 rounded-xl text-slate-900 font-bold flex items-center justify-center w-12 h-12 shadow-md">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide leading-tight">Sieamreap</h1>
            <p className="text-sm font-medium text-slate-200 opacity-90">Bannalay</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar text-sm">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            if (item.subItems) {
              return (
                <div key={index} className="space-y-1">
                  <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown size={16} />
                  </button>
                  <div className="pl-4 pt-1 space-y-1">
                    {item.subItems.map((sub, sIdx) => (
                      <button 
                        key={sIdx} 
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          sub.active 
                            ? 'text-amber-400 font-semibold bg-white/5' 
                            : 'text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        {sub.name.startsWith('➔') ? sub.name : `➔  ${sub.name}`}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <button 
                key={index} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-100 hover:bg-white/10 transition-colors font-medium"
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button className="text-slate-600 hover:text-slate-900 transition-colors">
              <ChevronLeft size={24} className="stroke-[2.5]" />
            </button>
            <h2 className="text-2xl font-bold text-[#0A6E94]">Borrow/Return Reports</h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="relative w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Search books, member..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6E94]/30 focus:border-[#0A6E94] transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full"></span>
            </button>

            {/* Profile */}
            <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors border border-slate-200">
              <User size={20} />
            </button>
          </div>
        </header>

        {/* Dashboard Grid Container */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto">

          {/* Table Header Filter controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tab segment controllers */}
            <div className="bg-slate-200/70 p-1 rounded-xl flex gap-1 self-start">
              {['All', 'Borrowing', 'Returns', 'Overdue'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filters and Export buttons */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter by name or book title..." 
                  className="pl-8 pr-4 py-2 bg-white border border-slate-200 text-xs rounded-xl w-52 focus:outline-none shadow-sm"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input 
                  type="text" 
                  value="Oct 01, 2023 - Oct 31, 2023" 
                  readOnly
                  className="pl-8 pr-4 py-2 bg-white border border-slate-200 text-xs rounded-xl w-52 text-slate-600 focus:outline-none shadow-sm cursor-pointer"
                />
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                <FileText size={14} className="text-slate-500" />
                <span>Export PDF</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-[#064E68] rounded-xl text-xs font-bold text-white hover:bg-[#043b4f] shadow-sm transition-all">
                <Download size={14} />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* ================= DATA TABLE CARD ================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold tracking-wider bg-slate-50/50">
                    <th className="py-4 px-6 font-semibold">Borrower Name</th>
                    <th className="py-4 px-6 font-semibold">Book Title</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold">Borrow Date</th>
                    <th className="py-4 px-6 font-semibold">Return Date</th>
                    <th className="py-4 px-6 font-semibold">Due Date</th>
                    <th className="py-4 px-6 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {reportData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                      {/* Borrower Name info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${row.bgColor} flex items-center justify-center text-xs font-bold`}>
                            {row.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{row.name}</div>
                            <div className="text-xs text-slate-400 font-normal mt-0.5">UID: {row.uid}</div>
                          </div>
                        </div>
                      </td>
                      {/* Book Title */}
                      <td className="py-4 px-6 max-w-xs truncate text-slate-600 font-medium">{row.book}</td>
                      {/* Badge status */}
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      {/* Dates */}
                      <td className="py-4 px-6 text-slate-500 font-normal">{row.borrowDate}</td>
                      <td className="py-4 px-6 text-slate-500 font-normal">{row.returnDate}</td>
                      <td className={`py-4 px-6 ${row.dueColor}`}>{row.dueDate}</td>
                      {/* Menu Operations */}
                      <td className="py-4 px-6 text-center">
                        <button className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Showing 4 of 248 records</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-all text-slate-400">
                  <ChevronLeft size={14} />
                </button>
                {[1, 2, 3].map((page) => (
                  <button 
                    key={page} 
                    onClick={() => setCurrentPage(page)}
                    className={`w-6 h-6 rounded-md font-semibold transition-all ${
                      currentPage === page 
                        ? 'bg-[#0A6E94] text-white shadow-sm' 
                        : 'border border-transparent hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-all text-slate-400">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ================= BOTTOM ANALYTICS METRICS CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Total Borrowed Today */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start relative overflow-hidden group">
              <div className="space-y-3 z-10">
                <span className="text-xs font-bold text-slate-400 block tracking-wide">Total Borrowed Today</span>
                <span className="text-4xl font-extrabold text-slate-800 block">42</span>
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 pt-2">
                  ➔ +12% <span className="text-slate-400 font-normal">from yesterday</span>
                </span>
              </div>
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl transition-transform group-hover:scale-105 z-10">
                <Upload size={20} />
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-50 rounded-full pointer-events-none"></div>
            </div>

            {/* Card 2: Books Returned Today */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start relative overflow-hidden group">
              <div className="space-y-3 z-10">
                <span className="text-xs font-bold text-slate-400 block tracking-wide">Books Returned Today</span>
                <span className="text-4xl font-extrabold text-slate-800 block">38</span>
                <span className="text-xs text-slate-400 font-normal flex items-center gap-1 pt-2">
                  <Clock size={12} /> Recent: 15 mins ago
                </span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl transition-transform group-hover:scale-105 z-10">
                <Download size={20} />
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-50 rounded-full pointer-events-none"></div>
            </div>

            {/* Card 3: Currently Overdue */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start relative overflow-hidden group">
              <div className="space-y-3 z-10">
                <span className="text-xs font-bold text-slate-400 block tracking-wide">Currently Overdue</span>
                <span className="text-4xl font-extrabold text-slate-800 block">15</span>
                <span className="text-xs text-red-500 font-bold flex items-center gap-1 pt-2">
                  ⚠️ Urgent <span className="text-slate-400 font-normal">requires attention</span>
                </span>
              </div>
              <div className="p-3 bg-red-50 text-red-500 rounded-xl transition-transform group-hover:scale-105 z-10">
                <RefreshCw size={20} className="animate-spin-slow" />
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-50/40 rounded-full pointer-events-none"></div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}