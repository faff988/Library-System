import { Routes, Route, Navigate } from 'react-router-dom'  // ✅ removed BrowserRouter, added Navigate
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";
import Inventory from "./pages/Inventory";
import AddBook from "./pages/AddBook";
import BookDetails from "./pages/BookDetails";
import EditBook from "./pages/EditBook";
import Event from "./pages/Event";
import BorrowReturn from "./pages/Borrow-Return";
import Member from "./pages/Member";
import Feedbacks from "./pages/FeedBacks";
import Settings from "./pages/Settings";
import PopularBookReport from "./pages/reports/PopularBookReport";
import BookInventoryReport from "./pages/reports/BookInventoryReport";
import LostDamagedReport from "./pages/reports/LostDamagedReport";
import BorrowReturnReport from "./pages/reports/BorrowReturnReport";
import DailyWeeklyMonthlyTransactionReport from "./pages/reports/DailyWeeklyMonthlyTransactionReport";
import EntryReport from "./pages/reports/EntryReport";
import FineReport from "./pages/reports/FineReport";
import MemberReport from "./pages/reports/MemberReport";
import StaffActivityReport from "./pages/reports/StaffActivityReport";
export default function App() {
  return (
    <Routes>  {/* ✅ removed BrowserRouter here, it's already in main.jsx */}
      <Route path="/" element={<Navigate to="/login" />} />
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
      <Route path="/feedback" element={<Feedbacks />} />
      <Route path="/settings" element= {<Settings/>} />
      <Route path="/reports/popular-book" element={<PopularBookReport />} />
      <Route path="/reports/book-inventory" element={<BookInventoryReport />} />
      <Route path="/reports/lost-damaged" element={<LostDamagedReport />} />
      <Route path="/reports/borrow-return" element={<BorrowReturnReport />} />
      <Route path="/reports/transactions" element={<DailyWeeklyMonthlyTransactionReport />} />
      <Route path="/reports/entry" element={<EntryReport />} />
      <Route path="/reports/fine" element={<FineReport />} />
      <Route path="/reports/member" element={<MemberReport />} />
      <Route path="/reports/staff-activity" element={<StaffActivityReport />} />
    </Routes>
  );
}