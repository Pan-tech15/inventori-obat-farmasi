import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import {
  mockBatchObat,
  mockPermintaan,
  getExpiryInfo,
  getAllSBBK,
  saveSBBK,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

const getFEFOBatches = (obatId) =>
  mockBatchObat
    .filter((b) => b.obatId === obatId && b.stok > 0)
    .filter((b) => getExpiryInfo(b).status !== "expired")
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

const generateNomor = () => {
  const tahun = new Date().getFullYear();
  const all = getAllSBBK();
  const thisYear = all.filter((s) => String(s.nomor).includes(String(tahun)));
  return `SBBK-${tahun}-${String(thisYear.length + 1).padStart(4, "0")}`;
};

export default function FormSBBK() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { id: draftId } = useParams();

  const [loading, setLoading] = useState(!!draftId);
  const [sbbkId, setSbbkId] = useState(draftId ? Number(draftId) : null);
  const [nomor, setNomor] = useState("");
  const [permintaanId, setPermintaanId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [allocations, setAllocations] = useState({});
  const [showTerbitConfirm, setShowTerbitConfirm] = useState(false);
  const [savedAsDraft, setSavedAsDraft] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const permintaanTersedia = mockPermintaan.filter((p) => {
    const selesai = JSON.parse(
      localStorage.getItem("permintaanSelesai") || "[]",
    );
    if (selesai.includes(p.id)) return false;
    return p.status === "pending" || p.status === "disetujui";
  });

  const selectedPermintaan = permintaanId
    ? mockPermintaan.find((p) => p.id === Number(permintaanId))
    : null;

  // Load draft saat edit
  useEffect(() => {
    if (!draftId) return;
    const draft = getAllSBBK().find((s) => s.id === Number(draftId));
    if (!draft) {
      alert("Draft SBBK tidak ditemukan");
      navigate("/operator/sbbk");
      return;
    }
    if (draft.status !== "draft") {
      alert("SBBK ini sudah diterbitkan, tidak bisa diedit");
      navigate(`/operator/sbbk/${draft.id}`);
      return;
    }
    setSbbkId(draft.id);
    setNomor(draft.nomor);
    setPermintaanId(String(draft.permintaanId));
    setTanggal(draft.tanggal);
    const prm = mockPermintaan.find((p) => p.id === draft.permintaanId);
    if (prm) {
      const alloc = {};
      prm.items.forEach((item, idx) => {
        const draftItems = draft.items.filter(
          (it) => it.obatId === item.obatId,
        );
        alloc[idx] = draftItems.map((it) => ({
          batchId: it.batchId,
          jumlah: it.jumlah,
        }));
      });
      setAllocations(alloc);
    }
    setLoading(false);
  }, [draftId, navigate]);

  // Auto-allocate saat permintaan dipilih (hanya untuk SBBK baru)
  useEffect(() => {
    if (sbbkId) return;
    if (!permintaanId) {
      setAllocations({});
      return;
    }
    const prm = mockPermintaan.find((p) => p.id === Number(permintaanId));
    if (!prm) return;
    const init = {};
    prm.items.forEach((item, idx) => {
      const fefoBatches = getFEFOBatches(item.obatId);
      let needed = item.jumlahDiminta;
      const allocs = [];
      for (const batch of fefoBatches) {
        if (needed <= 0) break;
        const take = Math.min(batch.stok, needed);
        allocs.push({ batchId: batch.id, jumlah: take });
        needed -= take;
      }
      init[idx] =
        allocs.length > 0
          ? allocs
          : [{ batchId: "", jumlah: item.jumlahDiminta }];
    });
    setAllocations(init);
    if (!nomor) setNomor(generateNomor());
  }, [permintaanId, sbbkId, nomor]);

  const handleSelectPermintaan = (e) => {
    const val = e.target.value;
    setPermintaanId(val);
    if (val) {
      const prm = mockPermintaan.find((p) => p.id === Number(val));
      // Cek kalau sudah ada SBBK untuk permintaan ini
      const existing = getAllSBBK().find(
        (s) => s.permintaanId === Number(val) && s.status === "draft",
      );
      if (existing && !sbbkId) {
        if (
          confirm(
            `Permintaan ini sudah memiliki SBBK draft (${existing.nomor}). Lanjutkan draft tersebut?`,
          )
        ) {
          navigate(`/operator/sbbk/draft/${existing.id}`);
          return;
        }
      }
    }
  };

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
    selectedPermintaan.items.every(
      (item, idx) => getItemValidation(item, idx).valid,
    );

  const hasAtLeastOneAllocation = Object.values(allocations).some((allocs) =>
    (allocs || []).some((a) => a.batchId && Number(a.jumlah) > 0),
  );

  const canSaveDraft = Boolean(selectedPermintaan) && hasAtLeastOneAllocation;
  const canTerbit =
    Boolean(selectedPermintaan) && allItemsValid && Boolean(tanggal);

  const buildSBBKData = (status) => {
    const items = [];
    selectedPermintaan.items.forEach((item, idx) => {
      (allocations[idx] || []).forEach((a) => {
        if (!a.batchId || !Number(a.jumlah)) return;
        const batch = mockBatchObat.find((b) => b.id === Number(a.batchId));
        if (!batch) return;
        items.push({
          batchId: batch.id,
          obatId: item.obatId,
          namaObat: item.namaObat,
          noBatch: batch.noBatch,
          expiry: batch.expiry,
          jumlah: Number(a.jumlah),
          satuan: item.satuan,
        });
      });
    });
    return {
      id: sbbkId || Date.now(),
      nomor: nomor || generateNomor(),
      tanggal,
      ifk: selectedPermintaan.kabKota,
      permintaanId: selectedPermintaan.id,
      permintaanNomor: selectedPermintaan.nomorSurat,
      status,
      cetakUlangKe: 0,
      items,
    };
  };

  const handleSimpanDraft = () => {
    setErrorMsg("");
    if (!canSaveDraft) {
      if (!selectedPermintaan) setErrorMsg("Pilih permintaan terlebih dahulu.");
      else
        setErrorMsg(
          "Minimal satu batch harus dialokasikan sebelum menyimpan draft.",
        );
      return;
    }
    const data = buildSBBKData("draft");
    saveSBBK(data);
    setSbbkId(data.id);
    setNomor(data.nomor);
    setSavedAsDraft(true);
    setTimeout(() => setSavedAsDraft(false), 4000);
  };

  const handleTerbitkan = () => {
    if (!canTerbit) {
      setErrorMsg(
        "Semua item harus teralokasi penuh dan tidak melebihi stok batch.",
      );
      return;
    }
    setErrorMsg("");
    setShowTerbitConfirm(true);
  };

  const doTerbitkan = () => {
    const data = buildSBBKData("terbit");
    saveSBBK(data);
    const selesai = JSON.parse(
      localStorage.getItem("permintaanSelesai") || "[]",
    );
    if (!selesai.includes(selectedPermintaan.id)) {
      selesai.push(selectedPermintaan.id);
      localStorage.setItem("permintaanSelesai", JSON.stringify(selesai));
    }
    setShowTerbitConfirm(false);
    navigate(`/operator/sbbk/${data.id}`);
  };

  const handleBatalkanDraft = () => {
    if (!sbbkId) return;
    if (!confirm(`Batalkan draft ${nomor}? Draft akan dihapus permanen.`))
      return;
    const stored = JSON.parse(localStorage.getItem("sbbkList") || "[]");
    localStorage.setItem(
      "sbbkList",
      JSON.stringify(stored.filter((s) => s.id !== sbbkId)),
    );
    setSbbkId(null);
    setNomor("");
    setPermintaanId("");
    setAllocations({});
    alert("Draft dibatalkan.");
  };

  if (loading) {
    return <div className="card">Memuat draft...</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{sbbkId ? `Draft ${nomor}` : "Penerbitan SBBK"}</h2>
          <p>
            SBBK dibuat berdasarkan permintaan kab/kota. Sistem otomatis
            mengalokasikan batch dengan FEFO.
            {sbbkId
              ? " Simpan draft untuk melanjutkan nanti, atau terbitkan jika sudah siap."
              : " Simpan draft atau terbitkan langsung."}
          </p>
        </div>
        <button className="btn" onClick={() => navigate("/operator/sbbk")}>
          Kembali
        </button>
      </div>

      {savedAsDraft && (
        <div className="info-banner success">
          <strong>✓ Draft tersimpan.</strong> Nomor: <code>{nomor}</code>. Anda
          dapat melanjutkan kapan saja. Stok belum berubah sampai diterbitkan.
        </div>
      )}

      {sbbkId && !savedAsDraft && (
        <div className="info-banner info">
          <strong>Melanjutkan draft {nomor}.</strong> Perubahan akan
          menggantikan draft sebelumnya.
          <button
            className="btn btn-sm"
            style={{ marginLeft: 12 }}
            onClick={handleBatalkanDraft}
          >
            Batalkan Draft
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="info-banner danger" style={{ fontSize: 12 }}>
          {errorMsg}
        </div>
      )}

      <div className="card">
        <div className="section-title">Informasi SBBK</div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Permintaan Kab/Kota (wajib) *</label>
            <select
              value={permintaanId}
              onChange={handleSelectPermintaan}
              disabled={!!sbbkId}
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
                <label>Nomor SBBK</label>
                <input value={nomor} disabled />
              </div>
              <div className="form-group">
                <label>IFK Tujuan</label>
                <input value={selectedPermintaan.kabKota} disabled />
              </div>
              <div className="form-group">
                <label>Tanggal SBBK</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {!selectedPermintaan && (
        <div className="card">
          <div className="empty-state">
            Pilih permintaan kab/kota terlebih dahulu untuk melihat alokasi
            batch.
          </div>
        </div>
      )}

      {selectedPermintaan && (
        <div className="card">
          <div className="section-title">Alokasi Batch per Item</div>
          <div
            className="info-banner info"
            style={{ fontSize: 12, marginBottom: 12 }}
          >
            Sistem otomatis memilih batch dengan expiry terdekat (FEFO). Anda
            dapat mengedit batch dan jumlah. Total alokasi per item{" "}
            <strong>harus sama</strong> dengan jumlah diminta sebelum SBBK dapat
            diterbitkan.
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <strong>{item.namaObat}</strong>{" "}
                    <code style={{ fontSize: 11 }}>{item.kodeObat}</code>
                  </div>
                  <span
                    className={`badge ${validation.valid ? "badge-success" : "badge-warning"}`}
                  >
                    {fmt(validation.totalAlokasi)} / {fmt(item.jumlahDiminta)}{" "}
                    {item.satuan}
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
                        const batch = a.batchId
                          ? mockBatchObat.find(
                              (x) => x.id === Number(a.batchId),
                            )
                          : null;
                        const over = batch && Number(a.jumlah) > batch.stok;
                        return (
                          <tr key={allocIdx}>
                            <td>
                              <select
                                value={a.batchId}
                                onChange={(e) =>
                                  updateAlloc(
                                    itemIdx,
                                    allocIdx,
                                    "batchId",
                                    e.target.value,
                                  )
                                }
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
                              {batch
                                ? `${fmt(batch.stok)} ${batch.satuan}`
                                : "—"}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <input
                                type="number"
                                min={1}
                                value={a.jumlah}
                                onChange={(e) =>
                                  updateAlloc(
                                    itemIdx,
                                    allocIdx,
                                    "jumlah",
                                    e.target.value,
                                  )
                                }
                                style={{
                                  width: 100,
                                  padding: "4px 8px",
                                  textAlign: "right",
                                  borderColor: over
                                    ? "var(--danger)"
                                    : "var(--gray-300)",
                                }}
                              />
                              {over && (
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "var(--danger)",
                                  }}
                                >
                                  Melebihi stok
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() =>
                                  removeAllocRow(itemIdx, allocIdx)
                                }
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

                <button
                  className="btn btn-sm"
                  onClick={() => addAllocRow(itemIdx)}
                >
                  + Tambah Batch
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedPermintaan && (
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button className="btn" onClick={() => navigate("/operator/sbbk")}>
            Batal
          </button>
          <button
            className="btn"
            onClick={handleSimpanDraft}
            disabled={!canSaveDraft}
          >
            {sbbkId ? "Perbarui Draft" : "Simpan Draft"}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleTerbitkan}
            disabled={!canTerbit}
          >
            Terbitkan SBBK
          </button>
        </div>
      )}
      {selectedPermintaan && !canTerbit && (
        <div
          style={{
            textAlign: "right",
            fontSize: 11,
            color: "var(--gray-600)",
            marginTop: 6,
          }}
        >
          Semua item harus teralokasi penuh dan tidak melebihi stok sebelum SBBK
          dapat diterbitkan. Anda masih bisa menyimpan sebagai draft.
        </div>
      )}

      {showTerbitConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowTerbitConfirm(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Konfirmasi Penerbitan SBBK</h3>
              <button onClick={() => setShowTerbitConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ lineHeight: 1.6 }}>
                Terbitkan SBBK <strong>{nomor}</strong> untuk permintaan{" "}
                <strong>{selectedPermintaan.nomorSurat}</strong> dari{" "}
                <strong>{selectedPermintaan.kabKota}</strong>?
              </p>
              <div className="info-banner warning" style={{ marginTop: 12 }}>
                <strong>Setelah diterbitkan:</strong> stok berkurang sesuai
                alokasi batch, permintaan ditandai <strong>Selesai</strong>, dan
                SBBK <strong>tidak bisa diedit</strong>. Jika ada kesalahan,
                koreksi melalui <strong>Penyesuaian Stok</strong>.
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn"
                onClick={() => setShowTerbitConfirm(false)}
              >
                Batal
              </button>
              <button className="btn btn-primary" onClick={doTerbitkan}>
                Ya, Terbitkan SBBK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
