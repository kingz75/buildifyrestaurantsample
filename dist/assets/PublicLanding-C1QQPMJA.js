import{r as a,u as c,j as e,L as s}from"./index-Dm63Vh2V.js";import{s as l}from"./storage-B6aPNTTM.js";function x(){const[t,n]=a.useState([]),{addToCart:o}=c();return a.useEffect(()=>{const i=l(r=>{n(r.filter(d=>d.available).slice(0,4))});return()=>i()},[]),e.jsxs("div",{className:"landing-page",children:[e.jsxs("section",{className:"hero-section",children:[e.jsxs("div",{className:"hero-content",children:[e.jsx("h1",{children:"Order Food From Anywhere"}),e.jsx("p",{children:"Experience the finest culinary delights from Grand Table, now available for delivery and pickup. Freshly prepared, legendarily delicious."}),e.jsxs(s,{to:"/menu",className:"cta-button",children:["Order Now ",e.jsx("span",{children:"→"})]})]}),e.jsx("div",{className:"hero-overlay"})]}),e.jsxs("section",{className:"preview-section",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h2",{children:"Chef's Favorites"}),e.jsx("p",{children:"A taste of what we have to offer"})]}),e.jsx("div",{className:"preview-grid",children:t.map(i=>{var r;return e.jsxs("div",{className:"preview-card",children:[e.jsx("div",{className:"card-image",children:i.image&&(i.image.startsWith("http")||i.image.startsWith("data:"))?e.jsx("img",{src:i.image,alt:i.name}):e.jsx("div",{className:"emoji-placeholder",children:i.image||"🍴"})}),e.jsxs("div",{className:"card-info",children:[e.jsx("h3",{children:i.name}),e.jsxs("p",{className:"price",children:["₦",(r=i.price)==null?void 0:r.toLocaleString()]}),e.jsx("button",{className:"add-btn",onClick:()=>o(i),children:"Add to Cart +"})]})]},i.id)})}),e.jsx("div",{style:{textAlign:"center",marginTop:"40px"},children:e.jsx(s,{to:"/menu",className:"view-all-link",children:"View Full Menu"})})]}),e.jsxs("section",{className:"how-it-works",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h2",{children:"How It Works"}),e.jsx("p",{children:"Simple steps to your delicious meal"})]}),e.jsxs("div",{className:"steps-container",children:[e.jsxs("div",{className:"step-card",children:[e.jsx("div",{className:"step-icon",children:"🍕"}),e.jsx("h3",{children:"Choose Food"}),e.jsx("p",{children:"Browse our extensive menu of gourmet dishes and select your favorites."})]}),e.jsxs("div",{className:"step-card",children:[e.jsx("div",{className:"step-icon",children:"🛒"}),e.jsx("h3",{children:"Add to Cart"}),e.jsx("p",{children:"Review your selection and add items to your shopping cart."})]}),e.jsxs("div",{className:"step-card",children:[e.jsx("div",{className:"step-icon",children:"📝"}),e.jsx("h3",{children:"Enter Details"}),e.jsx("p",{children:"Provide your delivery address and contact information for the order."})]}),e.jsxs("div",{className:"step-card",children:[e.jsx("div",{className:"step-icon",children:"💳"}),e.jsx("h3",{children:"Make Payment"}),e.jsx("p",{children:"Complete your order with our secure payment system and wait for delivery."})]})]})]}),e.jsxs("section",{className:"testimonials",children:[e.jsx("div",{className:"section-header",children:e.jsx("h2",{children:"What Our Guests Say"})}),e.jsxs("div",{className:"testimonials-grid",children:[e.jsxs("div",{className:"testimonial-card",children:[e.jsx("p",{children:'"The best dining experience in town, now in my living room. The Jollof Rice is out of this world!"'}),e.jsx("h4",{children:"— Sarah J."}),e.jsx("div",{className:"stars",children:"★★★★★"})]}),e.jsxs("div",{className:"testimonial-card",children:[e.jsx("p",{children:'"Fast delivery and the food arrived hot. The packaging is premium and the taste is even better."'}),e.jsx("h4",{children:"— Michael O."}),e.jsx("div",{className:"stars",children:"★★★★★"})]}),e.jsxs("div",{className:"testimonial-card",children:[e.jsx("p",{children:'"Grand Table never disappoints. The online ordering process is so smooth and intuitive."'}),e.jsx("h4",{children:"— Blessing A."}),e.jsx("div",{className:"stars",children:"★★★★★"})]})]})]}),e.jsx("style",{children:`
        .hero-section {
          height: 80vh;
          background: url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: white;
          text-align: center;
          padding: 0 24px;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }
        .hero-content h1 {
          font-family: var(--font-display);
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 700;
          margin-bottom: 24px;
          line-height: 1.1;
        }
        .hero-content p {
          font-size: clamp(16px, 2vw, 20px);
          color: rgba(255,255,255,0.9);
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--primary);
          color: white;
          padding: 18px 36px;
          border-radius: 40px;
          font-size: 18px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.3s, background 0.3s;
        }
        .cta-button:hover {
          background: var(--primary-hover);
          transform: translateY(-5px);
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-header h2 {
          font-family: var(--font-display);
          font-size: 36px;
          color: var(--white);
          margin-bottom: 12px;
        }
        .section-header p {
          color: var(--text-muted);
        }
        
        .preview-section {
          padding: 100px 24px;
          background: #0d0d0d;
        }
        .preview-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
        }
        .preview-card {
          background: var(--bg-card);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
          transition: transform 0.3s;
        }
        .preview-card:hover {
          transform: translateY(-10px);
        }
        .card-image {
          height: 240px;
          background: #222;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .emoji-placeholder {
          font-size: 64px;
        }
        .card-info {
          padding: 24px;
        }
        .card-info h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: var(--white);
        }
        .card-info .price {
          color: var(--primary);
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 20px;
        }
        .add-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--primary);
          color: var(--primary);
          padding: 12px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-btn:hover {
          background: var(--primary);
          color: white;
        }
        
        .view-all-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          border-bottom: 1px solid var(--primary);
        }
        
        .how-it-works {
          padding: 100px 24px;
          background: #080808;
        }
        .steps-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }
        .step-card {
          text-align: center;
        }
        .step-icon {
          font-size: 48px;
          margin-bottom: 24px;
          background: rgba(193, 127, 42, 0.1);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .step-card h3 {
          margin-bottom: 16px;
          color: var(--white);
        }
        .step-card p {
          color: var(--text-muted);
          line-height: 1.6;
        }
        
        .testimonials {
          padding: 100px 24px;
          background: #0d0d0d;
        }
        .testimonials-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }
        .testimonial-card {
          background: rgba(255,255,255,0.03);
          padding: 40px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .testimonial-card p {
          font-style: italic;
          line-height: 1.8;
          color: var(--text-main);
          margin-bottom: 24px;
        }
        .testimonial-card h4 {
          color: var(--primary);
          margin-bottom: 8px;
        }
        .stars {
          color: #ffcc00;
          letter-spacing: 2px;
        }
      `})]})}export{x as default};
