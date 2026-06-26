import { Routes, Route, Navigate } from "react-router-dom";

// Auth Import elements mapping routing paths
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard
import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";

// Inventory ecosystem links targets configuration 
import Inventory from "./pages/Inventory";
import AddBook from "./pages/AddBook";
import BookDetails from "./pages/BookDetails";
import EditBook from "./pages/EditBook";


// Other System Modules
import Event from "./pages/Event";
<<<<<<< HEAD
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
=======
import Member from "./pages/Member";
import Feedbacks from "./pages/FeedBacks";
import Settings from "./pages/Settings";

// Reports configurations blocks
import Reports from "./pages/Reports";
import PopularBookReport from "./pages/PopularBookReport";
import BookInventoryReport from "./pages/BookIneventoryReport";
import LostDamagedReport from "./pages/LostDamagedReport";

>>>>>>> 95b7745 (Save local progress before syncing)
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

      {/* Donations */}
      <Route path="/donations" element={<Donations />} />

      {/* Inventory Router Tree System lifecycle */}
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/inventory/add" element={<AddBook />} />
      <Route path="/inventory/:id" element={<BookDetails />} />
      <Route path="/inventory/:id/edit" element={<EditBook />} />

    

      {/* Event */}
      <Route path="/event" element={<Event />} />
<<<<<<< HEAD
      <Route path="/borrow-return" element={<BorrowReturn />} />
=======

      {/* Members */}
>>>>>>> 95b7745 (Save local progress before syncing)
      <Route path="/member" element={<Member />} />

      {/* Feedback */}
      <Route path="/feedback" element={<Feedbacks />} />

      {/* Settings */}
      <Route path="/settings" element={<Settings />} />

      {/* Reports tracking tree pages mapping */}
      <Route path="/reports" element={<Reports />} />
      <Route path="/reports/popular-book" element={<PopularBookReport />} />
      <Route path="/reports/book-inventory" element={<BookInventoryReport />} />
      <Route path="/reports/lost-damaged" element={<LostDamagedReport />} />
<<<<<<< HEAD
      <Route path="/reports/borrow-return" element={<BorrowReturnReport />} />
      <Route path="/reports/transactions" element={<DailyWeeklyMonthlyTransactionReport />} />
      <Route path="/reports/entry" element={<EntryReport />} />
      <Route path="/reports/fine" element={<FineReport />} />
      <Route path="/reports/member" element={<MemberReport />} />
      <Route path="/reports/staff-activity" element={<StaffActivityReport />} />
=======

      {/* Application Security Fallback catchall route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

>>>>>>> 95b7745 (Save local progress before syncing)
    </Routes>
  );
}