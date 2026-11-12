import { useState } from "react";
import { mockUsers } from "../../data/mockData";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";

const emptyForm = {
  nama: "",
  username: "",
  email: "",
  role: "Operator",
  status: "Aktif",
};

export default function ManajemenPengguna() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmAction, setConfirmAction] = useState(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.nama.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const openTambah = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      nama: user.nama,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nama || !form.username) {
      alert("Nama dan username wajib diisi.");
      return;
    }
    if (editing) {
      setUsers(
        users.map((u) =>
          u.id === editing.id
            ? { ...u, nama: form.nama, username: form.username, email: form.email, role: form.role, status: form.status }
            : u
        )
      );
    } else {
      setUsers([...users, { id: Date.now(), ...form }]);
    }
    setShowForm(false);
  };

  const handleToggleStatus = (user) => {
    setConfirmAction({
      title: user.status === "Aktif" ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna",
      message:
        user.status === "Aktif"
          ? `Nonaktifkan ${user.nama}? Pengguna tidak bisa login, tetapi riwayatnya tetap tersimpan. Pengguna tidak dihapus permanen.`
          : `Aktifkan kembali ${user.nama}?`,
      onConfirm: () => {
        setUsers(
          users.map((u) =>
            u.id === user.id
              ? { ...u, status: u.status === "Aktif" ? "Nonaktif" : "Aktif" }
              : u
          )
        );
        setConfirmAction(null);
      },
    });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Manajemen Pengguna</h2>
          <p>Kelola akun dan role pengguna. Pengguna tidak dihapus permanen — hanya dinonaktifkan.</p>
        </div>
        <button className="btn btn-primary" onClick={openTambah}>+ Tambah Pengguna</button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            placeholder="Cari nama, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">Semua Role</option>
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
            <option value="Kab/Kota">Kab/Kota</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
          <span className="spacer" />
          <span style={{ fontSize: 12, color: "var(--gray-600)" }}>{filtered.length} pengguna</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">Tidak ada pengguna yang sesuai filter.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td>{u.nama}</td>
                    <td><code>{u.username}</code></td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-info">{u.role}</span></td>
                    <td>
                      <span className={`badge ${u.status === "Aktif" ? "badge-success" : "badge-gray"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => openEdit(u)} style={{ marginRight: 6 }}>
                        Edit
                      </button>
                      <button className="btn btn-sm" onClick={() => handleToggleStatus(u)}>
                        {u.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
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
          title={editing ? "Edit Pengguna" : "Tambah Pengguna"}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowForm(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Lengkap *</label>
              <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="Admin">Admin</option>
                <option value="Operator">Operator</option>
                <option value="Kab/Kota">Kab/Kota</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
          confirmLabel="Ya, Lanjutkan"
        />
      )}
    </>
  );
}