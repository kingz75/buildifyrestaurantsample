import{u as k,b as z,r as i,j as e,L as S}from"./index-Dm63Vh2V.js";import{b as C}from"./storage-B6aPNTTM.js";function D(){const{cart:x,cartTotal:p,updateQty:h,removeFromCart:f}=k(),b=z(),[g,v]=i.useState([]),[n,y]=i.useState(0),[F,j]=i.useState(!1);i.useEffect(()=>{const t=C(s=>{v(s.deliveryLocations||[]),y(s.packagingFee||0),j(!0)});return()=>t()},[]);const[r,m]=i.useState(()=>{const t=sessionStorage.getItem("gt_checkout_customer");return t?JSON.parse(t):{name:"",phone:"",address:"",notes:"",location:"",deliveryFee:0,packagingFee:0}}),[a,u]=i.useState({}),l=t=>{const{name:s,value:c}=t.target;if(s==="phone"){const o=c.replace(/\D/g,"");m(d=>({...d,phone:o}))}else if(s==="location"){const o=g.find(d=>d.id===c);m(d=>({...d,location:c,deliveryFee:o?o.fee:0,packagingFee:n}))}else m(o=>({...o,[s]:c}));a[s]&&u(o=>({...o,[s]:null}))},w=()=>{const t={};return r.name.trim()||(t.name="Full name is required"),r.phone.trim()||(t.phone="Phone number is required"),r.location||(t.location="Please select a delivery location"),r.address.trim()||(t.address="Delivery address is required"),u(t),Object.keys(t).length===0},N=t=>{if(t.preventDefault(),w()){const s={...r,packagingFee:n};sessionStorage.setItem("gt_checkout_customer",JSON.stringify(s)),b("/checkout")}};return x.length===0?e.jsxs("div",{className:"empty-cart-view",children:[e.jsxs("div",{className:"empty-content",children:[e.jsx("div",{className:"empty-icon",children:"🛒"}),e.jsx("h2",{children:"Your cart is empty"}),e.jsx("p",{children:"Go to our menu and add some delicious items to get started!"}),e.jsx(S,{to:"/menu",className:"browse-btn",children:"Browse Menu"})]}),e.jsx("style",{children:`
          .empty-cart-view {
            padding: 100px 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .empty-icon { font-size: 64px; margin-bottom: 24px; opacity: 0.3; }
          .empty-content h2 { font-size: 32px; color: var(--white); margin-bottom: 12px; }
          .empty-content p { color: var(--text-muted); margin-bottom: 40px; }
          .browse-btn {
            background: var(--primary);
            color: white;
            padding: 16px 40px;
            border-radius: 40px;
            text-decoration: none;
            font-weight: 700;
          }
        `})]}):e.jsxs("div",{className:"cart-page",children:[e.jsxs("div",{className:"cart-grid",children:[e.jsxs("section",{className:"cart-items-section",children:[e.jsx("h2",{children:"Your Selection"}),e.jsx("div",{className:"cart-items-list",children:x.map(t=>e.jsxs("div",{className:"cart-item",children:[e.jsx("div",{className:"item-thumb",children:t.image&&(t.image.startsWith("http")||t.image.startsWith("data:"))?e.jsx("img",{src:t.image,alt:t.name}):e.jsx("span",{children:t.image||"🍴"})}),e.jsxs("div",{className:"item-details",children:[e.jsx("h4",{children:t.name}),e.jsxs("p",{children:["₦",t.price.toLocaleString()]})]}),e.jsxs("div",{className:"item-qty-controls",children:[e.jsx("button",{onClick:()=>h(t.id,-1),children:"−"}),e.jsx("span",{children:t.qty}),e.jsx("button",{onClick:()=>h(t.id,1),children:"+"})]}),e.jsxs("div",{className:"item-subtotal",children:["₦",(t.price*t.qty).toLocaleString()]}),e.jsx("button",{className:"remove-btn",onClick:()=>f(t.id),children:"×"})]},t.id))}),e.jsxs("div",{className:"cart-summary-row",children:[e.jsx("span",{children:"Subtotal"}),e.jsxs("span",{children:["₦",p.toLocaleString()]})]})]}),e.jsxs("section",{className:"customer-details-section",children:[e.jsx("h2",{children:"Delivery Details"}),e.jsxs("form",{className:"details-form",onSubmit:N,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Full Name"}),e.jsx("input",{name:"name",value:r.name,onChange:l,className:a.name?"error":""}),a.name&&e.jsx("span",{className:"error-text",children:a.name})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Phone Number"}),e.jsx("input",{name:"phone",value:r.phone,onChange:l,className:a.phone?"error":""}),a.phone&&e.jsx("span",{className:"error-text",children:a.phone})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Delivery Area"}),e.jsxs("select",{name:"location",value:r.location,onChange:l,className:a.location?"error":"",style:{width:"100%",background:"#000",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"14px",color:"white",fontFamily:"inherit",fontSize:"15px",outline:"none"},children:[e.jsx("option",{value:"",children:"Select a location..."}),g.map(t=>e.jsxs("option",{value:t.id,children:[t.name," (+₦",t.fee.toLocaleString(),")"]},t.id))]}),a.location&&e.jsx("span",{className:"error-text",children:a.location})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Delivery Address"}),e.jsx("textarea",{name:"address",rows:"3",value:r.address,onChange:l,placeholder:"Street name, house number, apartment details...",className:a.address?"error":""}),a.address&&e.jsx("span",{className:"error-text",children:a.address})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Order Notes (Optional)"}),e.jsx("textarea",{name:"notes",placeholder:"Extra spicy, no onions, etc.",value:r.notes,onChange:l})]}),e.jsx("div",{className:"total-display",children:e.jsxs("div",{className:"total-details",children:[e.jsxs("div",{className:"summary-row",children:[e.jsx("span",{children:"Items Subtotal"}),e.jsxs("span",{children:["₦",p.toLocaleString()]})]}),r.deliveryFee>0&&e.jsxs("div",{className:"summary-row",children:[e.jsx("span",{children:"Delivery Fee"}),e.jsxs("span",{children:["₦",r.deliveryFee.toLocaleString()]})]}),n>0&&e.jsxs("div",{className:"summary-row",children:[e.jsx("span",{children:"Packaging Fee"}),e.jsxs("span",{children:["₦",n.toLocaleString()]})]}),e.jsxs("div",{className:"final-total",children:[e.jsx("span",{className:"label",children:"Total Amount"}),e.jsxs("span",{className:"value",children:["₦",(p+(r.deliveryFee||0)+n).toLocaleString()]})]})]})}),e.jsx("button",{type:"submit",className:"proceed-btn",children:"Proceed to Checkout"})]})]})]}),e.jsx("style",{children:`
        .cart-page {
          padding: 60px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .cart-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 60px;
          align-items: start;
        }
        h2 { font-family: var(--font-display); font-size: 28px; margin-bottom: 32px; color: var(--white); }
        
        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }
        .cart-item {
          display: grid;
          grid-template-columns: auto 1fr auto auto auto;
          align-items: center;
          gap: 24px;
          background: var(--bg-card);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .item-thumb {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: #222;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .item-details h4 { font-size: 16px; color: var(--white); margin-bottom: 4px; }
        .item-details p { color: var(--text-muted); font-size: 14px; }
        
        .item-qty-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #000;
          padding: 6px 12px;
          border-radius: 20px;
        }
        .item-qty-controls button {
          background: none; border: none; color: var(--white); cursor: pointer; font-size: 18px;
        }
        .item-qty-controls span { min-width: 20px; text-align: center; font-weight: 600; }
        
        .item-subtotal { font-weight: 700; color: var(--white); width: 100px; text-align: right; }
        .remove-btn { background: none; border: none; color: #ff4444; font-size: 24px; cursor: pointer; padding: 0 10px; }
        
        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 20px;
          font-weight: 700;
          color: var(--white);
        }

        .customer-details-section {
          background: var(--bg-card);
          padding: 40px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .form-group { margin-bottom: 24px; }
        .form-group label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: var(--text-muted); }
        .form-group input, .form-group textarea {
          width: 100%; background: #000; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          padding: 14px; color: white; font-family: inherit; font-size: 15px; outline: none; transition: border-color 0.3s;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: var(--primary); }
        .form-group input.error, .form-group textarea.error { border-color: #ff4444; }
        .error-text { color: #ff4444; font-size: 12px; margin-top: 4px; display: block; }
        
        .total-display {
          margin-top: 40px; padding: 24px 0; border-top: 1px solid rgba(255,255,255,0.1);
        }
        .total-details { display: flex; flex-direction: column; gap: 12px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); }
        .final-total { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1); }
        .final-total .label { font-weight: 700; color: var(--white); font-size: 18px; }
        .final-total .value { font-size: 28px; font-weight: 800; color: var(--primary); }
        
        .proceed-btn {
          width: 100%; background: var(--primary); color: white; padding: 18px; border: none; border-radius: 12px;
          font-size: 18px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.3s;
        }
        .proceed-btn:hover { background: var(--primary-hover); }

        @media (max-width: 900px) {
          .cart-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .cart-page { padding: 40px 16px; }
          .cart-grid { gap: 40px; }
          h2 { font-size: 24px; margin-bottom: 24px; }
          .cart-item {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 16px;
            position: relative;
          }
          .item-thumb { flex-shrink: 0; width: 50px; height: 50px; }
          .item-details { flex: 1; min-width: 120px; }
          .item-details h4 { font-size: 14px; }
          .item-details p { font-size: 13px; }
          .item-qty-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #000;
            padding: 4px 10px;
            border-radius: 16px;
          }
          .item-qty-controls button { font-size: 16px; }
          .item-qty-controls span { min-width: 16px; font-size: 14px; }
          .item-subtotal { 
            font-weight: 700; 
            color: var(--primary); 
            font-size: 15px;
          }
          .remove-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 0;
            font-size: 20px;
          }
          .customer-details-section { padding: 24px; }
          .final-total .value { font-size: 24px; }
        }
      `})]})}export{D as default};
