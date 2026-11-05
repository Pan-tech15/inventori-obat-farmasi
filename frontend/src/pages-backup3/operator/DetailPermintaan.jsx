import { useNavigate, useParams } from "react-router-dom";
import { mockPermintaan, mockBatchObat, getExpiryInfo } from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const STATUS_LABEL = { pending: "Menunggu", disetujui: "Disetujui", selesai: "Selesai" };
const STATUS_CLASS = { pending: "badge-warning", disetujui: "badge-info", selesai: "badge-success" };

// Cek ketersediaan stok untuk satu obat
const checkAvailability = (obatId, jumlahDiminta) => {
  const available = mockBatchObat
    .filter((b) => b.obatId === obatId)
    .filter((b) => getExpiryInfo(b).status !== "expired")
    .reduce((s, b) => s + b.stok, 0);

  const cukup = available >= jumlahDiminta;
  return {
    available,
    cukup,
    kurang: cukup ? 0 : jumlahDiminta - available,
  };
};

export default function DetailPermintaanOperator() {
  const navigate = useNavigate();
  const { id } = useParams();
  const p = mockPermintaan.find((x) => x.id === Number(id));

  if (!p) return <div className="card">Permintaan tidak ditemukan.</div>;

  // Cek semua item
  const itemChecks = p.items.map((it) => ({
    item: it,
    avail: checkAvailability(it.obatId, it.jumlahDiminta),
  }));

  const semuaCukup = itemChecks.every((x) => x.avail.cukup);
  const adaYangKurang = itemChecks.filter((x) => !x.avail.cukup);

  const handleBuatSBBK = () => {
    if (!semuaCukup) return;
    navigate(`/operator/sbbk/baru?permintaan=${p.id}`);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Detail Permintaan — {p.nomorSurat}</h2>
          <p>Dari {p.kabKota} · {p.tanggal}</p>
        </div>
        <button className="btn" onClick={() => navigate("/operator/permintaan")}>
          Kembali
        </button>
      </div>

      <div className="card">
        <div className="section-title">Informasi Permintaan</div>
        <dl className="detail-list">
          <dt>Nomor Surat</dt><dd><code>{p.nomorSurat}</code></dd>
          <dt>Kab/Kota Pengirim</dt><dd><strong>{p.kabKota}</strong></dd>
          <dt>Tanggal</dt><dd>{p.tanggal}</dd>
          <dt>Status</dt>
          <dd>
            <span className={`badge ${STATUS_CLASS[p.status]}`}>{STATUS_LABEL[p.status]}</span>
          </dd>
          <dt>Catatan</dt><dd>{p.catatan || "-"}</dd>
        </dl>
      </div>

      <div className="card">
        <div className="section-title">Item yang Diminta & Ketersediaan Stok</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Obat</th>
                <th style={{ textAlign: "right" }}>Diminta</th>
                <th style={{ textAlign: "right" }}>Stok Tersedia</th>
                <th>Status Ketersediaan</th>
              </tr>
            </thead>
            <tbody>
              {itemChecks.map(({ item, avail }, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: 12 }}>{item.namaObat}</strong>
                      <code style={{ fontSize: 11 }}>{item.kodeObat}</code>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {fmt(item.jumlahDiminta)} {item.satuan}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {fmt(avail.available)} {item.satuan}
                  </td>
                  <td>
                    {avail.cukup ? (
                      <span className="badge badge-success">Stok Cukup</span>
                    ) : (
                      <span className="badge badge-danger">
                        Kurang {fmt(avail.kurang)} {item.satuan}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!semuaCukup && (
          <div className="info-banner warning" style={{ marginTop: 12 }}>
            <strong>Perhatian:</strong> {adaYangKurang.length} item belum memiliki stok yang cukup.
            SBBK tidak dapat diterbitkan sampai semua item tersedia. Tunggu pengiriman dari Kemenkes
            atau koordinasikan dengan kab/kota untuk mengurangi jumlah permintaan.
          </div>
        )}
        {semuaCukup && (
          <div className="info-banner success" style={{ marginTop: 12 }}>
            <strong>Siap dibuatkan SBBK.</strong> Semua item tersedia. Klik "Buat SBBK" untuk
            melanjutkan. Sistem akan otomatis mengalokasikan batch berdasarkan FEFO.
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="btn" onClick={() => navigate("/operator/permintaan")}>
          Kembali
        </button>
        {p.status === "pending" && (
          <button
            className="btn btn-primary"
            onClick={handleBuatSBBK}
            disabled={!semuaCukup}
          >
            Buat SBBK
          </button>
        )}
        {p.status === "selesai" && (
          <button
            className="btn"
            onClick={() => alert("Lihat SBBK terkait — implementasi lanjutan")}
          >
            Lihat SBBK Terkait
          </button>
        )}
      </div>
    </>
  );
}