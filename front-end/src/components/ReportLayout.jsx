import Sidebar from "./Adminsidebar";
import Navbar from "./Navbar";

export default function ReportLayout({
  title,
  breadcrumb,
  children
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <Navbar
          title={title}
          breadcrumb={breadcrumb}
          onBack={() => window.history.back()}
        />

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}