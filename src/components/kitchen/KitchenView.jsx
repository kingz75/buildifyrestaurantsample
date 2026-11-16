import { useEffect, useState } from "react";
import {
  ORDER_STATUSES,
  ONLINE_ORDER_STATUSES,
  STATUS_COLORS,
} from "../../data/constants";
import {
  getOrderLock,
  saveNotification,
  subscribeToOrders,
  timeAgo,
  updateOrder,
  ONLINE_DELIVERY_TABLE,
} from "../../utils/storage";
import MessageModal from "../common/MessageModal";

export default function KitchenView({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [bootDelayDone, setBootDelayDone] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);

  // Active statuses for dine-in orders
  const dineInStatuses = ["Confirmed", "Preparing"];
  // Active statuses for online delivery orders
  const onlineStatuses = ["Pending", "Preparing"];

  // Check if order is online delivery
  // Online orders: have type='delivery' OR table number is 0 (Online Delivery table)
  const isOnlineOrder = (order) => {
    return (
      order.type === "delivery" || order.table === ONLINE_DELIVERY_TABLE.number
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => setBootDelayDone(true), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setOrdersLoaded(false);
    const unsub = subscribeToOrders(
      (allOrders) => {
        // Filter orders that are in active statuses for either type
        const filtered = allOrders.filter((order) => {
          if (!order.items) return false;
          const isOnline = isOnlineOrder(order);
          const activeStatuses = isOnline ? onlineStatuses : dineInStatuses;
          return activeStatuses.includes(order.status);
        });
        setOrders(filtered);
        setOrdersLoaded(true);
      },
      { limit: 60 },
    );
    return () => unsub();
  }, []);

  // Get the appropriate status array based on order type
  const getStatusArray = (order) => {
    const isOnline = isOnlineOrder(order);
    return isOnline ? ONLINE_ORDER_STATUSES : ORDER_STATUSES;
  };

  // Get the display label for the table
  const getTableLabel = (order) => {
    const isOnline = isOnlineOrder(order);
    return isOnline ? "Online Delivery" : `Table #${order.table}`;
  };

  const advance = async (id) => {
    const order = orders.find((candidate) => candidate.id === id);
    const oldStatus = order?.status;

    const lock = getOrderLock(id);
    if (lock && lock.userType === "customer") {
      setModalMessage({
        title: "Update Blocked",
        message: "Cannot update: Customer is currently editing this order.",
      });
      return;
    }

    const statusArray = getStatusArray(order);
    const statusIndex = statusArray.indexOf(order.status);
    const newStatus =
      statusArray[Math.min(statusIndex + 1, statusArray.length - 1)];

    await updateOrder(id, { status: newStatus });

    if (oldStatus !== newStatus) {
      const tableLabel = getTableLabel(order);
      saveNotification({
        type: "kitchen_status",
        title: "Kitchen Update",
        message: `${tableLabel}: ${oldStatus} -> ${newStatus}`,
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
  const isLoading = !bootDelayDone || !ordersLoaded;

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
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{ fontSize: "24px", fontWeight: "700", color: "#ff9500" }}
          >
            Kitchen Display
          </div>
          <div style={{ fontSize: "12px", color: muted, marginTop: "2px" }}>
            {user?.role || "Staff"} | Live Orders
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              border: `1px solid ${border}`,
              color: muted,
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Sign Out
          </button>
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
            {darkMode ? "Light" : "Dark"}
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

      {isLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: muted,
            fontSize: "18px",
            border: `1px solid ${border}`,
            borderRadius: "12px",
            background: surface,
          }}
        >
          <div style={{ fontSize: "26px", marginBottom: "8px" }}>...</div>
          Loading kitchen orders...
        </div>
      ) : orders.length === 0 ? (
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
          {orders.map((order) => {
            const isOnline = isOnlineOrder(order);
            const borderColor = isOnline
              ? "#3b82f6"
              : STATUS_COLORS[order.status];
            const accentColor = isOnline ? "#3b82f6" : "#ff9500";
            return (
              <div
                key={order.id}
                style={{
                  background: surface,
                  border: `2px solid ${borderColor}`,
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  position: "relative",
                }}
              >
                {isOnline && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "#3b82f6",
                      color: "#fff",
                      padding: "2px 10px",
                      borderRadius: "10px",
                      fontSize: "10px",
                      fontWeight: "700",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ONLINE
                  </div>
                )}
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
                      color: accentColor,
                    }}
                  >
                    {isOnline
                      ? `🛵 ${order.customer?.name || "Online Delivery"}`
                      : `🍽️ ${getTableLabel(order)}`}
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
                {isOnline && order.customer?.address && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: muted,
                      marginBottom: "6px",
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                    }}
                  >
                    <span>📍</span>
                    <span>{order.customer.address}</span>
                  </div>
                )}
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
                        color: accentColor,
                        fontWeight: "700",
                        minWidth: "24px",
                      }}
                    >
                      x{item.qty}
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
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    Note: {order.specialInstructions}
                  </div>
                )}
                {isOnline && order.customer?.notes && (
                  <div
                    style={{
                      marginTop: order.specialInstructions ? "6px" : "10px",
                      background: "#3b82f611",
                      border: "1px solid #3b82f633",
                      borderRadius: "6px",
                      padding: "8px",
                      fontSize: "12px",
                      color: darkMode ? "#93c5fd" : "#2563eb",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    📝 {order.customer.notes}
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
                    getStatusArray(order)[
                      Math.min(
                        getStatusArray(order).indexOf(order.status) + 1,
                        getStatusArray(order).length - 1,
                      )
                    ]
                  }{" "}
                  {"->"}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <MessageModal
        open={Boolean(modalMessage)}
        title={modalMessage?.title}
        message={modalMessage?.message}
        onClose={() => setModalMessage(null)}
        surface={surface}
        border={border}
        text={text}
        muted={muted}
        accent="#ff9500"
      />
    </div>
  );
}
