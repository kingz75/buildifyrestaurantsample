import { useState } from 'react';
import { fmt } from '../../utils/storage';

export default function PaymentView({
  total,
  table,
  onSuccess,
  onCancel,
  orderItems,
  billBreakdown,
}) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("choose"); // choose | card | success
  const receiptBreakdown = {
    subtotal: Number(billBreakdown?.subtotal ?? total),
    serviceCharge: Number(billBreakdown?.serviceCharge ?? 0),
    vat: Number(billBreakdown?.vat ?? 0),
    tax: Number(billBreakdown?.tax ?? 0),
    total: Number(billBreakdown?.total ?? total),
  };

  const simulatePay = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("success"); }, 2500);
  };

  const downloadPDF = () => {
    setLoading(true);

    const getConstructor = () => {
      if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
      if (window.jsPDF) return window.jsPDF;
      return null;
    };

    const generate = (jsPDFCtor) => {
      try {
        const doc = new jsPDFCtor({
          unit: 'mm',
          format: [80, 200]
        });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(193, 127, 42);
        doc.text("GRAND TABLE", 40, 15, { align: 'center' });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Fine Dining Experience", 40, 20, { align: 'center' });

        doc.setDrawColor(193, 127, 42);
        doc.setLineWidth(0.5);
        doc.line(10, 25, 70, 25);

        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`Table #${table}`, 10, 32);
        doc.text(new Date().toLocaleDateString(), 70, 32, { align: 'right' });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.1);
        doc.line(10, 35, 70, 35);

        let y = 42;
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);

        if (orderItems && orderItems.length > 0) {
          orderItems.forEach(item => {
            const safeName = item.name.replace(/[^\x00-\x7F]/g, "");
            const displayName = safeName.length > 25 ? safeName.substring(0, 22) + "..." : safeName;
            doc.text(`${item.qty}x ${displayName}`, 10, y);
            doc.text(`N${(item.price * item.qty).toLocaleString()}`, 70, y, { align: 'right' });
            y += 7;
          });
        }

        y += 5;
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.5);
        doc.line(10, y, 70, y);

        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        [
          ["Subtotal", receiptBreakdown.subtotal],
          ["Service Charge", receiptBreakdown.serviceCharge],
          ["VAT", receiptBreakdown.vat],
          ["Tax", receiptBreakdown.tax],
        ].forEach(([label, value]) => {
          doc.text(label, 10, y);
          doc.text(`N${Number(value).toLocaleString()}`, 70, y, { align: 'right' });
          y += 5;
        });

        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.5);
        doc.line(10, y, 70, y);

        y += 7;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("TOTAL PAID", 10, y);
        doc.text(`N${receiptBreakdown.total.toLocaleString()}`, 70, y, { align: 'right' });

        y += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text("Receipt ID: " + Math.random().toString(36).substr(2, 9).toUpperCase(), 40, y, { align: 'center' });
        doc.text("Thank you for your patronage!", 40, y + 4, { align: 'center' });

        doc.save(`receipt_table_${table}.pdf`);
      } catch (err) {
        console.error("PDF generation error:", err);
        alert("Error generating PDF: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const existing = getConstructor();
    if (existing) {
      generate(existing);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => {
        const ctor = getConstructor();
        if (ctor) generate(ctor);
        else {
          setLoading(false);
          alert("Could not initialize PDF library.");
        }
      };
      script.onerror = () => {
        setLoading(false);
        alert("Failed to load PDF engine.");
      };
      document.body.appendChild(script);
    }
  };

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", background: "#f8f9fa", minHeight: "100vh", color: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "40px" }}>💳</div>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#c17f2a", marginTop: "8px" }}>Secure Payment</div>
          <div style={{ color: "#64748b", marginTop: "4px" }}>Table #{table} • {fmt(total)}</div>
        </div>

        {step === "success" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "#ffffff", border: "2px solid #22c55e", borderRadius: "24px", padding: "32px", marginBottom: "16px", boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.1)" }}>
              <div style={{ fontSize: "48px" }}>✅</div>
              <div style={{ color: "#22c55e", fontSize: "20px", fontWeight: "800", marginTop: "12px" }}>Payment Successful!</div>
              <div style={{ color: "#64748b", marginTop: "8px" }}>{fmt(total)} paid for Table #{table}</div>
            </div>
            <button
              onClick={downloadPDF}
              disabled={loading}
              style={{
                width: "100%",
                background: "#ffffff",
                border: "2px solid #c17f2a",
                color: "#c17f2a",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? "Generating..." : "📄 Download PDF Receipt"}
            </button>
            <button
              onClick={onSuccess}
              style={{
                width: "100%",
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
              Track Order
            </button>
          </div>
        ) : (
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "💳 Card", id: "card" },
                { label: "🏦 Transfer", id: "transfer" },
                { label: "📱 USSD", id: "ussd" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setStep(m.id)}
                  style={{
                    flex: 1,
                    background: step === m.id ? "#c17f2a11" : "#f8f9fa",
                    border: step === m.id ? "1px solid #c17f2a" : "1px solid #e2e8f0",
                    color: step === m.id ? "#c17f2a" : "#64748b",
                    padding: "12px 6px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    fontWeight: "600",
                    transition: "all 0.2s"
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {step === "card" || step === "choose" ? (
              <>
                <input placeholder="Card Number" style={{ width: "100%", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#1a1a1a", padding: "14px", borderRadius: "10px", marginBottom: "12px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <input placeholder="MM/YY" style={{ width: "100%", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#1a1a1a", padding: "14px", borderRadius: "10px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px" }} />
                  <input placeholder="CVV" style={{ width: "100%", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#1a1a1a", padding: "14px", borderRadius: "10px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px" }} />
                </div>
              </>
            ) : step === "transfer" ? (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Bank Details</div>
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>Bank Name</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a1a" }}>Standard Chartered Bank</div>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>Account Number</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#c17f2a", fontFamily: "monospace" }}>0012345678</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>Account Name</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a1a" }}>Grand Table Restaurant Ltd</div>
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", textAlign: "center", fontStyle: "italic" }}>
                  Please transfer exactly {fmt(total)} to the account above.
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "20px", textAlign: "center" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>Dial this USSD code on your mobile phone</div>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#c17f2a", letterSpacing: "1px" }}>*123*000*8921#</div>
                </div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  The code is valid for 10 minutes.
                </div>
              </div>
            )}

            <div style={{ background: "#f0fdf4", border: "1px solid #22c55e22", borderRadius: "10px", padding: "12px", marginBottom: "20px", fontSize: "12px", color: "#166534", display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "16px" }}>🔒</span> Secured by Paystack SSL encryption
            </div>
            <button onClick={simulatePay} disabled={loading} style={{ width: "100%", background: loading ? "#cbd5e1" : "#c17f2a", border: "none", color: "#fff", padding: "16px", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: loading ? "wait" : "pointer", fontFamily: "inherit", boxShadow: loading ? "none" : "0 4px 6px rgba(193, 127, 42, 0.2)" }}>
              {loading ? "Processing..." : step === "transfer" ? "I've Made the Transfer" : step === "ussd" ? "I've Completed the Dialing" : `Pay ${fmt(total)}`}
            </button>
            <button onClick={onCancel} style={{ width: "100%", marginTop: "12px", background: "transparent", border: "none", color: "#64748b", padding: "10px", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: "600" }}>Cancel Payment</button>
          </div>
        )}
      </div>
    </div>
  );
}
