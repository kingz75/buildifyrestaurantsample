import { fmt } from '../../utils/storage';
import { PROMO_CODES } from '../../data/constants';

export default function CartDrawer({
  cart,
  specialInstructions,
  setSpecialInstructions,
  promoCode,
  setPromoCode,
  discount,
  cartTotal,
  discountedTotal,
  updateQty,
  onClose,
  onPayNow,
  onPayLater
}) {
  const applyPromo = () => {
    if (PROMO_CODES[promoCode.toUpperCase()]) {
      alert(`Promo applied! ${PROMO_CODES[promoCode.toUpperCase()]}% off`);
    } else {
      alert("Invalid promo code");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
      <div style={{ background: "#ffffff", borderTop: "2px solid #c17f2a", borderRadius: "24px 24px 0 0", padding: "24px 16px", zIndex: 1, maxHeight: "85vh", overflowY: "auto", position: "relative", boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "#1a1a1a" }}>Your Order</div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", color: "#64748b", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            Your cart is empty
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a1a" }}>{item.name}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{fmt(item.price)} each</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", background: "#f8f9fa", borderRadius: "8px", padding: "4px" }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ background: "#ffffff", border: "1px solid #e2e8f0", color: "#c17f2a", width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>−</button>
                  <span style={{ color: "#1a1a1a", fontWeight: "700", minWidth: "30px", textAlign: "center", fontSize: "14px" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ background: "#c17f2a", border: "none", color: "#fff", width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>+</button>
                </div>
                <span style={{ color: "#1a1a1a", fontWeight: "700", minWidth: "70px", textAlign: "right" }}>{fmt(item.price * item.qty)}</span>
              </div>
            </div>
          ))
        )}

        <textarea
          placeholder="Add special instructions (e.g. No pepper, Extra sauce)..."
          value={specialInstructions}
          onChange={e => setSpecialInstructions(e.target.value)}
          style={{ width: "100%", marginTop: "20px", background: "#f8f9fa", border: "1px solid #e2e8f0", color: "#1a1a1a", padding: "12px", borderRadius: "12px", fontSize: "13px", outline: "none", resize: "vertical", minHeight: "80px", boxSizing: "border-box", fontFamily: "inherit" }}
        />

        {/* Promo */}
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <input placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)}
            style={{ flex: 1, background: "#f8f9fa", border: "1px solid #e2e8f0", color: "#1a1a1a", padding: "12px", borderRadius: "10px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
          <button onClick={applyPromo} style={{ background: "#ffffff", border: "1px solid #c17f2a", color: "#c17f2a", padding: "12px 16px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>Apply</button>
        </div>

        <div style={{ marginTop: "20px", padding: "16px", background: "#f8f9fa", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "13px", marginBottom: "8px" }}><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
          {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#22c55e", fontSize: "13px", marginBottom: "8px", fontWeight: "600" }}><span>Discount ({discount}%)</span><span>-{fmt(cartTotal * discount / 100)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", color: "#c17f2a", fontSize: "18px", fontWeight: "800" }}><span>Total</span><span>{fmt(discountedTotal)}</span></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "20px", paddingBottom: "10px" }}>
          <button onClick={onPayNow} style={{ background: "#22c55e", border: "none", color: "#fff", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 6px rgba(34, 197, 94, 0.2)" }}>💳 Pay Now</button>
          <button onClick={onPayLater} style={{ background: "#c17f2a", border: "none", color: "#fff", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 6px rgba(193, 127, 42, 0.2)" }}>🍽️ Order Now</button>
        </div>
      </div>
    </div>
  );
}
