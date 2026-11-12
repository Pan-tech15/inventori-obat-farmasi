import { useState } from "react";

export default function KonfigurasiSistem() {
  const [config, setConfig] = useState({
    expiryWarning: 8,
    expiryCritical: 6,
    stokMinimumDefault: 3,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setConfig({ ...config, [key]: value });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Konfigurasi Sistem</h2>
          <p>Ambang notifikasi kedaluwarsa dan batas minimum stok.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>Simpan Konfigurasi</button>
      </div>

      {saved && (
        <div style={{ background: "#ecfdf3", color: "#067647", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          Konfigurasi berhasil disimpan (simulasi lokal).
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Notifikasi Kedaluwarsa</h3>
        <p style={{ fontSize: 12, color: "var(--gray-600)", marginBottom: 12 }}>
          Ambang berlaku seragam untuk semua jenis obat.
        </p>
        <div className="form-grid">
          <div className="form-group">
            <label>Ambang Peringatan Awal (bulan)</label>
            <input
              type="number"
              value={config.expiryWarning}
              onChange={(e) => handleChange("expiryWarning", Number(e.target.value))}
            />
            <small style={{ color: "var(--gray-600)" }}>Warna kuning di dashboard</small>
          </div>
          <div className="form-group">
            <label>Ambang Kritis (bulan)</label>
            <input
              type="number"
              value={config.expiryCritical}
              onChange={(e) => handleChange("expiryCritical", Number(e.target.value))}
            />
            <small style={{ color: "var(--gray-600)" }}>Warna merah, perlu tindakan</small>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Stok</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Batas Minimum Stok Default (bulan pemakaian)</label>
            <input
              type="number"
              value={config.stokMinimumDefault}
              onChange={(e) => handleChange("stokMinimumDefault", Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </>
  );
}