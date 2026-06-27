import { Routes, Route, Navigate } from "react-router-dom";
// Auth Import elements mapping routing paths
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard & Main Pages
import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";
import Event from "./pages/Event";
import Member from "./pages/Member";
import Feedbacks from "./pages/FeedBacks"; // 
import Settings from "./pages/Settings";
import BorrowReturn from "./pages/Borrow_Return"; 

// Inventory ecosystem links targets configuration 
import Inventory from "./pages/Inventory";
import AddBook from "./pages/AddBook";
import BookDetails from "./pages/BookDetails";
import EditBook from "./pages/EditBook";

// Reports tracking sub-modules (All inside the lowercase 'reports' folder)
import BookInventoryReport from "./pages/reports/BookInventoryReport";
import BorrowReturnReport from "./pages/reports/BorrowReturnReport";
import DailyWeeklyMonthlyTransactionReport from "./pages/reports/DailyWeeklyMonthlyTransactionReport";
import EntryReport from "./pages/reports/EntryReport";
import FineReport from "./pages/reports/FineReport";
import LostDamagedReport from "./pages/reports/LostDamagedReport";
import MemberReport from "./pages/reports/MemberReport";
import PopularBookReport from "./pages/reports/PopularBookReport";
import StaffActivityReport from "./pages/reports/StaffActivityReport";

export default function App() {
  return (
    <Routes>
      {/* Default Landing Endpoint Catch path */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/donations" element={<Donations />} />

      {/* Inventory */}
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/inventory/add" element={<AddBook />} />
      <Route path="/inventory/:id" element={<BookDetails />} />
      <Route path="/inventory/:id/edit" element={<EditBook />} />

      {/* Other System Modules */}
      <Route path="/event" element={<Event />} />
      <Route path="/borrow-return" element={<BorrowReturn />} />
      <Route path="/member" element={<Member />} />
      <Route path="/feedback" element={<Feedbacks />} />
      <Route path="/settings" element={<Settings />} />

      {/* Individual Report Links */}
      <Route path="/reports/popular-book" element={<PopularBookReport />} />
      <Route path="/reports/book-inventory" element={<BookInventoryReport />} />
      <Route path="/reports/lost-damaged" element={<LostDamagedReport />} />
      <Route path="/reports/borrow-return" element={<BorrowReturnReport />} />
      <Route path="/reports/transactions" element={<DailyWeeklyMonthlyTransactionReport />} />
      <Route path="/reports/entry" element={<EntryReport />} />
      <Route path="/reports/fine" element={<FineReport />} />
      <Route path="/reports/member" element={<MemberReport />} />
      <Route path="/reports/staff-activity" element={<StaffActivityReport />} />

      {/* Application Security Fallback catchall route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}