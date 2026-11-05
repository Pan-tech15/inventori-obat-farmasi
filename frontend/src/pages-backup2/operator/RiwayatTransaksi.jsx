import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockRiwayatTransaksi,
  jenisProgramOptions,
  matchesJenisValue,
} from "../../data/mockOperator";
import { mockObat } from "../../data/mockData";
import LegendaTabel from "../../components/LegendaTabel";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

const jenisBadge = {
  Penerimaan: "badge-success",
  SBBK: "badge-info",
  Void: "badge-danger",
  Adjustment: "badge-warning",
};

// Lookup info obat dari nama (mockRiwayatTransaksi tidak menyimpan kodeObat)
const getObatInfoByNama = (namaObat) => {
  const obat = mockObat.find((o) => o.nama === namaObat);
  return {
    jenis: obat?.jenis || "-",
    program: obat?.program || "-",
    kode: obat?.kode || "",
  };
};

export default function RiwayatTransaksi() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterJenisObat, setFilterJenisObat] = useState("");
  const [periodeAwal, setPeriodeAwal] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");

  const filtered = useMemo(() => {
    return mockRiwayatTransaksi
      .filter((r) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          r.referensi.toLowerCase().includes(q) ||
          r.namaObat.toLowerCase().includes(q) ||
          r.noBatch.toLowerCase().includes(q);

        const matchJenis = !filterJenis || r.jenis === filterJenis;

        let matchJenisObat = true;
        if (filterJenisObat) {
          const info = getObatInfoByNama(r.namaObat);
          matchJenisObat = matchesJenisValue(info, filterJenisObat);
        }

        const tgl = String(r.tanggal).slice(0, 10);
        const matchAwal = !periodeAwal || tgl >= periodeAwal;
        const matchAkhir = !periodeAkhir || tgl <= periodeAkhir;

        return (
          matchSearch && matchJenis && matchJenisObat && matchAwal && matchAkhir
        );
      })
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)); // terbaru di atas
  }, [search, filterJenis, filterJenisObat, periodeAwal, periodeAkhir]);

  const handleExportCSV = () => {
    const headers = [
      "Tanggal",
      "Jenis",
      "Referensi",
      "Obat",
      "Batch",
      "Masuk",
      "Keluar",
      "Keterangan",
    ];
    const rows = filtered.map((r) => [
      r.tanggal,
      r.jenis,
      r.referensi,
      r.namaObat,
      r.noBatch,
      r.masuk || 0,
      r.keluar || 0,
      r.keterangan,
    ]);
    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"),
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RiwayatTransaksi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeKartuStok = (r) => {
    const info = getObatInfoByNama(r.namaObat);
    const jenisParam =
      info.jenis === "Program" ? `Program:${info.program}` : "Buffer";
    if (!info.kode) {
      alert("Kode obat tidak ditemukan. Tidak bisa membuka Kartu Stok.");
      return;
    }
    navigate(
      `/operator/kartu-stok?jenis=${jenisParam}&obat=${info.kode}&batch=${r.noBatch}`,
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Riwayat Transaksi</h2>
          <p>
            Jurnal kronologis semua transaksi lintas obat dan batch. Read-only.
            Untuk melihat saldo berjalan per batch, buka Kartu Stok.
          </p>
        </div>
        <button
          className="btn"
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
        >
          Ekspor CSV
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari referensi, obat, atau batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua Jenis Transaksi</option>
            <option value="Penerimaan">Penerimaan</option>
            <option value="SBBK">SBBK</option>
            <option value="Void">Void</option>
            <option value="Adjustment">Adjustment</option>
          </select>
          <select
            value={filterJenisObat}
            onChange={(e) => setFilterJenisObat(e.target.value)}
          >
            <option value="">Semua Jenis Obat</option>
            {jenisProgramOptions.map((j) => (
              <option key={j.value} value={j.value}>
                {j.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={periodeAwal}
            onChange={(e) => setPeriodeAwal(e.target.value)}
            title="Dari tanggal"
          />
          <input
            type="date"
            value={periodeAkhir}
            onChange={(e) => setPeriodeAkhir(e.target.value)}
            title="Sampai tanggal"
          />
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
            {filtered.length} transaksi
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Referensi</th>
                <th>Obat</th>
                <th>Batch</th>
                <th style={{ textAlign: "right" }}>Masuk</th>
                <th style={{ textAlign: "right" }}>Keluar</th>
                <th>Keterangan</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      Tidak ada transaksi yang sesuai filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const info = getObatInfoByNama(r.namaObat);
                  return (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                        {r.tanggal}
                      </td>
                      <td>
                        <span className={`badge ${jenisBadge[r.jenis]}`}>
                          {r.jenis}
                        </span>
                      </td>
                      <td>
                        <code>{r.referensi}</code>
                      </td>
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <strong style={{ fontSize: 12 }}>{r.namaObat}</strong>
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
                        <code>{r.noBatch}</code>
                      </td>
                      <td
                        style={{ textAlign: "right", color: "var(--success)" }}
                      >
                        {r.masuk > 0 ? `+${fmt(r.masuk)}` : "-"}
                      </td>
                      <td
                        style={{ textAlign: "right", color: "var(--danger)" }}
                      >
                        {r.keluar > 0 ? `-${fmt(r.keluar)}` : "-"}
                      </td>
                      <td style={{ fontSize: 12 }}>{r.keterangan}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleKeKartuStok(r)}
                          title="Lihat kartu stok batch ini"
                        >
                          Kartu Stok
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <LegendaTabel />
      </div>
    </>
  );
}
