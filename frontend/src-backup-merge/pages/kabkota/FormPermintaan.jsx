import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockObat } from "../../data/mockData";
import { getObatInfo } from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

export default function FormPermintaanKabKota() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const kabKota = session.kabKota || "";

  const today = new Date().toISOString().slice(0, 10);
  const [nomorSurat, setNomorSurat] = useState("");
  const [tanggal, setTanggal] = useState(today);
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState([{ obatKode: "", jumlahDiminta: 0 }]);

  const updateItem = (idx, field, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };
  const addItem = () => setItems([...items, { obatKode: "", jumlahDiminta: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const validItems = items.filter((i) => i.obatKode && Number(i.jumlahDiminta) > 0);
  const canSubmit = nomorSurat.trim() !== "" && validItems.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    alert(
      `Permintaan ${nomorSurat} diajukan.\n` +
      `${validItems.length} item obat.\n` +
      `Status: Menunggu diproses Operator Provinsi.\n\n` +
      `(Simulasi — backend akan menyimpan ke database)`
    );
    navigate("/kabkota/permintaan");
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Buat Permintaan Baru</h2>
          <p>Ajukan permintaan obat ke Dinas Kesehatan Provinsi</p>
        </div>
        <button className="btn" onClick={() => navigate("/kabkota/permintaan")}>
          Kembali
        </button>
      </div>

      <div className="info-banner info">
        <strong>Catatan:</strong> Permintaan ini akan ditinjau oleh Operator Dinas Kesehatan Provinsi.
        Jumlah yang disetujui dapat berbeda dari jumlah yang diminta, bergantung pada ketersediaan stok.
      </div>

      <div className="card">
        <div className="section-title">Informasi Permintaan</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Pengirim</label>
            <input value={kabKota} disabled />
          </div>
          <div className="form-group">
            <label>Nomor Surat Permintaan *</label>
            <input
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              placeholder="Contoh: PRM/MND/2026/002"
            />
          </div>
          <div className="form-group">
            <label>Tanggal</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
          <div className="form-group full">
            <label>Catatan</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Kebutuhan triwulan berikutnya"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Item Obat yang Diminta</div>
          <button className="btn btn-sm" onClick={addItem}>+ Tambah Item</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Obat</th>
                <th>Jenis</th>
                <th style={{ textAlign: "right" }}>Jumlah Diminta *</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const info = it.obatKode ? getObatInfo(it.obatKode) : null;
                return (
                  <tr key={idx}>
                    <td>
                      <select
                        value={it.obatKode}
                        onChange={(e) => updateItem(idx, "obatKode", e.target.value)}
                        style={{ width: "100%", padding: "4px 8px" }}
                      >
                        <option value="">— Pilih Obat —</option>
                        {mockObat.filter((o) => o.status === "Aktif").map((o) => (
                          <option key={o.id} value={o.kode}>
                            {o.nama}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {info ? (
                        <span className={`badge ${info.jenis === "Program" ? "badge-info" : "badge-warning"}`}>
                          {info.jenis === "Program" ? `Program: ${info.program}` : "Buffer"}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--gray-400)" }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <input
                        type="number"
                        min={1}
                        value={it.jumlahDiminta}
                        onChange={(e) => updateItem(idx, "jumlahDiminta", e.target.value)}
                        style={{ width: 120, padding: "4px 8px", textAlign: "right" }}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="btn" onClick={() => navigate("/kabkota/permintaan")}>
          Batal
        </button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
          Ajukan Permintaan
        </button>
      </div>
      {!canSubmit && (
        <div style={{ textAlign: "right", fontSize: 11, color: "var(--gray-600)", marginTop: 6 }}>
          Nomor surat dan minimal 1 item wajib diisi.
        </div>
      )}
    </>
  );
}