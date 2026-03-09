export default function MessageModal({
  open,
  title = "Notice",
  message = "",
  onClose,
  surface = "#ffffff",
  border = "#e2e8f0",
  text = "#1a1a1a",
  muted = "#64748b",
  accent = "#c17f2a",
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: "12px",
          padding: "18px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          fontFamily: "inherit",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: "700", color: text }}>
          {title}
        </div>
        <div style={{ marginTop: "8px", fontSize: "13px", color: muted }}>
          {message}
        </div>
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: accent,
              border: "none",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "inherit",
              fontWeight: "600",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
