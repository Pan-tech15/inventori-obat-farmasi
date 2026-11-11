import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockPenerimaan, getObatInfo } from "../../data/mockOperator";
import { mockObat } from "../../data/mockData";

const emptyItem = {
  obatKode: "",
  namaObat: "",
  noBatch: "",
  expiry: "",
  jumlahDokumen: 0,
  jumlahDiterima: 0,
  hargaSatuan: 0,
  pabrik: "",
};

const STATUS_LABELS = {
  selesai: "Selesai",
  discrepancy: "Ada Ketidaksesuaian",
  parsial: "Diterima Sebagian",
  pending: "Menunggu Verifikasi",
};
const statusBadge = {
  selesai: "badge-success",
  discrepancy: "badge-warning",
  parsial: "badge-info",
  pending: "badge-gray",
};

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

// Per-item status
const getItemStatus = (it) => {
  const doc = Number(it.jumlahDokumen) || 0;
  const rec = Number(it.jumlahDiterima) || 0;
  if (rec === doc) return "sesuai";
  if (rec > doc) return "lebih";
  return "kurang";
};

const itemStatusBadge = {
  sesuai: { cls: "badge-success", label: "Sesuai" },
  lebih: { cls: "badge-warning", label: "Lebih" },
  kurang: { cls: "badge-info", label: "Kurang" },
};

// Hitung status dokumen dari status item
// Prioritas: lebih > kurang > sesuai
const computeDocStatus = (items) => {
  if (items.length === 0) return "pending";
  const statuses = items.map(getItemStatus);
  if (statuses.some((s) => s === "lebih")) return "discrepancy";
  if (statuses.some((s) => s === "kurang")) return "parsial";
  return "selesai";
};

