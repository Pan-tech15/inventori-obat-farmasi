import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  mockBatchObat,
  mockPermintaan,
  getExpiryInfo,
} from "../../data/mockOperator";
import { mockReferensi } from "../../data/mockData";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

export default function FormSBBK() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialPermintaanId = params.get("permintaan") || "";

  const [permintaanId, setPermintaanId] = useState(initialPermintaanId);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [allocations, setAllocations] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(null);

  const permintaanTersedia = mockPermintaan.filter(
    (p) => p.status === "pending" || p.status === "disetujui"
  );
  const selectedPermintaan = permintaanId
    ? mockPermintaan.find((p) => p.id === Number(permintaanId))
    : null;

  // FEFO: batch dengan expiry terdekat, exclude expired
  const getFEFOBatches = (obatId) =>
    mockBatchObat
      .filter((b) => b.obatId === obatId && b.stok > 0)
      .filter((b) => getExpiryInfo(b).status !== "expired")
      .sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

  // Auto-alokasi saat permintaan dipilih
  useEffect(() => {
    if (!selectedPermintaan) {
      setAllocations({});
      return;
    }
    const init = {};
    selectedPermintaan.items.forEach((item, idx) => {
      const fefoBatches = getFEFOBatches(item.obatId);
      let needed = item.jumlahDiminta;
      const allocs = [];
      for (const batch of fefoBatches) {
        if (needed <= 0) break;
        const take = Math.min(batch.stok, needed);
        allocs.push({ batchId: batch.id, jumlah: take });
        needed -= take;
      }
      init[idx] = allocs.length > 0 ? allocs : [{ batchId: "", jumlah: item.jumlahDiminta }];
    });
    setAllocations(init);
  }, [permintaanId]);

  const updateAlloc = (itemIdx, allocIdx, field, value) => {
    const next = { ...allocations };
    const itemAllocs = [...(next[itemIdx] || [])];
    itemAllocs[allocIdx] = { ...itemAllocs[allocIdx], [field]: value };
    next[itemIdx] = itemAllocs;
    setAllocations(next);
  };

  const addAllocRow = (itemIdx) => {
    const next = { ...allocations };
    next[itemIdx] = [...(next[itemIdx] || []), { batchId: "", jumlah: 0 }];
    setAllocations(next);
  };

  const removeAllocRow = (itemIdx, allocIdx) => {
    const next = { ...allocations };
    next[itemIdx] = next[itemIdx].filter((_, i) => i !== allocIdx);
    setAllocations(next);
  };

  // Validasi per item: total alokasi == jumlah diminta
  const getItemValidation = (item, itemIdx) => {
    const allocs = allocations[itemIdx] || [];
    const totalAlokasi = allocs.reduce((s, a) => s + Number(a.jumlah || 0), 0);
    const cukupJumlah = totalAlokasi === item.jumlahDiminta;
    const batchValid = allocs.every((a) => {
      if (!a.batchId) return false;
      const b = mockBatchObat.find((x) => x.id === Number(a.batchId));
      return b && Number(a.jumlah) <= b.stok && Number(a.jumlah) > 0;
    });
    return {
      totalAlokasi,
      cukupJumlah,
      batchValid,
      valid: cukupJumlah && batchValid,
    };
  };

  const allItemsValid =
    selectedPermintaan &&
    selectedPermintaan.items.every((item, idx) => {
      const v = getItemValidation(item, idx);
      return v.valid;
    });

  const canTerbit = selectedPermintaan && allItemsValid && tanggal;

  const handleTerbitkan = () => {
    if (!canTerbit) return;
    setShowConfirm(true);
  };

  const doTerbitkan = () => {
    const nomor = `SBBK-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setSaved({ nomor, totalItem: selectedPermintaan.items.length });
    // Tandai permintaan selesai via localStorage (simulasi)
    const selesaiIds = JSON.parse(localStorage.getItem("permintaanSelesai") || "[]");
    if (!selesaiIds.includes(selectedPermintaan.id)) {
      selesaiIds.push(selectedPermintaan.id);
      localStorage.setItem("permintaanSelesai", JSON.stringify(selesaiIds));
    }
    setShowConfirm(false);
  };

  if (saved) {
    return (
      <>
        <div className="page-header"><div><h2>SBBK Berhasil Diterbitkan</h2></div></div>
        <div className="info-banner success">
          <strong>✓ SBBK diterbitkan.</strong> Stok sudah berkurang. Permintaan {selectedPermintaan.nomorSurat} ditandai Selesai.
        </div>
        <div className="card">
          <dl className="detail-list">
            <dt>Nomor SBBK</dt><dd><code>{saved.nomor}</code></dd>
            <dt>Untuk Permintaan</dt><dd><code>{selectedPermintaan.nomorSurat}</code></dd>
            <dt>IFK Tujuan</dt><dd>{selectedPermintaan.kabKota}</dd>
            <dt>Tanggal Terbit</dt><dd>{tanggal}</dd>
            <dt>Total Item</dt><dd>{saved.totalItem} jenis obat</dd>
            <dt>Status Stok</dt><dd><span className="badge badge-success">Berkurang</span></dd>
          </dl>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-primary" onClick={() => alert("Unduh PDF — implementasi backend nanti")}>
            Unduh PDF SBBK
          </button>
          <button className="btn" onClick={() => navigate("/operator/sbbk")}>
            Lihat Daftar SBBK
          </button>
          <button className="btn" onClick={() => navigate("/operator/permintaan")}>
            Kembali ke Permintaan
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Penerbitan SBBK</h2>
          <p>SBBK dibuat berdasarkan permintaan kab/kota. Sistem otomatis mengalokasikan batch dengan FEFO.</p>
        </div>
        <button className="btn" onClick={() => navigate("/operator/sbbk")}>
          Kembali
        </button>
      </div>

      <div className="card">
        <div className="section-title">Pilih Permintaan *</div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Permintaan Kab/Kota (wajib) *</label>
            <select
              value={permintaanId}
              onChange={(e) => setPermintaanId(e.target.value)}
            >
              <option value="">— Pilih Permintaan —</option>
              {permintaanTersedia.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nomorSurat} — {p.kabKota} — {p.tanggal}
                </option>
              ))}
            </select>
          </div>
          {selectedPermintaan && (
            <>
              <div className="form-group">
                <label>Pengirim</label>
                <input value={selectedPermintaan.kabKota} disabled />
              </div>
              <div className="form-group">
                <label>Tanggal Terbit SBBK</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </div>
            </>
          )}
        </div>
      </div>

      {!selectedPermintaan && (
        <div className="card">
          <div className="empty-state">
            Pilih permintaan kab/kota terlebih dahulu untuk melihat item yang perlu dialokasikan.
          </div>
        </div>
      )}

      {selectedPermintaan && (
        <div className="card">
          <div className="section-title">Alokasi Batch per Item</div>
          <div className="info-banner info" style={{ fontSize: 12, marginBottom: 12 }}>
            Sistem otomatis memilih batch dengan expiry terdekat (FEFO). Anda dapat mengedit
            batch dan jumlah jika ada kebutuhan khusus. Total alokasi per item <strong>harus sama</strong> dengan
            jumlah diminta.
          </div>

          {selectedPermintaan.items.map((item, itemIdx) => {
            const validation = getItemValidation(item, itemIdx);
            const allocs = allocations[itemIdx] || [];
            const fefoBatches = getFEFOBatches(item.obatId);

            return (
              <div
                key={itemIdx}
                style={{
                  border: `2px solid ${validation.valid ? "var(--success)" : "var(--warning)"}`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  background: validation.valid ? "#f0fdf4" : "#fffaeb",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <strong>{item.namaObat}</strong>{" "}
                    <code style={{ fontSize: 11 }}>{item.kodeObat}</code>
                  </div>
                  <span className={`badge ${validation.valid ? "badge-success" : "badge-warning"}`}>
                    {fmt(validation.totalAlokasi)} / {fmt(item.jumlahDiminta)} {item.satuan}
                    {validation.valid ? " ✓" : " (belum sesuai)"}
                  </span>
                </div>

                <div className="table-wrap" style={{ marginBottom: 8 }}>
                  <table style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>Batch</th>
                        <th>Expiry</th>
                        <th style={{ textAlign: "right" }}>Stok</th>
                        <th style={{ textAlign: "right" }}>Jumlah Kirim</th>
                        <th style={{ textAlign: "center" }}>Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocs.map((a, allocIdx) => {
                        const batch = a.batchId ? mockBatchObat.find((x) => x.id === Number(a.batchId)) : null;
                        const over = batch && Number(a.jumlah) > batch.stok;
                        return (
                          <tr key={allocIdx}>
                            <td>
                              <select
                                value={a.batchId}
                                onChange={(e) => updateAlloc(itemIdx, allocIdx, "batchId", e.target.value)}
                                style={{ width: "100%", padding: "4px 8px" }}
                              >
                                <option value="">— Batch —</option>
                                {fefoBatches.map((fb) => (
                                  <option key={fb.id} value={fb.id}>
                                    {fb.noBatch} (exp {fb.expiry})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>{batch ? batch.expiry : "—"}</td>
                            <td style={{ textAlign: "right" }}>
                              {batch ? `${fmt(batch.stok)} ${batch.satuan}` : "—"}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <input
                                type="number"
                                min={1}
                                value={a.jumlah}
                                onChange={(e) => updateAlloc(itemIdx, allocIdx, "jumlah", e.target.value)}
                                style={{
                                  width: 100,
                                  padding: "4px 8px",
                                  textAlign: "right",
                                  borderColor: over ? "var(--danger)" : "var(--gray-300)",
                                }}
                              />
                              {over && <div style={{ fontSize: 10, color: "var(--danger)" }}>Melebihi stok</div>}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => removeAllocRow(itemIdx, allocIdx)}
                                disabled={allocs.length === 1}
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

                <button className="btn btn-sm" onClick={() => addAllocRow(itemIdx)}>
                  + Tambah Batch
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedPermintaan && (
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => navigate("/operator/sbbk")}>
            Batal
          </button>
          <button className="btn btn-primary" onClick={handleTerbitkan} disabled={!canTerbit}>
            Terbitkan SBBK
          </button>
        </div>
      )}
      {selectedPermintaan && !canTerbit && (
        <div style={{ textAlign: "right", fontSize: 11, color: "var(--gray-600)", marginTop: 6 }}>
          Semua item harus teralokasi penuh dan tidak melebihi stok batch sebelum SBBK dapat diterbitkan.
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Konfirmasi Penerbitan SBBK</h3>
              <button onClick={() => setShowConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ lineHeight: 1.6 }}>
                Terbitkan SBBK untuk permintaan <strong>{selectedPermintaan.nomorSurat}</strong> dari{" "}
                <strong>{selectedPermintaan.kabKota}</strong>?
              </p>
              <div className="info-banner warning" style={{ marginTop: 12 }}>
                <strong>Setelah diterbitkan:</strong> stok berkurang permanen sesuai alokasi batch.
                Permintaan ditandai <strong>Selesai</strong>. Jika ada kesalahan, koreksi melalui Penyesuaian Stok.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowConfirm(false)}>Batal</button>
              <button className="btn btn-primary" onClick={doTerbitkan}>
                Ya, Terbitkan &amp; Potong Stok
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}