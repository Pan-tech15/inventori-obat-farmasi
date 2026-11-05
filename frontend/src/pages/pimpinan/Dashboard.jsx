import { useNavigate } from "react-router-dom";
import {
  mockBatchObat,
  mockSBBK,
  mockStockOpname,
  mockRiwayatVoidAdjustment,
} from "../../data/mockOperator";

const daysUntil = (s) => Math.ceil((new Date(s) - new Date()) / 86400000);
const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

export default function Dashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "{}");

  const totalBatchAktif = mockBatchObat.filter(
    (b) => b.status === "normal",
  ).length;
  const kritisExpiry = mockBatchObat.filter((b) => {
    const d = daysUntil(b.expiry);
    const ambang = b.kategori === "Fast Moving" ? 210 : 90;
    return b.status === "normal" && d > 0 && d <= ambang;
  }).length;
  const karantina = mockBatchObat.filter(
    (b) => b.status === "karantina",
  ).length;
  const expired = mockBatchObat.filter(
    (b) => b.status === "expired" || daysUntil(b.expiry) < 0,
  ).length;
  const totalUnitStok = mockBatchObat.reduce((s, b) => s + b.stok, 0);
  const totalNilaiStok = mockBatchObat.reduce(
    (s, b) => s + b.stok * b.hargaSatuan,
    0,
  );

  const sbbkTerbit = mockSBBK.filter((s) => s.status === "terbit").length;
  const sbbkVoid = mockSBBK.filter((s) => s.status === "void").length;

  const opnameTerakhir = mockStockOpname[0];
  const totalVarianceTerakhir = opnameTerakhir?.totalVariance || 0;

  // Perhatian Pimpinan: koreksi & temuan terbaru
  const koreksiTerbaru = mockRiwayatVoidAdjustment.slice(0, 4);
  const batchKritis = mockBatchObat
    .filter((b) => b.status !== "normal" || daysUntil(b.expiry) <= 90)
    .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))
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
            {fmt(totalUnitStok)} unit · Rp {fmt(totalNilaiStok)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Mendekati Expiry</div>
          <div className="value" style={{ color: "var(--warning)" }}>
            {fmt(kritisExpiry)}
          </div>
          <div className="desc">7 bln (fast) / 3 bln (slow)</div>
        </div>
        <div className="stat-card">
          <div className="label">Karantina</div>
          <div className="value" style={{ color: "var(--warning)" }}>
            {fmt(karantina)}
          </div>
          <div className="desc">disendirikan</div>
        </div>
        <div className="stat-card">
          <div className="label">Expired</div>
          <div className="value" style={{ color: "var(--danger)" }}>
            {fmt(expired)}
          </div>
          <div className="desc">perlu pemusnahan</div>
        </div>
        <div className="stat-card">
          <div className="label">SBBK Terbit</div>
          <div className="value">{fmt(sbbkTerbit)}</div>
          <div className="desc">{fmt(sbbkVoid)} void</div>
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
            {fmt(totalVarianceTerakhir)}
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
          <h3 style={{ fontSize: 15 }}>Perhatian Pimpinan — Koreksi Terbaru</h3>
          <button
            className="btn btn-sm no-print"
            onClick={() => navigate("/pimpinan/transaksi")}
          >
            Lihat Semua
          </button>
        </div>
        {koreksiTerbaru.length === 0 ? (
          <div className="empty-state">
            Tidak ada koreksi transaksi tercatat.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jenis</th>
                  <th>Referensi</th>
                  <th>Obat</th>
                  <th>Jumlah</th>
                  <th>Alasan</th>
                  <th>Petugas</th>
                </tr>
              </thead>
              <tbody>
                {koreksiTerbaru.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                      {r.tanggal}
                    </td>
                    <td>
                      <span
                        className={`badge ${r.jenis === "Void" ? "badge-danger" : "badge-warning"}`}
                      >
                        {r.jenis}
                      </span>
                    </td>
                    <td>
                      <code>{r.referensi}</code>
                    </td>
                    <td>{r.namaObat}</td>
                    <td>{fmt(r.jumlah)}</td>
                    <td style={{ fontSize: 12 }}>{r.alasan}</td>
                    <td>{r.petugas}</td>
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
            Batch Kritis (Karantina / Expired / Expiry Dekat)
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
                  <th>Sisa Hari</th>
                  <th>Stok</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {batchKritis.map((b) => {
                  const d = daysUntil(b.expiry);
                  return (
                    <tr key={b.id}>
                      <td>{b.namaObat}</td>
                      <td>
                        <code>{b.noBatch}</code>
                      </td>
                      <td>{b.expiry}</td>
                      <td>
                        <span
                          className={`badge ${d < 0 ? "badge-danger" : d <= 90 ? "badge-danger" : "badge-warning"}`}
                        >
                          {d < 0 ? "expired" : `${d} hari`}
                        </span>
                      </td>
                      <td>
                        {fmt(b.stok)} {b.satuan}
                      </td>
                      <td>
                        <span
                          className={`badge ${b.status === "normal" ? "badge-success" : b.status === "karantina" ? "badge-warning" : "badge-danger"}`}
                        >
                          {b.status}
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
