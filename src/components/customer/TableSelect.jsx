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
        background: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#1a1a1a",
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
            color: "#c17f2a",
            marginBottom: "8px",
          }}
        >
          Grand Table
        </div>
        <div
          style={{ color: "#64748b", marginBottom: "32px", fontSize: "15px" }}
        >
          Fine Dining Experience
        </div>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{ color: "#64748b", marginBottom: "12px", fontSize: "14px" }}
          >
            Enter your table number to begin
          </div>
          <input
            type="number"
            placeholder="0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: "100%",
              background: "#f1f5f9",
              border: error ? "2px solid #ef4444" : "1px solid #e2e8f0",
              color: "#1a1a1a",
              padding: "16px",
              borderRadius: "12px",
              fontSize: "32px",
              textAlign: "center",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              fontWeight: "700",
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
              padding: "16px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 6px rgba(193, 127, 42, 0.2)",
            }}
          >
            Browse Menu →
          </button>
        </div>
        <div style={{ marginTop: "20px", color: "#94a3b8", fontSize: "12px" }}>
          Or scan the QR code on your table
        </div>
      </div>
    </div>
  );
}
