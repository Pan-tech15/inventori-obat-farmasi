import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllSBBK,
  deleteSBBK,
  getJenisByObatId,
  matchesJenisValue,
  getHargaFromBatch,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

const STATUS_LABEL = { draft: "Draft", terbit: "Terbit" };
const STATUS_CLASS = { draft: "badge-warning", terbit: "badge-success" };

const getTotalNilaiSBBK = (sbbk) =>
  sbbk.items.reduce(
    (s, it) => s + (it.jumlah || 0) * getHargaFromBatch(it.obatId, it.noBatch),
    0,
  );

const getJenisSBBK = (sbbk) => {
  const jenisSet = new Set(
    sbbk.items.map((it) => getJenisByObatId(it.obatId).jenis),
  );
  if (jenisSet.size === 0) return { label: "-", jenis: "-" };
  if (jenisSet.size > 1) return { label: "Campuran", jenis: "mixed" };
  return { label: [...jenisSet][0], jenis: [...jenisSet][0] };
};

export default function DaftarSBBK() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [tglDari, setTglDari] = useState("");
  const [tglSampai, setTglSampai] = useState("");

  const allSBBK = getAllSBBK();

  const filtered = allSBBK.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.nomor.toLowerCase().includes(q) ||
      s.ifk.toLowerCase().includes(q);
    const matchStatus = !filterStatus || s.status === filterStatus;
    const matchJenis =
      !filterJenis ||
      s.items.some((it) => {
        const { jenis, program } = getJenisByObatId(it.obatId);
        return matchesJenisValue({ jenis, program }, filterJenis);
      });
    const matchTgl =
      (!tglDari || s.tanggal >= tglDari) &&
      (!tglSampai || s.tanggal <= tglSampai);
    return matchSearch && matchStatus && matchJenis && matchTgl;
  });

  const draftCount = allSBBK.filter((s) => s.status === "draft").length;

  const handleUnduhPDF = (sbbk) => {
    if (sbbk.status !== "terbit") {
      alert("Hanya SBBK berstatus Terbit yang dapat diunduh.");
      return;
    }
    alert(`Mengunduh PDF ${sbbk.nomor} — implementasi backend nanti.`);
  };

  const handleHapusDraft = (sbbk) => {
    if (!confirm(`Hapus draft ${sbbk.nomor}? Draft akan dihapus permanen.`))
      return;
    deleteSBBK(sbbk.id);
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>SBBK / Distribusi</h2>
          <p>
            Riwayat penerbitan SBBK. Draft dapat dilanjutkan; SBBK terbit tidak
            dapat diubah.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/operator/sbbk/baru")}
        >
          + Buat SBBK
        </button>
      </div>

      {draftCount > 0 && (
        <div className="info-banner warning" style={{ fontSize: 12 }}>
          <strong>{draftCount} draft SBBK</strong> belum diterbitkan. Klik
          tombol <strong>Lanjutkan</strong> pada baris draft untuk melanjutkan
          pengisian.
        </div>
      )}

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari nomor SBBK atau IFK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="date"
            value={tglDari}
            onChange={(e) => setTglDari(e.target.value)}
            title="Dari tanggal"
          />
          <input
            type="date"
            value={tglSampai}
            onChange={(e) => setTglSampai(e.target.value)}
            title="Sampai tanggal"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="terbit">Terbit</option>
          </select>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua Jenis Obat</option>
            <option value="Buffer">Buffer</option>
            <option value="Program:TBC">Program: TBC</option>
            <option value="Program:Malaria">Program: Malaria</option>
            <option value="Program:HIV/AIDS">Program: HIV/AIDS</option>
            <option value="Program:Kusta">Program: Kusta</option>
            <option value="Program:Hepatitis">Program: Hepatitis</option>
          </select>
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
            {filtered.length} SBBK
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Tanggal</th>
                <th>IFK</th>
                <th>Untuk Permintaan</th>
                <th>Jenis</th>
                <th style={{ textAlign: "center" }}>Item</th>
                <th style={{ textAlign: "right" }}>Total Harga</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      Tidak ada SBBK yang sesuai filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const js = getJenisSBBK(s);
                  return (
                    <tr
                      key={s.id}
                      style={
                        s.status === "draft" ? { background: "#fffaeb" } : {}
                      }
                    >
                      <td>
                        <code>{s.nomor}</code>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{s.tanggal}</td>
                      <td>{s.ifk}</td>
                      <td>
                        {s.permintaanNomor ? (
                          <code style={{ fontSize: 11 }}>
                            {s.permintaanNomor}
                          </code>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${js.jenis === "Buffer" ? "badge-warning" : js.jenis === "Program" ? "badge-info" : "badge-gray"}`}
                        >
                          {js.label}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>{s.items.length}</td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        Rp {fmt(getTotalNilaiSBBK(s))}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_CLASS[s.status]}`}>
                          {STATUS_LABEL[s.status]}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          {s.status === "draft" ? (
                            <>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                  navigate(`/operator/sbbk/draft/${s.id}`)
                                }
                              >
                                Lanjutkan
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleHapusDraft(s)}
                                title="Hapus draft"
                              >
                                ×
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm"
                                onClick={() =>
                                  navigate(`/operator/sbbk/${s.id}`)
                                }
                              >
                                Detail
                              </button>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleUnduhPDF(s)}
                              >
                                Unduh PDF
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
