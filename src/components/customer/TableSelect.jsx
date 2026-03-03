import { useState } from "react";

export default function TableSelect({ onSelect, tables = [] }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSelect = () => {
    const tableNum = parseInt(input);
    if (!tableNum) {
      setError("Please enter a table number");
      return;
    }
    // Check if table exists and is active
    const validTable = tables.find((t) => t.id === tableNum && t.active);
    if (!validTable) {
      setError("Invalid or inactive table number");
      return;
    }
    setError("");
    onSelect(tableNum);
  };

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        background: "radial-gradient(circle at 50% 30%, #2d1200, #0d0d0d 70%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f5f0e8",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px 24px",
          maxWidth: "360px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🍽️</div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#e8b86d",
            marginBottom: "8px",
          }}
        >
          Grand Table
        </div>
        <div
          style={{ color: "#7a5c30", marginBottom: "32px", fontSize: "15px" }}
        >
          Fine Dining Experience
        </div>
        <div
          style={{
            background: "#1a0a00",
            border: "1px solid #2d1200",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <div
            style={{ color: "#a07040", marginBottom: "12px", fontSize: "14px" }}
          >
            Enter your table number to begin
          </div>
          <input
            type="number"
            placeholder="Table Number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: "100%",
              background: "#0d0d0d",
              border: error ? "1px solid #ef4444" : "1px solid #c17f2a",
              color: "#e8b86d",
              padding: "14px",
              borderRadius: "8px",
              fontSize: "24px",
              textAlign: "center",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
          {error && (
            <div
              style={{ color: "#ef4444", fontSize: "12px", marginTop: "8px" }}
            >
              {error}
            </div>
          )}
          <button
            onClick={handleSelect}
            style={{
              width: "100%",
              marginTop: "16px",
              background: "#c17f2a",
              border: "none",
              color: "#fff",
              padding: "14px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Browse Menu →
          </button>
        </div>
        <div style={{ marginTop: "20px", color: "#3d2200", fontSize: "12px" }}>
          Or scan the QR code on your table
        </div>
      </div>
    </div>
  );
}
