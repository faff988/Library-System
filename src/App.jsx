import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Donations from "./pages/Donations";
import Inventory from "./pages/Inventory";
import Event from "./pages/Event";
import BorrowReturn from "./pages/Borrow-Return";
import Reports from "./pages/Reports";
import Member from "./pages/Member";
import Feedbacks from "./pages/FeedBacks";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />      
        <Route path="/donations" element={<Donations />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/event" element={<Event />} />
        <Route path="/borrow-return" element={<BorrowReturn />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/member" element={<Member />} />
        <Route path="/feedback" element={<Feedbacks />} />
      </Routes>
    </BrowserRouter>
  );
}
