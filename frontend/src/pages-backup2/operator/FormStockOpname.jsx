import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  mockBatchObat,
  mockStockOpname,
  getObatInfo,
  jenisProgramOptions,
  matchesJenisValue,
  kategoriAlasanOpname,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

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

const buildRows = (filterJenis) => {
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
      stokFisik: "", // kosong, wajib diisi operator
      kategoriAlasan: "",
      alasan: "",
    }));
};

export default function FormStockOpname() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const isDraft = false; // mode draft, ditentukan dari tombol yang diklik

  const [bulan, setBulan] = useState(currentMonth);
  const [tahun, setTahun] = useState(currentYear);
  const [filterJenis, setFilterJenis] = useState("");
  const [rows, setRows] = useState(() => buildRows(""));
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  // Muat data draft jika edit
  useEffect(() => {
    if (isEdit) {
      const existing = mockStockOpname.find((so) => so.id === Number(id));
      if (existing) {
        setBulan(existing.bulan || currentMonth);
        setTahun(existing.tahun || currentYear);
        setRows(
          existing.items.map((it) => ({
            batchId: it.batchId,
            kodeObat: it.kodeObat,
            namaObat: it.namaObat,
            noBatch: it.noBatch,
            satuan: it.satuan,
            stokSistem: it.stokSistem,
            stokFisik: it.stokFisik,
            kategoriAlasan: it.kategoriAlasan === "-" ? "" : it.kategoriAlasan,
            alasan: it.alasan === "-" ? "" : it.alasan,
          })),
        );
      }
    }
  }, [id, isEdit]);

  // Reset baris saat filter jenis berubah
  useEffect(() => {
    setRows(buildRows(filterJenis));
  }, [filterJenis]);

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

  const handleSimpanDraft = () => {
    if (!canSaveDraft) {
      if (hasNegative) alert("Stok fisik tidak boleh negatif.");
      else alert("Minimal satu item harus diisi.");
      return;
    }
    alert(
      `Draft opname ${bulanList[bulan - 1]} ${tahun} tersimpan.\n` +
        `${filledCount} dari ${totalCount} item terisi. Stok BELUM diubah.\n` +
        `Lanjutkan kapan saja dari daftar opname.`,
    );
    navigate("/operator/stock-opname");
  };

  const handleFinalisasi = () => {
    if (!canFinalize) {
      if (hasNegative) {
        alert("Stok fisik tidak boleh negatif.");
        return;
      }
      if (!allFilled) {
        alert(
          `Masih ada ${totalCount - filledCount} item yang belum diisi stok fisiknya.`,
        );
        return;
      }
      if (!allAlasanFilled) {
        alert("Semua item selisih wajib memiliki kategori dan detail alasan.");
        return;
      }
      return;
    }
    setShowFinalConfirm(true);
  };

  const doFinalize = () => {
    alert(
      `Opname ${bulanList[bulan - 1]} ${tahun} difinalisasi.\n` +
        `${selisihRows.length} item disesuaikan. Total variance: ${totalVariance}.\n` +
        `Adjustment tercatat di riwayat transaksi dan kartu stok.`,
    );
    setShowFinalConfirm(false);
    navigate("/operator/stock-opname");
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{isEdit ? "Lanjutkan Draft Opname" : "Stock Opname Baru"}</h2>
          <p>
            Masukkan stok fisik hasil hitung. Semua item wajib diisi. Item
            dengan selisih wajib diberi kategori dan detail alasan.
          </p>
        </div>
        <button
          className="btn"
          onClick={() => navigate("/operator/stock-opname")}
        >
          Kembali
        </button>
      </div>

      <div className="card">
        <div className="section-title">Periode &amp; Filter</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Bulan *</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              disabled={isEdit}
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
              disabled={isEdit}
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
                <th style={{ textAlign: "right" }}>Stok Sistem</th>
                <th style={{ textAlign: "right" }}>Stok Fisik *</th>
                <th style={{ textAlign: "right" }}>Selisih</th>
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
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {fmt(r.stokSistem)}{" "}
                      <span style={{ fontSize: 11, color: "var(--gray-600)" }}>
                        {r.satuan}
                      </span>
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
            onClick={() => navigate("/operator/stock-opname")}
          >
            Batal
          </button>
          <button
            className="btn"
            onClick={handleSimpanDraft}
            disabled={!canSaveDraft}
            title="Simpan progres tanpa mengubah stok"
          >
            Simpan Draft
          </button>
          <button
            className="btn btn-primary"
            onClick={handleFinalisasi}
            disabled={!canFinalize}
            title="Finalisasi dan sesuaikan stok"
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
                <strong>Setelah finalisasi:</strong> stok akan disesuaikan dan{" "}
                <strong>tidak dapat diubah lagi</strong>. Adjustment tercatat di
                riwayat transaksi dan kartu stok. Jika ada kesalahan, gunakan
                Penyesuaian Stok dengan alasan.
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
