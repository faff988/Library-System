import { useMemo, useState } from "react";
import {
  AlertTriangle, BookOpen, CalendarDays, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, CreditCard, DollarSign, FileDown, Filter, MoreVertical, Plus,
  Printer, RefreshCw, Search, Table as TableIcon,
} from "lucide-react";
import ReportLayout from "../../components/ReportLayout";

const PAGE_SIZE = 4;
const initialFines = [
  { id: "#F001", member: "Sophea Chan", book: "The Haunting of Hill House", dueDate: "Oct 12, 2023", returnNote: "Returned: Oct 18", days: 6, amount: 12, status: "Returned", payment: "Fully Paid" },
  { id: "#F002", member: "Hak SomNang", book: "Algorithms to Live By", dueDate: "Oct 05, 2023", returnNote: "Not Returned", days: 15, amount: 45, status: "Overdue", payment: "Unpaid" },
  { id: "#F003", member: "Sarah Chen", book: "The Great Gatsby", dueDate: "Oct 02, 2023", returnNote: "Returned: Oct 02", days: 0, amount: 5, status: "Paid", payment: "Fully Paid" },
  { id: "#F004", member: "Veasna Kim", book: "The 7 Habits of Highly Effective People", dueDate: "Sep 28, 2023", returnNote: "Returned: Oct 06", days: 7, amount: 8, status: "Paid", payment: "Partial" },
  { id: "#F005", member: "Dara Sok", book: "Clean Code", dueDate: "Sep 24, 2023", returnNote: "Not Returned", days: 11, amount: 32, status: "Overdue", payment: "Unpaid" },
  { id: "#F006", member: "Mony Rotha", book: "Designing Data-Intensive Applications", dueDate: "Sep 21, 2023", returnNote: "Returned: Sep 28", days: 7, amount: 18, status: "Returned", payment: "Partial" },
  { id: "#F007", member: "Nita Long", book: "English Grammar Guide", dueDate: "Sep 18, 2023", returnNote: "Returned: Oct 01", days: 13, amount: 26, status: "Paid", payment: "Fully Paid" },
  { id: "#F008", member: "Chan Dara", book: "Intro to Calculus", dueDate: "Sep 15, 2023", returnNote: "Not Returned", days: 19, amount: 54, status: "Overdue", payment: "Unpaid" },
  { id: "#F009", member: "Lina Mao", book: "Java Programming", dueDate: "Sep 10, 2023", returnNote: "Returned: Sep 16", days: 6, amount: 12, status: "Paid", payment: "Fully Paid" },
];

const statCards = [
  { title: "Total Fines", value: "$14,250.00", helper: "+12% vs LY", icon: DollarSign, tone: "blue" },
  { title: "Collected Fines", value: "$11,970.00", helper: "84% Rate", icon: CreditCard, tone: "gold" },
  { title: "Outstanding Fines", value: "$2,280.00", helper: "Action Req.", icon: AlertTriangle, tone: "red" },
  { title: "Overdue Books", value: "142 Items", helper: "Needs review", icon: BookOpen, tone: "slate" },
];

const toneStyles = {
  blue: { icon: "bg-sky-100 text-[#005A76]", helper: "bg-sky-100 text-[#005A76]", value: "text-[#005A76]" },
  gold: { icon: "bg-[#F5C842]/25 text-[#7A5A00]", helper: "bg-[#F5C842] text-[#6B4F00]", value: "text-[#7A5A00]" },
  red: { icon: "bg-red-100 text-red-600", helper: "bg-red-100 text-red-600", value: "text-red-600" },
  slate: { icon: "bg-slate-100 text-slate-600", helper: "bg-slate-100 text-slate-600", value: "text-slate-700" },
};

const statusStyles = { Returned: "bg-blue-100 text-blue-600", Overdue: "bg-amber-100 text-amber-700", Paid: "bg-[#F5C842]/35 text-[#7A5A00]" };
const paymentDistribution = [
  { label: "Fully Paid", value: "65%", color: "bg-[#005A76]" },
  { label: "Partial", value: "19%", color: "bg-[#F5C842]" },
  { label: "Unpaid", value: "16%", color: "bg-slate-300" },
];

const emptyManualFine = { member: "", book: "", dueDate: "", returnNote: "", days: "0", amount: "", status: "Overdue", payment: "Unpaid" };
const formatCurrency = (val) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

function downloadFineCsv(rows) {
  const headers = ["Fine ID", "Member", "Book", "Due Date", "Return Note", "Overdue Days", "Amount", "Status", "Payment"];
  const csvRows = rows.map(r => [r.id, r.member, r.book, r.dueDate, r.returnNote, r.days, formatCurrency(r.amount), r.status, r.payment]);
  const csv = [headers, ...csvRows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url; link.download = "fine-report.csv"; link.click(); URL.revokeObjectURL(url);
}

function StatCard({ stat }) {
  const Icon = stat.icon, tone = toneStyles[stat.tone];
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-md ${tone.icon}`}><Icon size={18} /></span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone.helper}`}>{stat.helper}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{stat.title}</p>
      <h3 className={`mt-1 text-2xl font-black tracking-normal ${tone.value}`}>{stat.value}</h3>
    </article>
  );
}

