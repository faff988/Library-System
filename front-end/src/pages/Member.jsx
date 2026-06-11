import Sidebar from "../components/Adminsidebar";
import Navbar from "../components/Navbar";

export default function Member() {
  return (
    <div className="flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        <Navbar title="Member Management" breadcrumb="Manage Your Members   " />
        <div className="px-8 py-6">
          {/* Member management content goes here */}
        </div>
      </main>
    </div>
  );
}