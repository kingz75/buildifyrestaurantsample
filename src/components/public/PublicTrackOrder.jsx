import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { subscribeToOrderById, fmt, timeAgo } from "../../utils/storage";
import { STATUS_COLORS } from "../../data/constants";

export default function PublicTrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    console.log("useEffect - URL id:", id);
    if (id) {
      trackOrder(id);
    }
  }, [searchParams]);

  const trackOrder = (id) => {
    setLoading(true);
    setError("");

    const unsub = subscribeToOrderById(id.trim(), (data) => {
      console.log("Tracking order ID:", id, "Result:", data);
      setLoading(false);
      if (data) {
        setOrder(data);
      } else {
        setOrder(null);
        setError("Order not found. Please check your ID and try again.");
      }
    });

    return unsub;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setSearchParams({ id: orderId.trim() });
  };

  return (
    <div className="track-page">
      <div className="track-container">
        <h1>Track Your Order</h1>
        <p className="subtitle">
          Enter your Order ID to see the real-time status of your meal.
        </p>

        <form onSubmit={handleSearch} className="search-form">
          <input
            placeholder="e.g. k7m2n4"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {error && <div className="error-box">{error}</div>}

        {order && (
          <div className="order-status-card">
            <div className="header">
              <div className="id-group">
                <span className="label">Order ID</span>
                <span className="value">#{order.id}</span>
              </div>
              <div
                className="status-badge"
                style={{
                  background: STATUS_COLORS[order.status] + "22",
                  color: STATUS_COLORS[order.status],
                  border: `1px solid ${STATUS_COLORS[order.status]}`,
                }}
              >
                {order.status}
              </div>
            </div>

            <div className="status-timeline">
              <div
                className={`step ${["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered", "Completed"].includes(order.status) ? "active" : ""}`}
              >
                <div className="dot"></div>
                <div className="label">Received</div>
              </div>
              <div
                className={`step ${["Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered", "Completed"].includes(order.status) ? "active" : ""}`}
              >
                <div className="dot"></div>
                <div className="label">Preparing</div>
              </div>
              <div
                className={`step ${["Out for Delivery", "Delivered", "Completed"].includes(order.status) ? "active" : ""}`}
              >
                <div className="dot"></div>
                <div className="label">Out for Delivery</div>
              </div>
              <div
                className={`step ${["Delivered", "Completed"].includes(order.status) ? "active" : ""}`}
              >
                <div className="dot"></div>
                <div className="label">Delivered</div>
              </div>
            </div>

            <div className="order-meta">
              <div className="meta-item">
                <span className="icon">🕒</span>
                <div className="text">
                  <span className="lbl">Placed At</span>
                  <span className="val">
                    {new Date(order.timestamp).toLocaleString()} (
                    {timeAgo(order.timestamp)})
                  </span>
                </div>
              </div>
              <div className="meta-item">
                <span className="icon">💳</span>
                <div className="text">
                  <span className="lbl">Payment Status</span>
                  <span className="val">{order.paymentStatus}</span>
                </div>
              </div>
            </div>

            <div className="items-list">
              <h3>Order Items</h3>
              {order.items.map((item, idx) => (
                <div key={idx} className="item-row">
                  <span>
                    {item.qty}x {item.name}
                  </span>
                  <span>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="total-row">
                <span>Subtotal</span>
                <span>{fmt(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="total-row">
                  <span>Delivery Fee</span>
                  <span>{fmt(order.deliveryFee)}</span>
                </div>
              )}
              <div className="total-row grand">
                <span>Total</span>
                <span>{fmt(order.total)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="track-footer">
          <Link to="/menu">Back to Menu</Link>
          <span className="sep">•</span>
          <Link to="/">Home</Link>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
}