export default function FormPenerimaan() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    noSPB: "",
    noSBBK: "",
    tanggal: new Date().toISOString().slice(0, 10),
    asal: "Kemenkes RI",
    sumberAnggaran: "APBN Kemenkes",
    catatan: "",
    status: "pending",
    items: [{ ...emptyItem }],
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [resolveMode, setResolveMode] = useState(null); // 'verify' | 'discrepancy' | 'susulan' | null
  const [resolutions, setResolutions] = useState({});

  useEffect(() => {
    if (isEdit) {
      const existing = mockPenerimaan.find((p) => p.id === Number(id));
      if (existing) {
        setForm({
          ...existing,
          items: existing.items.map((it) => {
            const obat = mockObat.find((o) => o.id === it.obatId);
            return { ...it, obatKode: obat?.kode || "" };
          }),
        });
      }
    }
  }, [id, isEdit]);

  // ---------- CRUD (Mode Baru) ----------
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    if (field === "obatKode") {
      const obat = mockObat.find((o) => o.kode === value);
      items[idx] = {
        ...items[idx],
        obatKode: value,
        namaObat: obat?.nama || "",
      };
    } else {
      items[idx] = { ...items[idx], [field]: value };
    }
    setForm({ ...form, items });
  };
  const addItem = () =>
    setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (idx) =>
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const totalDokumen = form.items.reduce(
    (s, i) => s + Number(i.jumlahDokumen || 0),
    0,
  );
  const totalDiterima = form.items.reduce(
    (s, i) => s + Number(i.jumlahDiterima || 0),
    0,
  );
  const totalNilai = form.items.reduce(
    (s, i) => s + Number(i.jumlahDiterima || 0) * Number(i.hargaSatuan || 0),
    0,
  );
  const hasDiscrepancy = form.items.some(
    (i) => Number(i.jumlahDokumen) !== Number(i.jumlahDiterima),
  );
  const discrepancyType = form.items.some(
    (i) => Number(i.jumlahDiterima) > Number(i.jumlahDokumen),
  )
    ? "lebih"
    : form.items.some((i) => Number(i.jumlahDiterima) < Number(i.jumlahDokumen))
      ? "kurang"
      : null;

  // ---------- Save (Mode Baru) ----------
  const handleSave = () => {
    if (!form.noSPB || !form.noSBBK) {
      alert("No SPB dan No SBBK wajib diisi.");
      return;
    }
    if (form.items.length === 0) {
      alert("Minimal 1 item obat harus diisi.");
      return;
    }
    const hasEmptyItem = form.items.some(
      (i) => !i.obatKode || !i.noBatch || Number(i.jumlahDokumen) <= 0,
    );
    if (hasEmptyItem) {
      alert("Semua item wajib memiliki obat, batch, dan jumlah dokumen > 0.");
      return;
    }
    const finalStatus = computeDocStatus(form.items);
    if (finalStatus !== "selesai") setShowConfirm(true);
    else doSave(finalStatus);
  };

  const doSave = (finalStatus) => {
    alert(
      `Penerimaan disimpan dengan status: ${STATUS_LABELS[finalStatus]}${finalStatus === "selesai" ? ". Stok bertambah otomatis." : ". Stok BELUM bertambah (lebih) atau bertambah sebagian (kurang)."}`,
    );
    setShowConfirm(false);
    navigate("/operator/penerimaan");
  };

  // ---------- Resolution (Mode Detail) ----------
  const handleOpenResolve = (mode) => {
    setResolveMode(mode);
    // Pre-fill resolutions untuk discrepancy (default: kembalikan)
    if (mode === "discrepancy") {
      const initial = {};
      form.items.forEach((it, idx) => {
        if (getItemStatus(it) === "lebih") {
          initial[idx] = { action: "return" };
        }
      });
      setResolutions(initial);
    } else if (mode === "susulan") {
      const initial = {};
      form.items.forEach((it, idx) => {
        if (getItemStatus(it) === "kurang") {
          initial[idx] = { tambahan: 0 };
        }
      });
      setResolutions(initial);
    } else {
      setResolutions({});
    }
  };

  const handleResolutionChange = (idx, field, value) => {
    setResolutions((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], [field]: value },
    }));
  };

  const handleSaveResolution = () => {
    const newItems = form.items.map((it, idx) => {
      const res = resolutions[idx];
      if (!res) return it;

      if (resolveMode === "verify") {
        return {
          ...it,
          jumlahDiterima: Number(res.jumlahDiterima ?? it.jumlahDiterima),
        };
      }

      if (resolveMode === "discrepancy") {
        if (res.action === "return") {
          return { ...it, jumlahDiterima: it.jumlahDokumen };
        }
        if (res.action === "legalkan") {
          if (!res.newSbbk) {
            alert("Nomor SBBK baru wajib diisi.");
            return it;
          }
          // Di backend: buat penerimaan baru tertaut dengan SBBK baru
          // Di mock: hanya catat di keterangan
          return {
            ...it,
            catatan: `Kelebihan dilegalkan dengan SBBK ${res.newSbbk}`,
          };
        }
      }

      if (resolveMode === "susulan") {
        const tambahan = Number(res.tambahan) || 0;
        return { ...it, jumlahDiterima: Number(it.jumlahDiterima) + tambahan };
      }

      return it;
    });

    const newStatus = computeDocStatus(newItems);
    setForm({ ...form, items: newItems, status: newStatus });
    setResolveMode(null);
    setResolutions({});

    const msg =
      newStatus === "selesai"
        ? "Semua ketidaksesuaian telah diselesaikan. Status dokumen menjadi SELESAI."
        : newStatus === "parsial"
          ? "Kelebihan telah diselesaikan. Masih ada item yang kurang. Status dokumen menjadi DITERIMA SEBAGIAN."
          : "Masih ada item yang lebih. Status dokumen tetap ADA KETIDAKSESUAIAN.";
    alert(msg);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <div className="page-header">
        <div>
          <h2>{isEdit ? "Detail Penerimaan" : "Penerimaan Baru"}</h2>
          <p>
            Catat penerimaan obat. Status dihitung otomatis dari kondisi per
            item.
          </p>
        </div>
        <button
          className="btn"
          onClick={() => navigate("/operator/penerimaan")}
        >
          Kembali
        </button>
      </div>

      {/* Status Banner */}
      {isEdit && (
        <div
          className={`info-banner ${form.status === "selesai" ? "success" : form.status === "discrepancy" ? "warning" : form.status === "parsial" ? "info" : "info"}`}
        >
          <strong>Status dokumen: {STATUS_LABELS[form.status]}</strong>
          {form.status === "pending" &&
            " — Belum ada verifikasi fisik. Klik tombol Verifikasi Fisik di bawah untuk memulai."}
          {form.status === "discrepancy" &&
            " — Ada item dengan jumlah lebih dari dokumen. Perlu keputusan Kemenkes."}
          {form.status === "parsial" &&
            " — Ada item dengan jumlah kurang dari dokumen. Menunggu sisa kiriman."}
          {form.status === "selesai" &&
            " — Semua item sesuai. Stok sudah tercatat."}
          {form.catatan && (
            <div style={{ marginTop: 6, fontSize: 12 }}>
              Catatan: {form.catatan}
            </div>
          )}
        </div>
      )}

      {!isEdit && hasDiscrepancy && (
        <div className="info-banner warning">
          <strong>Perhatian — discrepancy terdeteksi:</strong>{" "}
          {discrepancyType === "lebih"
            ? "Ada item dengan jumlah diterima > dokumen. Sistem akan membuat status Ada Ketidaksesuaian."
            : "Ada item dengan jumlah diterima < dokumen. Sistem akan mencatat sebagai penerimaan parsial."}{" "}
          Stok <strong>tidak akan bertambah otomatis</strong> untuk item yang
          lebih.
        </div>
      )}

      {/* Informasi Dokumen */}
      <div className="card">
        <div className="section-title">Informasi Dokumen</div>
        <div className="form-grid">
          <div className="form-group">
            <label>No SPB *</label>
            <input
              value={form.noSPB}
              onChange={(e) => setForm({ ...form, noSPB: e.target.value })}
              placeholder="SPB/2026/..."
              disabled={isEdit}
            />
          </div>
          <div className="form-group">
            <label>No SBBK *</label>
            <input
              value={form.noSBBK}
              onChange={(e) => setForm({ ...form, noSBBK: e.target.value })}
              placeholder="SBBK-KEMKES-..."
              disabled={isEdit}
            />
          </div>
          <div className="form-group">
            <label>Tanggal</label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              disabled={isEdit}
            />
          </div>
          <div className="form-group">
            <label>Asal</label>
            <input
              value={form.asal}
              onChange={(e) => setForm({ ...form, asal: e.target.value })}
              disabled={isEdit}
            />
          </div>
          <div className="form-group">
            <label>Sumber Anggaran</label>
            <input
              value={form.sumberAnggaran}
              onChange={(e) =>
                setForm({ ...form, sumberAnggaran: e.target.value })
              }
              disabled={isEdit}
            />
          </div>
          <div className="form-group full">
            <label>Catatan</label>
            <textarea
              rows={2}
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Item Obat */}
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
            Item Obat
          </div>
          {!isEdit && (
            <button className="btn btn-sm" onClick={addItem}>
              + Tambah Item
            </button>
          )}
        </div>

        {!isEdit && (
          <div className="info-banner info" style={{ fontSize: 12 }}>
            <strong>Jumlah Dokumen</strong> = sesuai surat/SPB.{" "}
            <strong>Jumlah Diterima</strong> = fisik yang benar-benar diterima.
            Jika berbeda, sistem menandai item sebagai <em>Lebih</em> atau{" "}
            <em>Kurang</em>.
          </div>
        )}

        <div className="item-list">
          <div
            className="item-row header"
            style={{
              gridTemplateColumns: isEdit
                ? "2fr 1fr 1fr 90px 90px 100px 90px"
                : "2fr 1fr 1fr 90px 90px 110px 50px",
            }}
          >
            <span>Obat</span>
            <span>No Batch</span>
            <span>Expiry</span>
            <span>Jml Dokumen</span>
            <span>Jml Diterima</span>
            {isEdit ? <span>Status</span> : <span>Harga Satuan</span>}
            <span style={{ textAlign: "center" }}>
              {isEdit ? "Kartu Stok" : "Hapus"}
            </span>
          </div>
          {form.items.map((it, idx) => {
            const info = getObatInfo(it.obatKode);
            const itemStatus = getItemStatus(it);
            const badge = itemStatusBadge[itemStatus];
            return (
              <div
                key={idx}
                className="item-row"
                style={{
                  gridTemplateColumns: isEdit
                    ? "2fr 1fr 1fr 90px 90px 100px 90px"
                    : "2fr 1fr 1fr 90px 90px 110px 50px",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  {isEdit ? (
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {it.namaObat}
                    </span>
                  ) : (
                    <select
                      value={it.obatKode}
                      onChange={(e) =>
                        updateItem(idx, "obatKode", e.target.value)
                      }
                    >
                      <option value="">— Pilih Obat —</option>
                      {mockObat.map((o) => (
                        <option key={o.id} value={o.kode}>
                          {o.nama}
                        </option>
                      ))}
                    </select>
                  )}
                  {it.obatKode && (
                    <span
                      className={`badge ${info.jenis === "Program" ? "badge-info" : "badge-warning"}`}
                      style={{ fontSize: 9, alignSelf: "flex-start" }}
                    >
                      {info.jenis === "Program"
                        ? `Program: ${info.program}`
                        : "Buffer"}
                    </span>
                  )}
                </div>
                <input
                  value={it.noBatch}
                  onChange={(e) => updateItem(idx, "noBatch", e.target.value)}
                  placeholder="Batch"
                  disabled={isEdit}
                />
                <input
                  type="date"
                  value={it.expiry}
                  onChange={(e) => updateItem(idx, "expiry", e.target.value)}
                  disabled={isEdit}
                />
                <input
                  type="number"
                  value={it.jumlahDokumen}
                  onChange={(e) =>
                    updateItem(idx, "jumlahDokumen", e.target.value)
                  }
                  disabled={isEdit}
                />
                <input
                  type="number"
                  value={it.jumlahDiterima}
                  onChange={(e) =>
                    updateItem(idx, "jumlahDiterima", e.target.value)
                  }
                  disabled={isEdit}
                  style={
                    Number(it.jumlahDokumen) !== Number(it.jumlahDiterima)
                      ? { borderColor: "var(--warning)", background: "#fffaeb" }
                      : {}
                  }
                />
                {isEdit ? (
                  <span
                    className={`badge ${badge.cls}`}
                    style={{ alignSelf: "center" }}
                  >
                    {badge.label}
                  </span>
                ) : (
                  <input
                    type="number"
                    value={it.hargaSatuan}
                    onChange={(e) =>
                      updateItem(idx, "hargaSatuan", e.target.value)
                    }
                  />
                )}
                {!isEdit ? (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(idx)}
                    title="Hapus item"
                    disabled={form.items.length === 1}
                    style={
                      form.items.length === 1
                        ? { opacity: 0.4, cursor: "not-allowed" }
                        : {}
                    }
                  >
                    ×
                  </button>
                ) : (
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      const info = getObatInfo(it.obatKode);
                      const jenisParam =
                        info.jenis === "Program"
                          ? `Program:${info.program}`
                          : "Buffer";
                      navigate(
                        `/operator/kartu-stok?jenis=${jenisParam}&obat=${it.obatKode}&batch=${it.noBatch}`,
                      );
                    }}
                    title="Lihat kartu stok batch ini"
                    style={{ fontSize: 11 }}
                  >
                    Kartu Stok
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 24,
            fontSize: 13,
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong>Total Dokumen:</strong> {fmt(totalDokumen)}
          </div>
          <div>
            <strong>Total Diterima:</strong> {fmt(totalDiterima)}
          </div>
          <div>
            <strong>Total Nilai:</strong> Rp {fmt(totalNilai)}
          </div>
          {hasDiscrepancy && (
            <div style={{ color: "var(--warning)" }}>
              <strong>Selisih:</strong> {totalDiterima - totalDokumen}
            </div>
          )}
        </div>
      </div>

      {/* Resolution Panel (hanya mode Detail) */}
      {isEdit && form.status !== "selesai" && (
        <div
          className="card"
          style={{ borderLeft: "4px solid var(--warning)" }}
        >
          <div className="section-title">Tindakan Penyelesaian</div>
          <p
            style={{ fontSize: 13, color: "var(--gray-600)", marginBottom: 12 }}
          >
            {form.status === "pending" &&
              "Lakukan verifikasi fisik untuk mencatat jumlah aktual yang diterima. Status akan dihitung ulang setelah disimpan."}
            {form.status === "discrepancy" &&
              "Untuk setiap item yang berstatus Lebih, putuskan apakah kelebihan dikembalikan ke Kemenkes atau dilegalkan dengan SBBK baru."}
            {form.status === "parsial" &&
              "Catat jumlah sisa yang datang dari Kemenkes untuk item yang berstatus Kurang."}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {form.status === "pending" && (
              <button
                className="btn btn-primary"
                onClick={() => handleOpenResolve("verify")}
              >
                Verifikasi Fisik
              </button>
            )}
            {form.status === "discrepancy" && (
              <button
                className="btn btn-primary"
                onClick={() => handleOpenResolve("discrepancy")}
              >
                Selesaikan Ketidaksesuaian
              </button>
            )}
            {form.status === "parsial" && (
              <button
                className="btn btn-primary"
                onClick={() => handleOpenResolve("susulan")}
              >
                Tambah Penerimaan Susulan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Save (mode Baru) */}
      {!isEdit && (
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            className="btn"
            onClick={() => navigate("/operator/penerimaan")}
          >
            Batal
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Simpan Penerimaan
          </button>
        </div>
      )}

      {/* Modal Konfirmasi Saat Simpan (mode Baru) */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Konfirmasi Discrepancy</h3>
              <button onClick={() => setShowConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ lineHeight: 1.6 }}>
                Terdeteksi{" "}
                <strong>
                  {discrepancyType === "lebih" ? "kelebihan" : "kekurangan"}
                </strong>{" "}
                jumlah obat.
                {discrepancyType === "lebih"
                  ? " Status dokumen akan menjadi ADA KETIDAKSESUAIAN. Stok item yang lebih BELUM ditambah sampai Kemenkes memutuskan."
                  : " Status dokumen akan menjadi DITERIMA SEBAGIAN. Stok bertambah sesuai jumlah yang diterima."}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowConfirm(false)}>
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={() => doSave(computeDocStatus(form.items))}
              >
                Ya, Simpan sebagai {STATUS_LABELS[computeDocStatus(form.items)]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resolution */}
      {resolveMode && (
        <div className="modal-overlay" onClick={() => setResolveMode(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: 760 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                {resolveMode === "verify" && "Verifikasi Fisik Penerimaan"}
                {resolveMode === "discrepancy" && "Selesaikan Ketidaksesuaian"}
                {resolveMode === "susulan" && "Tambah Penerimaan Susulan"}
              </h3>
              <button onClick={() => setResolveMode(null)}>×</button>
            </div>
            <div className="modal-body">
              {resolveMode === "verify" && (
                <div className="info-banner info" style={{ fontSize: 12 }}>
                  Masukkan <strong>jumlah fisik aktual</strong> yang diterima
                  untuk setiap item. Sistem akan menghitung ulang status
                  dokumen.
                </div>
              )}
              {resolveMode === "discrepancy" && (
                <div className="info-banner warning" style={{ fontSize: 12 }}>
                  Untuk setiap item yang <strong>Lebih</strong>, pilih tindakan:{" "}
                  <em>Kembalikan ke Kemenkes</em> (stok dikurangi ke jumlah
                  dokumen) atau <em>Legalkan dengan SBBK Baru</em> (Kemenkes
                  menerbitkan SBBK baru untuk kelebihan).
                </div>
              )}
              {resolveMode === "susulan" && (
                <div className="info-banner info" style={{ fontSize: 12 }}>
                  Masukkan <strong>jumlah sisa yang datang</strong> untuk item
                  yang <strong>Kurang</strong>. Setelah total sesuai dokumen,
                  status akan menjadi Selesai.
                </div>
              )}

              {form.items.map((it, idx) => {
                const itemStatus = getItemStatus(it);
                // Verify: semua item editable. Discrepancy: hanya lebih. Susulan: hanya kurang.
                const shouldShow =
                  resolveMode === "verify" ||
                  (resolveMode === "discrepancy" && itemStatus === "lebih") ||
                  (resolveMode === "susulan" && itemStatus === "kurang");
                if (!shouldShow) return null;

                const res = resolutions[idx] || {};

                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid var(--gray-200)",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <strong style={{ fontSize: 13 }}>{it.namaObat}</strong>
                      <span
                        className={`badge ${itemStatusBadge[itemStatus].cls}`}
                      >
                        {itemStatusBadge[itemStatus].label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--gray-600)",
                        marginBottom: 8,
                      }}
                    >
                      Batch <code>{it.noBatch}</code> · Dokumen:{" "}
                      <strong>{fmt(it.jumlahDokumen)}</strong> · Diterima:{" "}
                      <strong>{fmt(it.jumlahDiterima)}</strong>
                      {itemStatus === "lebih" && (
                        <span
                          style={{ color: "var(--warning)", marginLeft: 8 }}
                        >
                          Selisih: +{it.jumlahDiterima - it.jumlahDokumen}
                        </span>
                      )}
                      {itemStatus === "kurang" && (
                        <span style={{ color: "var(--danger)", marginLeft: 8 }}>
                          Kurang: {it.jumlahDokumen - it.jumlahDiterima}
                        </span>
                      )}
                    </div>

                    {resolveMode === "verify" && (
                      <div className="form-group">
                        <label>Jumlah Diterima Aktual</label>
                        <input
                          type="number"
                          value={res.jumlahDiterima ?? it.jumlahDiterima}
                          onChange={(e) =>
                            handleResolutionChange(
                              idx,
                              "jumlahDiterima",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    )}

                    {resolveMode === "discrepancy" &&
                      itemStatus === "lebih" && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <label style={{ fontSize: 12, fontWeight: 500 }}>
                            Tindakan untuk kelebihan{" "}
                            {it.jumlahDiterima - it.jumlahDokumen}:
                          </label>
                          <label
                            style={{
                              display: "flex",
                              gap: 6,
                              alignItems: "center",
                              fontSize: 12,
                            }}
                          >
                            <input
                              type="radio"
                              checked={res.action === "return"}
                              onChange={() =>
                                handleResolutionChange(idx, "action", "return")
                              }
                            />
                            Kembalikan ke Kemenkes (stok dikoreksi ke{" "}
                            {it.jumlahDokumen})
                          </label>
                          <label
                            style={{
                              display: "flex",
                              gap: 6,
                              alignItems: "center",
                              fontSize: 12,
                            }}
                          >
                            <input
                              type="radio"
                              checked={res.action === "legalkan"}
                              onChange={() =>
                                handleResolutionChange(
                                  idx,
                                  "action",
                                  "legalkan",
                                )
                              }
                            />
                            Legalkan dengan SBBK Baru
                          </label>
                          {res.action === "legalkan" && (
                            <input
                              placeholder="Nomor SBBK baru dari Kemenkes"
                              value={res.newSbbk || ""}
                              onChange={(e) =>
                                handleResolutionChange(
                                  idx,
                                  "newSbbk",
                                  e.target.value,
                                )
                              }
                            />
                          )}
                        </div>
                      )}

                    {resolveMode === "susulan" && itemStatus === "kurang" && (
                      <div className="form-group">
                        <label>
                          Jumlah Tambahan yang Datang (maks.{" "}
                          {it.jumlahDokumen - it.jumlahDiterima})
                        </label>
                        <input
                          type="number"
                          value={res.tambahan || 0}
                          min={0}
                          max={it.jumlahDokumen - it.jumlahDiterima}
                          onChange={(e) =>
                            handleResolutionChange(
                              idx,
                              "tambahan",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setResolveMode(null)}>
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveResolution}
              >
                Simpan Tindakan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
