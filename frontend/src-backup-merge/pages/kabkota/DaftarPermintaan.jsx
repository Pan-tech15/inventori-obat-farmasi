import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPermintaan } from "../../data/mockOperator";

const STATUS_LABEL = { pending: "Menunggu", disetujui: "Disetujui", selesai: "Selesai" };
const STATUS_CLASS = { pending: "badge-warning", disetujui: "badge-info", selesai: "badge-success" };

export default function DaftarPermintaanKabKota() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const kabKota = session.kabKota || "";

  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const filtered = mockPermintaan
    .filter((p) => p.kabKota === kabKota)
    .filter((p) => !filterStatus || p.status === filterStatus)
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.nomorSurat.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Permintaan Saya</h2>
          <p>Daftar permintaan obat yang Anda ajukan ke Dinas Kesehatan Provinsi</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/kabkota/permintaan/baru")}
        >
          + Buat Permintaan
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari nomor surat..."
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
                <th style={{ textAlign: "center" }}>Jumlah Item</th>
                <th>Status</th>
                <th>Catatan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">Belum ada permintaan yang sesuai.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td><code>{p.nomorSurat}</code></td>
                    <td style={{ whiteSpace: "nowrap" }}>{p.tanggal}</td>
                    <td style={{ textAlign: "center" }}>{p.items.length}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{p.catatan || "-"}</td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate(`/kabkota/permintaan/${p.id}`)}
                      >
                        Lihat
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