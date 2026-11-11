import { useState, useMemo } from "react";
import { mockObat } from "../../data/mockData";
import {
  mockBatchObat,
  mockPenerimaan,
  mockRiwayatTransaksi,
  getExpiryInfo,
  getAllSBBK,
  getAllOpnames,
  getAllAdjustments,
} from "../../data/mockOperator";
import { exportCSV, exportPDFViaPrint } from "../../utils/export";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const jenisOf = (kodeObat) =>
  mockObat.find((o) => o.kode === kodeObat)?.jenis || "-";

// Ekstrak nilai teks dari render JSX untuk keperluan ekspor CSV
const cellToText = (r, col) => {
  if (col.csvValue) return col.csvValue(r);
  if (col.render) {
    // Coba ambil nilai dari field umum kalau render mengembalikan JSX
    if (col.key === "exp" && r.exp) return r.exp.label;
    if (col.key === "totalItem" && r.items) return r.items.length;
    return r[col.key] ?? "";
  }
  return r[col.key] ?? "";
};

const LAPORAN = [
  {
    id: "stok",
    label: "Laporan Stok per Batch",
    dateField: null,
    useJenisFilter: true,
    build: () =>
      mockBatchObat.map((b) => ({
        ...b,
        jenis: jenisOf(b.kodeObat),
        exp: getExpiryInfo(b),
      })),
    columns: [
      { key: "namaObat", label: "Nama Obat" },
      { key: "noBatch", label: "No Batch" },
      { key: "expiry", label: "Expiry" },
      {
        key: "exp",
        label: "Status Kedaluwarsa",
        render: (r) => (
          <span className={`badge ${r.exp.badgeClass}`}>{r.exp.label}</span>
        ),
        csvValue: (r) => r.exp.label,
      },
      {
        key: "stok",
        label: "Stok",
        align: "right",
        render: (r) => fmt(r.stok),
        csvValue: (r) => r.stok,
      },
      { key: "satuan", label: "Satuan" },
      { key: "jenis", label: "Jenis" },
      {
        key: "hargaSatuan",
        label: "Harga Satuan",
        align: "right",
        render: (r) => rupiah(r.hargaSatuan),
        csvValue: (r) => r.hargaSatuan,
      },
      {
        key: "nilai",
        label: "Nilai Stok",
        align: "right",
        render: (r) => rupiah(r.stok * r.hargaSatuan),
        csvValue: (r) => r.stok * r.hargaSatuan,
      },
      { key: "pabrik", label: "Pabrik" },
      { key: "sumberAnggaran", label: "Sumber Anggaran" },
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
        label: "Batch Kedaluwarsa",
        value: fmt(rows.filter((r) => r.exp.status === "expired").length),
      },
    ],
  },
  {
    id: "kartu",
    label: "Kartu Stok (Mutasi)",
    dateField: "tanggal",
    useJenisFilter: false,
    build: () => mockRiwayatTransaksi,
    columns: [
      { key: "tanggal", label: "Tanggal" },
      { key: "jenis", label: "Jenis" },
      { key: "referensi", label: "Referensi" },
      { key: "namaObat", label: "Obat" },
      { key: "noBatch", label: "Batch" },
      {
        key: "masuk",
        label: "Masuk",
        align: "right",
        render: (r) => (r.masuk > 0 ? `+${fmt(r.masuk)}` : "-"),
        csvValue: (r) => r.masuk,
      },
      {
        key: "keluar",
        label: "Keluar",
        align: "right",
        render: (r) => (r.keluar > 0 ? `-${fmt(r.keluar)}` : "-"),
        csvValue: (r) => r.keluar,
      },
      { key: "keterangan", label: "Keterangan" },
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
    build: () => mockPenerimaan,
    columns: [
      { key: "tanggal", label: "Tanggal" },
      { key: "noSPB", label: "No SPB" },
      { key: "noSBBK", label: "No SBBK" },
      { key: "asal", label: "Asal" },
      { key: "sumberAnggaran", label: "Sumber Anggaran" },
      { key: "totalItem", label: "Item", align: "right" },
      { key: "status", label: "Status" },
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
    build: () => getAllSBBK().filter((s) => s.status === "terbit"),
    columns: [
      { key: "nomor", label: "Nomor SBBK" },
      { key: "tanggal", label: "Tanggal" },
      { key: "ifk", label: "IFK" },
      {
        key: "permintaanNomor",
        label: "Untuk Permintaan",
        render: (r) => r.permintaanNomor || "-",
      },
      {
        key: "totalItem",
        label: "Item",
        align: "right",
        render: (r) => r.items?.length || 0,
        csvValue: (r) => r.items?.length || 0,
      },
      {
        key: "cetakUlangKe",
        label: "Cetak Ulang",
        align: "right",
        render: (r) => `${r.cetakUlangKe || 0}×`,
        csvValue: (r) => r.cetakUlangKe || 0,
      },
    ],
    summary: (rows) => [
      { label: "Jumlah SBBK", value: fmt(rows.length) },
      {
        label: "Total Item Didistribusikan",
        value: fmt(rows.reduce((s, r) => s + (r.items?.length || 0), 0)),
      },
    ],
  },
  {
    id: "expiry",
    label: "Laporan Obat Mendekati Kedaluwarsa",
    dateField: null,
    useJenisFilter: true,
    build: () =>
      mockBatchObat
        .map((b) => ({
          ...b,
          jenis: jenisOf(b.kodeObat),
          exp: getExpiryInfo(b),
        }))
        .filter((b) => b.exp.color !== "safe")
        .sort((a, b) => a.exp.days - b.exp.days),
    columns: [
      { key: "namaObat", label: "Obat" },
      { key: "noBatch", label: "Batch" },
      { key: "expiry", label: "Expiry" },
      {
        key: "exp",
        label: "Sisa Waktu",
        render: (r) => (
          <span className={`badge ${r.exp.badgeClass}`}>{r.exp.label}</span>
        ),
        csvValue: (r) => r.exp.label,
      },
      {
        key: "stok",
        label: "Stok",
        align: "right",
        render: (r) => fmt(r.stok),
        csvValue: (r) => r.stok,
      },
    ],
    summary: (rows) => [
      { label: "Batch Berisiko", value: fmt(rows.length) },
      {
        label: "Total Stok Berisiko",
        value: fmt(rows.reduce((s, r) => s + r.stok, 0)),
      },
      {
        label: "Sudah Kedaluwarsa",
        value: fmt(rows.filter((r) => r.exp.status === "expired").length),
      },
    ],
  },
  {
    id: "variance",
    label: "Laporan Variance Stock Opname",
    dateField: "tanggal",
    useJenisFilter: false,
    build: () =>
      getAllOpnames().flatMap((so) =>
        (so.items || []).map((it) => ({
          ...it,
          periode: so.periode,
          tanggal: so.tanggal || "-",
        })),
      ),
    columns: [
      { key: "periode", label: "Periode" },
      { key: "tanggal", label: "Tanggal" },
      { key: "namaObat", label: "Obat" },
      { key: "noBatch", label: "Batch" },
      {
        key: "stokSistem",
        label: "Sistem",
        align: "right",
        render: (r) => fmt(r.stokSistem),
        csvValue: (r) => r.stokSistem,
      },
      {
        key: "stokFisik",
        label: "Fisik",
        align: "right",
        render: (r) => fmt(r.stokFisik),
        csvValue: (r) => r.stokFisik,
      },
      {
        key: "selisih",
        label: "Selisih",
        align: "right",
        render: (r) => (r.selisih > 0 ? `+${r.selisih}` : r.selisih),
        csvValue: (r) => r.selisih,
      },
      { key: "kategoriAlasan", label: "Kategori" },
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
    id: "penyesuaian",
    label: "Laporan Penyesuaian Stok",
    dateField: "tanggal",
    useJenisFilter: false,
    build: () => getAllAdjustments(),
    columns: [
      { key: "tanggal", label: "Tanggal" },
      { key: "referensi", label: "Referensi" },
      { key: "namaObat", label: "Obat" },
      { key: "noBatch", label: "Batch" },
      {
        key: "jenis",
        label: "Jenis",
        render: (r) => (r.jenis === "tambah" ? "Tambah" : "Kurang"),
        csvValue: (r) => (r.jenis === "tambah" ? "Tambah" : "Kurang"),
      },
      {
        key: "jumlah",
        label: "Jumlah",
        align: "right",
        render: (r) => fmt(r.jumlah),
        csvValue: (r) => r.jumlah,
      },
      { key: "kategoriAlasan", label: "Kategori" },
      { key: "alasan", label: "Alasan" },
    ],
    summary: (rows) => [
      { label: "Jumlah Penyesuaian", value: fmt(rows.length) },
      {
        label: "Penambahan",
        value: fmt(rows.filter((r) => r.jenis === "tambah").length),
      },
      {
        label: "Pengurangan",
        value: fmt(rows.filter((r) => r.jenis === "kurang").length),
      },
    ],
  },
];

export default function LaporanEkspor() {
  const [jenis, setJenis] = useState("stok");
  const [periodeAwal, setPeriodeAwal] = useState("2026-01-01");
  const [periodeAkhir, setPeriodeAkhir] = useState("2026-12-31");
  const [filterJenisObat, setFilterJenisObat] = useState("");
  const [preview, setPreview] = useState(false);

  const config = LAPORAN.find((l) => l.id === jenis);
  const allRows = useMemo(() => config.build(), [config]);

  const rows = useMemo(
    () =>
      allRows.filter((r) => {
        if (
          config.useJenisFilter &&
          filterJenisObat &&
          r.jenis !== filterJenisObat
        )
          return false;
        if (config.dateField && r[config.dateField]) {
          const tgl = String(r[config.dateField]).slice(0, 10);
          if (periodeAwal && tgl < periodeAwal) return false;
          if (periodeAkhir && tgl > periodeAkhir) return false;
        }
        return true;
      }),
    [allRows, config, filterJenisObat, periodeAwal, periodeAkhir],
  );

  const summary = config.summary(rows);

  const handleExportCSV = () => {
    const headers = config.columns.map((c) => c.label);
    const data = rows.map((r) => config.columns.map((c) => cellToText(r, c)));
    exportCSV(
      `${config.id}_${periodeAwal}_sd_${periodeAkhir}.csv`,
      headers,
      data,
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Laporan &amp; Ekspor</h2>
          <p>
            Semua laporan tersedia untuk Admin. Ekspor ke CSV atau cetak PDF.
          </p>
        </div>
      </div>

      <div className="card no-print">
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
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setPreview(true)}>
            Preview
          </button>
          <button
            className="btn"
            onClick={handleExportCSV}
            disabled={rows.length === 0}
          >
            Ekspor CSV
          </button>
          <button
            className="btn"
            onClick={exportPDFViaPrint}
            disabled={rows.length === 0}
          >
            Ekspor PDF
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
          <div className="info-banner warning no-print">
            <strong>PREVIEW — DATA SIMULASI.</strong> Angka dari data contoh,
            bukan basis data produksi.
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
