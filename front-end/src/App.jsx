import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Core Pages
import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";
import Inventory from "./pages/Inventory";
import BorrowReturn from "./pages/BorrowReturn";
import AddBook from "./pages/AddBook";
import BookDetails from "./pages/BookDetails";
import EditBook from "./pages/EditBook";
import Event from "./pages/Event";
import Member from "./pages/Member";
import FeedBacks from "./pages/FeedBacks";
import Settings from "./pages/Settings";

// Reports
// import Reports from "./pages/Reports"; // COMMENTED OUT: File missing in file system
import PopularBookReport from "./pages/reports/PopularBookReport";
import BookInventoryReport from "./pages/reports/BookInventoryReport";
import BorrowReturnReport from "./pages/reports/BorrowReturnReport";
import DailyWeeklyMonthlyTransactionReport from "./pages/reports/DailyWeeklyMonthlyTransactionReport";
import EntryReport from "./pages/reports/EntryReport";
import FineReport from "./pages/reports/FineReport";
import LostDamagedReport from "./pages/reports/LostDamagedReport";
import MemberReport from "./pages/reports/MemberReport";
import PopularBookReport from "./pages/reports/PopularBookReport";
import StaffActivityReport from "./pages/reports/StaffActivityReport";

// import BorrowReturn from "./pages/Borrow-Return"; // COMMENTED OUT: File missing in file system

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/donations" element={<Donations />} />
      <Route path="/inventory" element={<Inventory />} />
      
      <Route path="/inventory/add" element={<AddBook />} />
      <Route path="/inventory/:id" element={<BookDetails />} />
      <Route path="/inventory/:id/edit" element={<EditBook />} />
      <Route path="/event" element={<Event />} />
      
      <Route path="/borrow-return" element={<BorrowReturn />} /> 
      
      <Route path="/member" element={<Member />} />
      <Route path="/feedback" element={<FeedBacks />} />
      <Route path="/settings" element={<Settings />} />

      {/* Reports */}
      {/* <Route path="/reports" element={<Reports />} /> */}
      <Route path="/reports/popular-book" element={<PopularBookReport />} />
      <Route path="/reports/book-inventory" element={<BookInventoryReport />} />
      <Route path="/reports/lost-damaged" element={<LostDamagedReport />} />
      <Route path="/reports/borrow-return" element={<BorrowReturnReport />} />
      <Route path="/reports/transactions" element={<DailyWeeklyMonthlyTransactionReport />} />
      <Route path="/reports/entry" element={<EntryReport />} />
      <Route path="/reports/fine" element={<FineReport />} />
      <Route path="/reports/member" element={<MemberReport />} />
      <Route path="/reports/staff-activity" element={<StaffActivityReport />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}