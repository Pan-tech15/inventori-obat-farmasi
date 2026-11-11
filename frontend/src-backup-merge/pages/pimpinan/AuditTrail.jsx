import { useState } from "react";
import { mockAuditTrail } from "../../data/mockData";
import { exportCSV, exportPDFViaPrint } from "../../utils/export";

export default function AuditTrail() {
  const [search, setSearch] = useState("");
  const [filterModul, setFilterModul] = useState("");
  const [filterAksi, setFilterAksi] = useState("");
  const [periodeAwal, setPeriodeAwal] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");

  const modulList = [...new Set(mockAuditTrail.map((a) => a.modul))];
  const aksiList = [...new Set(mockAuditTrail.map((a) => a.aksi))];

  const filtered = mockAuditTrail.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.user.toLowerCase().includes(q) ||
      a.entitas.toLowerCase().includes(q) ||
      a.aksi.toLowerCase().includes(q);
    const matchModul = !filterModul || a.modul === filterModul;
    const matchAksi = !filterAksi || a.aksi === filterAksi;
    const tgl = a.waktu.slice(0, 10);
    const matchAwal = !periodeAwal || tgl >= periodeAwal;
    const matchAkhir = !periodeAkhir || tgl <= periodeAkhir;
    return matchSearch && matchModul && matchAksi && matchAwal && matchAkhir;
  });

  const handleExportCSV = () => {
    exportCSV(
      `Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`,
      ["Waktu", "User", "Modul", "Aksi", "Entitas", "Alasan", "IP"],
      filtered.map((a) => [
        a.waktu,
        a.user,
        a.modul,
        a.aksi,
        a.entitas,
        a.alasan,
        a.ip,
      ]),
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Audit Trail</h2>
          <p>
            Log semua aksi sistem lintas modul. Read-only dan tidak dapat
            dihapus.
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

      <div className="card">
        <div className="filter-bar no-print">
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
          <select
            value={filterAksi}
            onChange={(e) => setFilterAksi(e.target.value)}
          >
            <option value="">Semua Aksi</option>
            {aksiList.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <input
            type="date"
            value={periodeAwal}
            onChange={(e) => setPeriodeAwal(e.target.value)}
            title="Dari tanggal"
          />
          <input
            type="date"
            value={periodeAkhir}
            onChange={(e) => setPeriodeAkhir(e.target.value)}
            title="Sampai tanggal"
          />
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
                    <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                      {a.waktu}
                    </td>
                    <td>
                      <code>{a.user}</code>
                    </td>
                    <td>{a.modul}</td>
                    <td>
                      <span className="badge badge-gray">{a.aksi}</span>
                    </td>
                    <td>{a.entitas}</td>
                    <td style={{ fontSize: 12 }}>{a.alasan}</td>
                    <td>
                      <code style={{ fontSize: 12 }}>{a.ip}</code>
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
