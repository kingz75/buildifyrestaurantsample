import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import MessageModal from "../common/MessageModal";

export default function QRCodesTab({
  accent,
  muted,
  surface,
  border,
  darkMode,
  tables = [],
}) {
  const base = window.location.href.split("?")[0];
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);
  const activeTables = (tables || [])
    .filter((table) => table.active)
    .sort((a, b) => Number(a.number) - Number(b.number));
  const selectedTableData = activeTables.find(
    (table) => Number(table.number) === Number(selectedTable),
  );
  const buildCustomerUrl = (table) => {
    if (!table?.accessCode) return `${base}?table=${table?.number || ""}`;
    return `${base}?table=${table.number}&access=${encodeURIComponent(table.accessCode)}`;
  };

  useEffect(() => {
    if (!selectedTable) return;
    const stillExists = activeTables.some(
      (table) => Number(table.number) === Number(selectedTable),
    );
    if (!stillExists) {
      setSelectedTable(null);
    }
  }, [activeTables, selectedTable]);

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.error("Clipboard API copy failed:", error);
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch (error) {
      console.error("Fallback copy failed:", error);
      return false;
    }
  };

  return (
    <div>
      <div
        style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}
      >
        QR Codes for Tables
      </div>

      {/* Table QR Codes Grid */}
      <div
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "13px", color: muted, marginBottom: "16px" }}>
          How to use: Each table gets a unique QR code. Print and place at each
          table. Customers scan to order.
        </div>

        {/* Selected QR Code Display */}
        {selectedTableData && (
          <div
            style={{
              background: darkMode ? "#0f0f12" : "#ffffff",
              border: `2px solid ${accent}`,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              {selectedTableData.name}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "#fff",
                  borderRadius: "8px",
                }}
              >
                <QRCodeSVG
                  value={buildCustomerUrl(selectedTableData)}
                  size={180}
                  level={"H"}
                  includeMargin={true}
                />
              </div>
            </div>
            <div
              style={{
                fontSize: "13px",
                color: muted,
                marginBottom: "8px",
                fontFamily: "monospace",
              }}
            >
              {buildCustomerUrl(selectedTableData)}
            </div>
            <div
              style={{ display: "flex", gap: "8px", justifyContent: "center" }}
            >
              <button
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>${selectedTableData.name} QR Code</title>
                        <style>
                          body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 40px;
                          }
                          .qr-container { 
                            display: inline-block; 
                            padding: 20px; 
                            border: 2px solid #000; 
                            border-radius: 12px;
                          }
                          .table-number { 
                            font-size: 24px; 
                            font-weight: bold; 
                            margin-bottom: 16px; 
                          }
                          .url { 
                            font-size: 12px; 
                            color: #666; 
                            margin-top: 12px; 
                            font-family: monospace;
                          }
                          @media print {
                            body { padding: 0; }
                            .qr-container { border: 2px solid #000; }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="qr-container">
                          <div class="table-number">${selectedTableData.name}</div>
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(buildCustomerUrl(selectedTableData))}" alt="QR Code" />
                          <div class="url">${buildCustomerUrl(selectedTableData)}</div>
                        </div>
                        <script>window.onload = function() { window.print(); window.close(); }</script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }}
                style={{
                  background: accent + "22",
                  border: `1px solid ${accent}`,
                  color: accent,
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "inherit",
                }}
              >
                Print QR
              </button>
              <button
                onClick={async () => {
                  const copied = await copyText(buildCustomerUrl(selectedTableData));
                  if (copied) {
                    setModalMessage({
                      title: "Copied",
                      message: "URL copied to clipboard.",
                    });
                  } else {
                    setModalMessage({
                      title: "Copy Failed",
                      message: "Please copy the URL manually.",
                    });
                  }
                }}
                style={{
                  background: accent + "22",
                  border: `1px solid ${accent}`,
                  color: accent,
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "inherit",
                }}
              >
                Copy URL
              </button>
              <button
                onClick={() => setSelectedTable(null)}
                style={{
                  background: "transparent",
                  border: `1px solid ${border}`,
                  color: muted,
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "inherit",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: "8px",
          }}
        >
          {activeTables.map((table) => (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table.number)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "12px 8px",
                background:
                  Number(selectedTable) === Number(table.number)
                    ? accent + "22"
                    : "#ffffff08",
                border: `1px solid ${Number(selectedTable) === Number(table.number) ? accent : border}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  padding: "4px",
                  background: "#fff",
                  borderRadius: "4px",
                  marginBottom: "6px",
                }}
              >
                <QRCodeSVG
                  value={buildCustomerUrl(table)}
                  size={48}
                  level={"L"}
                />
              </div>
              <span style={{ fontWeight: "600", fontSize: "12px" }}>
                {table.name}
              </span>
            </div>
          ))}
        </div>
        {activeTables.length === 0 && (
          <div style={{ textAlign: "center", color: muted, padding: "18px 0 4px" }}>
            No active tables found. Add a table first.
          </div>
        )}
      </div>

      {/* Other Access Points */}
      <div
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <div
          style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}
        >
          Other Access Points
        </div>
        <div style={{ display: "grid", gap: "12px" }}>
          {[
            ["Admin Dashboard", `${base}?view=admin`],
            ["Kitchen Display", `${base}?view=kitchen`],
          ].map(([l, u]) => (
            <div
              key={l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                background: "#ffffff08",
                borderRadius: "8px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <span style={{ fontWeight: "600" }}>{l}</span>
                <div
                  style={{
                    color: muted,
                    fontSize: "12px",
                    fontFamily: "monospace",
                    marginTop: "2px",
                  }}
                >
                  {u}
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <button
                  onClick={async () => {
                    const copied = await copyText(u);
                    if (copied) {
                      setModalMessage({
                        title: "Copied",
                        message: "URL copied to clipboard.",
                      });
                    } else {
                      setModalMessage({
                        title: "Copy Failed",
                        message: "Please copy the URL manually.",
                      });
                    }
                  }}
                  style={{
                    background: accent + "22",
                    border: `1px solid ${accent}`,
                    color: accent,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontFamily: "inherit",
                  }}
                >
                  Copy
                </button>
                <a
                  href={u}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: accent,
                    border: "none",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontFamily: "inherit",
                    textDecoration: "none",
                  }}
                >
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <MessageModal
        open={Boolean(modalMessage)}
        title={modalMessage?.title}
        message={modalMessage?.message}
        onClose={() => setModalMessage(null)}
        surface={surface}
        border={border}
        text={darkMode ? "#e8e0f0" : "#1a1a2e"}
        muted={muted}
        accent={accent}
      />
    </div>
  );
}
