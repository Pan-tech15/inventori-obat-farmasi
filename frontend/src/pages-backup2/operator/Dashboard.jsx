import { useNavigate } from "react-router-dom";
import {
  mockBatchObat,
  mockSBBK,
  mockPenerimaan,
  mockRiwayatTransaksi,
  mockAdjustment,
  mockPermintaan,
  getExpiryInfo,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

const isSameMonth = (tanggal, bulan, tahun) => {
  const d = new Date(tanggal);
  return d.getMonth() + 1 === bulan && d.getFullYear() === tahun;
};

const isSameYear = (tanggal, tahun) => {
  return new Date(tanggal).getFullYear() === tahun;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "{}");

  // Permintaan pending (snapshot, bukan periodik)
  const permintaanPending = mockPermintaan.filter((p) => p.status === "pending").length;

  // Stok menipis (snapshot): batch normal dengan stok < 500
  const stokMenipis = mockBatchObat
    .filter((b) => {
      const exp = getExpiryInfo(b);
      return exp.status === "normal" && b.stok < 500;
    })
    .sort((a, b) => a.stok - b.stok)
    .slice(0, 5);

  // Mendekati expiry (snapshot): batch normal dengan warna non-safe
  const mendekatiExpiry = mockBatchObat
    .filter((b) => {
      const exp = getExpiryInfo(b);
      return exp.status === "normal" && exp.color !== "safe";
    })
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry))
    .slice(0, 5);

  // Kedaluwarsa (snapshot)
  const expired = mockBatchObat.filter((b) => getExpiryInfo(b).status === "expired");

  // Penyesuaian bulan ini
  const penyesuaianBulanIni = mockAdjustment.filter((a) =>
    isSameMonth(a.tanggal, currentMonth, currentYear)
  );

  // Aktivitas transaksi bulan ini (terakhir 5)
  const aktivitasBulanIni = mockRiwayatTransaksi
    .filter((t) => isSameMonth(t.tanggal, currentMonth, currentYear))
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 5);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard Operator</h2>
          <p>Selamat datang, {session.nama || "Operator"} — ringkasan persediaan bulan {currentMonth}/{currentYear}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={() => navigate("/operator/penerimaan/baru")}>
            + Penerimaan
          </button>
          <button
            className="btn btn-primary"
            style={{ background: "var(--gray-800)", borderColor: "var(--gray-800)" }}
            onClick={() => navigate("/operator/sbbk/baru")}
          >
            + Terbitkan SBBK
          </button>
        </div>
      </div>

      {/* 4 KARTU — semua clickable */}
      <div className="stat-grid">
        <div
          className="stat-card"
          onClick={() => navigate("/operator/permintaan")}
          style={{ cursor: "pointer" }}
          title="Klik untuk lihat permintaan"
        >
          <div className="label">Permintaan Pending</div>
          <div className="value" style={{ color: "var(--warning)" }}>{permintaanPending}</div>
          <div className="desc">dari kab/kota, belum ditindaklanjuti</div>
        </div>
        <div
          className="stat-card"
          onClick={() => navigate("/operator/stok")}
          style={{ cursor: "pointer" }}
          title="Klik untuk lihat stok"
        >
          <div className="label">Stok Di Bawah Minimum</div>
          <div className="value" style={{ color: "var(--warning)" }}>{stokMenipis.length}</div>
          <div className="desc">batch perlu segera diisi</div>
        </div>
        <div
          className="stat-card"
          onClick={() => navigate("/operator/karantina")}
          style={{ cursor: "pointer" }}
          title="Klik untuk lihat peringatan kedaluwarsa"
        >
          <div className="label">Mendekati Kedaluwarsa</div>
          <div className="value" style={{ color: "var(--warning)" }}>{mendekatiExpiry.length + expired.length}</div>
          <div className="desc">{expired.length} sudah kedaluwarsa</div>
        </div>
        <div
          className="stat-card"
          onClick={() => navigate("/operator/penyesuaian")}
          style={{ cursor: "pointer" }}
          title="Klik untuk lihat penyesuaian stok"
        >
          <div className="label">Penyesuaian Stok</div>
          <div className="value" style={{ color: "var(--info)" }}>{penyesuaianBulanIni.length}</div>
          <div className="desc">bulan ini ({currentMonth}/{currentYear})</div>
        </div>
      </div>

      {/* Notifikasi — clickable */}
      {(permintaanPending > 0 || expired.length > 0) && (
        <div className="card" style={{ borderLeft: "4px solid var(--danger)", background: "#fef3f2" }}>
          <h3 style={{ fontSize: 14, color: "var(--danger)", marginBottom: 8 }}>⚠ Perlu Perhatian</h3>
          <ul style={{ paddingLeft: 20, fontSize: 13, color: "var(--gray-800)", lineHeight: 1.6 }}>
            {permintaanPending > 0 && (
              <li>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate("/operator/permintaan"); }}
                  style={{ color: "var(--danger)", textDecoration: "underline", cursor: "pointer" }}
                >
                  {permintaanPending} permintaan kab/kota belum ditindaklanjuti
                </a>
              </li>
            )}
            {expired.length > 0 && (
              <li>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate("/operator/karantina"); }}
                  style={{ color: "var(--danger)", textDecoration: "underline", cursor: "pointer" }}
                >
                  {expired.length} batch kedaluwarsa perlu dicatat pemusnahannya
                </a>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* 2 TABEL SIDE BY SIDE */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", marginBottom: "20px" }}>

        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15 }}>Stok Yang Dibawah Minimum</h3>
            <button className="btn btn-sm" onClick={() => navigate("/operator/stok")}>Lihat Semua</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Obat</th><th>Batch</th><th style={{ textAlign: "right" }}>Sisa Stok</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {stokMenipis.length === 0 ? (
                  <tr><td colSpan={4}><div className="empty-state" style={{ padding: 20 }}>Tidak ada stok menipis.</div></td></tr>
                ) : stokMenipis.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontSize: 12 }}><strong>{b.namaObat}</strong></td>
                    <td style={{ fontSize: 12 }}><code>{b.noBatch}</code></td>
                    <td style={{ textAlign: "right" }}>
                      <span className="badge badge-warning">{fmt(b.stok)} {b.satuan}</span>
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => navigate("/operator/penyesuaian")}>Lihat</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15 }}>Mendekati Kedaluwarsa</h3>
            <button className="btn btn-sm" onClick={() => navigate("/operator/karantina")}>Lihat Semua</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Obat</th><th>Expiry</th><th style={{ textAlign: "right" }}>Sisa Hari</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {mendekatiExpiry.length === 0 ? (
                  <tr><td colSpan={4}><div className="empty-state" style={{ padding: 20 }}>Tidak ada obat mendekati kedaluwarsa.</div></td></tr>
                ) : mendekatiExpiry.map((b) => {
                  const exp = getExpiryInfo(b);
                  return (
                    <tr key={b.id}>
                      <td style={{ fontSize: 12 }}>
                        <strong>{b.namaObat}</strong><br/>
                        <code style={{ fontSize: 11 }}>{b.noBatch}</code>
                      </td>
                      <td style={{ fontSize: 12 }}>{b.expiry}</td>
                      <td style={{ textAlign: "right" }}>
                        <span className={`badge ${exp.badgeClass}`}>{exp.label}</span>
                      </td>
                      <td>
                        <button className="btn btn-sm" onClick={() => navigate("/operator/sbbk/baru")}>Distribusi</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* AKTIVITAS BULAN INI */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 15 }}>Aktivitas Transaksi Bulan Ini ({currentMonth}/{currentYear})</h3>
          <button className="btn btn-sm" onClick={() => navigate("/operator/riwayat-transaksi")}>Buka Riwayat</button>
        </div>
        {aktivitasBulanIni.length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>Belum ada transaksi bulan ini.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Waktu</th><th>Jenis</th><th>Referensi</th><th>Obat</th><th style={{ textAlign: "right" }}>Mutasi</th></tr>
              </thead>
              <tbody>
                {aktivitasBulanIni.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{r.tanggal}</td>
                    <td><span className={`badge ${r.jenis === "Penerimaan" ? "badge-success" : r.jenis === "SBBK" ? "badge-info" : r.jenis === "Void" ? "badge-danger" : "badge-warning"}`}>{r.jenis}</span></td>
                    <td><code>{r.referensi}</code></td>
                    <td style={{ fontSize: 12 }}>{r.namaObat}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold", color: r.masuk > 0 ? "var(--success)" : "var(--danger)" }}>
                      {r.masuk > 0 ? `+${fmt(r.masuk)}` : `-${fmt(r.keluar)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}