import {
  mockUsers,
  mockObat,
  mockBackup,
  mockLoginHistory,
} from "../../data/mockData";

export default function Dashboard() {
  const aktif = mockUsers.filter((u) => u.status === "Aktif").length;
  const nonaktif = mockUsers.filter((u) => u.status === "Nonaktif").length;
  const obatAktif = mockObat.filter((o) => o.status === "Aktif").length;
  const backupTerakhir = mockBackup[0];
  const loginGagal = mockLoginHistory.filter(
    (l) => l.status === "Gagal",
  ).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard Admin</h2>
          <p>Ringkasan administrasi sistem inventori obat</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Pengguna Aktif</div>
          <div className="value">{aktif}</div>
          <div className="desc">{nonaktif} pengguna nonaktif</div>
        </div>
        <div className="stat-card">
          <div className="label">Master Obat Aktif</div>
          <div className="value">{obatAktif}</div>
          <div className="desc">dari total {mockObat.length} obat</div>
        </div>
        <div className="stat-card">
          <div className="label">Backup Terakhir</div>
          <div className="value" style={{ fontSize: 16 }}>
            {backupTerakhir.waktu.split(" ")[0]}
          </div>
          <div className="desc">
            {backupTerakhir.nama} ({backupTerakhir.ukuran})
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Login Gagal (7 terakhir)</div>
          <div className="value">{loginGagal}</div>
          <div className="desc">periksa Riwayat Login</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12, fontSize: 15 }}>Pengingat Admin</h3>
        <ul
          style={{
            paddingLeft: 20,
            lineHeight: 2,
            fontSize: 13,
            color: "var(--gray-600)",
          }}
        >
          <li>
            Backup adalah <strong>kewajiban</strong> Admin. Lakukan minimal 1×
            sehari.
          </li>
          <li>
            Periksa <strong>Riwayat Login</strong> untuk mendeteksi percobaan
            login mencurigakan.
          </li>
          <li>
            Nonaktifkan pengguna yang tidak lagi bertugas — jangan dihapus.
          </li>
          <li>Setiap perubahan konfigurasi tercatat di Audit Trail.</li>
        </ul>
      </div>
    </>
  );
}