function SelectField({ icon: Icon, label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-black uppercase text-slate-500">{label}</span>
      <span className="relative block">
        <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10">
          {options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

export default function FineReport() {
  const [fines, setFines] = useState(initialFines);
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [status, setStatus] = useState("All Statuses");
  const [searchMember, setSearchMember] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");
  const [isManualFineOpen, setIsManualFineOpen] = useState(false);
  const [manualFine, setManualFine] = useState(emptyManualFine);

  const filteredFines = useMemo(() => {
    const q = searchMember.trim().toLowerCase();
    return fines.filter(f => (status === "All Statuses" || f.status === status || f.payment === status) &&
      (!q || f.id.toLowerCase().includes(q) || f.member.toLowerCase().includes(q) || f.book.toLowerCase().includes(q)));
  }, [fines, searchMember, status]);

  const pageCount = Math.max(1, Math.ceil(filteredFines.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleFines = filteredFines.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const showMsg = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };
  const handleFilter = (setter) => (val) => { setter(val); setCurrentPage(1); };

  const resetFilters = () => {
    setDateRange("Last 30 Days"); setStatus("All Statuses"); setSearchMember(""); setCurrentPage(1); showMsg("Filters reset");
  };

  const addManualFine = (e) => {
    e.preventDefault();
    if (!manualFine.member.trim() || !manualFine.book.trim()) return showMsg("Member and book are required");
    const nextNum = Math.max(...fines.map(f => Number(f.id.replace(/\D/g, ""))).filter(Boolean), 0) + 1;
    setFines(curr => [{
      id: `#F${String(nextNum).padStart(3, "0")}`, member: manualFine.member.trim(), book: manualFine.book.trim(),
      dueDate: manualFine.dueDate || "Today", returnNote: manualFine.returnNote.trim() || (manualFine.status === "Overdue" ? "Not Returned" : "Returned"),
      days: Number(manualFine.days) || 0, amount: Number(manualFine.amount) || 0, status: manualFine.status, payment: manualFine.payment
    }, ...curr]);
    setManualFine(emptyManualFine); setIsManualFineOpen(false); setCurrentPage(1); showMsg("Manual fine added");
  };

  return (
    <ReportLayout title="Fine Report">
      <section className="space-y-5">
        {toast && <div className="fixed bottom-6 right-6 z-50 rounded bg-[#005A76] px-4 py-3 text-sm font-bold text-white shadow-lg">{toast}</div>}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button onClick={() => setIsManualFineOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#F5C842] px-4 text-sm font-black text-[#1B4965] shadow-sm hover:bg-[#e4b932]"><Plus size={16} />Apply Manual Fine</button>
          <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#005A76] px-4 text-sm font-black text-white shadow-sm hover:bg-[#00445a]"><FileDown size={16} />Export PDF</button>
          <button onClick={() => filteredFines.length ? downloadFineCsv(filteredFines) || showMsg("Fine report exported") : showMsg("No fine records to export")} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:border-[#005A76] hover:text-[#005A76] disabled:cursor-not-allowed disabled:opacity-50"><TableIcon size={16} />Export Excel</button>
          <button onClick={() => window.print()} className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-[#005A76] hover:text-[#005A76]"><Printer size={17} /></button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {statCards.map(s => <StatCard key={s.title} stat={s} />)}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <SelectField icon={CalendarDays} label="Date Range" value={dateRange} onChange={handleFilter(setDateRange)} options={["Last 30 Days", "Last 7 Days", "This Month", "Last Month"]} />
          <SelectField icon={Filter} label="Status" value={status} onChange={handleFilter(setStatus)} options={["All Statuses", "Returned", "Overdue", "Paid", "Fully Paid", "Partial", "Unpaid"]} />
          <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase text-slate-500">Search Member</span>
            <span className="relative block">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={searchMember} onChange={(e) => handleFilter(setSearchMember)(e.target.value)} placeholder="Enter name or ID..." className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#005A76] focus:ring-2 focus:ring-[#005A76]/10" />
            </span>
          </label>
          <button onClick={resetFilters} className="mt-5 flex h-10 w-full items-center justify-center rounded-md bg-[#005A76] text-white shadow-sm hover:bg-[#00445a] lg:w-11"><RefreshCw size={17} /></button>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-slate-100 text-[11px] font-black uppercase text-slate-500">
                <tr>{["Fine ID", "Member & Book", "Due / Return", "Days", "Amount", "Status", ""].map(h => <th key={h} className="px-5 py-4">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {visibleFines.map((f) => (
                  <tr key={f.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-black text-[#005A76]">{f.id}</td>
                    <td className="px-5 py-4"><p className="font-black text-slate-800">{f.member}</p><p className="mt-0.5 text-xs font-medium text-slate-500">{f.book}</p></td>
                    <td className="px-5 py-4"><p className="font-semibold text-slate-700">{f.dueDate}</p><p className={`mt-0.5 text-[11px] font-black ${f.returnNote === "Not Returned" ? "text-red-600" : "text-red-500"}`}>{f.returnNote}</p></td>
                    <td className={`px-5 py-4 font-black ${f.days > 10 ? "text-red-600" : "text-slate-900"}`}>{f.days}</td>
                    <td className={`px-5 py-4 font-black ${f.status === "Paid" ? "text-[#7A5A00]" : "text-slate-900"}`}>{formatCurrency(f.amount)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${statusStyles[f.status]}`}>{f.status}</span></td>
                    <td className="px-3 py-4">
                      <button onClick={() => { setFines(curr => curr.map(item => item.id === f.id ? { ...item, status: "Paid", payment: "Fully Paid" } : item)); showMsg(`${f.id} marked as paid`); }} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-[#005A76]"><MoreVertical size={17} /></button>
                    </td>
                  </tr>
                ))}
                {!filteredFines.length && <tr><td colSpan="7" className="px-5 py-12 text-center text-sm font-semibold text-slate-400">No fine records match the current filters.</td></tr>}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold text-slate-500">Showing {filteredFines.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}-{Math.min(safePage * PAGE_SIZE, filteredFines.length)} of {filteredFines.length} entries</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 disabled:opacity-40"><ChevronLeft size={16} /></button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`h-8 w-8 rounded-md text-sm font-black transition ${safePage === p ? "bg-[#005A76] text-white" : "border border-slate-200 bg-white text-slate-600 hover:text-[#005A76]"}`}>{p}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-[#005A76]">Payment Distribution</h2>
              <div className="mx-auto mt-7 flex h-40 w-40 items-center justify-center rounded-full bg-[conic-gradient(#005A76_0deg_234deg,#F5C842_234deg_302deg,#D7DEE8_302deg_360deg)]">
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white"><span className="text-3xl font-black text-slate-800">84%</span><span className="text-xs font-bold text-slate-500">Paid</span></div>
              </div>
              <div className="mt-7 space-y-3">
                {paymentDistribution.map(i => <div key={i.label} className="flex items-center gap-3 text-sm"><span className={`h-3 w-3 rounded-full ${i.color}`} /><span className="flex-1 font-medium text-slate-600">{i.label}</span><span className="font-black text-slate-800">{i.value}</span></div>)}
              </div>
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3"><h2 className="font-black text-slate-700">Recent Activity</h2><span className="text-[10px] font-black uppercase text-[#005A76]">Quick</span></div>
              <div className="mt-4 space-y-3">
                {fines.slice(0, 4).map(f => <div key={f.id} className="flex items-center gap-3 text-xs"><CheckCircle2 size={14} className="text-[#005A76]" /><span className="flex-1 truncate font-semibold text-slate-500">{f.id} {f.member}</span><span className="font-black text-slate-800">{formatCurrency(f.amount)}</span></div>)}
              </div>
            </section>
          </aside>
        </div>
      </section>

      {isManualFineOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4">
          <form onSubmit={addManualFine} className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-black text-[#005A76]">Apply Manual Fine</h2><p className="mt-1 text-sm font-medium text-slate-500">Add a fine record to the active report.</p></div>
              <button type="button" onClick={() => setIsManualFineOpen(false)} className="rounded-md px-3 py-2 text-sm font-black text-slate-500 hover:bg-slate-100">Close</button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { label: "Member Name", field: "member", type: "input", ph: "Member name" },
                { label: "Book Title", field: "book", type: "input", ph: "Book title" },
                { label: "Due Date", field: "dueDate", type: "date" },
                { label: "Return Note", field: "returnNote", type: "input", ph: "Returned: Oct 18 or Not Returned" },
                { label: "Days", field: "days", type: "number", min: "0" },
                { label: "Amount", field: "amount", type: "number", min: "0", step: "0.01", ph: "0.00" },
              ].map(f => (
                <label key={f.field} className="text-xs font-black uppercase text-slate-500">{f.label}
                  <input type={f.type === "input" ? "text" : f.type} min={f.min} step={f.step} placeholder={f.ph} value={manualFine[f.field]} onChange={(e) => setManualFine(c => ({ ...c, [f.field]: e.target.value }))} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold normal-case text-slate-700 outline-none focus:border-[#005A76]" />
                </label>
              ))}
              {[{ label: "Status", field: "status", opts: ["Returned", "Overdue", "Paid"] }, { label: "Payment", field: "payment", opts: ["Fully Paid", "Partial", "Unpaid"] }].map(s => (
                <label key={s.field} className="text-xs font-black uppercase text-slate-500">{s.label}
                  <select value={manualFine[s.field]} onChange={(e) => setManualFine(c => ({ ...c, [s.field]: e.target.value }))} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold normal-case text-slate-700 outline-none focus:border-[#005A76]">
                    {s.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsManualFineOpen(false)} className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="h-10 rounded-md bg-[#005A76] px-5 text-sm font-black text-white hover:bg-[#00445a]">Add Fine</button>
            </div>
          </form>
        </div>
      )}
    </ReportLayout>
  );
}