import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { subscribeToMenu } from "../../utils/storage";
import { useCart } from "../../context/CartContext";

export default function PublicLanding() {
  const [previewItems, setPreviewItems] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const unsub = subscribeToMenu((items) => {
      // Show first 4 available items as preview
      setPreviewItems(items.filter(i => i.available).slice(0, 4));
    });
    return () => unsub();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Order Food From Anywhere</h1>
          <p>
            Experience the finest culinary delights from Grand Table, now available for delivery and pickup. Freshly prepared, legendarily delicious.
          </p>
          <Link to="/menu" className="cta-button">
            Order Now <span>→</span>
          </Link>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Menu Preview Section */}
      <section className="preview-section">
        <div className="section-header">
          <h2>Chef's Favorites</h2>
          <p>A taste of what we have to offer</p>
        </div>
        <div className="preview-grid">
          {previewItems.map((item) => (
            <div key={item.id} className="preview-card">
              <div className="card-image">
                {item.image && (item.image.startsWith("http") || item.image.startsWith("data:")) ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="emoji-placeholder">{item.image || "🍴"}</div>
                )}
              </div>
              <div className="card-info">
                <h3>{item.name}</h3>
                <p className="price">₦{item.price?.toLocaleString()}</p>
                <button className="add-btn" onClick={() => addToCart(item)}>
                  Add to Cart +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link to="/menu" className="view-all-link">
            View Full Menu
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to your delicious meal</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon">🍕</div>
            <h3>Choose Food</h3>
            <p>Browse our extensive menu of gourmet dishes and select your favorites.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🛒</div>
            <h3>Add to Cart</h3>
            <p>Review your selection and add items to your shopping cart.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">📝</div>
            <h3>Enter Details</h3>
            <p>Provide your delivery address and contact information for the order.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">💳</div>
            <h3>Make Payment</h3>
            <p>Complete your order with our secure payment system and wait for delivery.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-header">
          <h2>What Our Guests Say</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>
              "The best dining experience in town, now in my living room. The Jollof Rice is out of this world!"
            </p>
            <h4>— Sarah J.</h4>
            <div className="stars">★★★★★</div>
          </div>
          <div className="testimonial-card">
            <p>
              "Fast delivery and the food arrived hot. The packaging is premium and the taste is even better."
            </p>
            <h4>— Michael O.</h4>
            <div className="stars">★★★★★</div>
          </div>
          <div className="testimonial-card">
            <p>
              "Grand Table never disappoints. The online ordering process is so smooth and intuitive."
            </p>
            <h4>— Blessing A.</h4>
            <div className="stars">★★★★★</div>
          </div>
        </div>
      </section>

      <style>{`
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
      `}</style>
    </div>
  );
}
