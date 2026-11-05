import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockBatchObat,
  mockAdjustment,
  getObatInfo,
  jenisProgramOptions,
  matchesJenisValue,
  kategoriAlasanOpname,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function PenyesuaianStok() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    batchId: "",
    jenis: "kurang",
    jumlah: 0,
    kategoriAlasan: "",
    alasan: "",
    referensi: "",
  });
  const [filterJenis, setFilterJenis] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(null);
  const [filterRiwayatJenis, setFilterRiwayatJenis] = useState("");
  const [searchRiwayat, setSearchRiwayat] = useState("");

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

  const filteredRiwayat = mockAdjustment.filter((a) => {
    if (filterRiwayatJenis && a.jenis !== filterRiwayatJenis) return false;
    if (searchRiwayat) {
      const q = searchRiwayat.toLowerCase();
      return (
        a.namaObat.toLowerCase().includes(q) ||
        a.noBatch.toLowerCase().includes(q) ||
        (a.alasan || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSimpan = () => {
    if (!valid) return;
    setShowConfirm(true);
  };

  const doSimpan = () => {
    const arah = form.jenis === "tambah" ? "bertambah" : "berkurang";
    setSaved({
      namaObat: selected.namaObat,
      kodeObat: selected.kodeObat,
      noBatch: selected.noBatch,
      stokSebelum: selected.stok,
      stokSetelah,
      jumlah,
      arah,
      nilaiPerubahan,
    });
    setForm({
      batchId: "",
      jenis: "kurang",
      jumlah: 0,
      kategoriAlasan: "",
      alasan: "",
      referensi: "",
    });
    setShowConfirm(false);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Penyesuaian Stok</h2>
          <p>
            Koreksi terarah satu batch dengan penyebab yang sudah diketahui.
            Wajib kategori dan alasan; tercatat di audit trail.
          </p>
        </div>
      </div>

      <div className="info-banner info" style={{ fontSize: 12 }}>
        <strong>Kapan menggunakan halaman ini:</strong> untuk koreksi satu batch
        yang penyebabnya sudah diketahui (rusak, salah input, retur, temuan
        stok). Untuk verifikasi menyeluruh seluruh batch, gunakan{" "}
        <strong>Stock Opname</strong>.
      </div>

      {saved && (
        <div className="info-banner success">
          <strong>✓ Penyesuaian disimpan.</strong> {saved.namaObat} batch{" "}
          <code>{saved.noBatch}</code>: stok {saved.arah} {fmt(saved.jumlah)}{" "}
          unit, dari <strong>{fmt(saved.stokSebelum)}</strong> menjadi{" "}
          <strong>{fmt(saved.stokSetelah)}</strong>. Tercatat di riwayat
          transaksi dan kartu stok.
          <div style={{ marginTop: 8 }}>
            <button
              className="btn btn-sm"
              onClick={() => {
                const info = getObatInfo(saved.kodeObat);
                const jenisParam =
                  info.jenis === "Program"
                    ? `Program:${info.program}`
                    : "Buffer";
                navigate(
                  `/operator/kartu-stok?jenis=${jenisParam}&obat=${saved.kodeObat}&batch=${saved.noBatch}`,
                );
              }}
            >
              Lihat Kartu Stok
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">Form Penyesuaian</div>

        <div className="form-grid">
          <div className="form-group">
            <label>Filter Jenis</label>
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
                  : "Nomor dokumen pendukung (opsional)"
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
            Stok tidak boleh negatif. Kurangi jumlah atau pilih jenis "Tambah".
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
          <button className="btn" onClick={() => navigate("/operator")}>
            Batal
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSimpan}
            disabled={!valid}
          >
            Simpan Penyesuaian
          </button>
        </div>
      </div>

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
            Riwayat Penyesuaian ({filteredRiwayat.length})
          </div>
          <div className="filter-bar" style={{ margin: 0 }}>
            <input
              placeholder="Cari obat, batch, alasan..."
              value={searchRiwayat}
              onChange={(e) => setSearchRiwayat(e.target.value)}
            />
            <select
              value={filterRiwayatJenis}
              onChange={(e) => setFilterRiwayatJenis(e.target.value)}
            >
              <option value="">Semua Jenis</option>
              <option value="tambah">Tambah</option>
              <option value="kurang">Kurang</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Obat</th>
                <th>Batch</th>
                <th>Jenis</th>
                <th style={{ textAlign: "right" }}>Jumlah</th>
                <th>Alasan</th>
                <th>Referensi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiwayat.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      Tidak ada penyesuaian yang sesuai filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRiwayat.map((a) => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{a.tanggal}</td>
                    <td>{a.namaObat}</td>
                    <td>
                      <code>{a.noBatch}</code>
                    </td>
                    <td>
                      <span
                        className={`badge ${a.jenis === "tambah" ? "badge-success" : "badge-warning"}`}
                      >
                        {a.jenis === "tambah" ? "Tambah" : "Kurang"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>{fmt(a.jumlah)}</td>
                    <td style={{ fontSize: 12 }}>{a.alasan}</td>
                    <td>
                      <code>{a.referensi}</code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                Setelah disimpan, stok berubah permanen dan tercatat di riwayat
                transaksi. Jika ada kesalahan, gunakan penyesuaian balik — tidak
                bisa dihapus.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowConfirm(false)}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={doSimpan}>
                Ya, Simpan Penyesuaian
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
