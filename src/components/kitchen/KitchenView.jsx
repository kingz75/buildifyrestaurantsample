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
    // Get current orders state
    const all = orders;
    const order = all.find((o) => o.id === id);
    const oldStatus = order?.status;

    // Check if order is being edited by customer
    const lock = getOrderLock(id);
    if (lock && lock.userType === "customer") {
      alert("Cannot update: Customer is currently editing this order");
      return;
    }

    const i = ORDER_STATUSES.indexOf(order.status);
    const newStatus =
      ORDER_STATUSES[Math.min(i + 1, ORDER_STATUSES.length - 1)];

    // Update in Firebase
    await updateOrder(id, { status: newStatus });

    // Save notification for status change
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

  return (
    <div
      style={{
        fontFamily: "'DM Mono', 'Courier New', monospace",
        background: "#0a0a0a",
        minHeight: "100vh",
        color: "#e0e0e0",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          borderBottom: "2px solid #333",
          paddingBottom: "16px",
        }}
      >
        <div>
          <div
            style={{ fontSize: "24px", fontWeight: "700", color: "#ff9500" }}
          >
            🔥 Kitchen Display
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
            Live Orders • Auto-refreshes
          </div>
        </div>
        <div
          style={{
            background: "#ff950022",
            border: "1px solid #ff9500",
            color: "#ff9500",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        >
          {orders.length} Active Orders
        </div>
      </div>
      {orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "#444",
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
                background: "#111",
                border: `2px solid ${STATUS_COLORS[order.status]}`,
                borderRadius: "12px",
                padding: "16px",
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
                  color: "#666",
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
                  <span style={{ color: "#e0e0e0" }}>{item.name}</span>
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
                    color: "#ffbb66",
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
