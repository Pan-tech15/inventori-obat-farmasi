import { useNavigate, useParams } from "react-router-dom";
import { mockPermintaan } from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const STATUS_LABEL = { pending: "Menunggu", disetujui: "Disetujui", selesai: "Selesai" };
const STATUS_CLASS = { pending: "badge-warning", disetujui: "badge-info", selesai: "badge-success" };

export default function DetailPermintaanKabKota() {
  const navigate = useNavigate();
  const { id } = useParams();
  const p = mockPermintaan.find((x) => x.id === Number(id));

  if (!p) return <div className="card">Permintaan tidak ditemukan.</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Detail Permintaan</h2>
          <p>{p.nomorSurat}</p>
        </div>
        <button className="btn" onClick={() => navigate("/kabkota/permintaan")}>
          Kembali
        </button>
      </div>

      <div className="card">
        <div className="section-title">Informasi Permintaan</div>
        <dl className="detail-list">
          <dt>Nomor Surat</dt><dd><code>{p.nomorSurat}</code></dd>
          <dt>Tanggal</dt><dd>{p.tanggal}</dd>
          <dt>Pengirim</dt><dd>{p.kabKota}</dd>
          <dt>Status</dt>
          <dd>
            <span className={`badge ${STATUS_CLASS[p.status]}`}>{STATUS_LABEL[p.status]}</span>
          </dd>
          <dt>Catatan</dt><dd>{p.catatan || "-"}</dd>
        </dl>
      </div>

      <div className="card">
        <div className="section-title">Item yang Diminta</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Obat</th>
                <th style={{ textAlign: "right" }}>Jumlah Diminta</th>
                <th>Satuan</th>
              </tr>
            </thead>
            <tbody>
              {p.items.map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{it.namaObat}</td>
                  <td style={{ textAlign: "right" }}>{fmt(it.jumlahDiminta)}</td>
                  <td>{it.satuan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {p.status === "pending" && (
        <div className="info-banner info">
          Permintaan ini sedang menunggu diproses oleh Operator Dinas Kesehatan Provinsi.
          Anda akan melihat perubahan status di halaman ini.
        </div>
      )}
      {p.status === "selesai" && (
        <div className="info-banner success">
          Permintaan ini telah dipenuhi. Silakan cek pengiriman obat dari Provinsi.
        </div>
      )}
    </>
  );
}