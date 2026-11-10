import { useState, useMemo } from "react";
import { mockObat } from "../../data/mockData";
import {
  mockBatchObat,
  mockPenerimaan,
  mockSBBK,
  mockStockOpname,
  mockRiwayatTransaksi,
} from "../../data/mockOperator";
import { exportCSV, exportPDFViaPrint } from "../../utils/export";

const daysUntil = (s) => Math.ceil((new Date(s) - new Date()) / 86400000);
const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const jenisOf = (kode) => mockObat.find((o) => o.kode === kode)?.jenis || "-";

const LAPORAN = [
  {
    id: "stok",
    label: "Laporan Stok per Batch",
    dateField: null,
    useJenisFilter: true,
    build: () =>
      mockBatchObat.map((b) => ({ ...b, jenis: jenisOf(b.kodeObat) })),
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
        label: "Nilai",
        align: "right",
        render: (r) => rupiah(r.stok * r.hargaSatuan),
      },
      { key: "status", label: "Status" },
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
      { key: "petugas", label: "Petugas" },
    ],
  },
  {
    id: "sbbk",
    label: "Laporan SBBK / Distribusi",
    dateField: "tanggal",
    useJenisFilter: false,
    build: () => mockSBBK,
    columns: [
      { key: "nomor", label: "Nomor SBBK" },
      { key: "tanggal", label: "Tanggal" },
      { key: "ifk", label: "IFK" },
      { key: "totalItem", label: "Item", align: "right" },
      { key: "status", label: "Status" },
      {
        key: "cetakUlangKe",
        label: "Cetak Ulang",
        align: "right",
        render: (r) => `${r.cetakUlangKe}×`,
      },
      { key: "petugas", label: "Petugas" },
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
          sisaHari: daysUntil(b.expiry),
        }))
        .filter(
          (b) =>
            b.status !== "expired" &&
            b.sisaHari <= (b.kategori === "Fast Moving" ? 210 : 90),
        )
        .sort((a, b) => a.sisaHari - b.sisaHari),
    columns: [
      { key: "namaObat", label: "Obat" },
      { key: "noBatch", label: "Batch" },
      { key: "expiry", label: "Expiry" },
      {
        key: "sisaHari",
        label: "Sisa Hari",
        align: "right",
        render: (r) => (r.sisaHari < 0 ? "expired" : `${r.sisaHari}h`),
      },
      {
        key: "stok",
        label: "Stok",
        align: "right",
        render: (r) => fmt(r.stok),
      },
      { key: "kategori", label: "Kategori" },
    ],
  },
  {
    id: "karantina",
    label: "Laporan Obat Karantina",
    dateField: null,
    useJenisFilter: true,
    build: () =>
      mockBatchObat
        .filter((b) => b.status === "karantina")
        .map((b) => ({ ...b, jenis: jenisOf(b.kodeObat) })),
    columns: [
      { key: "namaObat", label: "Obat" },
      { key: "noBatch", label: "Batch" },
      { key: "expiry", label: "Expiry" },
      {
        key: "stok",
        label: "Stok",
        align: "right",
        render: (r) => fmt(r.stok),
      },
      { key: "satuan", label: "Satuan" },
      { key: "pabrik", label: "Pabrik" },
    ],
  },
  {
    id: "variance",
    label: "Laporan Variance Stock Opname",
    dateField: "tanggal",
    useJenisFilter: false,
    build: () =>
      mockStockOpname.flatMap((so) =>
        so.items.map((it) => ({
          ...it,
          periode: so.periode,
          tanggal: so.tanggal,
          petugas: so.petugas,
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
      },
      {
        key: "stokFisik",
        label: "Fisik",
        align: "right",
        render: (r) => fmt(r.stokFisik),
      },
      {
        key: "selisih",
        label: "Selisih",
        align: "right",
        render: (r) => (r.selisih > 0 ? `+${r.selisih}` : r.selisih),
      },
      { key: "alasan", label: "Alasan" },
    ],
  },
  {
    id: "void",
    label: "Laporan Void & Adjustment",
    dateField: "tanggal",
    useJenisFilter: false,
    build: () => mockRiwayatVoidAdjustment,
    columns: [
      { key: "tanggal", label: "Tanggal" },
      { key: "jenis", label: "Jenis" },
      { key: "referensi", label: "Referensi" },
      { key: "namaObat", label: "Obat" },
      { key: "noBatch", label: "Batch" },
      {
        key: "jumlah",
        label: "Jumlah",
        align: "right",
        render: (r) => fmt(r.jumlah),
      },
      { key: "alasan", label: "Alasan" },
      { key: "petugas", label: "Petugas" },
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

  const handleExportCSV = () => {
    const headers = config.columns.map((c) => c.label);
    const data = rows.map((r) =>
      config.columns.map((c) => {
        const raw = c.render ? c.render(r) : r[c.key];
        return typeof raw === "object" ? (r[c.key] ?? "") : raw;
      }),
    );
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
          <h2>Laporan & Ekspor</h2>
          <p>
            Semua laporan tersedia untuk Pimpinan. Ekspor ke Excel (CSV) atau
            PDF (via dialog cetak browser).
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
            Ekspor Excel (CSV)
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
