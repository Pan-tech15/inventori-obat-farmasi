import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockBatchObat,
  getObatInfo,
  jenisProgramOptions,
  matchesJenisValue,
  getHargaFromBatch,
  getExpiryInfo,
} from "../../data/mockOperator";
import { mockObat, mockReferensi } from "../../data/mockData";

const emptyItem = { jenisValue: "", obatKode: "", batchId: "", jumlah: 0 };
const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

export default function FormSBBK() {
  const navigate = useNavigate();
  const [ifk, setIfk] = useState("IFK Kota Manado");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [referensi, setReferensi] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(null);

  const updateItem = (idx, field, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    if (field === "jenisValue") {
      next[idx].obatKode = "";
      next[idx].batchId = "";
      next[idx].jumlah = 0;
    }
    if (field === "obatKode") {
      next[idx].batchId = "";
      next[idx].jumlah = 0;
    }
    if (field === "batchId") {
      next[idx].jumlah = 0;
    }
    setItems(next);
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const fefoFor = (obatKode) => {
    const obat = mockObat.find((o) => o.kode === obatKode);
    if (!obat) return [];
    return mockBatchObat
      .filter((b) => b.obatId === obat.id && b.stok > 0)
      .filter((b) => getExpiryInfo(b).status !== "expired")
      .sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
  };

  const obatOptions = (jenisValue) => {
    if (!jenisValue) return [];
    return mockObat.filter(
      (o) =>
        matchesJenisValue({ jenis: o.jenis, program: o.program }, jenisValue) &&
        o.status === "Aktif",
    );
  };

  const validItems = items.filter((i) => i.batchId && Number(i.jumlah) > 0);

  const totalNilai = validItems.reduce((s, i) => {
    const b = mockBatchObat.find((x) => x.id === Number(i.batchId));
    return s + (b ? b.hargaSatuan * Number(i.jumlah) : 0);
  }, 0);

  const canTerbit =
    ifk &&
    tanggal &&
    validItems.length > 0 &&
    validItems.every((i) => {
      const b = mockBatchObat.find((x) => x.id === Number(i.batchId));
      return b && Number(i.jumlah) <= b.stok;
    });

  const handleTerbit = () => setShowConfirm(true);

  const doTerbit = () => {
    const nomor = `SBBK-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setSaved({ nomor, totalNilai, totalItem: validItems.length });
    setShowConfirm(false);
  };

  if (saved) {
    return (
      <>
        <div className="page-header">
          <div>
            <h2>SBBK Berhasil Diterbitkan</h2>
          </div>
        </div>
        <div className="info-banner success">
          <strong>✓ SBBK diterbitkan.</strong> Stok sudah berkurang. PDF siap
          diunduh dan ditandatangani Kepala Seksi secara fisik.
        </div>
        <div className="card">
          <dl className="detail-list">
            <dt>Nomor SBBK</dt>
            <dd>
              <code>{saved.nomor}</code>
            </dd>
            <dt>IFK Tujuan</dt>
            <dd>{ifk}</dd>
            <dt>Tanggal</dt>
            <dd>{tanggal}</dd>
            <dt>Total Item</dt>
            <dd>{saved.totalItem} batch</dd>
            <dt>Total Nilai</dt>
            <dd>Rp {saved.totalNilai.toLocaleString("id-ID")}</dd>
            <dt>Status Stok</dt>
            <dd>
              <span className="badge badge-success">Berkurang</span>
            </dd>
          </dl>
        </div>
        <div className="info-banner info">
          <strong>Catatan:</strong> PDF bertanda tangan Kepala Seksi diserahkan
          ke IFK di luar aplikasi. Cetak ulang akan berlabel{" "}
          <strong>SALINAN</strong> dan <strong>tidak</strong> memotong stok
          lagi.
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn btn-primary"
            onClick={() => alert("Unduh PDF — implementasi backend nanti")}
          >
            Unduh PDF SBBK
          </button>
          <button className="btn" onClick={() => navigate("/operator/sbbk")}>
            Lihat Daftar SBBK
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
          <p>
            Stok berkurang saat SBBK <strong>diterbitkan</strong>, bukan saat
            diunduh.
          </p>
        </div>
        <button className="btn" onClick={() => navigate("/operator/sbbk")}>
          Kembali
        </button>
      </div>

      <div className="info-banner info">
        <strong>Sistem FEFO:</strong> batch dengan expiry terdekat disarankan
        lebih dulu. Batch <strong>karantina</strong> dan{" "}
        <strong>expired</strong> tidak dapat dipilih.
      </div>

      <div className="card">
        <div className="section-title">Informasi SBBK</div>
        <div className="form-grid">
          <div className="form-group">
            <label>IFK Tujuan *</label>
            <select value={ifk} onChange={(e) => setIfk(e.target.value)}>
              {mockReferensi.ifk.map((f) => (
                <option key={f.id}>{f.nama}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tanggal Terbit</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
          <div className="form-group full">
            <label>Referensi Dokumen Permintaan (opsional)</label>
            <input
              value={referensi}
              onChange={(e) => setReferensi(e.target.value)}
              placeholder="Nomor surat permintaan kab/kota / ROP"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div className="section-title" style={{ marginBottom: 0 }}>
            Item yang Didistribusikan
          </div>
          <button className="btn btn-sm" onClick={addItem}>
            + Tambah Item
          </button>
        </div>

        {items.map((it, idx) => {
          const obatList = obatOptions(it.jenisValue);
          const fefoBatches = it.obatKode ? fefoFor(it.obatKode) : [];
          const selected = it.batchId
            ? mockBatchObat.find((b) => b.id === Number(it.batchId))
            : null;
          const over = selected && Number(it.jumlah) > selected.stok;
          const info = it.obatKode ? getObatInfo(it.obatKode) : null;

          return (
            <div
              key={idx}
              style={{
                border: "1px solid var(--gray-200)",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                background: over ? "#fffaeb" : "#fff",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 2fr 2fr 1fr 50px",
                  gap: 10,
                  alignItems: "end",
                }}
              >
                <div className="form-group">
                  <label>Jenis *</label>
                  <select
                    value={it.jenisValue}
                    onChange={(e) =>
                      updateItem(idx, "jenisValue", e.target.value)
                    }
                  >
                    <option value="">— Pilih Jenis —</option>
                    {jenisProgramOptions.map((j) => (
                      <option key={j.value} value={j.value}>
                        {j.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Obat *</label>
                  <select
                    value={it.obatKode}
                    onChange={(e) =>
                      updateItem(idx, "obatKode", e.target.value)
                    }
                    disabled={!it.jenisValue}
                  >
                    <option value="">— Pilih Obat —</option>
                    {obatList.map((o) => (
                      <option key={o.id} value={o.kode}>
                        {o.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch (FEFO)</label>
                  <select
                    value={it.batchId}
                    onChange={(e) => updateItem(idx, "batchId", e.target.value)}
                    disabled={!it.obatKode}
                  >
                    <option value="">— Pilih Batch —</option>
                    {fefoBatches.map((b, i) => {
                      const exp = getExpiryInfo(b);
                      const icon =
                        exp.color === "danger"
                          ? "🔴 "
                          : exp.color === "warning"
                            ? "🟠 "
                            : exp.color === "caution"
                              ? "🟡 "
                              : "";
                      return (
                        <option key={b.id} value={b.id}>
                          {icon}
                          {b.noBatch} — exp {b.expiry} ({exp.label}) — stok{" "}
                          {b.stok.toLocaleString("id-ID")}
                          {i === 0 ? " (FEFO)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Jumlah *</label>
                  <input
                    type="number"
                    value={it.jumlah}
                    onChange={(e) => updateItem(idx, "jumlah", e.target.value)}
                    min={0}
                    max={selected?.stok || 999999}
                    disabled={!it.batchId}
                  />
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeItem(idx)}
                  style={{ marginBottom: 1 }}
                >
                  ×
                </button>
              </div>
              {info && (
                <div style={{ marginTop: 6, fontSize: 11 }}>
                  <span
                    className={`badge ${info.jenis === "Program" ? "badge-info" : "badge-warning"}`}
                  >
                    {info.jenis === "Program"
                      ? `Program: ${info.program}`
                      : "Buffer"}
                  </span>
                  {selected && (
                    <span
                      style={{
                        marginLeft: 10,
                        color: over ? "var(--danger)" : "var(--gray-600)",
                      }}
                    >
                      Expiry: {selected.expiry} · Stok:{" "}
                      {selected.stok.toLocaleString("id-ID")} {selected.satuan}{" "}
                      · Harga: Rp {selected.hargaSatuan.toLocaleString("id-ID")}
                      {over && <strong> — Melebihi stok!</strong>}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "var(--gray-50)",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <strong>Total Nilai:</strong> Rp {totalNilai.toLocaleString("id-ID")}{" "}
          · <strong>{validItems.length} item valid</strong>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="btn" onClick={() => navigate("/operator/sbbk")}>
          Batal
        </button>
        <button
          className="btn btn-primary"
          onClick={handleTerbit}
          disabled={!canTerbit}
        >
          Terbitkan SBBK
        </button>
      </div>
      {!canTerbit && (
        <div
          style={{
            textAlign: "right",
            fontSize: 12,
            color: "var(--gray-600)",
            marginTop: 6,
          }}
        >
          Lengkapi IFK, jenis, obat, batch, jumlah valid, dan jumlah tidak
          melebihi stok.
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
                Menerbitkan SBBK untuk <strong>{ifk}</strong> dengan{" "}
                <strong>{validItems.length} batch</strong> senilai{" "}
                <strong>Rp {totalNilai.toLocaleString("id-ID")}</strong>.
              </p>
              <div className="info-banner warning" style={{ marginTop: 12 }}>
                <strong>Setelah diterbitkan:</strong> stok berkurang permanen.
                Jika ada kesalahan, gunakan tombol <strong>Void</strong> di
                halaman Detail SBBK dengan alasan. Cetak ulang akan berlabel
                SALINAN dan tidak memotong stok lagi.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowConfirm(false)}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={doTerbit}>
                Ya, Terbitkan & Potong Stok
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
