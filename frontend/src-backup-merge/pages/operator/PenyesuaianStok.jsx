import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  mockBatchObat,
  mockStockOpname,
  mockAdjustment,
  getObatInfo,
  jenisProgramOptions,
  matchesJenisValue,
  kategoriAlasanOpname,
} from "../../data/mockOperator";
import { mockObat } from "../../data/mockData";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const bulanList = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

// ============================================================
// HELPERS
// ============================================================
const buildOpnameRows = (filterJenis) => {
  return mockBatchObat
    .filter((b) => {
      if (!filterJenis) return true;
      const info = getObatInfo(b.kodeObat);
      return matchesJenisValue(info, filterJenis);
    })
    .map((b) => ({
      batchId: b.id,
      kodeObat: b.kodeObat,
      namaObat: b.namaObat,
      noBatch: b.noBatch,
      satuan: b.satuan,
      stokSistem: b.stok,
      stokFisik: "",
      kategoriAlasan: "",
      alasan: "",
    }));
};

const getAllOpnames = () => {
  const local = JSON.parse(localStorage.getItem("opnameList") || "[]");
  return [...mockStockOpname, ...local].sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
  );
};

const getAllAdjustments = () => {
  const local = JSON.parse(localStorage.getItem("adjustmentList") || "[]");
  return [...mockAdjustment, ...local].sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
  );
};

const saveOpname = (opname) => {
  const stored = JSON.parse(localStorage.getItem("opnameList") || "[]");
  stored.unshift(opname);
  localStorage.setItem("opnameList", JSON.stringify(stored));
};

const saveAdjustment = (adj) => {
  const stored = JSON.parse(localStorage.getItem("adjustmentList") || "[]");
  stored.unshift(adj);
  localStorage.setItem("adjustmentList", JSON.stringify(stored));
};

const getSumberAdjustment = (adj) => {
  return adj.referensi && adj.referensi.startsWith("SO-")
    ? "Opname"
    : "Penyesuaian Independen";
};

