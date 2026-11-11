import { useNavigate, useParams } from "react-router-dom";
import {
  mockPermintaan,
  mockBatchObat,
  getExpiryInfo,
  getAllSBBK,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const STATUS_LABEL = {
  pending: "Menunggu",
  disetujui: "Disetujui",
  selesai: "Selesai",
};
const STATUS_CLASS = {
  pending: "badge-warning",
  disetujui: "badge-info",
  selesai: "badge-success",
};

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
  // Permintaan dianggap selesai jika status "selesai" ATAU sudah tercatat
  // di localStorage setelah operator menerbitkan SBBK untuk permintaan ini.
  const selesaiIds = JSON.parse(
    localStorage.getItem("permintaanSelesai") || "[]",
  );
  const isSelesai = p.status === "selesai" || selesaiIds.includes(p.id);

  // SBBK hanya dicek jika permintaan sudah selesai.
  // Permintaan pending tidak mungkin punya SBBK — SBBK dibuat setelah review.
  const existingSBBK = isSelesai
    ? getAllSBBK().find((s) => s.permintaanId === p.id)
    : null;
  const hasSBBK = Boolean(existingSBBK);
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
          <p>
            Dari {p.kabKota} · {p.tanggal}
          </p>
        </div>
        <button
          className="btn"
          onClick={() => navigate("/operator/permintaan")}
        >
          Kembali
        </button>
      </div>

      <div className="card">
        <div className="section-title">Informasi Permintaan</div>
        <dl className="detail-list">
          <dt>Nomor Surat</dt>
          <dd>
            <code>{p.nomorSurat}</code>
          </dd>
          <dt>Kab/Kota Pengirim</dt>
          <dd>
            <strong>{p.kabKota}</strong>
          </dd>
          <dt>Tanggal</dt>
          <dd>{p.tanggal}</dd>
          <dt>Status</dt>
          <dd>
            <span className={`badge ${STATUS_CLASS[p.status]}`}>
              {STATUS_LABEL[p.status]}
            </span>
          </dd>
          <dt>Catatan</dt>
          <dd>{p.catatan || "-"}</dd>
        </dl>
      </div>

      <div className="card">
        <div className="section-title">
          Item yang Diminta & Ketersediaan Stok
        </div>
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

        {hasSBBK && (
          <div className="info-banner info" style={{ marginTop: 12 }}>
            <strong>Permintaan ini sudah memiliki SBBK</strong> berstatus{" "}
            <strong>
              {existingSBBK.status === "draft" ? "Draft" : "Terbit"}
            </strong>{" "}
            (<code>{existingSBBK.nomor}</code>). Klik tombol di bawah untuk
            melanjutkan atau melihat detail.
          </div>
        )}
        {semuaCukup && (
          <div className="info-banner success" style={{ marginTop: 12 }}>
            <strong>Siap dibuatkan SBBK.</strong> Semua item tersedia. Klik
            "Buat SBBK" untuk melanjutkan. Sistem akan otomatis mengalokasikan
            batch berdasarkan FEFO.
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button
          className="btn"
          onClick={() => navigate("/operator/permintaan")}
        >
          Kembali
        </button>
        {hasSBBK ? (
          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(
                existingSBBK.status === "draft"
                  ? `/operator/sbbk/draft/${existingSBBK.id}`
                  : `/operator/sbbk/${existingSBBK.id}`,
              )
            }
          >
            {existingSBBK.status === "draft"
              ? "Lanjutkan SBBK Draft"
              : "Lihat SBBK"}
          </button>
        ) : !isSelesai ? (
          <button
            className="btn btn-primary"
            onClick={handleBuatSBBK}
            disabled={!semuaCukup}
          >
            Buat SBBK
          </button>
        ) : null}
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
