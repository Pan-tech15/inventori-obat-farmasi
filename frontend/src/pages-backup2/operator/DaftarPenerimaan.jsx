import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockPenerimaan,
  mockBatchObat,
  getJenisByObatId,
  matchesJenisValue,
} from "../../data/mockOperator";
import { mockObat } from "../../data/mockData";

const STATUS_LABELS = {
  selesai: "Selesai",
  discrepancy: "Ada Ketidaksesuaian",
  parsial: "Diterima Sebagian",
  pending: "Menunggu Verifikasi",
};
const statusBadge = {
  selesai: "badge-success",
  discrepancy: "badge-warning",
  parsial: "badge-info",
  pending: "badge-gray",
};

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

const getJenisSummary = (penerimaan) => {
  const jenisSet = new Set(
    penerimaan.items.map((it) => getJenisByObatId(it.obatId).jenis),
  );
  if (jenisSet.size === 0) return { label: "-", jenis: "-" };
  if (jenisSet.size > 1) return { label: "Campuran", jenis: "mixed" };
  const jenis = [...jenisSet][0];
  return { label: jenis, jenis };
};

const getTotalNilai = (penerimaan) =>
  penerimaan.items.reduce(
    (s, it) => s + (it.jumlahDiterima || 0) * (it.hargaSatuan || 0),
    0,
  );

export default function DaftarPenerimaan() {
  const navigate = useNavigate();
  const [data] = useState(mockPenerimaan);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [tglDari, setTglDari] = useState("");
  const [tglSampai, setTglSampai] = useState("");

  const filtered = data.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.noSPB.toLowerCase().includes(q) ||
      d.noSBBK.toLowerCase().includes(q) ||
      d.asal.toLowerCase().includes(q);
    const matchStatus = !filterStatus || d.status === filterStatus;
    const matchJenis =
      !filterJenis ||
      d.items.some((it) => {
        const { jenis, program } = getJenisByObatId(it.obatId);
        const obat = { jenis, program };
        return matchesJenisValue(obat, filterJenis);
      });
    const matchTgl =
      (!tglDari || d.tanggal >= tglDari) &&
      (!tglSampai || d.tanggal <= tglSampai);
    return matchSearch && matchStatus && matchJenis && matchTgl;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Penerimaan Obat</h2>
          <p>
            Daftar penerimaan obat dari Kemenkes / sumber lain. Status
            "Ketidaksesuaian" dan "Diterima Sebagian" harus diselesaikan.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/operator/penerimaan/baru")}
        >
          + Penerimaan Baru
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari No. SPB, No. SBBK, Asal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="date"
            value={tglDari}
            onChange={(e) => setTglDari(e.target.value)}
            title="Tanggal dari"
          />
          <input
            type="date"
            value={tglSampai}
            onChange={(e) => setTglSampai(e.target.value)}
            title="Tanggal sampai"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="selesai">Selesai</option>
            <option value="pending">Menunggu Verifikasi</option>
            <option value="discrepancy">Ada Ketidaksesuaian</option>
            <option value="parsial">Diterima Sebagian</option>
          </select>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            <option value="Buffer">Buffer</option>
            <option value="Program:TBC">Program: TBC</option>
            <option value="Program:Malaria">Program: Malaria</option>
            <option value="Program:HIV/AIDS">Program: HIV/AIDS</option>
            <option value="Program:Kusta">Program: Kusta</option>
            <option value="Program:Hepatitis">Program: Hepatitis</option>
          </select>
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
            Menampilkan {filtered.length} data
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>No. SPB</th>
                <th>No. SBBK</th>
                <th>Asal Instansi</th>
                <th>Jenis</th>
                <th style={{ textAlign: "center" }}>Jml Item</th>
                <th style={{ textAlign: "right" }}>Total Nilai</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      Tidak ada data penerimaan yang sesuai.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const js = getJenisSummary(d);
                  return (
                    <tr key={d.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{d.tanggal}</td>
                      <td>
                        <code>{d.noSPB}</code>
                      </td>
                      <td>
                        <code>{d.noSBBK}</code>
                      </td>
                      <td>{d.asal}</td>
                      <td>
                        <span
                          className={`badge ${js.jenis === "Buffer" ? "badge-warning" : js.jenis === "Program" ? "badge-info" : "badge-gray"}`}
                        >
                          {js.label}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>{d.totalItem}</td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        Rp {fmt(getTotalNilai(d))}
                      </td>
                      <td>
                        <span className={`badge ${statusBadge[d.status]}`}>
                          {STATUS_LABELS[d.status]}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() =>
                            navigate(`/operator/penerimaan/${d.id}`)
                          }
                        >
                          Lihat Detail
                        </button>
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
