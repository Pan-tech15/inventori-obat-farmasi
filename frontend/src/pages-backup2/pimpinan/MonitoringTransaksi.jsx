import { useState } from "react";
import {
  mockPenerimaan,
  mockSBBK,
  mockStockOpname,
  mockAdjustment,
} from "../../data/mockOperator";
import { exportCSV, exportPDFViaPrint } from "../../utils/export";
import LegendaTabel from "../../components/LegendaTabel";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

const TABS = [
  { key: "penerimaan", label: "Penerimaan" },
  { key: "sbbk", label: "SBBK" },
  { key: "opname", label: "Stock Opname" },
  { key: "adjustment", label: "Penyesuaian Stok" },
];

export default function MonitoringTransaksi() {
  const [tab, setTab] = useState("penerimaan");
  const [search, setSearch] = useState("");

  const filterBySearch = (rows, keys) => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      keys.some((k) =>
        String(r[k] || "")
          .toLowerCase()
          .includes(q)
      )
    );
  };

  const handleExportCSV = () => {
    if (tab === "penerimaan") {
      const rows = filterBySearch(mockPenerimaan, ["noSPB", "noSBBK", "asal"]);
      exportCSV(
        `Monitoring_Penerimaan_${new Date().toISOString().slice(0, 10)}.csv`,
        ["Tanggal", "No SPB", "No SBBK", "Asal", "Sumber Anggaran", "Item", "Status", "Catatan"],
        rows.map((r) => [
          r.tanggal,
          r.noSPB,
          r.noSBBK,
          r.asal,
          r.sumberAnggaran,
          r.totalItem,
          r.status,
          r.catatan || "-",
        ])
      );
    } else if (tab === "sbbk") {
      const rows = filterBySearch(mockSBBK, ["nomor", "ifk"]);
      exportCSV(
        `Monitoring_SBBK_${new Date().toISOString().slice(0, 10)}.csv`,
        ["Nomor", "Tanggal", "IFK", "Item", "Status", "Cetak Ulang"],
        rows.map((r) => [
          r.nomor,
          r.tanggal,
          r.ifk,
          r.totalItem,
          r.status,
          r.cetakUlangKe,
        ])
      );
    } else if (tab === "opname") {
      const rows = mockStockOpname.flatMap((so) =>
        so.items.map((it) => ({
          ...it,
          periode: so.periode,
          tanggal: so.tanggal,
        }))
      );
      const filtered = filterBySearch(rows, ["periode", "namaObat", "noBatch"]);
      exportCSV(
        `Monitoring_Variance_${new Date().toISOString().slice(0, 10)}.csv`,
        ["Periode", "Tanggal", "Obat", "Batch", "Stok Sistem", "Stok Fisik", "Selisih", "Alasan"],
        filtered.map((r) => [
          r.periode,
          r.tanggal,
          r.namaObat,
          r.noBatch,
          r.stokSistem,
          r.stokFisik,
          r.selisih,
          r.alasan,
        ])
      );
    } else {
      const rows = filterBySearch(mockAdjustment, ["namaObat", "noBatch", "alasan"]);
      exportCSV(
        `Monitoring_Adjustment_${new Date().toISOString().slice(0, 10)}.csv`,
        ["Tanggal", "Obat", "Batch", "Jenis", "Jumlah", "Alasan", "Referensi"],
        rows.map((r) => [
          r.tanggal,
          r.namaObat,
          r.noBatch,
          r.jenis,
          r.jumlah,
          r.alasan,
          r.referensi,
        ])
      );
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Monitoring Transaksi</h2>
          <p>
            Pantau penerimaan, SBBK, stock opname, dan penyesuaian stok.
            Read-only, termasuk untuk Pimpinan.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }} className="no-print">
          <button className="btn" onClick={exportPDFViaPrint}>
            Cetak PDF
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            Ekspor Excel
          </button>
        </div>
      </div>

      <div className="card">
        <div className="tabs no-print">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={tab === t.key ? "active" : ""}
              onClick={() => {
                setTab(t.key);
                setSearch("");
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="filter-bar no-print">
          <input
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 280 }}
          />
        </div>

        {tab === "penerimaan" && <TabPenerimaan search={search} />}
        {tab === "sbbk" && <TabSBBK search={search} />}
        {tab === "opname" && <TabOpname search={search} />}
        {tab === "adjustment" && <TabAdjustment search={search} />}
      </div>
    </>
  );
}

