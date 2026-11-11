import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// ============================================================
// ADMIN
// ============================================================
import AdminDashboard from "./pages/admin/Dashboard";
import ManajemenPengguna from "./pages/admin/ManajemenPengguna";
import MasterObat from "./pages/admin/MasterObat";
import MasterReferensi from "./pages/admin/MasterReferensi";
import KonfigurasiSistem from "./pages/admin/KonfigurasiSistem";
import AuditTrail from "./pages/admin/AuditTrail";
import BackupRestore from "./pages/admin/BackupRestore";
import RiwayatLogin from "./pages/admin/RiwayatLogin";

// ============================================================
// OPERATOR
// ============================================================
import OpDashboard from "./pages/operator/Dashboard";
import DaftarPenerimaan from "./pages/operator/DaftarPenerimaan";
import FormPenerimaan from "./pages/operator/FormPenerimaan";
import FormSBBK from "./pages/operator/FormSBBK";
import DaftarSBBK from "./pages/operator/DaftarSBBK";
import DetailSBBK from "./pages/operator/DetailSBBK";
import StokBatch from "./pages/operator/StokBatch";
import KartuStok from "./pages/operator/KartuStok";
import PenyesuaianStok from "./pages/operator/PenyesuaianStok";
import KarantinaExpiry from "./pages/operator/KarantinaExpiry";
import Laporan from "./pages/operator/Laporan";
import RiwayatTransaksi from "./pages/operator/RiwayatTransaksi";

// Batch 2: Permintaan Operator
import OperatorDaftarPermintaan from "./pages/operator/DaftarPermintaan";
import OperatorDetailPermintaan from "./pages/operator/DetailPermintaan";

// ============================================================
// PIMPINAN
// ============================================================
import PimpinanDashboard from "./pages/pimpinan/Dashboard";
import MonitoringPersediaan from "./pages/pimpinan/MonitoringPersediaan";
import MonitoringTransaksi from "./pages/pimpinan/MonitoringTransaksi";
import LaporanEkspor from "./pages/pimpinan/LaporanEkspor";

// ============================================================
// KAB/KOTA (Batch 2)
// ============================================================
import KabKotaDashboard from "./pages/kabkota/Dashboard";
import KabKotaDaftarPermintaan from "./pages/kabkota/DaftarPermintaan";
import KabKotaFormPermintaan from "./pages/kabkota/FormPermintaan";
import KabKotaDetailPermintaan from "./pages/kabkota/DetailPermintaan";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ==================================================== */}
      {/* ADMIN                                                */}
      {/* ==================================================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="pengguna" element={<ManajemenPengguna />} />
        <Route path="master-obat" element={<MasterObat />} />
        <Route path="master-referensi" element={<MasterReferensi />} />
        <Route path="konfigurasi" element={<KonfigurasiSistem />} />
        <Route path="audit-trail" element={<AuditTrail />} />
        <Route path="backup" element={<BackupRestore />} />
        <Route path="riwayat-login" element={<RiwayatLogin />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ==================================================== */}
      {/* OPERATOR                                             */}
      {/* ==================================================== */}
      <Route
        path="/operator"
        element={
          <ProtectedRoute allowedRole="Operator">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/operator/dashboard" replace />} />
        <Route path="dashboard" element={<OpDashboard />} />

        {/* Permintaan Kab/Kota (Batch 2) */}
        <Route path="permintaan" element={<OperatorDaftarPermintaan />} />
        <Route path="permintaan/:id" element={<OperatorDetailPermintaan />} />

        {/* Penerimaan */}
        <Route path="penerimaan" element={<DaftarPenerimaan />} />
        <Route path="penerimaan/baru" element={<FormPenerimaan />} />
        <Route path="penerimaan/:id" element={<FormPenerimaan />} />

        {/* SBBK / Distribusi */}
        <Route path="sbbk" element={<DaftarSBBK />} />
        <Route path="sbbk/baru" element={<FormSBBK />} />
        <Route path="sbbk/draft/:id" element={<FormSBBK />} />
        <Route path="sbbk/:id" element={<DetailSBBK />} />

        {/* Persediaan */}
        <Route path="stok" element={<StokBatch />} />
        <Route path="kartu-stok" element={<KartuStok />} />
        <Route path="karantina" element={<KarantinaExpiry />} />

        {/* Stock Opname */}

        {/* Penyesuaian Stok */}
        <Route path="penyesuaian" element={<PenyesuaianStok />} />

        {/* Riwayat */}
        <Route path="riwayat-transaksi" element={<RiwayatTransaksi />} />

        {/* Laporan */}
        <Route path="laporan" element={<Laporan />} />

        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ==================================================== */}
      {/* PIMPINAN                                             */}
      {/* ==================================================== */}
      <Route
        path="/pimpinan"
        element={
          <ProtectedRoute allowedRole="Pimpinan">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/pimpinan/dashboard" replace />} />
        <Route path="dashboard" element={<PimpinanDashboard />} />
        <Route path="persediaan" element={<MonitoringPersediaan />} />
        <Route path="transaksi" element={<MonitoringTransaksi />} />
        <Route path="laporan" element={<LaporanEkspor />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ==================================================== */}
      {/* KAB/KOTA (Batch 2)                                   */}
      {/* ==================================================== */}
      <Route
        path="/kabkota"
        element={
          <ProtectedRoute allowedRole="Kab/Kota">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/kabkota/dashboard" replace />} />
        <Route path="dashboard" element={<KabKotaDashboard />} />
        <Route path="permintaan" element={<KabKotaDaftarPermintaan />} />
        <Route path="permintaan/baru" element={<KabKotaFormPermintaan />} />
        <Route path="permintaan/:id" element={<KabKotaDetailPermintaan />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ==================================================== */}
      {/* FALLBACK                                             */}
      {/* ==================================================== */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
