import { useState, useEffect } from "react";
import { mockLoginHistory } from "../../data/mockData";

export default function RiwayatLogin() {
  // Gabungkan mock + log dari localStorage (hasil login di halaman Login)
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");

  useEffect(() => {
    const localHistory = JSON.parse(
      localStorage.getItem("loginHistory") || "null",
    );
    if (localHistory && localHistory.length > 0) {
      setHistory(localHistory);
    } else {
      setHistory(mockLoginHistory);
    }
  }, []);

  const userList = [...new Set(history.map((h) => h.username))];

  const filtered = history.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      h.username.toLowerCase().includes(q) ||
      (h.nama || "").toLowerCase().includes(q) ||
      (h.perangkat || "").toLowerCase().includes(q);
    const matchStatus = !filterStatus || h.status === filterStatus;
    const matchUser = !filterUser || h.username === filterUser;
    return matchSearch && matchStatus && matchUser;
  });

  const totalBerhasil = history.filter((h) => h.status === "Berhasil").length;
  const totalGagal = history.filter((h) => h.status === "Gagal").length;

  const handleExport = () => {
    alert(`Ekspor ${filtered.length} baris ke CSV — implementasi nanti.`);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Riwayat Login</h2>
          <p>
            Log percobaan login ke sistem. Halaman ini membantu mendeteksi akses
            mencurigakan. Read-only.
          </p>
        </div>
        <button className="btn" onClick={handleExport}>
          Ekspor CSV
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Login</div>
          <div className="value">{history.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Berhasil</div>
          <div className="value" style={{ color: "var(--success)" }}>
            {totalBerhasil}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Gagal</div>
          <div className="value" style={{ color: "var(--danger)" }}>
            {totalGagal}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari username, nama, perangkat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="">Semua Pengguna</option>
            {userList.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option>Berhasil</option>
            <option>Gagal</option>
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
                <th>No</th>
                <th>Waktu</th>
                <th>Username</th>
                <th>Nama</th>
                <th>Perangkat / IP</th>
                <th>Status</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      Tidak ada riwayat login yang sesuai filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((h, i) => (
                  <tr key={h.id}>
                    <td>{i + 1}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{h.waktu}</td>
                    <td>
                      <code>{h.username}</code>
                    </td>
                    <td>{h.nama || "-"}</td>
                    <td style={{ fontSize: 12 }}>{h.perangkat}</td>
                    <td>
                      <span
                        className={`badge ${h.status === "Berhasil" ? "badge-success" : "badge-danger"}`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td>{h.keterangan || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ background: "var(--gray-50)" }}>
        <p style={{ fontSize: 12, color: "var(--gray-600)" }}>
          <strong>Catatan implementasi:</strong> Data di halaman ini diambil
          dari <code>localStorage</code> jika ada, atau dari mock data. Di
          produksi, riwayat login dicatat oleh backend (ExpressJS) ke
          PostgreSQL, bukan oleh frontend, agar tidak dapat dimanipulasi
          pengguna.
        </p>
      </div>
    </>
  );
}
