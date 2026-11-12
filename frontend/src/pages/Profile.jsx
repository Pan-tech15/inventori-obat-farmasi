import { useState } from "react";

export default function Profile() {
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setMsg("Konfirmasi password tidak cocok.");
      return;
    }
    if (newPass.length < 6) {
      setMsg("Password minimal 6 karakter.");
      return;
    }
    setMsg("Password berhasil diubah (simulasi).");
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Profil Saya</h2>
          <p>Informasi akun dan ubah password.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Informasi Akun</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Nama</label>
            <input value={session.nama || "-"} disabled />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input value={session.username || "-"} disabled />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input value={session.role || "-"} disabled />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Ubah Password</h3>
        {msg && (
          <div style={{ background: "var(--gray-100)", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
            {msg}
          </div>
        )}
        <form onSubmit={handleChangePassword}>
          <div className="form-grid">
            <div className="form-group full">
              <label>Password Lama</label>
              <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password Baru</label>
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Konfirmasi Password Baru</label>
              <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
            Simpan Password
          </button>
        </form>
      </div>
    </>
  );
}