function TabPenerimaan({ search }) {
  const q = search.toLowerCase();
  const rows = mockPenerimaan.filter(
    (r) =>
      !q ||
      r.noSPB.toLowerCase().includes(q) ||
      r.noSBBK.toLowerCase().includes(q) ||
      r.asal.toLowerCase().includes(q)
  );

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>No SPB</th>
            <th>No SBBK</th>
            <th>Asal</th>
            <th>Sumber Anggaran</th>
            <th style={{ textAlign: "right" }}>Item</th>
            <th>Status</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <div className="empty-state">Tidak ada penerimaan.</div>
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td style={{ whiteSpace: "nowrap" }}>{r.tanggal}</td>
                <td>
                  <code>{r.noSPB}</code>
                </td>
                <td>
                  <code>{r.noSBBK}</code>
                </td>
                <td>{r.asal}</td>
                <td>{r.sumberAnggaran}</td>
                <td style={{ textAlign: "right" }}>{r.totalItem}</td>
                <td>
                  <span
                    className={`badge ${r.status === "selesai" ? "badge-success" : r.status === "discrepancy" ? "badge-warning" : r.status === "parsial" ? "badge-info" : "badge-gray"}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: "var(--gray-600)" }}>
                  {r.catatan || "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function TabSBBK({ search }) {
  const q = search.toLowerCase();
  const rows = mockSBBK.filter(
    (r) =>
      !q ||
      r.nomor.toLowerCase().includes(q) ||
      r.ifk.toLowerCase().includes(q)
  );

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nomor</th>
            <th>Tanggal</th>
            <th>IFK</th>
            <th style={{ textAlign: "right" }}>Item</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Cetak Ulang</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">Tidak ada SBBK.</div>
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <code>{r.nomor}</code>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{r.tanggal}</td>
                <td>{r.ifk}</td>
                <td style={{ textAlign: "right" }}>{r.totalItem}</td>
                <td>
                  <span
                    className={`badge ${r.status === "terbit" ? "badge-success" : "badge-warning"}`}
                  >
                    {r.status === "terbit" ? "Terbit" : "Draft"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>{r.cetakUlangKe}×</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function TabOpname({ search }) {
  const q = search.toLowerCase();
  const allItems = mockStockOpname.flatMap((so) =>
    so.items.map((it) => ({
      ...it,
      periode: so.periode,
      tanggal: so.tanggal,
    }))
  );
  const rows = allItems.filter(
    (r) =>
      !q ||
      r.periode.toLowerCase().includes(q) ||
      r.namaObat.toLowerCase().includes(q) ||
      r.noBatch.toLowerCase().includes(q)
  );

  const totalVariance = rows.reduce((s, r) => s + r.selisih, 0);
  const itemBerselisih = rows.filter((r) => r.selisih !== 0).length;

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Item Diperiksa</div>
          <div className="value">{fmt(rows.length)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Item Berselisih</div>
          <div
            className="value"
            style={{
              color: itemBerselisih > 0 ? "var(--warning)" : "var(--success)",
            }}
          >
            {fmt(itemBerselisih)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Total Variance</div>
          <div
            className="value"
            style={{
              color: totalVariance === 0 ? "var(--success)" : "var(--warning)",
            }}
          >
            {totalVariance > 0 ? `+${totalVariance}` : totalVariance}
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Periode</th>
              <th>Tanggal</th>
              <th>Obat</th>
              <th>Batch</th>
              <th style={{ textAlign: "right" }}>Stok Sistem</th>
              <th style={{ textAlign: "right" }}>Stok Fisik</th>
              <th style={{ textAlign: "right" }}>Selisih</th>
              <th>Alasan</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">Tidak ada variance.</div>
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={`${r.periode}-${r.noBatch}-${i}`}>
                  <td>{r.periode}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.tanggal}</td>
                  <td>{r.namaObat}</td>
                  <td>
                    <code>{r.noBatch}</code>
                  </td>
                  <td style={{ textAlign: "right" }}>{fmt(r.stokSistem)}</td>
                  <td style={{ textAlign: "right" }}>{fmt(r.stokFisik)}</td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className={`badge ${r.selisih === 0 ? "badge-success" : r.selisih > 0 ? "badge-info" : "badge-warning"}`}
                    >
                      {r.selisih > 0 ? `+${r.selisih}` : r.selisih}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{r.alasan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <LegendaTabel />
    </>
  );
}

function TabAdjustment({ search }) {
  const q = search.toLowerCase();
  const rows = mockAdjustment.filter(
    (r) =>
      !q ||
      r.namaObat.toLowerCase().includes(q) ||
      r.noBatch.toLowerCase().includes(q) ||
      r.alasan.toLowerCase().includes(q)
  );

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Obat</th>
            <th>Batch</th>
            <th>Jenis</th>
            <th style={{ textAlign: "right" }}>Jumlah</th>
            <th>Alasan</th>
            <th>Referensi</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="empty-state">Tidak ada penyesuaian stok.</div>
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td style={{ whiteSpace: "nowrap" }}>{r.tanggal}</td>
                <td>{r.namaObat}</td>
                <td>
                  <code>{r.noBatch}</code>
                </td>
                <td>
                  <span
                    className={`badge ${r.jenis === "tambah" ? "badge-success" : "badge-warning"}`}
                  >
                    {r.jenis === "tambah" ? "Tambah" : "Kurang"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>{fmt(r.jumlah)}</td>
                <td style={{ fontSize: 12 }}>{r.alasan}</td>
                <td>
                  <code>{r.referensi}</code>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <LegendaTabel />
    </div>
  );
}