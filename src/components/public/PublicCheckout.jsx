import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import PaymentView from "../customer/PaymentView";
import {
  addOrder,
  generateId,
  ONLINE_DELIVERY_TABLE,
  getOnlineCharges,
} from "../../utils/storage";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateCharge = (subtotal, amount, percent) =>
  toNumber(amount) + subtotal * (toNumber(percent) / 100);

export default function PublicCheckout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [paymentStep, setPaymentStep] = useState("review"); // review | paying | success
  const [orderId, setOrderId] = useState("");
  const [onlineCharges, setOnlineCharges] = useState(getOnlineCharges());

  const activeBillers = Array.isArray(onlineCharges.billers)
    ? onlineCharges.billers.filter((b) => b.active !== false)
    : [];
  const billerCharges = activeBillers.reduce((sum, biller) => {
    return sum + calculateCharge(cartTotal, biller.amount, biller.percent);
  }, 0);

  useEffect(() => {
    if (paymentStep === "success") return;
    const saved = sessionStorage.getItem("gt_checkout_customer");
    if (!saved || cart.length === 0) {
      navigate("/cart");
    } else {
      setCustomer(JSON.parse(saved));
    }
  }, [cart, navigate, paymentStep]);

  const handlePayment = () => {
    setPaymentStep("paying");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const recordOrder = async () => {
    if (isSubmitting || paymentStep === "success") return;

    setIsSubmitting(true);
    const newOrderId = generateId();

    // Ensure customer and cart are present
    if (!customer || cart.length === 0) {
      console.error("Order Record Aborted: Missing customer or cart data.");
      setIsSubmitting(false);
      return;
    }

    const order = {
      id: newOrderId,
      type: "delivery",
      table: ONLINE_DELIVERY_TABLE.number,
      accessCode: ONLINE_DELIVERY_TABLE.accessCode,
      customer: customer,
      items: cart,
      subtotal: cartTotal,
      deliveryFee: customer.deliveryFee || 0,
      packagingFee: customer.packagingFee || 0,
      billerCharges: billerCharges,
      billers: activeBillers.map((b) => ({
        id: b.id,
        name: b.name,
        amount: b.amount,
        percent: b.percent,
        value: calculateCharge(cartTotal, b.amount, b.percent),
      })),
      total:
        cartTotal +
        (customer.deliveryFee || 0) +
        (customer.packagingFee || 0) +
        billerCharges,
      status: "Pending",
      paymentStatus: "Paid",
      paymentMethod: "Online",
      timestamp: Date.now(),
    };

    try {
      await addOrder(order);
      setOrderId(newOrderId);
      setPaymentStep("success");
      clearCart();
      sessionStorage.removeItem("gt_checkout_customer");
      console.log("Order saved successfully:", newOrderId);

      // Auto-download order ID as a text file
      const orderIdBlob = new Blob(
        [
          `Your Order ID: ${newOrderId}\n\nUse this ID to track your order at: ${window.location.origin}/track?id=${newOrderId}`,
        ],
        { type: "text/plain" },
      );
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(orderIdBlob);
      downloadLink.download = `order-id-${newOrderId}.txt`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Order Record Failed:", error);
      alert(
        `Something went wrong saving your order. Error: ${error.message || "Unknown error"}`,
      );
      setPaymentStep("review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!customer) return null;

  if (paymentStep === "success") {
    return (
      <div className="checkout-success">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h1>Order Placed!</h1>
          <p>
            Thank you for your order, <strong>{customer.name}</strong>!
          </p>
          <div className="order-number">
            <span>Order ID:</span>
            <code>{orderId}</code>
          </div>
          <p className="delivery-wait">
            Our kitchen is preparing your food. We'll notify you when it's out
            for delivery.
          </p>
          <div className="action-btns">
            <Link to={`/track?id=${orderId}`} className="track-btn">
              Track Order
            </Link>
            <Link to="/" className="home-btn">
              Back to Home
            </Link>
          </div>
        </div>
        <style>{`
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
        `}</style>
      </div>
    );
  }

  if (paymentStep === "paying") {
    return (
      <PaymentView
        total={
          cartTotal + (customer.deliveryFee || 0) + (customer.packagingFee || 0) + billerCharges
        }
        table="Online"
        onSuccess={recordOrder}
        onCancel={() => setPaymentStep("review")}
        orderItems={cart}
        orderId={orderId}
      />
    );
  }

  if (paymentStep === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "40px",
          textAlign: "center",
          background: "var(--bg-main)",
          color: "var(--white)",
        }}
      >
        <div style={{ fontSize: "80px", marginBottom: "24px" }}>🎉</div>
        <h1 style={{ fontSize: "42px", marginBottom: "16px" }}>
          Order Placed!
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "var(--text-muted)",
            marginBottom: "40px",
          }}
        >
          Thank you for your order. We are preparing it now!
        </p>
        <div
          style={{
            background: "var(--bg-card)",
            padding: "24px",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.05)",
            marginBottom: "32px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            Order ID
          </div>
          <div
            style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "1px" }}
          >
            #{orderId}
          </div>
        </div>
        <button
          onClick={() => (window.location.href = `/track?id=${orderId}`)}
          style={{
            background: "var(--primary)",
            color: "white",
            padding: "16px 32px",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Track My Order
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-grid">
        <section className="order-summary-section">
          <h3>Order Summary</h3>
          <div className="summary-list">
            {cart.map((item) => (
              <div key={item.id} className="summary-item">
                <span className="qty">{item.qty}x</span>
                <span className="name">{item.name}</span>
                <span className="price">
                  ₦{(item.price * item.qty).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <div className="row">
              <span>Items Total</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            {customer.deliveryFee > 0 && (
              <div className="row">
                <span>Delivery ({customer.location})</span>
                <span>₦{customer.deliveryFee.toLocaleString()}</span>
              </div>
            )}
            {customer.packagingFee > 0 && (
              <div className="row">
                <span>Packaging Fee</span>
                <span>₦{customer.packagingFee.toLocaleString()}</span>
              </div>
            )}
            {activeBillers.length > 0 && (
              activeBillers.map((b) => (
                <div key={b.id} className="row">
                  <span>{b.name}</span>
                  <span>₦{calculateCharge(cartTotal, b.amount, b.percent).toLocaleString()}</span>
                </div>
              ))
            )}
            <div className="row grand-total">
              <span>Total Amount</span>
              <span>
                ₦
                {(
                  cartTotal +
                  (customer.deliveryFee || 0) +
                  (customer.packagingFee || 0) +
                  billerCharges
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        <section className="payment-section">
          <div className="info-card">
            <h3>Delivery Details</h3>
            <p>
              <strong>{customer.name}</strong> • {customer.phone}
            </p>
            <p>{customer.address}</p>
            {customer.notes && (
              <p className="notes">
                <em>Note: {customer.notes}</em>
              </p>
            )}
          </div>

          <div className="summary-card">
            <button className="pay-btn" onClick={handlePayment}>
              Proceed to Payment
            </button>
            <p className="cancel-pay">
              <Link to="/cart">Back to Cart</Link>
            </p>
          </div>
        </section>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
}
