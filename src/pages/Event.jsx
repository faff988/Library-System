import Sidebar from "../components/LibrarianSidebar";

export default function Event() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-[#F8FAFC]">
        <h1 className="text-2xl font-bold text-[#055E83]">Event Management</h1>
        {/* Event management content goes here */}
      </main>
    </div>
  );
}