import { useState, useEffect } from "react";
import { ORDER_STATUSES, STATUS_COLORS } from "../../data/constants";
import {
  getOrders,
  timeAgo,
  saveNotification,
  getOrderLock,
  subscribeToOrders,
  updateOrder,
} from "../../utils/storage";

export default function KitchenView() {
  const [orders, setOrders] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const activeStatuses = ["Confirmed", "Preparing"];

  useEffect(() => {
    const unsub = subscribeToOrders((allOrders) => {
      setOrders(
        allOrders.filter((o) => activeStatuses.includes(o.status) && o.items),
      );
    });
    return () => unsub();
  }, []);

  const advance = async (id) => {
    const all = orders;
    const order = all.find((o) => o.id === id);
    const oldStatus = order?.status;

    const lock = getOrderLock(id);
    if (lock && lock.userType === "customer") {
      alert("Cannot update: Customer is currently editing this order");
      return;
    }

    const i = ORDER_STATUSES.indexOf(order.status);
    const newStatus =
      ORDER_STATUSES[Math.min(i + 1, ORDER_STATUSES.length - 1)];

    await updateOrder(id, { status: newStatus });

    if (oldStatus !== newStatus) {
      saveNotification({
        type: "kitchen_status",
        title: "Kitchen Update",
        message: `Table ${order.table}: ${oldStatus} → ${newStatus}`,
        table: order.table,
        orderId: id,
      });
    }
  };

  const bg = darkMode ? "#0d0d0d" : "#f3f4f6";
  const surface = darkMode ? "#1a1a1a" : "#ffffff";
  const text = darkMode ? "#f5f0e8" : "#1a1a1a";
  const muted = darkMode ? "#888888" : "#666666";
  const border = darkMode ? "#333" : "#e2e8f0";

  return (
    <div
      style={{
        fontFamily: "'DM Mono', 'Courier New', monospace",
        background: bg,
        minHeight: "100vh",
        color: text,
        padding: "20px",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          borderBottom: `2px solid ${border}`,
          paddingBottom: "16px",
        }}
      >
        <div>
          <div
            style={{ fontSize: "24px", fontWeight: "700", color: "#ff9500" }}
          >
            🔥 Kitchen Display
          </div>
          <div style={{ fontSize: "12px", color: muted, marginTop: "2px" }}>
            Live Orders • Auto-refreshes
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: surface,
              border: `1px solid ${border}`,
              color: text,
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <div
            style={{
              background: "#ff950022",
              border: "1px solid #ff9500",
              color: "#ff9500",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            {orders.length} Active Orders
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: muted,
            fontSize: "18px",
          }}
        >
          No active orders in kitchen
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: surface,
                border: `2px solid ${STATUS_COLORS[order.status]}`,
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#ff9500",
                  }}
                >
                  Table #{order.table}
                </div>
                <div
                  style={{
                    background: STATUS_COLORS[order.status] + "33",
                    color: STATUS_COLORS[order.status],
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {order.status}
                </div>
              </div>
              <div
                style={{
                  color: muted,
                  fontSize: "11px",
                  marginBottom: "10px",
                }}
              >
                {timeAgo(order.timestamp)}
              </div>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "6px",
                    fontSize: "14px",
                  }}
                >
                  <span
                    style={{
                      color: "#ff9500",
                      fontWeight: "700",
                      minWidth: "24px",
                    }}
                  >
                    ×{item.qty}
                  </span>
                  <span style={{ color: text }}>{item.name}</span>
                </div>
              ))}
              {order.specialInstructions && (
                <div
                  style={{
                    marginTop: "10px",
                    background: "#ff950011",
                    border: "1px solid #ff950033",
                    borderRadius: "6px",
                    padding: "8px",
                    fontSize: "12px",
                    color: darkMode ? "#ffbb66" : "#af6600",
                  }}
                >
                  📝 {order.specialInstructions}
                </div>
              )}
              <button
                onClick={() => advance(order.id)}
                style={{
                  width: "100%",
                  marginTop: "14px",
                  background: STATUS_COLORS[order.status],
                  border: "none",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontFamily: "inherit",
                }}
              >
                Mark as{" "}
                {
                  ORDER_STATUSES[
                  Math.min(
                    ORDER_STATUSES.indexOf(order.status) + 1,
                    ORDER_STATUSES.length - 1,
                  )
                  ]
                }{" "}
                →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

