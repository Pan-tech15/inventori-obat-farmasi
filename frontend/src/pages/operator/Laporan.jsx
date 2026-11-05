import { useState, useMemo } from "react";
import { mockObat } from "../../data/mockData";
import {
  mockBatchObat,
  mockPenerimaan,
  mockSBBK,
  mockStockOpname,
  mockRiwayatVoidAdjustment,
  mockRiwayatTransaksi,
} from "../../data/mockOperator";

// ===== Helper =====
const daysUntil = (s) => Math.ceil((new Date(s) - new Date()) / 86400000);
const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

// Join batch -> master obat untuk mendapatkan jenis (Program/Buffer).
// Di backend nanti ini menjadi JOIN batch_obat -> obat.
const jenisOf = (kodeObat) =>
  mockObat.find((o) => o.kode === kodeObat)?.jenis || "-";

// ===== Konfigurasi tiap jenis laporan =====
const LAPORAN = [
  {
    id: "stok",
    label: "Laporan Stok per Batch",
    dateField: null,
    useJenisFilter: true,
    columns: [
      { key: "namaObat", label: "Nama Obat" },
      { key: "noBatch", label: "No Batch" },
      { key: "expiry", label: "Expiry" },
      {
        key: "stok",
        label: "Stok",
        align: "right",
        render: (r) => fmt(r.stok),
      },
      { key: "satuan", label: "Satuan" },
      { key: "jenis", label: "Jenis" },
      { key: "pabrik", label: "Pabrik" },
      { key: "sumberAnggaran", label: "Sumber Anggaran" },
      {
        key: "nilai",
        label: "Nilai Stok",
        align: "right",
        render: (r) => rupiah(r.stok * r.hargaSatuan),
      },
      {
        key: "status",
        label: "Status",
        render: (r) => (
          <span
            className={`badge ${r.status === "normal" ? "badge-success" : r.status === "karantina" ? "badge-warning" : "badge-danger"}`}
          >
            {r.status}
          </span>
        ),
      },
    ],
    summary: (rows) => [
      { label: "Jumlah Batch", value: fmt(rows.length) },
      {
        label: "Total Unit Stok",
        value: fmt(rows.reduce((s, r) => s + r.stok, 0)),
      },
      {
        label: "Total Nilai Stok",
        value: rupiah(rows.reduce((s, r) => s + r.stok * r.hargaSatuan, 0)),
      },
      {
        label: "Batch Bermasalah",
        value: fmt(rows.filter((r) => r.status !== "normal").length),
      },
    ],
  },
  {
    id: "kartu",
    label: "Kartu Stok (Mutasi)",
    dateField: "tanggal",
    useJenisFilter: false,
    columns: [
      { key: "tanggal", label: "Tanggal" },
      { key: "jenis", label: "Jenis Transaksi" },
      { key: "referensi", label: "Referensi" },
      { key: "namaObat", label: "Nama Obat" },
      { key: "noBatch", label: "No Batch" },
      {
        key: "masuk",
        label: "Masuk",
        align: "right",
        render: (r) => (r.masuk > 0 ? `+${fmt(r.masuk)}` : "-"),
      },
      {
        key: "keluar",
        label: "Keluar",
        align: "right",
        render: (r) => (r.keluar > 0 ? `-${fmt(r.keluar)}` : "-"),
      },
      {
        key: "saldo",
        label: "Saldo",
        align: "right",
        render: (r) => fmt(r.saldo),
      },
      { key: "petugas", label: "Petugas" },
    ],
    summary: (rows) => [
      { label: "Jumlah Mutasi", value: fmt(rows.length) },
      {
        label: "Total Masuk",
        value: fmt(rows.reduce((s, r) => s + r.masuk, 0)),
      },
      {
        label: "Total Keluar",
        value: fmt(rows.reduce((s, r) => s + r.keluar, 0)),
      },
    ],
  },
  {
    id: "penerimaan",
    label: "Laporan Penerimaan",
    dateField: "tanggal",
    useJenisFilter: false,
    columns: [
      { key: "tanggal", label: "Tanggal" },
      { key: "noSPB", label: "No SPB" },
      { key: "noSBBK", label: "No SBBK" },
      { key: "asal", label: "Asal" },
      { key: "sumberAnggaran", label: "Sumber Anggaran" },
      { key: "totalItem", label: "Jumlah Item", align: "right" },
      {
        key: "status",
        label: "Status",
        render: (r) => (
          <span
            className={`badge ${r.status === "selesai" ? "badge-success" : r.status === "discrepancy" ? "badge-warning" : r.status === "parsial" ? "badge-info" : "badge-gray"}`}
          >
            {r.status}
          </span>
        ),
      },
      { key: "petugas", label: "Petugas" },
    ],
    summary: (rows) => [
      { label: "Jumlah Dokumen", value: fmt(rows.length) },
      {
        label: "Total Item",
        value: fmt(rows.reduce((s, r) => s + r.totalItem, 0)),
      },
      {
        label: "Discrepancy / Parsial",
        value: fmt(
          rows.filter(
            (r) => r.status === "discrepancy" || r.status === "parsial",
          ).length,
        ),
      },
    ],
  },
  {
    id: "sbbk",
    label: "Laporan SBBK / Distribusi",
    dateField: "tanggal",
    useJenisFilter: false,
    columns: [
      { key: "nomor", label: "Nomor SBBK" },
      { key: "tanggal", label: "Tanggal Terbit" },
      { key: "ifk", label: "IFK Tujuan" },
      { key: "totalItem", label: "Jumlah Item", align: "right" },
      {
        key: "cetakUlangKe",
        label: "Cetak Ulang",
        align: "right",
        render: (r) => `${r.cetakUlangKe}×`,
      },
      {
        key: "status",
        label: "Status",
        render: (r) => (
          <span
            className={`badge ${r.status === "terbit" ? "badge-success" : "badge-danger"}`}
          >
            {r.status}
          </span>
        ),
      },
      { key: "petugas", label: "Petugas" },
    ],
    summary: (rows) => [
      { label: "Jumlah SBBK", value: fmt(rows.length) },
      {
        label: "Terbit",
        value: fmt(rows.filter((r) => r.status === "terbit").length),
      },
      {
        label: "Void",
        value: fmt(rows.filter((r) => r.status === "void").length),
      },
      {
        label: "Total Item Didistribusikan",
        value: fmt(
          rows
            .filter((r) => r.status === "terbit")
            .reduce((s, r) => s + r.totalItem, 0),
        ),
      },
    ],
  },
  {
    id: "expiry",
    label: "Laporan Obat Mendekati Kedaluwarsa",
    dateField: null,
    useJenisFilter: true,
    columns: [
      { key: "namaObat", label: "Nama Obat" },
      { key: "noBatch", label: "No Batch" },
      { key: "expiry", label: "Expiry" },
      {
        key: "sisaHari",
        label: "Sisa Hari",
        align: "right",
        render: (r) => (r.sisaHari < 0 ? "Expired" : `${r.sisaHari} hari`),
      },
      {
        key: "stok",
        label: "Stok",
        align: "right",
        render: (r) => fmt(r.stok),
      },
      { key: "kategori", label: "Kategori" },
      { key: "status", label: "Status" },
    ],
    summary: (rows) => [
      { label: "Jumlah Batch Berisiko", value: fmt(rows.length) },
      {
        label: "Total Stok Berisiko",
        value: fmt(rows.reduce((s, r) => s + r.stok, 0)),
      },
      {
        label: "Sudah Expired",
        value: fmt(rows.filter((r) => r.sisaHari < 0).length),
      },
    ],
  },
  {
    id: "karantina",
    label: "Laporan Obat Karantina",
    dateField: null,
    useJenisFilter: true,
    columns: [
      { key: "namaObat", label: "Nama Obat" },
      { key: "noBatch", label: "No Batch" },
      { key: "expiry", label: "Expiry" },
      {
        key: "stok",
        label: "Stok",
        align: "right",
        render: (r) => fmt(r.stok),
      },
      { key: "satuan", label: "Satuan" },
      { key: "pabrik", label: "Pabrik" },
      { key: "status", label: "Status" },
    ],
    summary: (rows) => [
      { label: "Jumlah Batch Karantina", value: fmt(rows.length) },
      { label: "Total Unit", value: fmt(rows.reduce((s, r) => s + r.stok, 0)) },
    ],
  },
  {
    id: "variance",
    label: "Laporan Variance Stock Opname",
    dateField: "tanggal",
    useJenisFilter: false,
    columns: [
      { key: "periode", label: "Periode" },
      { key: "tanggal", label: "Tanggal" },
      { key: "namaObat", label: "Nama Obat" },
      { key: "noBatch", label: "No Batch" },
      {
        key: "stokSistem",
        label: "Stok Sistem",
        align: "right",
        render: (r) => fmt(r.stokSistem),
      },
      {
        key: "stokFisik",
        label: "Stok Fisik",
        align: "right",
        render: (r) => fmt(r.stokFisik),
      },
      {
        key: "selisih",
        label: "Selisih",
        align: "right",
        render: (r) => (
          <span
            className={`badge ${r.selisih === 0 ? "badge-success" : r.selisih > 0 ? "badge-info" : "badge-warning"}`}
          >
            {r.selisih > 0 ? `+${r.selisih}` : r.selisih}
          </span>
        ),
      },
      { key: "alasan", label: "Alasan" },
    ],
    summary: (rows) => [
      { label: "Item Diperiksa", value: fmt(rows.length) },
      {
        label: "Item Berselisih",
        value: fmt(rows.filter((r) => r.selisih !== 0).length),
      },
      {
        label: "Total Variance",
        value: fmt(rows.reduce((s, r) => s + r.selisih, 0)),
      },
    ],
  },
  {
    id: "void",
    label: "Laporan Void & Adjustment",
    dateField: "tanggal",
    useJenisFilter: false,
    columns: [
      { key: "tanggal", label: "Tanggal" },
      {
        key: "jenis",
        label: "Jenis",
        render: (r) => (
          <span
            className={`badge ${r.jenis === "Void" ? "badge-danger" : "badge-warning"}`}
          >
            {r.jenis}
          </span>
        ),
      },
      { key: "referensi", label: "Referensi" },
      { key: "namaObat", label: "Nama Obat" },
      { key: "noBatch", label: "No Batch" },
      {
        key: "jumlah",
        label: "Jumlah",
        align: "right",
        render: (r) => fmt(r.jumlah),
      },
      { key: "alasan", label: "Alasan" },
      { key: "petugas", label: "Petugas" },
    ],
    summary: (rows) => [
      { label: "Jumlah Koreksi", value: fmt(rows.length) },
      {
        label: "Void SBBK",
        value: fmt(rows.filter((r) => r.jenis === "Void").length),
      },
      {
        label: "Adjustment",
        value: fmt(rows.filter((r) => r.jenis === "Adjustment").length),
      },
    ],
  },
];

