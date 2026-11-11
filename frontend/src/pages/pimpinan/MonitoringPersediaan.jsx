import { useState, useMemo } from "react";
import { mockObat } from "../../data/mockData";
import {
  mockBatchObat,
  getExpiryInfo,
  getObatInfo,
  jenisProgramOptions,
  matchesJenisValue,
} from "../../data/mockOperator";
import { exportCSV, exportPDFViaPrint } from "../../utils/export";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

export default function MonitoringPersediaan() {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const rows = useMemo(
    () =>
      mockBatchObat.map((b) => {
        const info = getObatInfo(b.kodeObat);
        return {
          ...b,
          jenis: info.jenis,
          program: info.program,
          exp: getExpiryInfo(b),
        };
      }),
    [],
  );

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.namaObat.toLowerCase().includes(q) ||
      r.noBatch.toLowerCase().includes(q) ||
      r.pabrik.toLowerCase().includes(q) ||
      r.program.toLowerCase().includes(q);
    const matchJenis =
      !filterJenis ||
      matchesJenisValue({ jenis: r.jenis, program: r.program }, filterJenis);
    const matchStatus = !filterStatus || r.exp.status === filterStatus;
    return matchSearch && matchJenis && matchStatus;
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
        "Status Kedaluwarsa",
        "Stok",
        "Satuan",
        "Jenis",
        "Program Spesifik",
        "Pabrik",
        "Sumber Anggaran",
        "Harga Satuan",
        "Nilai Stok",
        "Status Batch",
      ],
      filtered.map((r) => [
        r.namaObat,
        r.noBatch,
        r.expiry,
        r.exp.days,
        r.exp.label,
        r.stok,
        r.satuan,
        r.jenis,
        r.program,
        r.pabrik,
        r.sumberAnggaran,
        r.hargaSatuan,
        r.stok * r.hargaSatuan,
        r.exp.status === "normal" ? "Normal" : "Kedaluwarsa",
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
            {jenisProgramOptions.map((j) => (
              <option key={j.value} value={j.value}>
                {j.label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="normal">Normal</option>
            <option value="expired">Kedaluwarsa</option>
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
                <th>Sisa Waktu</th>
                <th style={{ textAlign: "right" }}>Stok</th>
                <th>Satuan</th>
                <th>Jenis</th>
                <th>Program Spesifik</th>
                <th>Pabrik</th>
                <th style={{ textAlign: "right" }}>Nilai Stok</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11}>
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
                      <span className={`badge ${r.exp.badgeClass}`}>
                        {r.exp.label}
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
                    <td>
                      {r.jenis === "Program" ? (
                        <span
                          className="badge"
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
                    <td>{r.pabrik}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      Rp {fmt(r.stok * r.hargaSatuan)}
                    </td>
                    <td>
                      <span
                        className={`badge ${r.exp.status === "normal" ? "badge-success" : "badge-danger"}`}
                      >
                        {r.exp.status === "normal" ? "Normal" : "Kedaluwarsa"}
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
