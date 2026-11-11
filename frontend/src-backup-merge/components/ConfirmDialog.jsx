import Modal from "./Modal";

export default function ConfirmDialog({
  title = "Konfirmasi",
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Ya, Lanjutkan",
  danger = false,
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn" onClick={onCancel}>
            Batal
          </button>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}
