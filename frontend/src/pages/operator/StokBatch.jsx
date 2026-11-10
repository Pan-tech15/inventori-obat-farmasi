import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockBatchObat,
  getObatInfo,
  getExpiryInfo,
  jenisProgramOptions,
  matchesJenisValue,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function StokBatch() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  const filtered = mockBatchObat
    .filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.namaObat.toLowerCase().includes(q) ||
        b.noBatch.toLowerCase().includes(q);

      const exp = getExpiryInfo(b);
      const matchStatus = !filterStatus || exp.status === filterStatus;

      const info = getObatInfo(b.kodeObat);
      const matchJenis = !filterJenis || matchesJenisValue(info, filterJenis);

      return matchSearch && matchStatus && matchJenis;
    })
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

  const totalStok = filtered.reduce((s, b) => s + b.stok, 0);
  const totalNilai = filtered.reduce((s, b) => s + b.stok * b.hargaSatuan, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Stok &amp; Batch</h2>
          <p>
            Daftar stok per batch, diurutkan dari expiry terdekat (FEFO). Batch
            mendekati kedaluwarsa ditandai warna sesuai sisa hari.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Jumlah Batch</div>
          <div className="value">{fmt(filtered.length)}</div>
          <div className="desc">setelah filter</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Unit Stok</div>
          <div className="value">{fmt(totalStok)}</div>
          <div className="desc">jumlah seluruh batch</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Nilai Stok</div>
          <div className="value" style={{ fontSize: 20 }}>
            {rupiah(totalNilai)}
          </div>
          <div className="desc">stok × harga satuan</div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari nama obat atau batch..."
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
            {filtered.length} batch
          </span>
        </div>

        <div
          className="info-banner info"
          style={{ fontSize: 12, marginBottom: 12 }}
        >
          <strong>Panduan warna sisa waktu:</strong>{" "}
          <span className="badge badge-danger">Merah</span> ≤ 6 bulan atau
          kedaluwarsa · <span className="badge badge-warning">Kuning</span> ≤ 8
          bulan · <span className="badge badge-success">Hijau</span> &gt; 8
          bulan. Warna hanya panduan prioritas — semua batch normal tetap bisa
          didistribusikan.
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Obat</th>
                <th>Jenis</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th style={{ textAlign: "right" }}>Stok</th>
                <th style={{ textAlign: "right" }}>Harga Satuan</th>
                <th>Pabrik</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      Tidak ada batch yang sesuai filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const exp = getExpiryInfo(b);
                  const info = getObatInfo(b.kodeObat);
                  const jenisParam =
                    info.jenis === "Program"
                      ? `Program:${info.program}`
                      : "Buffer";

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong style={{ fontSize: 13 }}>{b.namaObat}</strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${info.jenis === "Program" ? "badge-info" : "badge-warning"}`}
                        >
                          {info.jenis === "Program"
                            ? `Program: ${info.program}`
                            : "Buffer"}
                        </span>
                      </td>
                      <td>
                        <code>{b.noBatch}</code>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {b.expiry}{" "}
                        <span
                          className={`badge ${exp.badgeClass}`}
                          style={{ marginLeft: 6 }}
                        >
                          {exp.label}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <strong>{fmt(b.stok)}</strong>{" "}
                        <span
                          style={{ fontSize: 11, color: "var(--gray-600)" }}
                        >
                          {b.satuan}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          fontSize: 12,
                        }}
                      >
                        {rupiah(b.hargaSatuan)}
                      </td>
                      <td style={{ fontSize: 12 }}>{b.pabrik}</td>
                      <td>
                        <span
                          className={`badge ${exp.status === "normal" ? "badge-success" : "badge-danger"}`}
                        >
                          {exp.status === "normal" ? "Normal" : "Kedaluwarsa"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn btn-sm"
                          onClick={() =>
                            navigate(
                              `/operator/kartu-stok?jenis=${jenisParam}&obat=${b.kodeObat}&batch=${b.noBatch}`,
                            )
                          }
                          title="Lihat kartu stok batch ini"
                        >
                          Kartu Stok
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
