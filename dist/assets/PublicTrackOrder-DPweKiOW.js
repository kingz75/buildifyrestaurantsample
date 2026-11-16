import{c as j,r,j as e,L as u}from"./index-Dm63Vh2V.js";import{e as y,t as w,f as s}from"./storage-B6aPNTTM.js";import{S as d}from"./constants-Bw4oZQm2.js";function O(){const[i,h]=j(),[o,f]=r.useState(i.get("id")||""),[t,l]=r.useState(null),[p,c]=r.useState(!1),[x,m]=r.useState("");r.useEffect(()=>{const a=i.get("id");console.log("useEffect - URL id:",a),a&&b(a)},[i]);const b=a=>(c(!0),m(""),y(a.trim(),n=>{console.log("Tracking order ID:",a,"Result:",n),c(!1),n?l(n):(l(null),m("Order not found. Please check your ID and try again."))})),v=a=>{a.preventDefault(),o.trim()&&h({id:o.trim()})};return e.jsxs("div",{className:"track-page",children:[e.jsxs("div",{className:"track-container",children:[e.jsx("h1",{children:"Track Your Order"}),e.jsx("p",{className:"subtitle",children:"Enter your Order ID to see the real-time status of your meal."}),e.jsxs("form",{onSubmit:v,className:"search-form",children:[e.jsx("input",{placeholder:"e.g. k7m2n4",value:o,onChange:a=>f(a.target.value)}),e.jsx("button",{type:"submit",disabled:p,children:p?"Searching...":"Track Order"})]}),x&&e.jsx("div",{className:"error-box",children:x}),t&&e.jsxs("div",{className:"order-status-card",children:[e.jsxs("div",{className:"header",children:[e.jsxs("div",{className:"id-group",children:[e.jsx("span",{className:"label",children:"Order ID"}),e.jsxs("span",{className:"value",children:["#",t.id]})]}),e.jsx("div",{className:"status-badge",style:{background:d[t.status]+"22",color:d[t.status],border:`1px solid ${d[t.status]}`},children:t.status})]}),e.jsxs("div",{className:"status-timeline",children:[e.jsxs("div",{className:`step ${["Pending","Confirmed","Preparing","Ready","Out for Delivery","Delivered","Completed"].includes(t.status)?"active":""}`,children:[e.jsx("div",{className:"dot"}),e.jsx("div",{className:"label",children:"Received"})]}),e.jsxs("div",{className:`step ${["Confirmed","Preparing","Ready","Out for Delivery","Delivered","Completed"].includes(t.status)?"active":""}`,children:[e.jsx("div",{className:"dot"}),e.jsx("div",{className:"label",children:"Preparing"})]}),e.jsxs("div",{className:`step ${["Out for Delivery","Delivered","Completed"].includes(t.status)?"active":""}`,children:[e.jsx("div",{className:"dot"}),e.jsx("div",{className:"label",children:"Out for Delivery"})]}),e.jsxs("div",{className:`step ${["Delivered","Completed"].includes(t.status)?"active":""}`,children:[e.jsx("div",{className:"dot"}),e.jsx("div",{className:"label",children:"Delivered"})]})]}),e.jsxs("div",{className:"order-meta",children:[e.jsxs("div",{className:"meta-item",children:[e.jsx("span",{className:"icon",children:"🕒"}),e.jsxs("div",{className:"text",children:[e.jsx("span",{className:"lbl",children:"Placed At"}),e.jsxs("span",{className:"val",children:[new Date(t.timestamp).toLocaleString()," (",w(t.timestamp),")"]})]})]}),e.jsxs("div",{className:"meta-item",children:[e.jsx("span",{className:"icon",children:"💳"}),e.jsxs("div",{className:"text",children:[e.jsx("span",{className:"lbl",children:"Payment Status"}),e.jsx("span",{className:"val",children:t.paymentStatus})]})]})]}),e.jsxs("div",{className:"items-list",children:[e.jsx("h3",{children:"Order Items"}),t.items.map((a,g)=>e.jsxs("div",{className:"item-row",children:[e.jsxs("span",{children:[a.qty,"x ",a.name]}),e.jsx("span",{children:s(a.price*a.qty)})]},g)),e.jsxs("div",{className:"total-row",children:[e.jsx("span",{children:"Subtotal"}),e.jsx("span",{children:s(t.subtotal)})]}),t.deliveryFee>0&&e.jsxs("div",{className:"total-row",children:[e.jsx("span",{children:"Delivery Fee"}),e.jsx("span",{children:s(t.deliveryFee)})]}),e.jsxs("div",{className:"total-row grand",children:[e.jsx("span",{children:"Total"}),e.jsx("span",{children:s(t.total)})]})]})]}),e.jsxs("div",{className:"track-footer",children:[e.jsx(u,{to:"/menu",children:"Back to Menu"}),e.jsx("span",{className:"sep",children:"•"}),e.jsx(u,{to:"/",children:"Home"})]})]}),e.jsx("style",{children:`
        .track-page { padding: 40px 16px; min-height: 80vh; display: flex; justify-content: center; }
        .track-container { width: 100%; max-width: 600px; }
        h1 { font-family: var(--font-display); font-size: 28px; color: var(--white); margin-bottom: 12px; text-align: center; }
        .subtitle { color: var(--text-muted); text-align: center; margin-bottom: 24px; font-size: 14px; }
        
        .search-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .search-form input { width: 100%; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; color: white; font-family: inherit; font-size: 16px; outline: none; box-sizing: border-box; }
        .search-form button { width: 100%; background: var(--primary); color: white; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 16px; }
        
        .error-box { background: rgba(255,68,68,0.1); color: #ff4444; padding: 14px; border-radius: 12px; margin-bottom: 24px; text-align: center; font-size: 14px; }
        
        .order-status-card { background: var(--bg-card); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .header { display: flex; flex-direction: column; gap: 16px; align-items: start; margin-bottom: 24px; }
        .id-group .label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 2px; font-weight: 600; }
        .id-group .value { font-size: 18px; font-weight: 800; color: var(--white); font-family: monospace; word-break: break-all; }
        .status-badge { padding: 6px 14px; border-radius: 40px; font-size: 12px; font-weight: 700; text-transform: uppercase; align-self: flex-start; }
        
        .status-timeline { display: flex; justify-content: space-between; margin-bottom: 32px; position: relative; }
        .status-timeline::before { content: ''; position: absolute; top: 10px; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.1); z-index: 0; }
        .step { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
        .step .dot { width: 20px; height: 20px; border-radius: 50%; background: #222; border: 3px solid #111; transition: all 0.4s; }
        .step .label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-align: center; }
        .step.active .dot { background: var(--primary); border-color: var(--primary); box-shadow: 0 0 15px var(--primary); }
        .step.active .label { color: var(--white); }
        
        .order-meta { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 24px; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 16px; }
        .meta-item { display: flex; gap: 10px; align-items: center; }
        .meta-item .icon { font-size: 18px; }
        .meta-item .lbl { display: block; font-size: 10px; color: var(--text-muted); font-weight: 600; }
        .meta-item .val { font-size: 13px; color: var(--white); font-weight: 600; }
        
        .items-list h3 { font-size: 16px; margin-bottom: 12px; color: var(--white); }
        .item-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
        .total-row { display: flex; justify-content: space-between; padding-top: 8px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .total-row.grand { font-size: 18px; font-weight: 800; color: var(--primary); border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 12px; }
        
        .track-footer { margin-top: 24px; text-align: center; font-size: 13px; }
        .track-footer a { color: var(--text-muted); text-decoration: none; }
        .sep { margin: 0 8px; color: rgba(255,255,255,0.1); }

        @media (min-width: 640px) {
          .track-page { padding: 80px 24px; }
          .track-container { max-width: 600px; }
          h1 { font-size: 36px; margin-bottom: 12px; }
          .subtitle { margin-bottom: 40px; }
          .search-form { flex-direction: row; margin-bottom: 32px; }
          .search-form button { width: auto; padding: 0 24px; }
          .order-status-card { padding: 32px; border-radius: 24px; }
          .header { flex-direction: row; justify-content: space-between; align-items: start; margin-bottom: 40px; }
          .id-group .label { font-size: 12px; margin-bottom: 4px; }
          .id-group .value { font-size: 24px; }
          .status-badge { padding: 6px 16px; font-size: 13px; }
          .status-timeline { margin-bottom: 48px; }
          .status-timeline::before { top: 12px; }
          .step .dot { width: 24px; height: 24px; border-width: 4px; }
          .step .label { font-size: 11px; gap: 8px; }
          .order-meta { grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px; margin-bottom: 40px; }
          .meta-item .icon { font-size: 20px; }
          .meta-item .lbl { font-size: 11px; }
          .meta-item .val { font-size: 13px; }
          .items-list h3 { font-size: 18px; margin-bottom: 16px; }
          .item-row { font-size: 14px; margin-bottom: 10px; }
          .total-row { padding-top: 10px; margin-top: 10px; font-size: 14px; }
          .total-row.grand { font-size: 20px; padding-top: 16px; }
          .track-footer { margin-top: 32px; font-size: 14px; }
          .track-footer .sep { margin: 0 12px; }
        }
      `})]})}export{O as default};