// ============================================================
// TAB 1: FORM STOCK OPNAME
// ============================================================
function FormOpname({ onSaved, activeDraftId, onDraftIdChange }) {
  const [bulan, setBulan] = useState(currentMonth);
  const [tahun, setTahun] = useState(currentYear);
  const [filterJenis, setFilterJenis] = useState("");
  const [rows, setRows] = useState(() => buildOpnameRows(""));
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  // Load draft ketika activeDraftId berubah
  useEffect(() => {
    if (!activeDraftId) return;
    const drafts = JSON.parse(localStorage.getItem("opnameList") || "[]");
    const draft = drafts.find((d) => d.id === activeDraftId);
    if (!draft) return;
    setBulan(draft.bulan || currentMonth);
    setTahun(draft.tahun || currentYear);
    setFilterJenis("");
  }, [activeDraftId]);

  // Rebuild rows + overlay draft values
  useEffect(() => {
    const base = buildOpnameRows(filterJenis);
    if (!activeDraftId) {
      setRows(base);
      return;
    }
    const drafts = JSON.parse(localStorage.getItem("opnameList") || "[]");
    const draft = drafts.find((d) => d.id === activeDraftId);
    if (!draft) {
      setRows(base);
      return;
    }
    const items = draft.items || [];
    const merged = base.map((r) => {
      const di = items.find((x) => x.batchId === r.batchId);
      if (di) {
        return {
          ...r,
          stokFisik: di.stokFisik ?? "",
          kategoriAlasan:
            di.kategoriAlasan === "-" ? "" : di.kategoriAlasan || "",
          alasan: di.alasan === "-" ? "" : di.alasan || "",
        };
      }
      return r;
    });
    setRows(merged);
  }, [filterJenis, activeDraftId]);

  const updateRow = (idx, field, value) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [field]: value };
    setRows(next);
  };

  const getSelisih = (r) => {
    if (r.stokFisik === "" || r.stokFisik === null) return null;
    return Number(r.stokFisik) - Number(r.stokSistem);
  };

  const filledRows = rows.filter(
    (r) => r.stokFisik !== "" && r.stokFisik !== null,
  );
  const selisihRows = filledRows.filter((r) => getSelisih(r) !== 0);
  const totalVariance = selisihRows.reduce((s, r) => s + getSelisih(r), 0);
  const filledCount = filledRows.length;
  const totalCount = rows.length;
  const allFilled = filledCount === totalCount;
  const hasNegative = filledRows.some((r) => Number(r.stokFisik) < 0);
  const allAlasanFilled = selisihRows.every(
    (r) => r.kategoriAlasan.trim() !== "" && r.alasan.trim() !== "",
  );

  const canSaveDraft = filledCount > 0 && !hasNegative;
  const canFinalize = allFilled && allAlasanFilled && !hasNegative;

  const generateNomor = (status, bulanVal, tahunVal) => {
    const mm = String(bulanVal).padStart(2, "0");
    const prefix = status === "draft" ? "SO-DRAFT" : "SO";
    return `${prefix}-${tahunVal}-${mm}-${String(Math.floor(Math.random() * 900) + 100)}`;
  };

  const persistOpname = (status) => {
    const drafts = JSON.parse(localStorage.getItem("opnameList") || "[]");
    const items = filledRows.map((r) => ({
      batchId: r.batchId,
      kodeObat: r.kodeObat,
      namaObat: r.namaObat,
      noBatch: r.noBatch,
      satuan: r.satuan,
      stokSistem: r.stokSistem,
      stokFisik: Number(r.stokFisik),
      selisih: Number(r.stokFisik) - r.stokSistem,
      kategoriAlasan: r.kategoriAlasan || "-",
      alasan: r.alasan || "-",
    }));

    const tanggal =
      status === "selesai" ? new Date().toISOString().slice(0, 10) : "";
    const nomor = generateNomor(status, bulan, tahun);

    const baseData = {
      periode: `${bulanList[bulan - 1]} ${tahun}`,
      bulan,
      tahun,
      tanggal,
      status,
      totalItem: totalCount,
      totalItemSelisih: selisihRows.length,
      totalVariance,
      items,
    };

    let result;
    if (activeDraftId) {
      // Update existing draft
      const idx = drafts.findIndex((d) => d.id === activeDraftId);
      if (idx >= 0) {
        result = {
          ...drafts[idx],
          ...baseData,
          nomor: status === "selesai" ? nomor : drafts[idx].nomor,
        };
        drafts[idx] = result;
      } else {
        result = { id: Date.now(), nomor, ...baseData };
        drafts.unshift(result);
      }
    } else {
      result = { id: Date.now(), nomor, ...baseData };
      drafts.unshift(result);
      if (status === "draft") {
        onDraftIdChange(result.id);
      }
    }

    localStorage.setItem("opnameList", JSON.stringify(drafts));

    if (status === "selesai") {
      result.items
        .filter((it) => it.selisih !== 0)
        .forEach((it) => {
          saveAdjustment({
            id: Date.now() + Math.random(),
            tanggal: result.tanggal,
            obatId: mockObat.find((o) => o.kode === it.kodeObat)?.id,
            namaObat: it.namaObat,
            noBatch: it.noBatch,
            jenis: it.selisih > 0 ? "tambah" : "kurang",
            jumlah: Math.abs(it.selisih),
            kategoriAlasan: it.kategoriAlasan,
            alasan: it.alasan,
            referensi: result.nomor,
          });
        });
    }

    return result;
  };

  const handleSimpanDraft = () => {
    if (!canSaveDraft) {
      if (hasNegative) alert("Stok fisik tidak boleh negatif.");
      else alert("Minimal satu item harus diisi.");
      return;
    }
    const opname = persistOpname("draft");
    alert(
      `Draft ${opname.nomor} tersimpan.\n${filledCount} dari ${totalCount} item terisi.\nStok BELUM diubah. Form tetap terbuka — Anda bisa melanjutkan kapan saja.`,
    );
    onSaved?.();
  };

  const handleFinalisasi = () => {
    if (!canFinalize) {
      if (hasNegative) {
        alert("Stok fisik tidak boleh negatif.");
        return;
      }
      if (!allFilled) {
        alert(`Masih ada ${totalCount - filledCount} item yang belum diisi.`);
        return;
      }
      if (!allAlasanFilled) {
        alert("Semua item selisih wajib memiliki kategori & detail alasan.");
        return;
      }
      return;
    }
    setShowFinalConfirm(true);
  };

  const doFinalize = () => {
    const opname = persistOpname("selesai");
    alert(
      `Opname ${opname.nomor} difinalisasi.\n${selisihRows.length} item disesuaikan. Total variance: ${fmt(totalVariance)}.`,
    );
    setShowFinalConfirm(false);
    onDraftIdChange(null);
    setRows(buildOpnameRows(filterJenis));
    onSaved?.();
  };

  return (
    <>
      {activeDraftId && (
        <div className="info-banner info" style={{ fontSize: 12 }}>
          <strong>Melanjutkan draft.</strong> Data yang sudah diisi telah dimuat
          kembali. Anda dapat melanjutkan pengisian atau memfinalisasi kapan
          saja.
          <button
            className="btn btn-sm"
            style={{ marginLeft: 12 }}
            onClick={() => {
              if (
                !confirm(
                  "Batalkan draft ini? Data yang tersimpan akan dihapus.",
                )
              )
                return;
              const drafts = JSON.parse(
                localStorage.getItem("opnameList") || "[]",
              );
              const filtered = drafts.filter((d) => d.id !== activeDraftId);
              localStorage.setItem("opnameList", JSON.stringify(filtered));
              onDraftIdChange(null);
              setRows(buildOpnameRows(filterJenis));
              onSaved?.();
            }}
          >
            Batalkan Draft
          </button>
        </div>
      )}

      <div className="card">
        <div className="section-title">Buat Stock Opname Baru</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Bulan *</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              disabled={!!activeDraftId}
            >
              {bulanList.map((b, i) => (
                <option key={i} value={i + 1}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tahun *</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              disabled={!!activeDraftId}
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Filter Jenis (opsional)</label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="">Semua Jenis</option>
              {jenisProgramOptions.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 8 }}>
          <strong>Catatan:</strong> untuk opname lengkap, gunakan "Semua Jenis".
          Semua item wajib diisi stok fisiknya sebelum finalisasi.
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
            Daftar Item ({filledCount} / {totalCount} terisi)
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Obat</th>
                <th>Batch</th>
                <th style={{ textAlign: "right" }}>Stok Fisik *</th>
                <th style={{ textAlign: "right" }}>Stok Sistem</th>
                <th style={{ textAlign: "right" }}>Selisih</th>
                <th style={{ textAlign: "right" }}>Jumlah Stok Akhir</th>
                <th>Kategori Alasan *</th>
                <th>Detail Alasan *</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const selisih = getSelisih(r);
                const isFilled = r.stokFisik !== "" && r.stokFisik !== null;
                const isNegative = isFilled && Number(r.stokFisik) < 0;
                const needsReason = selisih !== null && selisih !== 0;
                return (
                  <tr key={r.batchId}>
                    <td style={{ fontSize: 12 }}>{r.namaObat}</td>
                    <td>
                      <code style={{ fontSize: 11 }}>{r.noBatch}</code>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <input
                        type="number"
                        value={r.stokFisik}
                        onChange={(e) =>
                          updateRow(i, "stokFisik", e.target.value)
                        }
                        placeholder="wajib"
                        min="0"
                        style={{
                          width: 100,
                          padding: "4px 8px",
                          textAlign: "right",
                          borderColor: isNegative
                            ? "var(--danger)"
                            : isFilled
                              ? "var(--gray-300)"
                              : "var(--warning)",
                        }}
                      />
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {fmt(r.stokSistem)}{" "}
                      <span style={{ fontSize: 11, color: "var(--gray-600)" }}>
                        {r.satuan}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {selisih === null ? (
                        <span
                          style={{ fontSize: 11, color: "var(--gray-400)" }}
                        >
                          —
                        </span>
                      ) : (
                        <span
                          className={`badge ${selisih === 0 ? "badge-success" : selisih > 0 ? "badge-info" : "badge-warning"}`}
                        >
                          {selisih > 0 ? `+${fmt(selisih)}` : fmt(selisih)}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {isFilled ? (
                        <strong>
                          {fmt(r.stokFisik)} {r.satuan}
                        </strong>
                      ) : (
                        <span
                          style={{ fontSize: 11, color: "var(--gray-400)" }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td>
                      {needsReason ? (
                        <select
                          value={r.kategoriAlasan}
                          onChange={(e) =>
                            updateRow(i, "kategoriAlasan", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "4px 8px",
                            borderColor: r.kategoriAlasan
                              ? "var(--gray-300)"
                              : "var(--danger)",
                          }}
                        >
                          <option value="">— Pilih —</option>
                          {kategoriAlasanOpname.map((k) => (
                            <option key={k.value} value={k.value}>
                              {k.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          style={{ fontSize: 11, color: "var(--gray-400)" }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td>
                      {needsReason ? (
                        <input
                          value={r.alasan}
                          onChange={(e) =>
                            updateRow(i, "alasan", e.target.value)
                          }
                          placeholder="Detail alasan (wajib)"
                          style={{
                            width: "100%",
                            padding: "4px 8px",
                            borderColor: r.alasan
                              ? "var(--gray-300)"
                              : "var(--danger)",
                          }}
                        />
                      ) : (
                        <span
                          style={{ fontSize: 11, color: "var(--gray-400)" }}
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "var(--gray-50)",
            borderRadius: 8,
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <strong>Item Terisi:</strong> {filledCount} / {totalCount}
          </div>
          <div>
            <strong>Item Selisih:</strong>{" "}
            <span
              className={`badge ${selisihRows.length > 0 ? "badge-warning" : "badge-success"}`}
            >
              {selisihRows.length}
            </span>
          </div>
          <div>
            <strong>Total Variance:</strong>{" "}
            <span
              className={`badge ${totalVariance === 0 ? "badge-success" : "badge-warning"}`}
            >
              {totalVariance > 0
                ? `+${fmt(totalVariance)}`
                : fmt(totalVariance)}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            className="btn"
            onClick={handleSimpanDraft}
            disabled={!canSaveDraft}
          >
            {activeDraftId ? "Perbarui Draft" : "Simpan Draft"}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleFinalisasi}
            disabled={!canFinalize}
          >
            Finalisasi &amp; Sesuaikan Stok
          </button>
        </div>
        {!canFinalize && (
          <div
            style={{
              textAlign: "right",
              fontSize: 11,
              color: "var(--gray-600)",
              marginTop: 6,
            }}
          >
            {hasNegative && "Stok fisik tidak boleh negatif. "}
            {!allFilled && `${totalCount - filledCount} item belum diisi. `}
            {!allAlasanFilled &&
              "Item selisih belum lengkap alasan/kategorinya."}
          </div>
        )}
      </div>

      {showFinalConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowFinalConfirm(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Konfirmasi Finalisasi Opname</h3>
              <button onClick={() => setShowFinalConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ lineHeight: 1.6 }}>
                Finalisasi opname{" "}
                <strong>
                  {bulanList[bulan - 1]} {tahun}
                </strong>
                ?
              </p>
              <ul style={{ paddingLeft: 20, lineHeight: 1.8, fontSize: 13 }}>
                <li>{totalCount} item diperiksa</li>
                <li>{selisihRows.length} item dengan selisih</li>
                <li>
                  Total variance:{" "}
                  <strong>
                    {totalVariance > 0
                      ? `+${fmt(totalVariance)}`
                      : fmt(totalVariance)}
                  </strong>
                </li>
              </ul>
              <div className="info-banner warning" style={{ marginTop: 12 }}>
                Setelah finalisasi, stok disesuaikan dan adjustment tercatat.
                Tidak dapat diubah.
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn"
                onClick={() => setShowFinalConfirm(false)}
              >
                Batal
              </button>
              <button className="btn btn-primary" onClick={doFinalize}>
                Ya, Finalisasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// TAB 2: FORM PENYESUAIAN INDEPENDEN
// ============================================================
function FormPenyesuaian({ prefill, onSaved }) {
  const [filterJenis, setFilterJenis] = useState("");
  const [form, setForm] = useState({
    batchId: prefill?.batchId || "",
    jenis: "kurang",
    jumlah: prefill?.jumlah || 0,
    kategoriAlasan: prefill?.kategori || "",
    alasan: "",
    referensi: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(null);

  const selected = form.batchId
    ? mockBatchObat.find((b) => b.id === Number(form.batchId))
    : null;
  const stokSetelah = selected
    ? selected.stok +
      (form.jenis === "tambah" ? Number(form.jumlah) : -Number(form.jumlah))
    : 0;
  const jumlah = Number(form.jumlah) || 0;
  const nilaiPerubahan = selected ? jumlah * selected.hargaSatuan : 0;
  const referensiWajib =
    form.kategoriAlasan === "Salah Input" || form.kategoriAlasan === "Retur";

  const valid =
    selected &&
    jumlah > 0 &&
    form.kategoriAlasan.trim() !== "" &&
    form.alasan.trim() !== "" &&
    stokSetelah >= 0 &&
    (!referensiWajib || form.referensi.trim() !== "");

  const batchOptions = mockBatchObat.filter((b) => {
    if (!filterJenis) return true;
    const info = getObatInfo(b.kodeObat);
    return matchesJenisValue(info, filterJenis);
  });

  const handleSimpan = () => {
    if (!valid) return;
    setShowConfirm(true);
  };

  const doSimpan = () => {
    const adj = {
      id: Date.now(),
      tanggal: new Date().toISOString().slice(0, 10),
      obatId: selected.obatId,
      namaObat: selected.namaObat,
      noBatch: selected.noBatch,
      jenis: form.jenis,
      jumlah,
      kategoriAlasan: form.kategoriAlasan,
      alasan: form.alasan,
      referensi:
        form.referensi ||
        `ADJ-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 900) + 100)}`,
    };
    saveAdjustment(adj);
    setSaved({ ...adj, stokSebelum: selected.stok, stokSetelah });
    setForm({
      batchId: "",
      jenis: "kurang",
      jumlah: 0,
      kategoriAlasan: "",
      alasan: "",
      referensi: "",
    });
    setShowConfirm(false);
    onSaved?.();
  };

  return (
    <>
      {saved && (
        <div className="info-banner success">
          <strong>✓ Penyesuaian disimpan.</strong> {saved.namaObat} batch{" "}
          <code>{saved.noBatch}</code>: stok{" "}
          {saved.jenis === "tambah" ? "bertambah" : "berkurang"}{" "}
          {fmt(saved.jumlah)} unit, dari{" "}
          <strong>{fmt(saved.stokSebelum)}</strong> menjadi{" "}
          <strong>{fmt(saved.stokSetelah)}</strong>.
        </div>
      )}

      <div className="info-banner info" style={{ fontSize: 12 }}>
        <strong>Kapan menggunakan form ini:</strong> untuk koreksi satu batch
        dengan penyebab yang sudah diketahui. Untuk verifikasi menyeluruh
        seluruh batch, gunakan tab <strong>Stock Opname</strong>.
      </div>

      <div className="card">
        <div className="section-title">Form Penyesuaian Stok</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Filter Jenis Obat</label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="">Semua Jenis</option>
              {jenisProgramOptions.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Batch *</label>
            <select
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
            >
              <option value="">— Pilih Batch —</option>
              {batchOptions.map((b) => {
                const info = getObatInfo(b.kodeObat);
                const jenisLabel =
                  info.jenis === "Program"
                    ? `Program ${info.program}`
                    : "Buffer";
                return (
                  <option key={b.id} value={b.id}>
                    [{jenisLabel}] {b.namaObat} — {b.noBatch} (stok{" "}
                    {fmt(b.stok)} {b.satuan})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label>Jenis *</label>
            <select
              value={form.jenis}
              onChange={(e) => setForm({ ...form, jenis: e.target.value })}
            >
              <option value="tambah">Tambah Stok</option>
              <option value="kurang">Kurangi Stok</option>
            </select>
          </div>
          <div className="form-group">
            <label>Jumlah *</label>
            <input
              type="number"
              min={1}
              value={form.jumlah}
              onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Kategori Alasan *</label>
            <select
              value={form.kategoriAlasan}
              onChange={(e) =>
                setForm({ ...form, kategoriAlasan: e.target.value })
              }
            >
              <option value="">— Pilih Kategori —</option>
              {kategoriAlasanOpname.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Referensi {referensiWajib ? "*" : "(opsional)"}</label>
            <input
              value={form.referensi}
              onChange={(e) => setForm({ ...form, referensi: e.target.value })}
              placeholder={
                referensiWajib
                  ? "Nomor dokumen asli (wajib untuk kategori ini)"
                  : "Nomor dokumen pendukung"
              }
              style={
                referensiWajib && !form.referensi.trim()
                  ? { borderColor: "var(--danger)" }
                  : {}
              }
            />
          </div>
          <div className="form-group full">
            <label>Detail Alasan *</label>
            <textarea
              rows={2}
              value={form.alasan}
              onChange={(e) => setForm({ ...form, alasan: e.target.value })}
              placeholder="Contoh: 5 tablet pecah saat penyimpanan di rak B-02"
            />
          </div>
        </div>

        {selected && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "var(--gray-50)",
              borderRadius: 8,
              fontSize: 13,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "var(--gray-600)" }}>
                Stok Saat Ini
              </div>
              <strong>
                {fmt(selected.stok)} {selected.satuan}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--gray-600)" }}>
                Perubahan
              </div>
              <strong
                style={{
                  color:
                    form.jenis === "tambah"
                      ? "var(--success)"
                      : "var(--danger)",
                }}
              >
                {form.jenis === "tambah" ? "+" : "-"}
                {fmt(jumlah)} {selected.satuan}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--gray-600)" }}>
                Stok Setelah
              </div>
              <strong
                style={{
                  color: stokSetelah < 0 ? "var(--danger)" : "var(--success)",
                }}
              >
                {fmt(stokSetelah)} {selected.satuan}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--gray-600)" }}>
                Nilai Perubahan
              </div>
              <strong>{rupiah(nilaiPerubahan)}</strong>
            </div>
          </div>
        )}

        {selected && stokSetelah < 0 && (
          <div
            className="info-banner danger"
            style={{ marginTop: 12, fontSize: 12 }}
          >
            Stok tidak boleh negatif. Kurangi jumlah atau ubah jenis menjadi
            "Tambah".
          </div>
        )}

        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            className="btn btn-primary"
            onClick={handleSimpan}
            disabled={!valid}
          >
            Simpan Penyesuaian
          </button>
        </div>
      </div>

      {showConfirm && selected && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Konfirmasi Penyesuaian Stok</h3>
              <button onClick={() => setShowConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <dl className="detail-list">
                <dt>Obat</dt>
                <dd>
                  <strong>{selected.namaObat}</strong>
                </dd>
                <dt>Batch</dt>
                <dd>
                  <code>{selected.noBatch}</code>
                </dd>
                <dt>Jenis</dt>
                <dd>
                  <span
                    className={`badge ${form.jenis === "tambah" ? "badge-success" : "badge-warning"}`}
                  >
                    {form.jenis === "tambah" ? "Tambah Stok" : "Kurangi Stok"}
                  </span>
                </dd>
                <dt>Jumlah</dt>
                <dd>
                  <strong>
                    {fmt(jumlah)} {selected.satuan}
                  </strong>
                </dd>
                <dt>Stok</dt>
                <dd>
                  {fmt(selected.stok)} → <strong>{fmt(stokSetelah)}</strong>
                </dd>
                <dt>Nilai Perubahan</dt>
                <dd>
                  <strong>{rupiah(nilaiPerubahan)}</strong>
                </dd>
                <dt>Kategori</dt>
                <dd>{form.kategoriAlasan}</dd>
                <dt>Alasan</dt>
                <dd style={{ fontSize: 12 }}>{form.alasan}</dd>
                {form.referensi && (
                  <>
                    <dt>Referensi</dt>
                    <dd>
                      <code>{form.referensi}</code>
                    </dd>
                  </>
                )}
              </dl>
              <div
                className="info-banner warning"
                style={{ marginTop: 12, fontSize: 12 }}
              >
                Setelah disimpan, stok berubah permanen dan tercatat di riwayat.
                Tidak bisa dihapus.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowConfirm(false)}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={doSimpan}>
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// RIWAYAT GABUNGAN
// ============================================================
function RiwayatGabungan({ refreshKey, onLanjutkanDraft }) {
  const [filterJenis, setFilterJenis] = useState("semua"); // semua | opname | penyesuaian
  const [search, setSearch] = useState("");
  const [detailOpname, setDetailOpname] = useState(null);

  const opnames = getAllOpnames().filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.nomor.toLowerCase().includes(q) ||
      (o.periode || "").toLowerCase().includes(q)
    );
  });

  const adjustments = getAllAdjustments().filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.namaObat.toLowerCase().includes(q) ||
      a.noBatch.toLowerCase().includes(q) ||
      (a.alasan || "").toLowerCase().includes(q) ||
      (a.referensi || "").toLowerCase().includes(q)
    );
  });

  const exportOpnameCSV = () => {
    const headers = [
      "Nomor",
      "Periode",
      "Tanggal",
      "Total Item",
      "Item Selisih",
      "Total Variance",
      "Status",
    ];
    const rows = opnames.map((o) => [
      o.nomor,
      o.periode,
      o.tanggal || "-",
      o.totalItem,
      o.totalItemSelisih,
      o.totalVariance,
      o.status === "selesai" ? "Selesai" : "Draft",
    ]);
    downloadCSV(
      headers,
      rows,
      `RiwayatOpname_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const exportPenyesuaianCSV = () => {
    const headers = [
      "Tanggal",
      "Referensi",
      "Sumber",
      "Obat",
      "Batch",
      "Jenis",
      "Jumlah",
      "Kategori",
      "Alasan",
    ];
    const rows = adjustments.map((a) => [
      a.tanggal,
      a.referensi,
      getSumberAdjustment(a),
      a.namaObat,
      a.noBatch,
      a.jenis,
      a.jumlah,
      a.kategoriAlasan || "-",
      a.alasan,
    ]);
    downloadCSV(
      headers,
      rows,
      `RiwayatPenyesuaian_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const downloadCSV = (headers, rows, filename) => {
    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"),
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div className="section-title" style={{ marginBottom: 0 }}>
            Riwayat
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {filterJenis !== "penyesuaian" && (
              <button className="btn btn-sm" onClick={exportOpnameCSV}>
                Ekspor Opname
              </button>
            )}
            {filterJenis !== "opname" && (
              <button className="btn btn-sm" onClick={exportPenyesuaianCSV}>
                Ekspor Penyesuaian
              </button>
            )}
          </div>
        </div>

        <div className="filter-bar">
          <input
            placeholder="Cari nomor, obat, batch, alasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="semua">Semua Riwayat</option>
            <option value="opname">Hanya Stock Opname</option>
            <option value="penyesuaian">Hanya Penyesuaian</option>
          </select>
        </div>

        {(filterJenis === "semua" || filterJenis === "opname") && (
          <>
            <div className="section-title" style={{ marginTop: 12 }}>
              Riwayat Stock Opname ({opnames.length})
            </div>
            {opnames.length === 0 ? (
              <div className="empty-state">Belum ada opname.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nomor</th>
                      <th>Periode</th>
                      <th>Tanggal</th>
                      <th style={{ textAlign: "center" }}>Item</th>
                      <th style={{ textAlign: "center" }}>Selisih</th>
                      <th style={{ textAlign: "right" }}>Variance</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opnames.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <code>{o.nomor}</code>
                        </td>
                        <td>{o.periode}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {o.tanggal || "-"}
                        </td>
                        <td style={{ textAlign: "center" }}>{o.totalItem}</td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            className={`badge ${o.totalItemSelisih > 0 ? "badge-warning" : "badge-success"}`}
                          >
                            {o.totalItemSelisih}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span
                            className={`badge ${o.totalVariance === 0 ? "badge-success" : "badge-warning"}`}
                          >
                            {o.totalVariance > 0
                              ? `+${fmt(o.totalVariance)}`
                              : fmt(o.totalVariance)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${o.status === "selesai" ? "badge-success" : "badge-gray"}`}
                          >
                            {o.status === "selesai" ? "Selesai" : "Draft"}
                          </span>
                        </td>
                        <td>
                          {o.status === "draft" ? (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => onLanjutkanDraft?.(o)}
                            >
                              Lanjutkan
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm"
                              onClick={() => setDetailOpname(o)}
                            >
                              Detail
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {(filterJenis === "semua" || filterJenis === "penyesuaian") && (
          <>
            <div className="section-title" style={{ marginTop: 16 }}>
              Riwayat Penyesuaian ({adjustments.length})
            </div>
            {adjustments.length === 0 ? (
              <div className="empty-state">Belum ada penyesuaian.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Sumber</th>
                      <th>Referensi</th>
                      <th>Obat</th>
                      <th>Batch</th>
                      <th>Jenis</th>
                      <th style={{ textAlign: "right" }}>Jumlah</th>
                      <th>Kategori</th>
                      <th>Alasan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.map((a) => (
                      <tr key={a.id}>
                        <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                          {a.tanggal}
                        </td>
                        <td>
                          <span
                            className={`badge ${getSumberAdjustment(a) === "Opname" ? "badge-info" : "badge-warning"}`}
                          >
                            {getSumberAdjustment(a)}
                          </span>
                        </td>
                        <td>
                          <code>{a.referensi}</code>
                        </td>
                        <td style={{ fontSize: 12 }}>{a.namaObat}</td>
                        <td>
                          <code style={{ fontSize: 11 }}>{a.noBatch}</code>
                        </td>
                        <td>
                          <span
                            className={`badge ${a.jenis === "tambah" ? "badge-success" : "badge-warning"}`}
                          >
                            {a.jenis === "tambah" ? "Tambah" : "Kurang"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>{fmt(a.jumlah)}</td>
                        <td style={{ fontSize: 12 }}>
                          {a.kategoriAlasan || "-"}
                        </td>
                        <td style={{ fontSize: 12 }}>{a.alasan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {detailOpname && (
        <div className="modal-overlay" onClick={() => setDetailOpname(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: 900 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Detail Opname — {detailOpname.nomor}</h3>
              <button onClick={() => setDetailOpname(null)}>×</button>
            </div>
            <div className="modal-body">
              <dl className="detail-list" style={{ marginBottom: 16 }}>
                <dt>Periode</dt>
                <dd>{detailOpname.periode}</dd>
                <dt>Tanggal</dt>
                <dd>{detailOpname.tanggal || "-"}</dd>
                <dt>Status</dt>
                <dd>
                  <span
                    className={`badge ${detailOpname.status === "selesai" ? "badge-success" : "badge-gray"}`}
                  >
                    {detailOpname.status === "selesai" ? "Selesai" : "Draft"}
                  </span>
                </dd>
                <dt>Total Item</dt>
                <dd>{detailOpname.totalItem}</dd>
                <dt>Item Selisih</dt>
                <dd>{detailOpname.totalItemSelisih}</dd>
                <dt>Total Variance</dt>
                <dd>
                  <strong>
                    {detailOpname.totalVariance > 0
                      ? `+${fmt(detailOpname.totalVariance)}`
                      : fmt(detailOpname.totalVariance)}
                  </strong>
                </dd>
              </dl>
              {!detailOpname.items || detailOpname.items.length === 0 ? (
                <div className="empty-state">
                  Tidak ada rincian item tersimpan.
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Obat</th>
                        <th>Batch</th>
                        <th style={{ textAlign: "right" }}>Stok Sistem</th>
                        <th style={{ textAlign: "right" }}>Stok Fisik</th>
                        <th style={{ textAlign: "right" }}>Selisih</th>
                        <th>Kategori</th>
                        <th>Alasan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailOpname.items.map((it, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 12 }}>{it.namaObat}</td>
                          <td>
                            <code style={{ fontSize: 11 }}>{it.noBatch}</code>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {fmt(it.stokSistem)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {fmt(it.stokFisik)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              className={`badge ${it.selisih === 0 ? "badge-success" : it.selisih > 0 ? "badge-info" : "badge-warning"}`}
                            >
                              {it.selisih > 0
                                ? `+${fmt(it.selisih)}`
                                : fmt(it.selisih)}
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {it.kategoriAlasan || "-"}
                          </td>
                          <td style={{ fontSize: 12 }}>{it.alasan || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDetailOpname(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function PenyesuaianStok() {
  const [params] = useSearchParams();
  const [activeTab, setActiveTab] = useState(params.get("tab") || "opname");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeDraftId, setActiveDraftId] = useState(null);

  const prefill = {
    batchId: params.get("batchId") || "",
    kategori: params.get("kategori") || "",
    jumlah: params.get("jumlah") || "",
  };

  const handleSaved = () => setRefreshKey((k) => k + 1);

  const handleLanjutkanDraft = (draft) => {
    setActiveDraftId(draft.id);
    setActiveTab("opname");
  };

  const handleDraftIdChange = (id) => {
    setActiveDraftId(id);
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Penyesuaian Stok</h2>
          <p>
            Stock opname berkala (bulanan) atau penyesuaian independen satu
            batch. Pilih tab sesuai kebutuhan.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            className={activeTab === "opname" ? "active" : ""}
            onClick={() => setActiveTab("opname")}
          >
            Stock Opname
          </button>
          <button
            className={activeTab === "penyesuaian" ? "active" : ""}
            onClick={() => setActiveTab("penyesuaian")}
          >
            Penyesuaian Stok
          </button>
        </div>
        <div style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 8 }}>
          {activeTab === "opname"
            ? "Verifikasi menyeluruh seluruh batch pada periode tertentu. Draft bisa disimpan dan dilanjutkan kapan saja."
            : "Koreksi terarah satu batch dengan penyebab yang sudah diketahui (rusak, salah input, kedaluwarsa, retur, dll)."}
        </div>
      </div>

      {activeTab === "opname" && (
        <FormOpname
          onSaved={handleSaved}
          activeDraftId={activeDraftId}
          onDraftIdChange={handleDraftIdChange}
        />
      )}
      {activeTab === "penyesuaian" && (
        <FormPenyesuaian prefill={prefill} onSaved={handleSaved} />
      )}

      <RiwayatGabungan
        key={refreshKey}
        onLanjutkanDraft={handleLanjutkanDraft}
      />
    </>
  );
}
