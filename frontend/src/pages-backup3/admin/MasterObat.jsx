import { useState } from "react";
import { mockObat } from "../../data/mockData";
import Modal from "../../components/Modal";

const emptyForm = {
  kode: "",
  nama: "",
  zatAktif: "",
  satuan: "Tablet",
  jenis: "Buffer",
  kategori: "Fast Moving",
  stokMin: 0,
  status: "Aktif",
};

export default function MasterObat() {
  const [obat, setObat] = useState(mockObat);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = obat.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.nama.toLowerCase().includes(q) ||
      o.kode.toLowerCase().includes(q) ||
      o.zatAktif.toLowerCase().includes(q);
    const matchJenis = !filterJenis || o.jenis === filterJenis;
    return matchSearch && matchJenis;
  });

  const openTambah = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (o) => {
    setEditing(o);
    setForm({
      kode: o.kode,
      nama: o.nama,
      zatAktif: o.zatAktif,
      satuan: o.satuan,
      jenis: o.jenis,
      kategori: o.kategori,
      stokMin: o.stokMin,
      status: o.status,
    });
    setShowForm(true);
  };
  const handleSave = () => {
    if (!form.kode || !form.nama) {
      alert("Kode dan nama obat wajib diisi.");
      return;
    }
    if (editing)
      setObat(obat.map((o) => (o.id === editing.id ? { ...o, ...form } : o)));
    else setObat([...obat, { id: Date.now(), ...form }]);
    setShowForm(false);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Master Data Obat</h2>
          <p>
            Kelola daftar obat program dan buffer. Obat yang sudah punya
            transaksi tidak dapat dihapus — hanya dinonaktifkan.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openTambah}>
          + Tambah Obat
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari kode, nama, zat aktif..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            <option>Program</option>
            <option>Buffer</option>
          </select>
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>
            {filtered.length} obat
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Obat</th>
                <th>Zat Aktif</th>
                <th>Satuan</th>
                <th>Jenis</th>
                <th>Program</th>
                <th>Kategori</th>
                <th>Stok Min</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      Tidak ada obat yang sesuai filter.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <code>{o.kode}</code>
                    </td>
                    <td>{o.nama}</td>
                    <td>{o.zatAktif}</td>
                    <td>{o.satuan}</td>
                    <td>
                      <span
                        className={`badge ${o.jenis === "Program" ? "badge-info" : "badge-warning"}`}
                      >
                        {o.jenis}
                      </span>
                      <td>
                        {o.jenis === "Program" ? (
                          <span className="badge badge-info">{o.program}</span>
                        ) : (
                          <span style={{ color: "var(--gray-400)" }}>-</span>
                        )}
                      </td>
                    </td>
                    <td>{o.kategori}</td>
                    <td>{o.stokMin.toLocaleString("id-ID")}</td>
                    <td>
                      <span
                        className={`badge ${o.status === "Aktif" ? "badge-success" : "badge-gray"}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() => openEdit(o)}
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

      {showForm && (
        <Modal
          title={editing ? "Edit Obat" : "Tambah Obat"}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowForm(false)}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Simpan
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Kode Obat *</label>
              <input
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Nama Obat *</label>
              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Zat Aktif</label>
              <input
                value={form.zatAktif}
                onChange={(e) => setForm({ ...form, zatAktif: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Satuan</label>
              <select
                value={form.satuan}
                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
              >
                <option>Tablet</option>
                <option>Kapsul</option>
                <option>Sachet</option>
                <option>Botol</option>
                <option>Ampul</option>
              </select>
            </div>
            <div className="form-group">
              <label>Jenis</label>
              <select
                value={form.jenis}
                onChange={(e) => setForm({ ...form, jenis: e.target.value })}
              >
                <option>Program</option>
                <option>Buffer</option>
              </select>
              {form.jenis === "Program" && (
                <div className="form-group">
                  <label>Program Spesifik</label>
                  <select
                    value={form.program}
                    onChange={(e) =>
                      setForm({ ...form, program: e.target.value })
                    }
                  >
                    <option value="TBC">TBC</option>
                    <option value="Malaria">Malaria</option>
                    <option value="HIV/AIDS">HIV/AIDS</option>
                    <option value="Kusta">Kusta</option>
                    <option value="Hepatitis">Hepatitis</option>
                  </select>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              >
                <option>Fast Moving</option>
                <option>Slow Moving</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stok Minimum</label>
              <input
                type="number"
                value={form.stokMin}
                onChange={(e) =>
                  setForm({ ...form, stokMin: Number(e.target.value) })
                }
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>Aktif</option>
                <option>Nonaktif</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
