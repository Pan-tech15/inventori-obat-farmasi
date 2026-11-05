import { useState } from "react";
import { mockReferensi } from "../../data/mockData";

const tabConfig = [
  { key: "satuan", label: "Satuan", columns: ["Nama", "Keterangan"] },
  { key: "pabrik", label: "Pabrik", columns: ["Nama", "Alamat"] },
  {
    key: "sumberAnggaran",
    label: "Sumber Anggaran",
    columns: ["Nama", "Tahun"],
  },
  { key: "ifk", label: "IFK / Kab-Kota", columns: ["Nama IFK", "Kab/Kota"] },
  {
    key: "jenisProgram",
    label: "Jenis Program",
    columns: ["Nama", "Keterangan"],
  },
];

export default function MasterReferensi() {
  const [activeTab, setActiveTab] = useState("satuan");
  const [data, setData] = useState(mockReferensi);

  const current = data[activeTab];
  const config = tabConfig.find((t) => t.key === activeTab);
  const fieldKeys =
    activeTab === "satuan"
      ? ["nama", "keterangan"]
      : activeTab === "pabrik"
        ? ["nama", "alamat"]
        : activeTab === "sumberAnggaran"
          ? ["nama", "tahun"]
          : activeTab === "ifk"
            ? ["nama", "kabKota"]
            : ["nama", "keterangan"];

  const handleTambah = () => {
    const nama = prompt(`Nama ${config.label}:`);
    if (!nama) return;
    const newItem = {
      id: Date.now(),
      [fieldKeys[0]]: nama,
      [fieldKeys[1]]: "-",
    };
    setData({ ...data, [activeTab]: [...current, newItem] });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Master Referensi</h2>
          <p>Data referensi untuk mengisi pilihan pada form transaksi.</p>
        </div>
        <button className="btn btn-primary" onClick={handleTambah}>
          + Tambah {config.label}
        </button>
      </div>

      <div className="card">
        <div className="tabs">
          {tabConfig.map((t) => (
            <button
              key={t.key}
              className={activeTab === t.key ? "active" : ""}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label} ({data[t.key].length})
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                {config.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {current.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 2}>
                    <div className="empty-state">Belum ada data.</div>
                  </td>
                </tr>
              ) : (
                current.map((item, i) => (
                  <tr key={item.id}>
                    <td>{i + 1}</td>
                    {fieldKeys.map((k) => (
                      <td key={k}>{item[k] || "-"}</td>
                    ))}
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          alert("Edit — implementasi backend nanti")
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
