import{u as z,b as C,r as i,j as e,L as h}from"./index-Dm63Vh2V.js";import{P as F}from"./PaymentView-x4-whLrO.js";import{g as I,c as L,d as P,O as v}from"./storage-B6aPNTTM.js";import"./MessageModal-C6r7YgMD.js";const j=n=>{const a=Number(n);return Number.isFinite(a)?a:0},y=(n,a,g)=>j(a)+n*(j(g)/100);function $(){const{cart:n,cartTotal:a,clearCart:g}=z(),f=C(),[t,w]=i.useState(null),[s,l]=i.useState("review"),[c,k]=i.useState(""),[b,B]=i.useState(I()),p=Array.isArray(b.billers)?b.billers.filter(r=>r.active!==!1):[],m=p.reduce((r,x)=>r+y(a,x.amount,x.percent),0);i.useEffect(()=>{if(s==="success")return;const r=sessionStorage.getItem("gt_checkout_customer");!r||n.length===0?f("/cart"):w(JSON.parse(r))},[n,f,s]);const N=()=>{l("paying")},[S,u]=i.useState(!1),O=async()=>{if(S||s==="success")return;u(!0);const r=L();if(!t||n.length===0){console.error("Order Record Aborted: Missing customer or cart data."),u(!1);return}const x={id:r,type:"delivery",table:v.number,accessCode:v.accessCode,customer:t,items:n,subtotal:a,deliveryFee:t.deliveryFee||0,packagingFee:t.packagingFee||0,billerCharges:m,billers:p.map(o=>({id:o.id,name:o.name,amount:o.amount,percent:o.percent,value:y(a,o.amount,o.percent)})),total:a+(t.deliveryFee||0)+(t.packagingFee||0)+m,status:"Pending",paymentStatus:"Paid",paymentMethod:"Online",timestamp:Date.now()};try{await P(x),k(r),l("success"),g(),sessionStorage.removeItem("gt_checkout_customer"),console.log("Order saved successfully:",r);const o=new Blob([`Your Order ID: ${r}

Use this ID to track your order at: ${window.location.origin}/track?id=${r}`],{type:"text/plain"}),d=document.createElement("a");d.href=URL.createObjectURL(o),d.download=`order-id-${r}.txt`,document.body.appendChild(d),d.click(),document.body.removeChild(d)}catch(o){console.error("Order Record Failed:",o),alert(`Something went wrong saving your order. Error: ${o.message||"Unknown error"}`),l("review")}finally{u(!1)}};return t?s==="success"?e.jsxs("div",{className:"checkout-success",children:[e.jsxs("div",{className:"success-card",children:[e.jsx("div",{className:"success-icon",children:"✅"}),e.jsx("h1",{children:"Order Placed!"}),e.jsxs("p",{children:["Thank you for your order, ",e.jsx("strong",{children:t.name}),"!"]}),e.jsxs("div",{className:"order-number",children:[e.jsx("span",{children:"Order ID:"}),e.jsx("code",{children:c})]}),e.jsx("p",{className:"delivery-wait",children:"Our kitchen is preparing your food. We'll notify you when it's out for delivery."}),e.jsxs("div",{className:"action-btns",children:[e.jsx(h,{to:`/track?id=${c}`,className:"track-btn",children:"Track Order"}),e.jsx(h,{to:"/",className:"home-btn",children:"Back to Home"})]})]}),e.jsx("style",{children:`
          .checkout-success { padding: 100px 24px; display: flex; justify-content: center; }
          .success-card { background: var(--bg-card); padding: 60px; border-radius: 32px; border: 1px solid rgba(255,255,255,0.05); text-align: center; max-width: 500px; }
          .success-icon { font-size: 64px; margin-bottom: 24px; }
          .success-card h1 { font-family: var(--font-display); font-size: 36px; color: var(--white); margin-bottom: 16px; }
          .success-card p { color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
          .order-number { background: #000; padding: 16px; border-radius: 12px; margin-bottom: 32px; display: flex; flex-direction: column; gap: 4px; }
          .order-number span { font-size: 12px; font-weight: 600; }
          .order-number code { color: var(--primary); font-size: 20px; font-weight: 800; font-family: monospace; }
          .action-btns { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
          .track-btn { display: inline-block; background: var(--primary); color: white; padding: 16px 40px; border-radius: 40px; text-decoration: none; font-weight: 700; }
          .home-btn { display: inline-block; background: rgba(255,255,255,0.05); color: white; padding: 16px 40px; border-radius: 40px; text-decoration: none; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); }
          .delivery-wait { font-size: 14px; font-style: italic; }
        `})]}):s==="paying"?e.jsx(F,{total:a+(t.deliveryFee||0)+(t.packagingFee||0)+m,table:"Online",onSuccess:O,onCancel:()=>l("review"),orderItems:n,orderId:c}):s==="success"?e.jsxs("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:"40px",textAlign:"center",background:"var(--bg-main)",color:"var(--white)"},children:[e.jsx("div",{style:{fontSize:"80px",marginBottom:"24px"},children:"🎉"}),e.jsx("h1",{style:{fontSize:"42px",marginBottom:"16px"},children:"Order Placed!"}),e.jsx("p",{style:{fontSize:"18px",color:"var(--text-muted)",marginBottom:"40px"},children:"Thank you for your order. We are preparing it now!"}),e.jsxs("div",{style:{background:"var(--bg-card)",padding:"24px",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.05)",marginBottom:"32px",width:"100%",maxWidth:"400px"},children:[e.jsx("div",{style:{fontSize:"14px",color:"var(--text-muted)",marginBottom:"8px"},children:"Order ID"}),e.jsxs("div",{style:{fontSize:"20px",fontWeight:700,letterSpacing:"1px"},children:["#",c]})]}),e.jsx("button",{onClick:()=>window.location.href=`/track?id=${c}`,style:{background:"var(--primary)",color:"white",padding:"16px 32px",border:"none",borderRadius:"12px",fontSize:"16px",fontWeight:700,cursor:"pointer"},children:"Track My Order"})]}):e.jsxs("div",{className:"checkout-page",children:[e.jsx("h1",{children:"Checkout"}),e.jsxs("div",{className:"checkout-grid",children:[e.jsxs("section",{className:"order-summary-section",children:[e.jsx("h3",{children:"Order Summary"}),e.jsx("div",{className:"summary-list",children:n.map(r=>e.jsxs("div",{className:"summary-item",children:[e.jsxs("span",{className:"qty",children:[r.qty,"x"]}),e.jsx("span",{className:"name",children:r.name}),e.jsxs("span",{className:"price",children:["₦",(r.price*r.qty).toLocaleString()]})]},r.id))}),e.jsxs("div",{className:"summary-total",children:[e.jsxs("div",{className:"row",children:[e.jsx("span",{children:"Items Total"}),e.jsxs("span",{children:["₦",a.toLocaleString()]})]}),t.deliveryFee>0&&e.jsxs("div",{className:"row",children:[e.jsxs("span",{children:["Delivery (",t.location,")"]}),e.jsxs("span",{children:["₦",t.deliveryFee.toLocaleString()]})]}),t.packagingFee>0&&e.jsxs("div",{className:"row",children:[e.jsx("span",{children:"Packaging Fee"}),e.jsxs("span",{children:["₦",t.packagingFee.toLocaleString()]})]}),p.length>0&&p.map(r=>e.jsxs("div",{className:"row",children:[e.jsx("span",{children:r.name}),e.jsxs("span",{children:["₦",y(a,r.amount,r.percent).toLocaleString()]})]},r.id)),e.jsxs("div",{className:"row grand-total",children:[e.jsx("span",{children:"Total Amount"}),e.jsxs("span",{children:["₦",(a+(t.deliveryFee||0)+(t.packagingFee||0)+m).toLocaleString()]})]})]})]}),e.jsxs("section",{className:"payment-section",children:[e.jsxs("div",{className:"info-card",children:[e.jsx("h3",{children:"Delivery Details"}),e.jsxs("p",{children:[e.jsx("strong",{children:t.name})," • ",t.phone]}),e.jsx("p",{children:t.address}),t.notes&&e.jsx("p",{className:"notes",children:e.jsxs("em",{children:["Note: ",t.notes]})})]}),e.jsxs("div",{className:"summary-card",children:[e.jsx("button",{className:"pay-btn",onClick:N,children:"Proceed to Payment"}),e.jsx("p",{className:"cancel-pay",children:e.jsx(h,{to:"/cart",children:"Back to Cart"})})]})]})]}),e.jsx("style",{children:`
        .checkout-page { padding: 60px 24px; max-width: 1000px; margin: 0 auto; }
        .checkout-page h1 { font-family: var(--font-display); font-size: 40px; color: var(--white); margin-bottom: 40px; text-align: center; }
        .checkout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
        
        h3 { font-family: var(--font-body); font-size: 20px; font-weight: 700; color: var(--white); margin-bottom: 24px; }
        
        .order-summary-section { background: var(--bg-card); padding: 32px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
        .summary-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 24px; }
        .summary-item { display: grid; grid-template-columns: 40px 1fr auto; font-size: 15px; color: var(--text-main); }
        .summary-item .qty { color: var(--primary); font-weight: 700; }
        .summary-item .price { font-weight: 600; }
        
        .summary-total { display: flex; flex-direction: column; gap: 12px; }
        .summary-total .row { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 15px; }
        .summary-total .row.grand-total { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 8px; font-size: 22px; font-weight: 800; color: var(--white); }
        .free { color: #22c55e; font-weight: 700; }

        .info-card { background: rgba(255,255,255,0.03); padding: 24px; border-radius: 16px; margin-bottom: 24px; border-left: 4px solid var(--primary); }
        .info-card p { font-size: 14px; color: var(--text-muted); margin-bottom: 4px; line-height: 1.4; }
        .info-card p strong { color: var(--white); }
        .notes { margin-top: 12px !important; }
        
        .payment-action-card { background: var(--bg-card); padding: 32px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
        .method { background: #000; border: 2px solid var(--primary); padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; color: var(--white); position: relative; }
        .method .check { margin-left: auto; color: var(--primary); font-weight: 900; }
        
        .secure-badge { text-align: center; font-size: 12px; color: var(--text-muted); margin: 24px 0 16px; }
        
        .pay-btn { width: 100%; background: var(--primary); color: white; padding: 18px; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .pay-btn:hover { background: var(--primary-hover); transform: translateY(-3px); }
        .pay-btn.loading { opacity: 0.7; cursor: wait; transform: none; }
        
        .cancel-pay { text-align: center; margin-top: 16px; font-size: 14px; }
        .cancel-pay a { color: var(--text-muted); text-decoration: none; }
        
        @media (max-width: 800px) {
          .checkout-grid { grid-template-columns: 1fr; }
        }
      `})]}):null}export{$ as default};
