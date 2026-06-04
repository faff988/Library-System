import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-[#F8FAFC]">
        <h1 className="text-2xl font-bold text-[#055E83]">Dashboard</h1>
      </main>
    </div>
  );
}