// ===== Penyusun data per jenis laporan =====
function buildRows(jenis) {
  switch (jenis) {
    case "stok":
      return mockBatchObat.map((b) => ({ ...b, jenis: jenisOf(b.kodeObat) }));
    case "kartu":
      return mockRiwayatTransaksi;
    case "penerimaan":
      return mockPenerimaan;
    case "sbbk":
      return mockSBBK;
    case "expiry":
      return mockBatchObat
        .map((b) => ({
          ...b,
          jenis: jenisOf(b.kodeObat),
          sisaHari: daysUntil(b.expiry),
        }))
        .filter(
          (b) =>
            b.status !== "expired" &&
            b.sisaHari <= (b.kategori === "Fast Moving" ? 210 : 90),
        )
        .sort((a, b) => a.sisaHari - b.sisaHari);
    case "karantina":
      return mockBatchObat
        .filter((b) => b.status === "karantina")
        .map((b) => ({ ...b, jenis: jenisOf(b.kodeObat) }));
    case "variance":
      return mockStockOpname.flatMap((so) =>
        so.items.map((it) => ({
          ...it,
          periode: so.periode,
          tanggal: so.tanggal,
          namaObat: it.namaObat,
          noBatch: it.noBatch,
        })),
      );
    case "void":
      return mockRiwayatVoidAdjustment;
    default:
      return [];
  }
}

