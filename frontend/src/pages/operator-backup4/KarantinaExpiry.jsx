import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockBatchObat,
  getObatInfo,
  getExpiryInfo,
  jenisProgramOptions,
  matchesJenisValue,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function KarantinaExpiry() {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState("warning");
  const [filterJenis, setFilterJenis] = useState("");
  const [search, setSearch] = useState("");

  const semuaBatch = mockBatchObat.filter((b) => {
    if (!filterJenis) return true;
    const info = getObatInfo(b.kodeObat);
    return matchesJenisValue(info, filterJenis);
  });

  const peringatan = semuaBatch
    .filter((b) => {
      const info = getExpiryInfo(b);
      return info.status === "normal" && info.color !== "safe";
    })
    .sort((a, b) => getExpiryInfo(a).days - getExpiryInfo(b).days);

  const expired = semuaBatch
    .filter((b) => getExpiryInfo(b).status === "expired")
    .sort((a, b) => getExpiryInfo(a).days - getExpiryInfo(b).days);

  const data = filterTab === "warning" ? peringatan : expired;

  const filtered = data.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.namaObat.toLowerCase().includes(q) ||
      b.noBatch.toLowerCase().includes(q)
    );
  });

  const handleCatatPemusnahan = (b) => {
    navigate(
      `/operator/penyesuaian?tab=penyesuaian&batchId=${b.id}&kategori=Kedaluwarsa&jumlah=${b.stok}`,
    );
  };

  const handleCatatDistribusi = (b) => {
    const info = getObatInfo(b.kodeObat);
    const jenisParam =
      info.jenis === "Program" ? `Program:${info.program}` : "Buffer";
    navigate(
      `/operator/sbbk/baru?jenis=${jenisParam}&obat=${b.kodeObat}&batch=${b.noBatch}`,
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Peringatan Kedaluwarsa</h2>
          <p>
            Batch normal yang mendekati kedaluwarsa (warna merah/oranye/kuning)
            dan batch yang sudah kedaluwarsa. Prioritaskan distribusi untuk yang
            mendekati expired. Batch kedaluwarsa tidak bisa didistribusikan dan
            harus dimusnahkan.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Mendekati Kedaluwarsa</div>
          <div className="value" style={{ color: "var(--warning)" }}>
            {peringatan.length}
          </div>
          <div className="desc">prioritaskan distribusi</div>
        </div>
        <div className="stat-card">
          <div className="label">Kedaluwarsa</div>
          <div className="value" style={{ color: "var(--danger)" }}>
            {expired.length}
          </div>
          <div className="desc">perlu berita acara pemusnahan</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Nilai Berisiko</div>
          <div className="value" style={{ fontSize: 16 }}>
            {rupiah(
              [...peringatan, ...expired].reduce(
                (s, b) => s + b.stok * b.hargaSatuan,
                0,
              ),
            )}
          </div>
          <div className="desc">stok × harga satuan</div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari nama obat atau batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
            {filtered.length} batch
          </span>
        </div>

        <div className="tabs" style={{ marginTop: 8 }}>
          <button
            className={filterTab === "warning" ? "active" : ""}
            onClick={() => setFilterTab("warning")}
          >
            Mendekati Kedaluwarsa ({peringatan.length})
          </button>
          <button
            className={filterTab === "expired" ? "active" : ""}
            onClick={() => setFilterTab("expired")}
          >
            Kedaluwarsa ({expired.length})
          </button>
        </div>

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Obat</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Sisa Hari</th>
                <th style={{ textAlign: "right" }}>Stok</th>
                <th style={{ textAlign: "right" }}>Nilai</th>
                <th>Kategori</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      Tidak ada data pada kategori ini.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const info = getObatInfo(b.kodeObat);
                  const exp = getExpiryInfo(b);
                  const jenisParam =
                    info.jenis === "Program"
                      ? `Program:${info.program}`
                      : "Buffer";

                  return (
                    <tr key={b.id}>
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <strong style={{ fontSize: 12 }}>{b.namaObat}</strong>
                          <span
                            className={`badge ${info.jenis === "Program" ? "badge-info" : "badge-warning"}`}
                            style={{
                              fontSize: 9,
                              alignSelf: "flex-start",
                              marginTop: 2,
                            }}
                          >
                            {info.jenis === "Program"
                              ? `Program: ${info.program}`
                              : "Buffer"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <code>{b.noBatch}</code>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{b.expiry}</td>
                      <td>
                        <span className={`badge ${exp.badgeClass}`}>
                          {exp.label}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {fmt(b.stok)} {b.satuan}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {rupiah(b.stok * b.hargaSatuan)}
                      </td>
                      <td>{b.kategori}</td>
                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          {exp.status === "expired" ? (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleCatatPemusnahan(b)}
                            >
                              Catat Pemusnahan (buka Penyesuaian)
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleCatatDistribusi(b)}
                              title="Prioritaskan distribusi batch ini"
                            >
                              Distribusikan
                            </button>
                          )}
                          <button
                            className="btn btn-sm"
                            onClick={() =>
                              navigate(
                                `/operator/kartu-stok?jenis=${jenisParam}&obat=${b.kodeObat}&batch=${b.noBatch}`,
                              )
                            }
                          >
                            Kartu Stok
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filterTab === "warning" && peringatan.length > 0 && (
          <div className="info-banner warning" style={{ marginTop: 16 }}>
            <strong>Perhatian:</strong> Batch dengan warna merah/oranye/kuning
            masih berstatus <strong>Normal</strong> dan{" "}
            <strong>bisa didistribusikan</strong>. Semakin merah warnanya,
            semakin urgen untuk segera disalurkan sebelum kedaluwarsa. Klik{" "}
            <strong>Distribusikan</strong> untuk langsung ke Form SBBK dengan
            batch ini terpilih.
          </div>
        )}

        {filterTab === "expired" && expired.length > 0 && (
          <div className="info-banner danger" style={{ marginTop: 16 }}>
            <strong>Perhatian:</strong> Batch kedaluwarsa{" "}
            <strong>tidak bisa didistribusikan</strong> dan harus dimusnahkan
            dengan berita acara resmi. Klik <strong>Catat Pemusnahan</strong>{" "}
            untuk mencatat nomor BA.
          </div>
        )}
      </div>
    </>
  );
}
