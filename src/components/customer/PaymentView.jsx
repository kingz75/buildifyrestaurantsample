import { useState } from 'react';
import { fmt } from '../../utils/storage';

export default function PaymentView({ total, table, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("choose"); // choose | card | success

  const simulatePay = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("success"); setTimeout(onSuccess, 2000); }, 2500);
  };

  return (
    <div style={{fontFamily:"'Playfair Display', Georgia, serif", background:"#0d0d0d", minHeight:"100vh", color:"#f5f0e8", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px"}}>
      <div style={{maxWidth:"400px", width:"100%"}}>
        <div style={{textAlign:"center", marginBottom:"24px"}}>
          <div style={{fontSize:"40px"}}>💳</div>
          <div style={{fontSize:"22px", fontWeight:"700", color:"#e8b86d", marginTop:"8px"}}>Secure Payment</div>
          <div style={{color:"#7a5c30"}}>Table #{table} • {fmt(total)}</div>
        </div>

        {step === "success" ? (
          <div style={{textAlign:"center", background:"#0a2010", border:"2px solid #22c55e", borderRadius:"16px", padding:"32px"}}>
            <div style={{fontSize:"48px"}}>✅</div>
            <div style={{color:"#22c55e", fontSize:"18px", fontWeight:"700", marginTop:"12px"}}>Payment Successful!</div>
            <div style={{color:"#7a5c30", marginTop:"8px"}}>Redirecting to order status...</div>
          </div>
        ) : (
          <div style={{background:"#1a0a00", border:"1px solid #2d1200", borderRadius:"16px", padding:"24px"}}>
            <div style={{display:"flex", gap:"10px", marginBottom:"20px"}}>
              {["💳 Card","🏦 Transfer","👜 Wallet"].map(m => (
                <button key={m} onClick={() => setStep("card")} style={{flex:1, background:"#0d0d0d", border:"1px solid #3d2200", color:"#a07040", padding:"10px 6px", borderRadius:"8px", cursor:"pointer", fontSize:"12px", fontFamily:"inherit"}}>{m}</button>
              ))}
            </div>
            <input placeholder="Card Number" style={{width:"100%", background:"#0d0d0d", border:"1px solid #2d1200", color:"#f5f0e8", padding:"12px", borderRadius:"8px", marginBottom:"10px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", fontSize:"14px"}} />
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px"}}>
              <input placeholder="MM/YY" style={{background:"#0d0d0d", border:"1px solid #2d1200", color:"#f5f0e8", padding:"12px", borderRadius:"8px", outline:"none", fontFamily:"inherit", fontSize:"14px"}} />
              <input placeholder="CVV" style={{background:"#0d0d0d", border:"1px solid #2d1200", color:"#f5f0e8", padding:"12px", borderRadius:"8px", outline:"none", fontFamily:"inherit", fontSize:"14px"}} />
            </div>
            <div style={{background:"#0a1a0a", border:"1px solid #22c55e33", borderRadius:"8px", padding:"10px", marginBottom:"16px", fontSize:"11px", color:"#4a8a4a", display:"flex", gap:"6px", alignItems:"center"}}>
              <span>🔒</span> Secured by Paystack SSL encryption
            </div>
            <button onClick={simulatePay} disabled={loading} style={{width:"100%", background: loading?"#5a4020":"#c17f2a", border:"none", color:"#fff", padding:"14px", borderRadius:"8px", fontSize:"15px", fontWeight:"700", cursor: loading?"wait":"pointer", fontFamily:"inherit"}}>
              {loading ? "Processing..." : `Pay ${fmt(total)}`}
            </button>
            <button onClick={onCancel} style={{width:"100%", marginTop:"10px", background:"transparent", border:"none", color:"#7a5c30", padding:"10px", cursor:"pointer", fontFamily:"inherit", fontSize:"13px"}}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
