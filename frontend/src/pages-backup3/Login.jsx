import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockUsers, mockLoginHistory } from "../data/mockData";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const user = mockUsers.find((u) => u.username === username);

    if (!user) {
      recordLogin(username, "Gagal", "Username tidak ditemukan");
      setError("Username tidak ditemukan.");
      return;
    }
    if (user.status === "Nonaktif") {
      recordLogin(username, "Gagal", "Akun nonaktif");
      setError("Akun Anda nonaktif. Hubungi Admin.");
      return;
    }
    if (password !== "password123") {
      recordLogin(username, "Gagal", "Password salah");
      setError("Password salah. (Demo: password123)");
      return;
    }

    // Simpan session
    localStorage.setItem(
      "session",
      JSON.stringify({
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
        scope: user.scope,
        kabKota: user.kabKota || null,
      })
    );
    recordLogin(username, "Berhasil", "-");

    // Redirect berdasarkan role
    if (user.role === "Admin") navigate("/admin/dashboard");
    else if (user.role === "Operator") navigate("/operator/dashboard");
    else if (user.role === "Pimpinan") navigate("/pimpinan/dashboard");
    else if (user.role === "Kab/Kota") navigate("/kabkota/dashboard");
    else navigate("/login");
  };

  const recordLogin = (username, status, keterangan) => {
    const history =
      JSON.parse(localStorage.getItem("loginHistory") || "null") ||
      mockLoginHistory;
    history.unshift({
      id: Date.now(),
      waktu: new Date().toISOString().slice(0, 19).replace("T", " "),
      username: username || "(kosong)",
      nama: "-",
      perangkat: `${navigator.platform} — ${
        navigator.userAgent.includes("Chrome") ? "Chrome" : "Browser"
      }`,
      status,
      keterangan,
    });
    localStorage.setItem("loginHistory", JSON.stringify(history));
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>Inventori Obat Farmasi</h1>
        <p className="subtitle">Dinas Kesehatan Provinsi Sulawesi Utara</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
          >
            Masuk
          </button>
        </form>

        <div className="hint">
          <strong>Akun demo:</strong>
          <br />
          Admin: <code>vanesh</code> · Operator: <code>marsela</code> · Pimpinan: <code>kasi.farmasi</code>
          <br />
          Kab/Kota: <code>ifk.manado</code> · Password semua: <code>password123</code>
        </div>
      </div>
    </div>
  );
}