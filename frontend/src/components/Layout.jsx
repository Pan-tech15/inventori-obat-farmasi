import { NavLink, Outlet, useNavigate } from "react-router-dom";

const menuAdmin = [
  { to: "/admin/dashboard", label: "Dashboard Sistem" },
  { section: "MONITORING" },
  { to: "/admin/monitoring-dashboard", label: "Dashboard Monitoring" },
  { to: "/admin/monitoring-persediaan", label: "Monitoring Persediaan" },
  { to: "/admin/monitoring-transaksi", label: "Monitoring Transaksi" },
  { to: "/admin/monitoring-laporan", label: "Laporan & Ekspor" },
  { section: "SISTEM" },
  { to: "/admin/pengguna", label: "Manajemen Pengguna" },
  { to: "/admin/master-obat", label: "Master Data Obat" },
  { to: "/admin/master-referensi", label: "Master Referensi" },
  { to: "/admin/konfigurasi", label: "Konfigurasi Sistem" },
  { to: "/admin/audit-trail", label: "Audit Trail" },
  { to: "/admin/backup", label: "Backup & Restore" },
  { to: "/admin/riwayat-login", label: "Riwayat Login" },
  { section: "AKUN" },
  { to: "/admin/profile", label: "Profil Saya" },
];

const menuOperator = [
  { to: "/operator/dashboard", label: "Beranda" },
  { section: "PERMINTAAN" },
  { to: "/operator/permintaan", label: "Permintaan Kab/Kota" },
  { section: "TRANSAKSI" },
  { to: "/operator/penerimaan", label: "Penerimaan Obat" },
  { to: "/operator/sbbk", label: "SBBK / Distribusi" },
  { section: "PERSEDIAAN" },
  { to: "/operator/stok", label: "Stok & Batch" },
  { to: "/operator/kartu-stok", label: "Kartu Stok" },
  { to: "/operator/karantina", label: "Peringatan Kedaluwarsa" },
  { section: "PENYESUAIAN" },
  { to: "/operator/penyesuaian", label: "Stock Opname & Penyesuaian" },
  { section: "RIWAYAT" },
  { to: "/operator/riwayat-transaksi", label: "Riwayat Transaksi" },
  { section: "LAINNYA" },
  { to: "/operator/laporan", label: "Laporan" },
  { to: "/operator/profile", label: "Profil Saya" },
];

const menuKabKota = [
  { to: "/kabkota/dashboard", label: "Beranda" },
  { section: "PERMINTAAN" },
  { to: "/kabkota/permintaan", label: "Permintaan Saya" },
  { to: "/kabkota/permintaan/baru", label: "Buat Permintaan" },
  { section: "AKUN" },
  { to: "/kabkota/profile", label: "Profil Saya" },
];

export default function Layout() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "{}");

  const menu =
    session.role === "Operator"
      ? menuOperator
      : session.role === "Kab/Kota"
        ? menuKabKota
        : menuAdmin;

  const handleLogout = () => {
    localStorage.removeItem("session");
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          Inventori Obat Farmasi
          <small>Dinkes Prov. Sulawesi Utara</small>
        </div>
        <nav>
          {menu.map((item, i) =>
            item.section ? (
              <div
                key={i}
                style={{
                  padding: "12px 18px 4px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: 1,
                }}
              >
                {item.section}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="sidebar-footer">Role: {session.role || "-"}</div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="page-title">{session.role || "Aplikasi"}</div>
          <div className="user-info">
            <span>{session.nama || "-"}</span>
            <div className="avatar">{(session.nama || "U").charAt(0)}</div>
            <button onClick={handleLogout}>Keluar</button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
