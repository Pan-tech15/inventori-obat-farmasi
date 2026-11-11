// src/pages/operator/KartuStok.jsx
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  mockBatchObat,
  mockRiwayatTransaksi,
  getObatInfo,
  jenisProgramOptions,
  matchesJenisValue,
} from "../../data/mockOperator";
import { mockObat } from "../../data/mockData";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const currentYear = new Date().getFullYear();

// Hitung status batch dari expiry + kategori (bukan dari field `status` yang hardcoded)
const computeBatchStatus = (batch) => {
  const d = Math.ceil((new Date(batch.expiry) - new Date()) / 86400000);
  if (d < 0)
    return { key: "expired", label: "Kedaluwarsa", cls: "badge-danger" };
  const ambang = batch.kategori === "Fast Moving" ? 210 : 90;
  if (d <= ambang)
    return { key: "karantina", label: "Karantina", cls: "badge-warning" };
  return { key: "normal", label: "Normal", cls: "badge-success" };
};

// Preset periode — Tahunan, Semester, Triwulan, Bulanan, Custom
const basePeriode = [
  {
    key: "tahunan",
    label: `Tahunan ${currentYear}`,
    start: `${currentYear}-01-01`,
    end: `${currentYear}-12-31`,
  },
  {
    key: "semester1",
    label: `Semester I ${currentYear}`,
    start: `${currentYear}-01-01`,
    end: `${currentYear}-06-30`,
  },
  {
    key: "semester2",
    label: `Semester II ${currentYear}`,
    start: `${currentYear}-07-01`,
    end: `${currentYear}-12-31`,
  },
  {
    key: "tw1",
    label: "Triwulan I",
    start: `${currentYear}-01-01`,
    end: `${currentYear}-03-31`,
  },
  {
    key: "tw2",
    label: "Triwulan II",
    start: `${currentYear}-04-01`,
    end: `${currentYear}-06-30`,
  },
  {
    key: "tw3",
    label: "Triwulan III",
    start: `${currentYear}-07-01`,
    end: `${currentYear}-09-30`,
  },
  {
    key: "tw4",
    label: "Triwulan IV",
    start: `${currentYear}-10-01`,
    end: `${currentYear}-12-31`,
  },
];

const bulanPeriode = Array.from({ length: 12 }, (_, i) => {
  const m = i + 1;
  const mm = String(m).padStart(2, "0");
  const lastDay = new Date(currentYear, m, 0).getDate();
  return {
    key: `bulan-${m}`,
    label: new Date(currentYear, i, 1).toLocaleDateString("id-ID", {
      month: "long",
    }),
    start: `${currentYear}-${mm}-01`,
    end: `${currentYear}-${mm}-${String(lastDay).padStart(2, "0")}`,
  };
});

const periodeTemplates = [
  ...basePeriode,
  ...bulanPeriode,
  { key: "custom", label: "Custom Range", start: "", end: "" },
];

const isInPeriod = (tanggal, start, end) => {
  const tgl = String(tanggal).slice(0, 10);
  if (start && tgl < start) return false;
  if (end && tgl > end) return false;
  return true;
};

const isBefore = (tanggal, dateStr) => {
  if (!dateStr) return false;
  return String(tanggal).slice(0, 10) < dateStr;
};

const normalizeJenis = (j) => {
  if (!j) return "";
  if (j === "Buffer") return "Buffer";
  if (j.startsWith("Program:")) return j;
  return `Program:${j}`;
};

