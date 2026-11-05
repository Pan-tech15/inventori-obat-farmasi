import { useState, useMemo } from "react";
import { mockObat } from "../../data/mockData";
import { mockBatchObat } from "../../data/mockOperator";
import { exportCSV, exportPDFViaPrint } from "../../utils/export";

const daysUntil = (s) => Math.ceil((new Date(s) - new Date()) / 86400000);
const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

// 1. Tambahkan helper untuk mengambil jenis dan program spesifik
const jenisOf = (kode) => mockObat.find((o) => o.kode === kode)?.jenis || "-";
const programOf = (kode) =>
  mockObat.find((o) => o.kode === kode)?.program || "-";

export default function MonitoringPersediaan() {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKategori, setFilterKategori] = useState("");

  const rows = useMemo(
    () =>
      mockBatchObat.map((b) => ({
        ...b,
        jenis: jenisOf(b.kodeObat),
        program: programOf(b.kodeObat), // 2. Tarik data program ke dalam baris
        sisaHari: daysUntil(b.expiry),
      })),
    [],
  );

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.namaObat.toLowerCase().includes(q) ||
      r.noBatch.toLowerCase().includes(q) ||
      r.pabrik.toLowerCase().includes(q) ||
      r.program.toLowerCase().includes(q); // Program bisa dicari juga
    const matchJenis = !filterJenis || r.jenis === filterJenis;
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchKategori = !filterKategori || r.kategori === filterKategori;
    return matchSearch && matchJenis && matchStatus && matchKategori;
  });

  const totalUnit = filtered.reduce((s, r) => s + r.stok, 0);
  const totalNilai = filtered.reduce((s, r) => s + r.stok * r.hargaSatuan, 0);

  const handleExportCSV = () => {
    exportCSV(
      `Monitoring_Persediaan_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Nama Obat",
        "Batch",
        "Expiry",
        "Sisa Hari",
        "Stok",
        "Satuan",
        "Jenis",
        "Program Spesifik", // 3. Tambah di header CSV
        "Kategori",
        "Pabrik",
        "Sumber Anggaran",
        "Nilai Stok",
        "Status",
      ],
      filtered.map((r) => [
        r.namaObat,
        r.noBatch,
        r.expiry,
        r.sisaHari,
        r.stok,
        r.satuan,
        r.jenis,
        r.program, // 4. Tambah di data CSV
        r.kategori,
        r.pabrik,
        r.sumberAnggaran,
        r.stok * r.hargaSatuan,
        r.status,
      ]),
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Monitoring Persediaan</h2>
          <p>
            Pantau stok per batch. Read-only — untuk tindakan koreksi, hubungi
            Operator.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }} className="no-print">
          <button className="btn" onClick={exportPDFViaPrint}>
            Cetak PDF
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            Ekspor Excel
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Batch</div>
          <div className="value">{fmt(filtered.length)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Unit Stok</div>
          <div className="value">{fmt(totalUnit)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Nilai Stok</div>
          <div className="value" style={{ fontSize: 20 }}>
            Rp {fmt(totalNilai)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari nama, batch, pabrik, atau program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            <option>Program</option>
            <option>Buffer</option>
          </select>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option>Fast Moving</option>
            <option>Slow Moving</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="normal">Normal</option>
            <option value="karantina">Karantina</option>
            <option value="expired">Expired</option>
          </select>
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
            {filtered.length} baris
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Obat</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Sisa</th>
                <th style={{ textAlign: "right" }}>Stok</th>
                <th>Satuan</th>
                <th>Jenis</th>
                <th>Program Spesifik</th>
                <th>Kategori</th>
                <th>Pabrik</th>
                <th style={{ textAlign: "right" }}>Nilai</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  {/* 5. Perbaiki colSpan dari 11 menjadi 12 karena kolom bertambah */}
                  <td colSpan={12}>
                    <div className="empty-state">Tidak ada data.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{r.namaObat}</td>
                    <td>
                      <code>{r.noBatch}</code>
                    </td>
                    <td>{r.expiry}</td>
                    <td>
                      <span
                        className={`badge ${r.sisaHari < 0 ? "badge-danger" : r.sisaHari <= 90 ? "badge-danger" : r.sisaHari <= 210 ? "badge-warning" : "badge-success"}`}
                      >
                        {r.sisaHari < 0 ? "expired" : `${r.sisaHari}h`}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>{fmt(r.stok)}</td>
                    <td>{r.satuan}</td>
                    <td>
                      <span
                        className={`badge ${r.jenis === "Program" ? "badge-info" : "badge-warning"}`}
                      >
                        {r.jenis}
                      </span>
                    </td>
                    {/* 6. Tampilkan program spesifiknya di sini */}
                    <td>
                      {r.jenis === "Program" ? (
                        <span
                          className="badge badge-gray"
                          style={{
                            background: "var(--primary-light)",
                            color: "var(--primary-dark)",
                          }}
                        >
                          {r.program}
                        </span>
                      ) : (
                        <span style={{ color: "var(--gray-400)" }}>-</span>
                      )}
                    </td>
                    <td>{r.kategori}</td>
                    <td>{r.pabrik}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      Rp {fmt(r.stok * r.hargaSatuan)}
                    </td>
                    <td>
                      <span
                        className={`badge ${r.status === "normal" ? "badge-success" : r.status === "karantina" ? "badge-warning" : "badge-danger"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
