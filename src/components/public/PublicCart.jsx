import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { subscribeToOnlineCharges } from "../../utils/storage";

export default function PublicCart() {
  const { cart, cartTotal, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [packagingFee, setPackagingFee] = useState(0);
  const [chargesLoaded, setChargesLoaded] = useState(false);

  useEffect(() => {
    const unsub = subscribeToOnlineCharges((charges) => {
      setDeliveryLocations(charges.deliveryLocations || []);
      setPackagingFee(charges.packagingFee || 0);
      setChargesLoaded(true);
    });
    return () => unsub();
  }, []);
  
  const [customer, setCustomer] = useState(() => {
    const saved = sessionStorage.getItem("gt_checkout_customer");
    return saved ? JSON.parse(saved) : { 
      name: "", 
      phone: "", 
      address: "", 
      notes: "",
      location: "",
      deliveryFee: 0,
      packagingFee: 0
    };
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Only allow numbers for phone field
      const filtered = value.replace(/\D/g, "");
      setCustomer(prev => ({ ...prev, phone: filtered }));
    } else if (name === "location") {
      const loc = deliveryLocations.find(l => l.id === value);
      setCustomer(prev => ({ 
        ...prev, 
        location: value, 
        deliveryFee: loc ? loc.fee : 0,
        packagingFee: packagingFee
      }));
    } else {
      setCustomer(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!customer.name.trim()) newErrors.name = "Full name is required";
    if (!customer.phone.trim()) newErrors.phone = "Phone number is required";
    if (!customer.location) newErrors.location = "Please select a delivery location";
    if (!customer.address.trim()) newErrors.address = "Delivery address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = (e) => {
    e.preventDefault();
    if (validate()) {
      const customerWithFees = { ...customer, packagingFee: packagingFee };
      sessionStorage.setItem("gt_checkout_customer", JSON.stringify(customerWithFees));
      navigate("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart-view">
        <div className="empty-content">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Go to our menu and add some delicious items to get started!</p>
          <Link to="/menu" className="browse-btn">
            Browse Menu
          </Link>
        </div>
        <style>{`
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-grid">
        <section className="cart-items-section">
          <h2>Your Selection</h2>
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-thumb">
                  {item.image &&
                  (item.image.startsWith("http") ||
                    item.image.startsWith("data:")) ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>{item.image || "🍴"}</span>
                  )}
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>₦{item.price.toLocaleString()}</p>
                </div>
                <div className="item-qty-controls">
                  <button onClick={() => updateQty(item.id, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)}>+</button>
                </div>
                <div className="item-subtotal">
                  ₦{(item.price * item.qty).toLocaleString()}
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>₦{cartTotal.toLocaleString()}</span>
          </div>
        </section>

        <section className="customer-details-section">
          <h2>Delivery Details</h2>
          <form className="details-form" onSubmit={handleProceed}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={customer.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                value={customer.phone}
                onChange={handleInputChange}
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && (
                <span className="error-text">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label>Delivery Area</label>
              <select
                name="location"
                value={customer.location}
                onChange={handleInputChange}
                className={errors.location ? "error" : ""}
                style={{
                  width: "100%",
                  background: "#000",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "14px",
                  color: "white",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  outline: "none",
                }}
              >
                <option value="">Select a location...</option>
                {deliveryLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} (+₦{loc.fee.toLocaleString()})
                  </option>
                ))}
              </select>
              {errors.location && (
                <span className="error-text">{errors.location}</span>
              )}
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                name="address"
                rows="3"
                value={customer.address}
                onChange={handleInputChange}
                placeholder="Street name, house number, apartment details..."
                className={errors.address ? "error" : ""}
              ></textarea>
              {errors.address && (
                <span className="error-text">{errors.address}</span>
              )}
            </div>

            <div className="form-group">
              <label>Order Notes (Optional)</label>
              <textarea
                name="notes"
                placeholder="Extra spicy, no onions, etc."
                value={customer.notes}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="total-display">
              <div className="total-details">
                <div className="summary-row">
                  <span>Items Subtotal</span>
                  <span>₦{cartTotal.toLocaleString()}</span>
                </div>
                {customer.deliveryFee > 0 && (
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>₦{customer.deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                {packagingFee > 0 && (
                  <div className="summary-row">
                    <span>Packaging Fee</span>
                    <span>₦{packagingFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="final-total">
                  <span className="label">Total Amount</span>
                  <span className="value">
                    ₦{(cartTotal + (customer.deliveryFee || 0) + packagingFee).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button type="submit" className="proceed-btn">
              Proceed to Checkout
            </button>
          </form>
        </section>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
}
