import{r as s,u as w,j as e,L as k}from"./index-Dm63Vh2V.js";import{s as N,a as C}from"./storage-B6aPNTTM.js";function L(){const[o,x]=s.useState([]),[l,g]=s.useState([]),[c,u]=s.useState("All"),[d,h]=s.useState(""),{addToCart:f,cart:n,cartTotal:b}=w(),[y,v]=s.useState(!0);s.useEffect(()=>{const a=N(r=>{x(r),v(!1)}),t=C(r=>{g(r)});return()=>{a(),t()}},[]);const j=s.useMemo(()=>{const a=Array.from(new Set(o.map(r=>r.category).filter(Boolean))),t=Array.from(new Set([...l,...a]));return t.includes("All")?t:["All",...t]},[o,l]),m=o.filter(a=>{var i;const t=c==="All"||a.category===c,r=a.name.toLowerCase().includes(d.toLowerCase())||((i=a.desc)==null?void 0:i.toLowerCase().includes(d.toLowerCase()));return a.available&&t&&r}),p=a=>{const t=n.find(r=>r.id===a);return t?t.qty:0};return e.jsxs("div",{className:"menu-page",children:[e.jsxs("header",{className:"menu-header",children:[e.jsx("h1",{children:"Our Menu"}),e.jsx("p",{children:"Explore our curated selection of fine dishes"}),e.jsx("div",{className:"search-bar",children:e.jsx("input",{type:"text",placeholder:"Search for dishes...",value:d,onChange:a=>h(a.target.value)})})]}),e.jsxs("div",{className:"menu-container",children:[e.jsxs("aside",{className:"menu-sidebar",children:[e.jsx("h3",{children:"Categories"}),e.jsx("div",{className:"category-list",children:j.map(a=>e.jsx("button",{className:`category-btn ${c===a?"active":""}`,onClick:()=>u(a),children:a},a))})]}),e.jsx("main",{className:"menu-main",children:y?e.jsx("div",{className:"menu-loading",children:"Loading delicious items..."}):m.length>0?e.jsx("div",{className:"items-grid",children:m.map(a=>{var t,r;return e.jsxs("div",{className:"menu-item-card",children:[e.jsx("div",{className:"item-image",children:a.image&&(a.image.startsWith("http")||a.image.startsWith("data:"))?e.jsx("img",{src:a.image,alt:a.name}):e.jsx("div",{className:"emoji-placeholder",children:a.image||"🍴"})}),e.jsxs("div",{className:"item-info",children:[e.jsxs("div",{className:"item-top",children:[e.jsx("h4",{children:a.name}),e.jsxs("span",{className:"item-price",children:["₦",(t=a.price)==null?void 0:t.toLocaleString()]})]}),e.jsx("p",{className:"item-desc",children:a.desc}),e.jsxs("div",{className:"item-bottom",children:[e.jsx("div",{className:"item-tags",children:(r=a.tags)==null?void 0:r.map(i=>e.jsx("span",{className:"tag",children:i},i))}),e.jsxs("div",{className:"item-actions",children:[p(a.id)>0&&e.jsxs("span",{className:"qty-badge",children:[p(a.id)," in cart"]}),e.jsx("button",{className:"add-to-cart-btn",onClick:()=>f(a),children:"Add to Cart"})]})]})]})]},a.id)})}):e.jsxs("div",{className:"no-items",children:[e.jsx("h3",{children:"No items found"}),e.jsx("p",{children:"Try adjusting your search or category filter."})]})})]}),n.length>0&&e.jsxs(k,{to:"/cart",className:"sticky-cart-bar",children:[e.jsxs("div",{className:"sticky-cart-info",children:[e.jsxs("span",{className:"sticky-cart-count",children:[n.reduce((a,t)=>a+t.qty,0)," items"]}),e.jsxs("span",{className:"sticky-cart-total",children:["₦",b.toLocaleString()]})]}),e.jsx("span",{className:"sticky-cart-action",children:"View Cart →"})]}),e.jsx("style",{children:`
        .menu-page {
          padding: 60px 24px;
          max-width: 1400px;
          margin: 0 auto;
          padding-bottom: ${n.length>0?"100px":"60px"};
        }
        .menu-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .menu-header h1 {
          font-family: var(--font-display);
          font-size: 48px;
          margin-bottom: 12px;
          color: var(--white);
        }
        .menu-header p {
          color: var(--text-muted);
          font-size: 18px;
          margin-bottom: 32px;
        }
        .search-bar {
          max-width: 600px;
          margin: 0 auto;
        }
        .search-bar input {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 16px 24px;
          border-radius: 30px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s;
        }
        .search-bar input:focus {
          border-color: var(--primary);
        }

        .menu-container {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 40px;
        }
        
        .menu-sidebar h3 {
          font-family: var(--font-display);
          font-size: 20px;
          margin-bottom: 24px;
          color: var(--white);
        }
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .category-btn {
          text-align: left;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.2s;
        }
        .category-btn:hover {
          background: rgba(255,255,255,0.05);
          color: var(--white);
        }
        .category-btn.active {
          background: var(--primary);
          color: white;
          font-weight: 600;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .menu-item-card {
          background: var(--bg-card);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
        }
        .item-image {
          height: 200px;
          background: #222;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-info {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .item-top h4 {
          font-size: 18px;
          color: var(--white);
        }
        .item-price {
          color: var(--primary);
          font-weight: 700;
        }
        .item-desc {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
        }
        .item-bottom {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .item-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag {
          font-size: 10px;
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          padding: 4px 10px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .qty-badge {
          font-size: 12px;
          color: var(--primary);
          font-weight: 600;
        }
        .add-to-cart-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s;
        }
        .add-to-cart-btn:hover {
          background: var(--primary-hover);
        }

        .menu-loading, .no-items {
          text-align: center;
          padding: 80px 0;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .menu-container {
            grid-template-columns: 1fr;
          }
          .menu-sidebar {
            display: none;
          }
        }

        /* Sticky Cart Bar — CustomerApp style */
        .sticky-cart-bar {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 520px;
          background: var(--primary, #c17f2a);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 999;
          text-decoration: none;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
          animation: slideUpCart 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 16px 16px 0 0;
        }
        @keyframes slideUpCart {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        .sticky-cart-info {
          color: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sticky-cart-count {
          font-weight: 700;
          font-size: 15px;
        }
        .sticky-cart-total {
          opacity: 0.9;
          font-size: 15px;
        }
        .sticky-cart-action {
          background: #fff;
          color: var(--primary, #c17f2a);
          border: none;
          padding: 10px 22px;
          border-radius: 24px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .sticky-cart-bar:hover .sticky-cart-action {
          transform: scale(1.04);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }

        @media (max-width: 520px) {
          .sticky-cart-bar {
            max-width: 100%;
            border-radius: 0;
          }
        }
      `})]})}export{L as default};
