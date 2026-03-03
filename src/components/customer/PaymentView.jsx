import { useState } from 'react';
import { fmt } from '../../utils/storage';

export default function PaymentView({ total, table, onSuccess, onCancel, orderItems }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("choose"); // choose | card | success

  const simulatePay = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("success"); }, 2500);
  };

  const printReceipt = () => {
    const w = window.open("", "_blank");
    const itemsHtml = orderItems && orderItems.length > 0
      ? orderItems.map(i => `<tr><td style="padding:4px 0">${i.qty}× ${i.name}</td><td align="right" style="padding:4px 0">₦${(i.price * i.qty).toLocaleString()}</td></tr>`).join("")
      : `<tr><td colspan="2" style="padding:4px 0">Payment</td></tr>`;
    w.document.write(`<html><body style="font-family:'Georgia',serif;padding:40px;max-width:400px;margin:0 auto;color:#1a1a1a">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:28px;color:#c17f2a;font-weight:700">🍽️ Grand Table</div>
        <div style="font-size:12px;color:#888;margin-top:4px">Fine Dining Restaurant</div>
      </div>
      <div style="border-top:2px solid #c17f2a;border-bottom:1px dashed #ccc;padding:10px 0;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666">
          <span>Table #${table}</span>
          <span>${new Date().toLocaleString()}</span>
        </div>
      </div>
      <table width="100%" style="border-collapse:collapse;font-size:14px">${itemsHtml}</table>
      <div style="border-top:2px solid #1a1a1a;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;font-size:18px;font-weight:700">
        <span>Total</span><span>₦${total.toLocaleString()}</span>
      </div>
      <div style="margin-top:8px;display:flex;justify-content:space-between;font-size:13px;color:#22c55e;font-weight:600">
        <span>Payment Status</span><span>✅ Paid</span>
      </div>
      <div style="text-align:center;margin-top:24px;font-size:12px;color:#aaa">
        Thank you for dining with us!<br/>www.grandtable.com
      </div>
      <script>window.print()</script></body></html>`);
  };

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", background: "#0d0d0d", minHeight: "100vh", color: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "40px" }}>💳</div>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#e8b86d", marginTop: "8px" }}>Secure Payment</div>
          <div style={{ color: "#7a5c30" }}>Table #{table} • {fmt(total)}</div>
        </div>

        {step === "success" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "#0a2010", border: "2px solid #22c55e", borderRadius: "16px", padding: "32px", marginBottom: "16px" }}>
              <div style={{ fontSize: "48px" }}>✅</div>
              <div style={{ color: "#22c55e", fontSize: "18px", fontWeight: "700", marginTop: "12px" }}>Payment Successful!</div>
              <div style={{ color: "#7a5c30", marginTop: "8px" }}>{fmt(total)} paid for Table #{table}</div>
            </div>
            <button
              onClick={printReceipt}
              style={{
                width: "100%",
                background: "#2d1200",
                border: "1px solid #c17f2a",
                color: "#e8b86d",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              🖨️ Print Receipt
            </button>
            <button
              onClick={onSuccess}
              style={{
                width: "100%",
                background: "#c17f2a",
                border: "none",
                color: "#fff",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Continue
            </button>
          </div>
        ) : (
          <div style={{ background: "#1a0a00", border: "1px solid #2d1200", borderRadius: "16px", padding: "24px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {["💳 Card", "🏦 Transfer", "👜 Wallet"].map(m => (
                <button key={m} onClick={() => setStep("card")} style={{ flex: 1, background: "#0d0d0d", border: "1px solid #3d2200", color: "#a07040", padding: "10px 6px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>{m}</button>
              ))}
            </div>
            <input placeholder="Card Number" style={{ width: "100%", background: "#0d0d0d", border: "1px solid #2d1200", color: "#f5f0e8", padding: "12px", borderRadius: "8px", marginBottom: "10px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <input placeholder="MM/YY" style={{ background: "#0d0d0d", border: "1px solid #2d1200", color: "#f5f0e8", padding: "12px", borderRadius: "8px", outline: "none", fontFamily: "inherit", fontSize: "14px" }} />
              <input placeholder="CVV" style={{ background: "#0d0d0d", border: "1px solid #2d1200", color: "#f5f0e8", padding: "12px", borderRadius: "8px", outline: "none", fontFamily: "inherit", fontSize: "14px" }} />
            </div>
            <div style={{ background: "#0a1a0a", border: "1px solid #22c55e33", borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "11px", color: "#4a8a4a", display: "flex", gap: "6px", alignItems: "center" }}>
              <span>🔒</span> Secured by Paystack SSL encryption
            </div>
            <button onClick={simulatePay} disabled={loading} style={{ width: "100%", background: loading ? "#5a4020" : "#c17f2a", border: "none", color: "#fff", padding: "14px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: loading ? "wait" : "pointer", fontFamily: "inherit" }}>
              {loading ? "Processing..." : `Pay ${fmt(total)}`}
            </button>
            <button onClick={onCancel} style={{ width: "100%", marginTop: "10px", background: "transparent", border: "none", color: "#7a5c30", padding: "10px", cursor: "pointer", fontFamily: "inherit", fontSize: "13px" }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
