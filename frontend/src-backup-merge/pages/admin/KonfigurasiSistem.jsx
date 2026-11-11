import { useState } from "react";

export default function KonfigurasiSistem() {
  const [config, setConfig] = useState({
    expiryWarningFast: 7,
    expiryWarningSlow: 3,
    expiryCritical: 3,
    stokMinimumDefault: 3,
    formatSBBK: "SBBK-{YYYY}-{NNNN}",
    formatPenerimaan: "TERIMA-{YYYY}-{NNNN}",
    kategoriDefault: "Fast Moving",
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setConfig({ ...config, [key]: value });
    setSaved(false);
  };

  const handleSave = () => {
    // Nanti dikirim ke backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Konfigurasi Sistem</h2>
          <p>Ambang notifikasi, batas minimum, dan format penomoran dokumen.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          Simpan Konfigurasi
        </button>
      </div>

      {saved && (
        <div
          style={{
            background: "#ecfdf3",
            color: "#067647",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          Konfigurasi berhasil disimpan (simulasi lokal).
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>
          Notifikasi Kedaluwarsa
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Ambang Peringatan Awal — Fast Moving (bulan)</label>
            <input
              type="number"
              value={config.expiryWarningFast}
              onChange={(e) =>
                handleChange("expiryWarningFast", Number(e.target.value))
              }
            />
            <small style={{ color: "var(--gray-600)" }}>
              Warna kuning di dashboard
            </small>
          </div>
          <div className="form-group">
            <label>Ambang Peringatan Awal — Slow Moving (bulan)</label>
            <input
              type="number"
              value={config.expiryWarningSlow}
              onChange={(e) =>
                handleChange("expiryWarningSlow", Number(e.target.value))
              }
            />
            <small style={{ color: "var(--gray-600)" }}>
              Warna kuning di dashboard
            </small>
          </div>
          <div className="form-group">
            <label>Ambang Kritis (bulan)</label>
            <input
              type="number"
              value={config.expiryCritical}
              onChange={(e) =>
                handleChange("expiryCritical", Number(e.target.value))
              }
            />
            <small style={{ color: "var(--gray-600)" }}>
              Warna merah, perlu tindakan karantina
            </small>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Stok & Kategori</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Batas Minimum Stok Default (bulan pemakaian)</label>
            <input
              type="number"
              value={config.stokMinimumDefault}
              onChange={(e) =>
                handleChange("stokMinimumDefault", Number(e.target.value))
              }
            />
          </div>
          <div className="form-group">
            <label>Kategori Default Obat Baru</label>
            <select
              value={config.kategoriDefault}
              onChange={(e) => handleChange("kategoriDefault", e.target.value)}
            >
              <option>Fast Moving</option>
              <option>Slow Moving</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Format Penomoran</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Format Nomor SBBK</label>
            <input
              value={config.formatSBBK}
              onChange={(e) => handleChange("formatSBBK", e.target.value)}
            />
            <small style={{ color: "var(--gray-600)" }}>
              {"{YYYY}"} = tahun, {"{NNNN}"} = urutan
            </small>
          </div>
          <div className="form-group">
            <label>Format Nomor Penerimaan</label>
            <input
              value={config.formatPenerimaan}
              onChange={(e) => handleChange("formatPenerimaan", e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