export default function Laporan() {
  const [jenis, setJenis] = useState("stok");
  const [periodeAwal, setPeriodeAwal] = useState("2026-01-01");
  const [periodeAkhir, setPeriodeAkhir] = useState("2026-12-31");
  const [filterJenisObat, setFilterJenisObat] = useState("");
  const [format, setFormat] = useState("pdf");
  const [preview, setPreview] = useState(false);

  const config = LAPORAN.find((l) => l.id === jenis);
  const allRows = useMemo(() => buildRows(jenis), [jenis]);

  const rows = useMemo(() => {
    return allRows.filter((r) => {
      // Filter jenis obat (hanya laporan yang mendukung)
      if (
        config.useJenisFilter &&
        filterJenisObat &&
        r.jenis !== filterJenisObat
      )
        return false;
      // Filter periode (hanya laporan yang punya dateField)
      if (config.dateField && r[config.dateField]) {
        const tgl = String(r[config.dateField]).slice(0, 10);
        if (periodeAwal && tgl < periodeAwal) return false;
        if (periodeAkhir && tgl > periodeAkhir) return false;
      }
      return true;
    });
  }, [allRows, config, filterJenisObat, periodeAwal, periodeAkhir]);

  const summary = config.summary(rows);

  const handlePreview = () => setPreview(true);

  const handleEkspor = () => {
    // CSV asli dibuat di sisi klien — sah dilakukan sepenuhnya di frontend
    if (format === "excel") {
      const header = config.columns.map((c) => `"${c.label}"`).join(";");
      const body = rows
        .map((r) =>
          config.columns
            .map((c) => {
              const raw = c.render ? c.render(r) : r[c.key];
              // Ambil teks mentah, buang markup bila render mengembalikan elemen
              const text = typeof raw === "object" ? (r[c.key] ?? "") : raw;
              return `"${String(text).replace(/"/g, '""')}"`;
            })
            .join(";"),
        )
        .join("\n");
      const csv = `\uFEFF${header}\n${body}`; // BOM agar Excel membaca UTF-8
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.id}_${periodeAwal}_sd_${periodeAkhir}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert(
        "Ekspor PDF memerlukan backend (mis. Puppeteer/pdfkit). Untuk demo, gunakan Excel/CSV.",
      );
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Laporan</h2>
          <p>Pilih jenis laporan, terapkan filter, lalu preview dan ekspor.</p>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Parameter Laporan</div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Jenis Laporan</label>
            <select
              value={jenis}
              onChange={(e) => {
                setJenis(e.target.value);
                setPreview(false);
              }}
            >
              {LAPORAN.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {config.dateField && (
            <>
              <div className="form-group">
                <label>Periode Awal</label>
                <input
                  type="date"
                  value={periodeAwal}
                  onChange={(e) => setPeriodeAwal(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Periode Akhir</label>
                <input
                  type="date"
                  value={periodeAkhir}
                  onChange={(e) => setPeriodeAkhir(e.target.value)}
                />
              </div>
            </>
          )}

          {config.useJenisFilter && (
            <div className="form-group">
              <label>Jenis Obat</label>
              <select
                value={filterJenisObat}
                onChange={(e) => setFilterJenisObat(e.target.value)}
              >
                <option value="">Semua</option>
                <option value="Program">Program</option>
                <option value="Buffer">Buffer</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Format Ekspor</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="excel">Excel / CSV</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={handlePreview}>
            Preview
          </button>
          <button
            className="btn"
            onClick={handleEkspor}
            disabled={!preview || rows.length === 0}
          >
            Ekspor {format === "excel" ? "CSV" : "PDF"}
          </button>
        </div>

        {!config.dateField && (
          <div
            style={{ marginTop: 10, fontSize: 12, color: "var(--gray-600)" }}
          >
            Laporan ini menampilkan kondisi terkini, bukan rentang periode.
          </div>
        )}
      </div>

      {preview && (
        <>
          <div className="info-banner warning">
            <strong>PREVIEW — DATA SIMULASI.</strong> Angka pada tabel ini
            berasal dari data contoh (mock), bukan basis data produksi.
            Diimplementasikan untuk memvalidasi struktur kolom dan filter.
          </div>

          <div className="stat-grid">
            {summary.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="label">{s.label}</div>
                <div className="value" style={{ fontSize: 22 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div className="section-title" style={{ marginBottom: 0 }}>
                {config.label}
              </div>
              <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
                {rows.length} baris
              </span>
            </div>

            {rows.length === 0 ? (
              <div className="empty-state">
                Tidak ada data yang sesuai filter.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      {config.columns.map((c) => (
                        <th
                          key={c.key}
                          style={
                            c.align === "right" ? { textAlign: "right" } : {}
                          }
                        >
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        {config.columns.map((c) => (
                          <td
                            key={c.key}
                            style={
                              c.align === "right"
                                ? { textAlign: "right", whiteSpace: "nowrap" }
                                : {}
                            }
                          >
                            {c.render ? c.render(r) : (r[c.key] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
