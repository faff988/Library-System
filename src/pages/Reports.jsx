import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

export default function Reports() {
  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Reports" breadcrumb="View Your Reports" />
        <div className="px-8 py-6">
          {/* Reports content goes here */}
        </div>
      </main>
    </div>
  );
}