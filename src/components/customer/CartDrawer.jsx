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
    if(PROMO_CODES[promoCode.toUpperCase()]) { 
      alert(`Promo applied! ${PROMO_CODES[promoCode.toUpperCase()]}% off`); 
    } else {
      alert("Invalid promo code");
    }
  };

  return (
    <div style={{position:"fixed", inset:0, zIndex:300, display:"flex", flexDirection:"column", justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute", inset:0, background:"rgba(0,0,0,0.7)"}} />
      <div style={{background:"#0d0d0d", borderTop:"2px solid #c17f2a", borderRadius:"24px 24px 0 0", padding:"24px 16px", zIndex:1, maxHeight:"85vh", overflowY:"auto", position:"relative"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
          <div style={{fontSize:"18px", fontWeight:"700", color:"#e8b86d"}}>Your Order</div>
          <button onClick={onClose} style={{background:"#2d1200", border:"none", color:"#e8b86d", width:"32px", height:"32px", borderRadius:"50%", cursor:"pointer", fontSize:"16px"}}>✕</button>
        </div>
        {cart.map(item => (
          <div key={item.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #1a0a00"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:"14px", fontWeight:"600", color:"#f5f0e8"}}>{item.name}</div>
              <div style={{fontSize:"12px", color:"#7a5c30"}}>{fmt(item.price)} each</div>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
              <button onClick={() => updateQty(item.id, -1)} style={{background:"#2d1200", border:"1px solid #c17f2a", color:"#e8b86d", width:"28px", height:"28px", borderRadius:"50%", cursor:"pointer"}}>−</button>
              <span style={{color:"#e8b86d", fontWeight:"700", minWidth:"20px", textAlign:"center"}}>{item.qty}</span>
              <button onClick={() => updateQty(item.id, 1)} style={{background:"#c17f2a", border:"none", color:"#fff", width:"28px", height:"28px", borderRadius:"50%", cursor:"pointer"}}>+</button>
              <span style={{color:"#f5f0e8", fontWeight:"600", minWidth:"60px", textAlign:"right"}}>{fmt(item.price*item.qty)}</span>
            </div>
          </div>
        ))}
        <textarea placeholder="Special instructions (e.g. No pepper, Extra sauce)..." value={specialInstructions} onChange={e=>setSpecialInstructions(e.target.value)}
          style={{width:"100%", marginTop:"16px", background:"#1a0a00", border:"1px solid #2d1200", color:"#f5f0e8", padding:"12px", borderRadius:"10px", fontSize:"13px", outline:"none", resize:"vertical", minHeight:"70px", boxSizing:"border-box", fontFamily:"inherit"}} />
        {/* Promo */}
        <div style={{display:"flex", gap:"8px", marginTop:"12px"}}>
          <input placeholder="Promo code" value={promoCode} onChange={e=>setPromoCode(e.target.value)}
            style={{flex:1, background:"#1a0a00", border:"1px solid #2d1200", color:"#f5f0e8", padding:"10px 12px", borderRadius:"8px", fontSize:"13px", outline:"none", fontFamily:"inherit"}} />
          <button onClick={applyPromo} style={{background:"#2d1200", border:"1px solid #c17f2a", color:"#e8b86d", padding:"10px 16px", borderRadius:"8px", cursor:"pointer", fontFamily:"inherit"}}>Apply</button>
        </div>
        <div style={{marginTop:"16px", padding:"12px", background:"#1a0a00", borderRadius:"10px"}}>
          <div style={{display:"flex", justifyContent:"space-between", color:"#7a5c30", fontSize:"13px", marginBottom:"6px"}}><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
          {discount > 0 && <div style={{display:"flex", justifyContent:"space-between", color:"#22c55e", fontSize:"13px", marginBottom:"6px"}}><span>Discount ({discount}%)</span><span>-{fmt(cartTotal * discount/100)}</span></div>}
          <div style={{display:"flex", justifyContent:"space-between", color:"#e8b86d", fontSize:"16px", fontWeight:"700"}}><span>Total</span><span>{fmt(discountedTotal)}</span></div>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"16px"}}>
          <button onClick={onPayNow} style={{background:"#c17f2a", border:"none", color:"#fff", padding:"14px", borderRadius:"10px", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>💳 Pay Now</button>
          <button onClick={onPayLater} style={{background:"#1a0a00", border:"2px solid #c17f2a", color:"#e8b86d", padding:"14px", borderRadius:"10px", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit"}}>🍽️ Pay Later</button>
        </div>
      </div>
    </div>
  );
}