export default function KartuStok() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [jenisValue, setJenisValue] = useState(
    normalizeJenis(params.get("jenis")),
  );
  const [obatKode, setObatKode] = useState(params.get("obat") || "");
  const [batchFilter, setBatchFilter] = useState(params.get("batch") || "");
  const [periodeKey, setPeriodeKey] = useState("tahunan");
  const [customStart, setCustomStart] = useState(`${currentYear}-01-01`);
  const [customEnd, setCustomEnd] = useState(`${currentYear}-12-31`);
  const [filterJenisTransaksi, setFilterJenisTransaksi] = useState("");

  const periode = useMemo(() => {
    if (periodeKey === "custom") {
      return {
        start: customStart,
        end: customEnd,
        label: `${customStart} s.d. ${customEnd}`,
      };
    }
    const tpl = periodeTemplates.find((p) => p.key === periodeKey);
    return tpl
      ? { start: tpl.start, end: tpl.end, label: tpl.label }
      : { start: "", end: "", label: "-" };
  }, [periodeKey, customStart, customEnd]);

  const obatOptions = useMemo(() => {
    if (!jenisValue) return [];
    return mockObat.filter(
      (o) =>
        o.status === "Aktif" &&
        matchesJenisValue({ jenis: o.jenis, program: o.program }, jenisValue),
    );
  }, [jenisValue]);

  const selectedObat = obatKode
    ? mockObat.find((o) => o.kode === obatKode)
    : null;

  const selectedBatches = useMemo(() => {
    if (!selectedObat) return [];
    return mockBatchObat.filter((b) => b.obatId === selectedObat.id);
  }, [selectedObat]);

  const info = obatKode ? getObatInfo(obatKode) : null;

  // Validasi: jika batch dari URL tidak ada di batch obat ini, reset
  useEffect(() => {
    if (batchFilter && selectedBatches.length > 0) {
      const exists = selectedBatches.some((b) => b.noBatch === batchFilter);
      if (!exists) setBatchFilter("");
    }
  }, [selectedBatches, batchFilter]);

  const batchesInScope = useMemo(() => {
    if (!batchFilter) return selectedBatches;
    return selectedBatches.filter((b) => b.noBatch === batchFilter);
  }, [selectedBatches, batchFilter]);

  // RINGKASAN PER BATCH
  // Saldo Awal = stokAwalTahun + mutasi SEBELUM periode
  // Saldo Akhir = Saldo Awal + masuk periode − keluar periode
  // Tidak menggunakan stok saat ini agar laporan periode selalu konsisten
  const batchSummary = useMemo(() => {
    if (!selectedObat) return [];
    return batchesInScope.map((b) => {
      const allTrans = mockRiwayatTransaksi.filter(
        (t) => t.namaObat === selectedObat.nama && t.noBatch === b.noBatch,
      );

      const sebelum = allTrans.filter((t) =>
        isBefore(t.tanggal, periode.start),
      );
      const masukSebelum = sebelum.reduce((s, t) => s + (t.masuk || 0), 0);
      const keluarSebelum = sebelum.reduce((s, t) => s + (t.keluar || 0), 0);

      const stokAwalTahun = b.stokAwalTahun ?? 0;
      const saldoAwal = stokAwalTahun + masukSebelum - keluarSebelum;

      const dalam = allTrans.filter((t) =>
        isInPeriod(t.tanggal, periode.start, periode.end),
      );
      const totalMasuk = dalam.reduce((s, t) => s + (t.masuk || 0), 0);
      const totalKeluar = dalam.reduce((s, t) => s + (t.keluar || 0), 0);

      const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;

      return { batch: b, saldoAwal, totalMasuk, totalKeluar, saldoAkhir };
    });
  }, [selectedObat, batchesInScope, periode]);

  const rekapTotal = useMemo(() => {
    return batchSummary.reduce(
      (s, r) => ({
        saldoAwal: s.saldoAwal + r.saldoAwal,
        totalMasuk: s.totalMasuk + r.totalMasuk,
        totalKeluar: s.totalKeluar + r.totalKeluar,
        saldoAkhir: s.saldoAkhir + r.saldoAkhir,
      }),
      { saldoAwal: 0, totalMasuk: 0, totalKeluar: 0, saldoAkhir: 0 },
    );
  }, [batchSummary]);

  const totalStokSemuaBatch = selectedBatches.reduce((s, b) => s + b.stok, 0);
  const totalNilaiSemuaBatch = selectedBatches.reduce(
    (s, b) => s + b.stok * b.hargaSatuan,
    0,
  );

  // RIWAYAT TRANSAKSI dengan saldo berjalan per batch
  // Saldo berjalan dihitung dari SEMUA transaksi periode, BARU difilter untuk display
  // agar saldo tetap akurat saat filter jenis transaksi aktif
  const transactionsWithSaldo = useMemo(() => {
    if (!selectedObat) return [];
    const allInPeriod = mockRiwayatTransaksi
      .filter((t) => {
        if (t.namaObat !== selectedObat.nama) return false;
        if (batchFilter && t.noBatch !== batchFilter) return false;
        if (!isInPeriod(t.tanggal, periode.start, periode.end)) return false;
        return true;
      })
      .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    if (allInPeriod.length === 0) return [];

    const saldoAwalMap = {};
    batchSummary.forEach((r) => {
      saldoAwalMap[r.batch.noBatch] = r.saldoAwal;
    });

    const byBatch = {};
    allInPeriod.forEach((t) => {
      if (!byBatch[t.noBatch]) byBatch[t.noBatch] = [];
      byBatch[t.noBatch].push(t);
    });

    const computed = [];
    Object.keys(byBatch).forEach((batchNo) => {
      let running = saldoAwalMap[batchNo] || 0;
      byBatch[batchNo].forEach((t) => {
        running = running + (t.masuk || 0) - (t.keluar || 0);
        computed.push({ ...t, saldoBatch: running });
      });
    });

    const filtered = computed.filter((t) => {
      if (filterJenisTransaksi && t.jenis !== filterJenisTransaksi)
        return false;
      return true;
    });

    return filtered.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
  }, [selectedObat, batchFilter, periode, filterJenisTransaksi, batchSummary]);

  const handleExportCSV = () => {
    const headers = [
      "Tanggal",
      "Jenis",
      "Referensi",
      "Batch",
      "Masuk",
      "Keluar",
      "Saldo Batch",
      "Keterangan",
    ];
    const rows = transactionsWithSaldo.map((t) => [
      t.tanggal,
      t.jenis,
      t.referensi,
      t.noBatch,
      t.masuk || 0,
      t.keluar || 0,
      t.saldoBatch != null ? t.saldoBatch : "-",
      t.keterangan,
    ]);
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
    a.download = `KartuStok_${(selectedObat?.nama || "obat").replace(/\s+/g, "_")}_${periode.start}_sd_${periode.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-header no-print">
        <div>
          <h2>Kartu Stok</h2>
          <p>
            Kartu stok per obat sesuai format Dinas Kesehatan.
            <strong> Ringkasan per Batch</strong> menunjukkan total akhir per
            batch,
            <strong> Riwayat Transaksi</strong> menunjukkan detail kejadian per
            transaksi.
          </p>
        </div>
        <button className="btn" onClick={() => navigate("/operator/stok")}>
          Kembali ke Stok
        </button>
      </div>

      <div className="card no-print">
        <div className="section-title">Pilih Obat</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Jenis Obat *</label>
            <select
              value={jenisValue}
              onChange={(e) => {
                setJenisValue(e.target.value);
                setObatKode("");
                setBatchFilter("");
              }}
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
              value={obatKode}
              onChange={(e) => {
                setObatKode(e.target.value);
                setBatchFilter("");
              }}
              disabled={!jenisValue}
            >
              <option value="">— Pilih Obat —</option>
              {obatOptions.map((o) => (
                <option key={o.id} value={o.kode}>
                  {o.nama}
                </option>
              ))}
            </select>
          </div>
          {selectedObat && selectedBatches.length > 1 && (
            <div className="form-group">
              <label>Batch (opsional)</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              >
                <option value="">Semua Batch ({selectedBatches.length})</option>
                {selectedBatches.map((b) => (
                  <option key={b.id} value={b.noBatch}>
                    {b.noBatch} — exp {b.expiry}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {selectedObat && (
        <div className="card no-print">
          <div className="section-title">Periode Laporan</div>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {periodeTemplates.map((p) => (
              <button
                key={p.key}
                className={`btn btn-sm ${periodeKey === p.key ? "btn-primary" : ""}`}
                onClick={() => setPeriodeKey(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          {periodeKey === "custom" && (
            <div className="form-grid" style={{ marginTop: 8 }}>
              <div className="form-group">
                <label>Tanggal Awal</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Tanggal Akhir</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 8 }}>
            Periode aktif: <strong>{periode.label}</strong> ({periode.start}{" "}
            s.d. {periode.end})
          </div>
        </div>
      )}

      {selectedObat && (
        <div className="card">
          <div className="section-title">Informasi Obat (Kondisi Terkini)</div>
          <dl className="detail-list">
            <dt>Nama Obat</dt>
            <dd>
              <strong>{selectedObat.nama}</strong>
            </dd>
            <dt>Jenis</dt>
            <dd>
              <span
                className={`badge ${info.jenis === "Program" ? "badge-info" : "badge-warning"}`}
              >
                {info.jenis === "Program"
                  ? `Program: ${info.program}`
                  : "Buffer"}
              </span>
            </dd>
            <dt>Satuan</dt>
            <dd>{selectedObat.satuan}</dd>
            <dt>Total Stok Saat Ini (semua batch)</dt>
            <dd>
              <strong>
                {fmt(totalStokSemuaBatch)} {selectedObat.satuan}
              </strong>
            </dd>
            <dt>Total Nilai Stok Saat Ini</dt>
            <dd>
              <strong>{rupiah(totalNilaiSemuaBatch)}</strong>
            </dd>
            <dt>Jumlah Batch</dt>
            <dd>{selectedBatches.length} batch</dd>
          </dl>
        </div>
      )}

      {selectedObat && batchesInScope.length > 0 && (
        <div className="card">
          <div className="section-title">
            Ringkasan per Batch — {periode.label}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Saldo Awal</th>
                  <th style={{ textAlign: "right" }}>Total Masuk</th>
                  <th style={{ textAlign: "right" }}>Total Keluar</th>
                  <th style={{ textAlign: "right" }}>Saldo Akhir</th>
                </tr>
              </thead>
              <tbody>
                {batchSummary.map((r) => {
                  const st = computeBatchStatus(r.batch);
                  return (
                    <tr key={r.batch.id}>
                      <td>
                        <code>{r.batch.noBatch}</code>
                      </td>
                      <td>{r.batch.expiry}</td>
                      <td>
                        <span className={`badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(r.saldoAwal)}</td>
                      <td
                        style={{ textAlign: "right", color: "var(--success)" }}
                      >
                        {r.totalMasuk > 0 ? `+${fmt(r.totalMasuk)}` : "-"}
                      </td>
                      <td
                        style={{ textAlign: "right", color: "var(--danger)" }}
                      >
                        {r.totalKeluar > 0 ? `-${fmt(r.totalKeluar)}` : "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <strong>{fmt(r.saldoAkhir)}</strong>
                      </td>
                    </tr>
                  );
                })}
                <tr
                  style={{ background: "var(--gray-100)", fontWeight: "bold" }}
                >
                  <td colSpan={3}>REKAP TOTAL OBAT</td>
                  <td style={{ textAlign: "right" }}>
                    {fmt(rekapTotal.saldoAwal)}
                  </td>
                  <td style={{ textAlign: "right", color: "var(--success)" }}>
                    {rekapTotal.totalMasuk > 0
                      ? `+${fmt(rekapTotal.totalMasuk)}`
                      : "-"}
                  </td>
                  <td style={{ textAlign: "right", color: "var(--danger)" }}>
                    {rekapTotal.totalKeluar > 0
                      ? `-${fmt(rekapTotal.totalKeluar)}`
                      : "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {fmt(rekapTotal.saldoAkhir)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedObat && (
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
              Riwayat Transaksi — {periode.label}
            </div>
            <div style={{ display: "flex", gap: 6 }} className="no-print">
              <select
                value={filterJenisTransaksi}
                onChange={(e) => setFilterJenisTransaksi(e.target.value)}
                style={{
                  fontSize: 12,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--gray-300)",
                }}
              >
                <option value="">Semua Jenis</option>
                <option value="Penerimaan">Penerimaan</option>
                <option value="SBBK">SBBK</option>
                <option value="Void">Void</option>
                <option value="Adjustment">Adjustment</option>
              </select>
              <button className="btn btn-sm" onClick={handleExportCSV}>
                Ekspor CSV
              </button>
              <button className="btn btn-sm" onClick={() => window.print()}>
                Cetak PDF
              </button>
            </div>
          </div>

          {transactionsWithSaldo.length === 0 ? (
            <div className="empty-state">
              Tidak ada transaksi pada periode ini.
              <div
                style={{ fontSize: 12, marginTop: 8, color: "var(--gray-600)" }}
              >
                Coba ubah periode laporan atau pilih "Semua Jenis" di filter.
              </div>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jenis</th>
                      <th>Referensi</th>
                      <th>Batch</th>
                      <th style={{ textAlign: "right" }}>Masuk</th>
                      <th style={{ textAlign: "right" }}>Keluar</th>
                      <th style={{ textAlign: "right" }}>
                        Saldo Setelah Transaksi
                      </th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsWithSaldo.map((t) => (
                      <tr key={t.id}>
                        <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                          {t.tanggal}
                        </td>
                        <td>
                          <span
                            className={`badge ${t.jenis === "Penerimaan" ? "badge-success" : t.jenis === "SBBK" ? "badge-info" : t.jenis === "Void" ? "badge-danger" : "badge-warning"}`}
                          >
                            {t.jenis}
                          </span>
                        </td>
                        <td>
                          <code>{t.referensi}</code>
                        </td>
                        <td>
                          <code>{t.noBatch}</code>
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            color: "var(--success)",
                          }}
                        >
                          {t.masuk > 0 ? `+${fmt(t.masuk)}` : "-"}
                        </td>
                        <td
                          style={{ textAlign: "right", color: "var(--danger)" }}
                        >
                          {t.keluar > 0 ? `-${fmt(t.keluar)}` : "-"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <strong>
                            {t.saldoBatch != null ? fmt(t.saldoBatch) : "-"}
                          </strong>
                        </td>
                        <td style={{ fontSize: 12 }}>{t.keterangan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filterJenisTransaksi && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--gray-600)",
                    marginTop: 8,
                  }}
                >
                  Catatan: Saldo Setelah Transaksi mencerminkan saldo setelah
                  transaksi terjadi, sudah memperhitungkan transaksi lain yang
                  tidak ditampilkan karena filter.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!selectedObat && (
        <div className="card">
          <div className="empty-state">
            Pilih jenis dan obat terlebih dahulu untuk melihat kartu stok.
          </div>
        </div>
      )}
    </>
  );
}
