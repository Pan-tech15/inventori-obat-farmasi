import { useNavigate } from "react-router-dom";
import { mockPermintaan } from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

const STATUS_LABEL = {
  pending: "Menunggu",
  disetujui: "Disetujui",
  selesai: "Selesai",
};
const STATUS_CLASS = {
  pending: "badge-warning",
  disetujui: "badge-info",
  selesai: "badge-success",
};

export default function DashboardKabKota() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const kabKota = session.kabKota || "";

  const permintaanSaya = mockPermintaan.filter((p) => p.kabKota === kabKota);
  const pending = permintaanSaya.filter((p) => p.status === "pending").length;
  const disetujui = permintaanSaya.filter((p) => p.status === "disetujui").length;
  const selesai = permintaanSaya.filter((p) => p.status === "selesai").length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Beranda {kabKota}</h2>
          <p>Selamat datang, {session.nama || "Staf"} — kelola permintaan obat Anda</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/kabkota/permintaan/baru")}
        >
          + Buat Permintaan
        </button>
      </div>

      <div className="stat-grid">
        <div
          className="stat-card"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/kabkota/permintaan")}
        >
          <div className="label">Total Permintaan</div>
          <div className="value">{permintaanSaya.length}</div>
          <div className="desc">seluruh permintaan saya</div>
        </div>
        <div className="stat-card">
          <div className="label">Menunggu</div>
          <div className="value" style={{ color: "var(--warning)" }}>{pending}</div>
          <div className="desc">belum diproses operator</div>
        </div>
        <div className="stat-card">
          <div className="label">Disetujui</div>
          <div className="value" style={{ color: "var(--info)" }}>{disetujui}</div>
          <div className="desc">sudah disetujui, belum dikirim</div>
        </div>
        <div className="stat-card">
          <div className="label">Selesai</div>
          <div className="value" style={{ color: "var(--success)" }}>{selesai}</div>
          <div className="desc">sudah dikirim ke IFK</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 15 }}>Permintaan Terbaru</h3>
          <button className="btn btn-sm" onClick={() => navigate("/kabkota/permintaan")}>
            Lihat Semua
          </button>
        </div>
        {permintaanSaya.length === 0 ? (
          <div className="empty-state">
            Belum ada permintaan. Klik "+ Buat Permintaan" untuk memulai.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nomor Surat</th>
                  <th>Tanggal</th>
                  <th style={{ textAlign: "center" }}>Item</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {permintaanSaya.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td><code>{p.nomorSurat}</code></td>
                    <td style={{ whiteSpace: "nowrap" }}>{p.tanggal}</td>
                    <td style={{ textAlign: "center" }}>{p.items.length}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate(`/kabkota/permintaan/${p.id}`)}
                      >
                        Lihat
                      </button>
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