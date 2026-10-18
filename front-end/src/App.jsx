import { Routes, Route, Navigate } from "react-router-dom";

// Layout & guards
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AiBubblechat from "./components/AiBubblechat";

// Auth
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

// Core Pages
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import Entry from "./pages/Entry";
import Donations from "./pages/Donations";
import { Inventory, AddBook, BookDetails, EditBook } from "./pages/Inventory";
import BorrowReturn from "./pages/BorrowReturn";
import Event from "./pages/Event";
import Member from "./pages/Member";
import FeedBacks from "./pages/FeedBacks";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

// Reports
import PopularBookReport from "./pages/reports/PopularBookReport";
import BookInventoryReport from "./pages/reports/BookInventoryReport";
import BorrowReturnReport from "./pages/reports/BorrowReturnReport";
import DailyWeeklyMonthlyTransactionReport from "./pages/reports/DailyWeeklyMonthlyTransactionReport";
import EntryReport from "./pages/reports/EntryReport";
import LostDamagedReport from "./pages/reports/LostDamagedReport";
import MemberReport from "./pages/reports/MemberReport";
import StaffActivityReport from "./pages/reports/StaffActivityReport";

export default function App() {
  return (
    <div className="bg-[#F1F3F5] min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Everything below requires login and renders inside Layout,
            which picks Admin or Librarian sidebar based on role. */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
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
          <Route path="/notifications" element={<Notifications />} />

          {/* Reports available to both roles */}
          <Route path="/reports/popular-book" element={<PopularBookReport />} />
          <Route path="/reports/book-inventory" element={<BookInventoryReport />} />
          <Route path="/reports/lost-damaged" element={<LostDamagedReport />} />
          <Route path="/reports/borrow-return" element={<BorrowReturnReport />} />
          <Route path="/reports/transactions" element={<DailyWeeklyMonthlyTransactionReport />} />
          <Route path="/reports/member" element={<MemberReport />} />

          {/* Admin-only: staff accounts and permissions */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entry"
            element={
              <ProtectedRoute roles={["admin", "librarian"]}>
                <Entry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/entry-report"
            element={
              <ProtectedRoute roles={["admin", "librarian"]}>
                <EntryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/staff-activity"
            element={
              <ProtectedRoute roles={["admin"]}>
                <StaffActivityReport />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}