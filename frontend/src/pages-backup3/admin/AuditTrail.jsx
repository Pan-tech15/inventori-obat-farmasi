import { useState } from "react";
import { mockAuditTrail } from "../../data/mockData";

export default function AuditTrail() {
  const [search, setSearch] = useState("");
  const [filterModul, setFilterModul] = useState("");

  const modulList = [...new Set(mockAuditTrail.map((a) => a.modul))];

  const filtered = mockAuditTrail.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.user.toLowerCase().includes(q) ||
      a.entitas.toLowerCase().includes(q) ||
      a.aksi.toLowerCase().includes(q);
    const matchModul = !filterModul || a.modul === filterModul;
    return matchSearch && matchModul;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Audit Trail</h2>
          <p>Log semua aksi sistem. Read-only dan tidak dapat dihapus.</p>
        </div>
        <button
          className="btn"
          onClick={() => alert("Ekspor — implementasi nanti")}
        >
          Ekspor CSV
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari user, entitas, aksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterModul}
            onChange={(e) => setFilterModul(e.target.value)}
          >
            <option value="">Semua Modul</option>
            {modulList.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
            {filtered.length} log
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>User</th>
                <th>Modul</th>
                <th>Aksi</th>
                <th>Entitas</th>
                <th>Alasan</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      Tidak ada log yang sesuai.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{a.waktu}</td>
                    <td>
                      <code>{a.user}</code>
                    </td>
                    <td>{a.modul}</td>
                    <td>
                      <span className="badge badge-gray">{a.aksi}</span>
                    </td>
                    <td>{a.entitas}</td>
                    <td>{a.alasan}</td>
                    <td>
                      <code>{a.ip}</code>
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
