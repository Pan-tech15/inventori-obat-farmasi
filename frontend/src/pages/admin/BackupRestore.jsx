import { useState } from "react";
import { mockBackup } from "../../data/mockData";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function BackupRestore() {
  const [backups, setBackups] = useState(mockBackup);
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [backingUp, setBackingUp] = useState(false);

  const handleBackup = () => {
    setBackingUp(true);
    setTimeout(() => {
      const now = new Date();
      const nama = `backup_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}.sql`;
      const newBackup = {
        id: Date.now(),
        nama,
        ukuran: "2.5 MB",
        waktu: now.toISOString().slice(0, 19).replace("T", " "),
        status: "Sukses",
        oleh: "vanesh",
      };
      setBackups([newBackup, ...backups]);
      setBackingUp(false);
    }, 1500);
  };

  const handleRestore = (b) => {
    setConfirmRestore({
      backup: b,
      onConfirm: () => {
        alert(
          `Restore dari ${b.nama} — simulasi. Di produksi, ini akan menimpa database.`,
        );
        setConfirmRestore(null);
      },
    });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Backup & Restore</h2>
          <p>Backup adalah kewajiban Admin. Lakukan minimal 1× sehari.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleBackup}
          disabled={backingUp}
        >
          {backingUp ? "Memproses..." : "+ Backup Sekarang"}
        </button>
      </div>

      <div
        className="card"
        style={{ background: "#fffaeb", borderColor: "#fedf89" }}
      >
        <p style={{ fontSize: 13, color: "#b54708" }}>
          <strong>Peringatan:</strong> Restore akan{" "}
          <strong>menimpa seluruh data</strong> saat ini dengan data dari file
          backup. Pastikan Anda sudah melakukan backup terbaru sebelum restore.
        </p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Riwayat Backup</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama File</th>
                <th>Ukuran</th>
                <th>Waktu</th>
                <th>Oleh</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td>
                    <code>{b.nama}</code>
                  </td>
                  <td>{b.ukuran}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{b.waktu}</td>
                  <td>{b.oleh}</td>
                  <td>
                    <span
                      className={`badge ${b.status === "Sukses" ? "badge-success" : "badge-danger"}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => alert("Unduh — implementasi nanti")}
                      style={{ marginRight: 6 }}
                    >
                      Unduh
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRestore(b)}
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmRestore && (
        <ConfirmDialog
          title="Restore Database"
          message={`Restore dari ${confirmRestore.backup.nama}? Seluruh data saat ini akan ditimpa. Pastikan Anda sudah backup terbaru.`}
          confirmLabel="Ya, Restore"
          danger
          onConfirm={confirmRestore.onConfirm}
          onCancel={() => setConfirmRestore(null)}
        />
      )}
    </>
  );
}
