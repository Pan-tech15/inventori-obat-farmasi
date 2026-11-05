import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockSBBK,
  getJenisByObatId,
  matchesJenisValue,
  getHargaFromBatch,
} from "../../data/mockOperator";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

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
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [tglDari, setTglDari] = useState("");
  const [tglSampai, setTglSampai] = useState("");

  const filtered = mockSBBK.filter((s) => {
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

  const handleUnduhPDF = (sbbk) => {
    if (sbbk.status !== "terbit") {
      alert("Hanya SBBK berstatus Terbit yang dapat diunduh.");
      return;
    }
    alert(`Mengunduh PDF ${sbbk.nomor} — implementasi backend nanti.`);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>SBBK / Distribusi</h2>
          <p>
            Riwayat penerbitan SBBK ke IFK. SBBK yang sudah terbit tidak dapat
            diubah; gunakan void untuk koreksi.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/operator/sbbk/baru")}
        >
          + Terbitkan SBBK
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari nomor SBBK, IFK..."
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
            <option value="terbit">Terbit</option>
            <option value="void">Void</option>
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
                <th>Jenis</th>
                <th style={{ textAlign: "center" }}>Item</th>
                <th style={{ textAlign: "right" }}>Total Harga</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Cetak Ulang</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      Tidak ada SBBK yang sesuai.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const js = getJenisSBBK(s);
                  return (
                    <tr key={s.id}>
                      <td>
                        <code>{s.nomor}</code>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{s.tanggal}</td>
                      <td>{s.ifk}</td>
                      <td>
                        <span
                          className={`badge ${js.jenis === "Buffer" ? "badge-warning" : js.jenis === "Program" ? "badge-info" : "badge-gray"}`}
                        >
                          {js.label}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>{s.totalItem}</td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        Rp {fmt(getTotalNilaiSBBK(s))}
                      </td>
                      <td>
                        <span
                          className={`badge ${s.status === "terbit" ? "badge-success" : "badge-danger"}`}
                        >
                          {s.status === "terbit" ? "Terbit" : "Void"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>{s.cetakUlangKe}×</td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => navigate(`/operator/sbbk/${s.id}`)}
                          style={{ marginRight: 6 }}
                        >
                          Detail
                        </button>
                        {s.status === "terbit" && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleUnduhPDF(s)}
                          >
                            Unduh PDF
                          </button>
                        )}
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
