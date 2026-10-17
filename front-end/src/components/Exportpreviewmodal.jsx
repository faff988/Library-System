import { Eye, X } from "lucide-react";

// Generic column-picker + live-preview modal shown before a report is
// actually exported to CSV or printed to PDF. Used by every report page so
// the export/print flow (and its markup) lives in exactly one place.
//
// `columns` items: { key, label, render?: (row) => ReactNode }
//   - `render` is optional and only affects the preview table (e.g. status
//     badges); the CSV/print output always reads row[key] as plain text.
// `selection` is a { [key]: boolean } map owned by the parent component.
export default function ExportPreviewModal({
  type,
  rows,
  columns,
  selection,
  onToggleColumn,
  onSelectAll,
  onClose,
  onConfirm,
  getRowKey,
  brandColor = "#1B4965",
}) {
  const activeColumns = columns.filter((col) => selection[col.key]);
  const previewRows = rows.slice(0, 8);
  const allChecked = columns.every((col) => selection[col.key]);
  const noneChecked = activeColumns.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2" style={{ color: brandColor }}>
            <Eye size={18} />
            <h2 className="text-sm font-extrabold">
              Preview {type === "csv" ? "Excel" : "PDF"} Export
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 transition hover:text-gray-600" aria-label="Close preview">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5 lg:flex-row">
          <div className="w-full flex-shrink-0 lg:w-56">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase text-gray-400">Columns to include</p>
              <button
                type="button"
                onClick={() => onSelectAll(!allChecked)}
                className="text-[11px] font-bold hover:underline"
                style={{ color: brandColor }}
              >
                {allChecked ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="mt-2 space-y-1.5 rounded-md border border-gray-100 bg-[#F8FAFC] p-3">
              {columns.map((col) => (
                <label key={col.key} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={!!selection[col.key]}
                    onChange={() => onToggleColumn(col.key)}
                    className="h-3.5 w-3.5 rounded border-gray-300 focus:ring-2"
                    style={{ accentColor: brandColor }}
                  />
                  {col.label}
                </label>
              ))}
            </div>
            {noneChecked && (
              <p className="mt-2 text-[11px] font-semibold text-red-500">Select at least one column.</p>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <p className="mb-2 text-[11px] font-bold uppercase text-gray-400">
              Preview ({rows.length} record{rows.length === 1 ? "" : "s"} total, showing first {previewRows.length})
            </p>
            <div className="flex-1 overflow-auto rounded-md border border-gray-100">
              {noneChecked ? (
                <div className="flex h-32 items-center justify-center text-xs font-semibold text-gray-400">
                  Nothing to preview yet.
                </div>
              ) : rows.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-xs font-semibold text-gray-400">
                  No records match the current filters.
                </div>
              ) : (
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead className="bg-[#F1F6FA] uppercase tracking-wide text-gray-500">
                    <tr>
                      {activeColumns.map((col) => (
                        <th key={col.key} className="px-3 py-2 font-extrabold">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewRows.map((row, index) => (
                      <tr key={getRowKey ? getRowKey(row) : index}>
                        {activeColumns.map((col) => (
                          <td key={col.key} className="px-3 py-2 font-semibold text-gray-600">
                            {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={noneChecked || rows.length === 0}
            onClick={onConfirm}
            className="rounded-md bg-[#F5C842] px-4 py-2 text-xs font-extrabold text-[#1B4965] transition hover:bg-[#e7b92f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {type === "csv" ? "Download CSV" : "Print"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared helpers so every report's CSV/print functions stay one-liners.

export function escapeCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function buildCsv(rows, columns, selection) {
  const activeColumns = columns.filter((col) => selection[col.key]);
  const headers = activeColumns.map((col) => col.label);
  const csvRows = rows.map((row) => activeColumns.map((col) => (col.csvValue ? col.csvValue(row) : row[col.key])));
  return [headers, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export function downloadCsvFile(rows, columns, selection, filename) {
  const csv = buildCsv(rows, columns, selection);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

export function printReport(rows, columns, selection, { title = "Report", brandColor = "#1B4965" } = {}) {
  const activeColumns = columns.filter((col) => selection[col.key]);
  const win = window.open("", "_blank", "width=1000,height=750");
  if (!win) {
    alert("Please allow pop-ups to print the report.");
    return;
  }

  const tableRows = rows
    .map(
      (row) =>
        `<tr>${activeColumns.map((col) => `<td>${escapeHtml(col.csvValue ? col.csvValue(row) : row[col.key])}</td>`).join("")}</tr>`
    )
    .join("");

  win.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: ${brandColor}; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          p.meta { font-size: 12px; color: #64748B; margin-top: 0; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #E2E8F0; padding: 6px 10px; text-align: left; }
          th { background: #F1F6FA; text-transform: uppercase; font-size: 10px; letter-spacing: 0.03em; }
          tr:nth-child(even) { background: #F8FAFC; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p class="meta">${rows.length} record${rows.length === 1 ? "" : "s"} · Generated ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr>${activeColumns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("")}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

// Builds the default { [key]: true } selection object for a column list,
// optionally excluding some keys so a report can start with a leaner set.
export function defaultSelection(columns, excludeKeys = []) {
  return columns.reduce((acc, col) => ({ ...acc, [col.key]: !excludeKeys.includes(col.key) }), {});
}