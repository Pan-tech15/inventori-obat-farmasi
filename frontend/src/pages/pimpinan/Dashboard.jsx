import { useNavigate } from "react-router-dom";
import {
  mockBatchObat,
  mockStockOpname,
  mockAdjustment,
  getExpiryInfo,
  getAllSBBK,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

// Gabungkan data mock dengan localStorage (untuk data yang ditambah operator)
const getAllOpnames = () => {
  const local = JSON.parse(localStorage.getItem("opnameList") || "[]");
  return [...mockStockOpname, ...local].sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
  );
};

const getAllAdjustments = () => {
  const local = JSON.parse(localStorage.getItem("adjustmentList") || "[]");
  return [...mockAdjustment, ...local].sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "{}");

  // Statistik batch
  const totalBatchAktif = mockBatchObat.filter(
    (b) => getExpiryInfo(b).status === "normal",
  ).length;
  const kritisExpiry = mockBatchObat.filter((b) => {
    const exp = getExpiryInfo(b);
    return exp.status === "normal" && exp.color !== "safe";
  }).length;
  const expired = mockBatchObat.filter(
    (b) => getExpiryInfo(b).status === "expired",
  ).length;
  const totalUnitStok = mockBatchObat.reduce((s, b) => s + b.stok, 0);
  const totalNilaiStok = mockBatchObat.reduce(
    (s, b) => s + b.stok * b.hargaSatuan,
    0,
  );

  // SBBK terbit (gabungan mock + localStorage)
  const sbbkTerbit = getAllSBBK().filter((s) => s.status === "terbit").length;

  // Opname terakhir
  const allOpnames = getAllOpnames();
  const opnameTerakhir = allOpnames[0];
  const totalVarianceTerakhir = opnameTerakhir?.totalVariance || 0;

  // Koreksi terbaru: penyesuaian stok (gabungan mock + localStorage)
  const koreksiTerbaru = getAllAdjustments().slice(0, 4);

  // Batch kritis: expired atau mendekati expiry
  const batchKritis = mockBatchObat
    .filter((b) => {
      const exp = getExpiryInfo(b);
      return exp.status === "expired" || exp.color !== "safe";
    })
    .sort((a, b) => getExpiryInfo(a).days - getExpiryInfo(b).days)
    .slice(0, 5);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard Pimpinan</h2>
          <p>
            Selamat datang, {session.nama || "Pimpinan"} — ringkasan pengawasan
            persediaan dan transaksi obat
          </p>
        </div>
        <button
          className="btn btn-primary no-print"
          onClick={() => navigate("/pimpinan/laporan")}
        >
          Buka Laporan
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Batch Aktif</div>
          <div className="value">{fmt(totalBatchAktif)}</div>
          <div className="desc">
            {fmt(totalUnitStok)} unit · {rupiah(totalNilaiStok)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Mendekati Kedaluwarsa</div>
          <div className="value" style={{ color: "var(--warning)" }}>
            {fmt(kritisExpiry)}
          </div>
          <div className="desc">≤ 8 bulan (kuning) · ≤ 6 bulan (merah)</div>
        </div>
        <div className="stat-card">
          <div className="label">Kedaluwarsa</div>
          <div className="value" style={{ color: "var(--danger)" }}>
            {fmt(expired)}
          </div>
          <div className="desc">perlu pemusnahan</div>
        </div>
        <div className="stat-card">
          <div className="label">SBBK Terbit</div>
          <div className="value">{fmt(sbbkTerbit)}</div>
          <div className="desc">distribusi ke kab/kota</div>
        </div>
        <div className="stat-card">
          <div className="label">Variance Opname Terakhir</div>
          <div
            className="value"
            style={{
              color:
                totalVarianceTerakhir === 0
                  ? "var(--success)"
                  : "var(--warning)",
            }}
          >
            {totalVarianceTerakhir > 0
              ? `+${fmt(totalVarianceTerakhir)}`
              : fmt(totalVarianceTerakhir)}
          </div>
          <div className="desc">{opnameTerakhir?.periode || "-"}</div>
        </div>
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
          <h3 style={{ fontSize: 15 }}>
            Perhatian Pimpinan — Penyesuaian Terbaru
          </h3>
          <button
            className="btn btn-sm no-print"
            onClick={() => navigate("/pimpinan/transaksi")}
          >
            Lihat Semua
          </button>
        </div>
        {koreksiTerbaru.length === 0 ? (
          <div className="empty-state">
            Tidak ada penyesuaian stok tercatat.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Referensi</th>
                  <th>Obat</th>
                  <th>Batch</th>
                  <th style={{ textAlign: "right" }}>Jumlah</th>
                  <th>Kategori</th>
                  <th>Alasan</th>
                </tr>
              </thead>
              <tbody>
                {koreksiTerbaru.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                      {r.tanggal}
                    </td>
                    <td>
                      <code>{r.referensi}</code>
                    </td>
                    <td style={{ fontSize: 12 }}>{r.namaObat}</td>
                    <td>
                      <code style={{ fontSize: 11 }}>{r.noBatch}</code>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        className={`badge ${r.jenis === "tambah" ? "badge-success" : "badge-warning"}`}
                      >
                        {r.jenis === "tambah" ? "+" : "−"}
                        {fmt(r.jumlah)}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{r.kategoriAlasan || "-"}</td>
                    <td style={{ fontSize: 12 }}>{r.alasan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          <h3 style={{ fontSize: 15 }}>
            Batch Kritis (Kedaluwarsa / Mendekati Kedaluwarsa)
          </h3>
          <button
            className="btn btn-sm no-print"
            onClick={() => navigate("/pimpinan/persediaan")}
          >
            Lihat Persediaan
          </button>
        </div>
        {batchKritis.length === 0 ? (
          <div className="empty-state">Tidak ada batch kritis.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Obat</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>Sisa Waktu</th>
                  <th style={{ textAlign: "right" }}>Stok</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {batchKritis.map((b) => {
                  const exp = getExpiryInfo(b);
                  return (
                    <tr key={b.id}>
                      <td>{b.namaObat}</td>
                      <td>
                        <code>{b.noBatch}</code>
                      </td>
                      <td>{b.expiry}</td>
                      <td>
                        <span className={`badge ${exp.badgeClass}`}>
                          {exp.label}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {fmt(b.stok)}{" "}
                        <span
                          style={{ fontSize: 11, color: "var(--gray-600)" }}
                        >
                          {b.satuan}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${exp.status === "normal" ? "badge-success" : "badge-danger"}`}
                        >
                          {exp.status === "normal" ? "Normal" : "Kedaluwarsa"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
