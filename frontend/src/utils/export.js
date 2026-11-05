// Ekspor CSV (Excel-compatible, UTF-8 BOM)
export function exportCSV(filename, headers, rows) {
  const header = headers.map((h) => `"${h}"`).join(";");
  const body = rows
    .map((r) =>
      r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";"),
    )
    .join("\n");
  const csv = `\uFEFF${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Ekspor PDF via dialog cetak browser ("Save as PDF").
// Di produksi, PDF akan dihasilkan backend (mis. pdfkit) dengan tata letak resmi.
export function exportPDFViaPrint() {
  window.print();
}
