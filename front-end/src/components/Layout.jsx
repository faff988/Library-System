import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AiBubblechat from "./AiBubblechat.jsx";

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
      <AiBubblechat />
    </div>
  );
}