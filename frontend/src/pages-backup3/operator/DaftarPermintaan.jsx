import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPermintaan } from "../../data/mockOperator";

const STATUS_LABEL = { pending: "Menunggu", disetujui: "Disetujui", selesai: "Selesai" };
const STATUS_CLASS = { pending: "badge-warning", disetujui: "badge-info", selesai: "badge-success" };

export default function DaftarPermintaanOperator() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const filtered = mockPermintaan
    .filter((p) => !filterStatus || p.status === filterStatus)
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.nomorSurat.toLowerCase().includes(q) || p.kabKota.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      // Pending di atas
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.tanggal) - new Date(a.tanggal);
    });

  const pendingCount = mockPermintaan.filter((p) => p.status === "pending").length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Permintaan Kab/Kota</h2>
          <p>Daftar permintaan obat dari Instalasi Farmasi Kabupaten/Kota. Tinjau dan buatkan SBBK.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Menunggu Tindakan</div>
          <div className="value" style={{ color: "var(--warning)" }}>{pendingCount}</div>
          <div className="desc">belum direview</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Permintaan</div>
          <div className="value">{mockPermintaan.length}</div>
          <div className="desc">semua permintaan</div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari nomor surat atau kab/kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="disetujui">Disetujui</option>
            <option value="selesai">Selesai</option>
          </select>
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>{filtered.length} permintaan</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nomor Surat</th>
                <th>Tanggal</th>
                <th>Kab/Kota</th>
                <th style={{ textAlign: "center" }}>Jumlah Item</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">Tidak ada permintaan yang sesuai filter.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    style={p.status === "pending" ? { background: "#fffaeb" } : {}}
                  >
                    <td><code>{p.nomorSurat}</code></td>
                    <td style={{ whiteSpace: "nowrap" }}>{p.tanggal}</td>
                    <td>{p.kabKota}</td>
                    <td style={{ textAlign: "center" }}>{p.items.length}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate(`/operator/permintaan/${p.id}`)}
                      >
                        {p.status === "pending" ? "Tinjau" : "Lihat"}
                      </button>
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