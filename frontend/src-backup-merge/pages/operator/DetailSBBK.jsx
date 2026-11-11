import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSBBKById } from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

export default function DetailSBBK() {
  const navigate = useNavigate();
  const { id } = useParams();
  const sbbk = getSBBKById(id);
  const [cetakUlang, setCetakUlang] = useState(sbbk?.cetakUlangKe || 0);

  if (!sbbk) return <div className="card">SBBK tidak ditemukan.</div>;

  const isDraft = sbbk.status === "draft";

  const handleCetakUlang = () => {
    setCetakUlang(cetakUlang + 1);
    alert(
      `PDF cetak ulang ke-${cetakUlang + 1} diunduh dengan label SALINAN. Stok TIDAK berkurang.`,
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Detail SBBK</h2>
          <p>{sbbk.nomor}</p>
        </div>
        <button className="btn" onClick={() => navigate("/operator/sbbk")}>
          Kembali
        </button>
      </div>

      {isDraft && (
        <div className="info-banner warning">
          <strong>Status: Draft.</strong> SBBK ini belum diterbitkan. Stok belum
          berkurang. Klik <strong>Lanjutkan Pengisian</strong> untuk melanjutkan
          atau menerbitkan.
        </div>
      )}

      <div className="card">
        <div className="section-title">Informasi SBBK</div>
        <dl className="detail-list">
          <dt>Nomor</dt>
          <dd>
            <code>{sbbk.nomor}</code>
          </dd>
          <dt>Tanggal</dt>
          <dd>{sbbk.tanggal}</dd>
          <dt>IFK Tujuan</dt>
          <dd>{sbbk.ifk}</dd>
          {sbbk.permintaanNomor && (
            <>
              <dt>Untuk Permintaan</dt>
              <dd>
                <code>{sbbk.permintaanNomor}</code>
              </dd>
            </>
          )}
          <dt>Status</dt>
          <dd>
            <span
              className={`badge ${isDraft ? "badge-warning" : "badge-success"}`}
            >
              {isDraft ? "Draft" : "Terbit"}
            </span>
          </dd>
          {!isDraft && (
            <>
              <dt>Cetak Ulang</dt>
              <dd>{cetakUlang}×</dd>
            </>
          )}
        </dl>
      </div>

      <div className="card">
        <div className="section-title">Item yang Didistribusikan</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Obat</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th style={{ textAlign: "right" }}>Jumlah</th>
                <th>Satuan</th>
              </tr>
            </thead>
            <tbody>
              {sbbk.items.map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{it.namaObat}</td>
                  <td>
                    <code>{it.noBatch}</code>
                  </td>
                  <td>{it.expiry}</td>
                  <td style={{ textAlign: "right" }}>{fmt(it.jumlah)}</td>
                  <td>{it.satuan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isDraft && (
        <div className="info-banner info">
          <strong>Catatan:</strong> SBBK yang sudah terbit tidak dapat diubah.
          Jika terjadi kesalahan, stok dapat dikoreksi melalui{" "}
          <strong>Penyesuaian Stok</strong>. Untuk mendistribusikan ulang, buat
          SBBK baru dengan nomor unik.
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <button className="btn" onClick={() => navigate("/operator/sbbk")}>
          Kembali
        </button>
        {isDraft ? (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/operator/sbbk/draft/${sbbk.id}`)}
          >
            Lanjutkan Pengisian
          </button>
        ) : (
          <>
            <button className="btn" onClick={handleCetakUlang}>
              Cetak Ulang (SALINAN)
            </button>
            <button
              className="btn btn-primary"
              onClick={() =>
                alert("Unduh PDF asli — implementasi backend nanti")
              }
            >
              Unduh PDF Asli
            </button>
          </>
        )}
      </div>
    </>
  );
}
