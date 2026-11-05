import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockStockOpname } from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

export default function DaftarStockOpname() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");
  const [detail, setDetail] = useState(null);

  const filtered = mockStockOpname.filter((so) => {
    const matchStatus = !filterStatus || so.status === filterStatus;
    const matchPeriode = !filterPeriode || so.periode === filterPeriode;
    return matchStatus && matchPeriode;
  });

  const periodeList = [...new Set(mockStockOpname.map((so) => so.periode))];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Stock Opname</h2>
          <p>
            Opname bulanan. Selisih wajib diberi alasan. Opname berstatus draft
            belum mengubah stok sampai difinalisasi.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/operator/stock-opname/baru")}
        >
          + Opname Baru
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari nomor dokumen atau periode..."
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="selesai">Selesai</option>
          </select>
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
            {filtered.length} dokumen
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Periode</th>
                <th>Tanggal</th>
                <th style={{ textAlign: "center" }}>Item</th>
                <th style={{ textAlign: "center" }}>Selisih</th>
                <th style={{ textAlign: "right" }}>Total Variance</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      Tidak ada dokumen opname yang sesuai filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((so) => (
                  <tr key={so.id}>
                    <td>
                      <code>{so.nomor}</code>
                    </td>
                    <td>{so.periode}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {so.tanggal || "-"}
                    </td>
                    <td style={{ textAlign: "center" }}>{so.totalItem}</td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`badge ${so.totalItemSelisih > 0 ? "badge-warning" : "badge-success"}`}
                      >
                        {so.totalItemSelisih} item
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        className={`badge ${so.totalVariance === 0 ? "badge-success" : "badge-warning"}`}
                      >
                        {so.totalVariance > 0
                          ? `+${fmt(so.totalVariance)}`
                          : fmt(so.totalVariance)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${so.status === "selesai" ? "badge-success" : "badge-gray"}`}
                      >
                        {so.status === "selesai" ? "Selesai" : "Draft"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          justifyContent: "center",
                        }}
                      >
                        {so.status === "draft" ? (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                              navigate(`/operator/stock-opname/${so.id}`)
                            }
                          >
                            Lanjutkan
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm"
                            onClick={() => setDetail(so)}
                          >
                            Lihat Detail
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: 900 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Detail Opname — {detail.nomor}</h3>
              <button onClick={() => setDetail(null)}>×</button>
            </div>
            <div className="modal-body">
              <dl className="detail-list" style={{ marginBottom: 16 }}>
                <dt>Periode</dt>
                <dd>{detail.periode}</dd>
                <dt>Tanggal Final</dt>
                <dd>{detail.tanggal}</dd>
                <dt>Status</dt>
                <dd>
                  <span
                    className={`badge ${detail.status === "selesai" ? "badge-success" : "badge-gray"}`}
                  >
                    {detail.status === "selesai" ? "Selesai" : "Draft"}
                  </span>
                </dd>
                <dt>Total Item Diperiksa</dt>
                <dd>{detail.totalItem}</dd>
                <dt>Item dengan Selisih</dt>
                <dd>{detail.totalItemSelisih}</dd>
                <dt>Total Variance</dt>
                <dd>
                  <strong>
                    {detail.totalVariance > 0
                      ? `+${fmt(detail.totalVariance)}`
                      : fmt(detail.totalVariance)}
                  </strong>
                </dd>
              </dl>

              {detail.items.length === 0 ? (
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
                      {detail.items.map((it, i) => (
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
                          <td style={{ fontSize: 12 }}>{it.kategoriAlasan}</td>
                          <td style={{ fontSize: 12 }}>{it.alasan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDetail(null)}>
                Tutup
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  alert(
                    "Cetak Berita Acara Opname — implementasi backend nanti",
                  );
                }}
              >
                Cetak Berita Acara
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
