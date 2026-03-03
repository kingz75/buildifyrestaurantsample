import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ORDER_STATUSES, STATUS_COLORS } from "../../data/constants";
import {
  getOrders,
  getMenuItems,
  saveMenu,
  getTables,
  saveTables,
  getCategories,
  saveCategories,
  fmt,
  timeAgo,
  playNotificationSound,
  getNotifications,
  markNotificationRead,
  clearNotifications,
  saveNotification,
  getOrderLock,
  subscribeToOrders,
  subscribeToMenu,
  subscribeToTables,
  updateOrder,
} from "../../utils/storage";
import ItemForm from "./ItemForm";
import QRCodesTab from "./QRCodesTab";

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState(getMenuItems);
  const [categories, setCategories] = useState(getCategories);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("rqs_darkmode");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [tables, setTables] = useState(getTables);
  const [filterTable, setFilterTable] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPay, setFilterPay] = useState("");
  const prevOrderCount = useRef(0);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showWaiterCalls, setShowWaiterCalls] = useState(false);
  const [showReadyOrders, setShowReadyOrders] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [showAddTable, setShowAddTable] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    localStorage.setItem("rqs_darkmode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = () => setNotifications(getNotifications());
    loadNotifications();
    window.addEventListener("rqs_notification", loadNotifications);
    return () =>
      window.removeEventListener("rqs_notification", loadNotifications);
  }, []);

  useEffect(() => {
    const unsubOrders = subscribeToOrders((all) => {
      console.log(
        "AdminDashboard: Received orders update:",
        all.length,
        "orders",
      );
      if (all.length > prevOrderCount.current) {
        if (prevOrderCount.current > 0) {
          playNotificationSound();
          const newOrder = all[0];
          if (newOrder) {
            saveNotification({
              type: "new_order",
              title: "New Order",
              message: `Table ${newOrder.table} placed an order - ${fmt(newOrder.total)}`,
              table: newOrder.table,
            });
          }
        }
        prevOrderCount.current = all.length;
      }
      setOrders(all);
    });

    const unsubMenu = subscribeToMenu((items) => {
      setMenuItems(items);
    });

    const unsubTables = subscribeToTables((tables) => {
      setTables(tables);
    });

    return () => {
      unsubOrders();
      unsubMenu();
      unsubTables();
    };
  }, []);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCat = newCategoryName.trim();
      if (!categories.includes(newCat)) {
        const updated = [...categories, newCat];
        setCategories(updated);
        saveCategories(updated);
      }
      setNewCategoryName("");
      setShowAddCategory(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    const order = orders.find((o) => o.id === id);
    const oldStatus = order?.status;

    // Check if order is being edited by customer
    const lock = getOrderLock(id);
    if (lock && lock.userType === "customer") {
      alert("Cannot update: Customer is currently editing this order");
      return;
    }

    await updateOrder(id, { status });

    // Save notification for status change
    if (order && oldStatus !== status) {
      saveNotification({
        type: "status_change",
        title: "Order Status Updated",
        message: `Table ${order.table}: ${oldStatus} → ${status}`,
        table: order.table,
        orderId: id,
      });
    }
  };

  const markPaid = async (id) => {
    await updateOrder(id, { paymentStatus: "Paid" });
  };

  const realOrders = orders.filter((o) => o.items);
  const waiterCalls = orders.filter((o) => o.type === "waiter_call");
  const readyOrders = realOrders.filter((o) => o.status === "Ready");
  const filteredOrders = realOrders.filter(
    (o) =>
      (!filterTable || String(o.table) === filterTable) &&
      (!filterStatus || o.status === filterStatus) &&
      (!filterPay || o.paymentStatus === filterPay),
  );

  // Analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = realOrders.filter((o) => o.timestamp >= today.getTime());
  const todayRevenue = todayOrders.reduce(
    (s, o) => s + (o.paymentStatus === "Paid" ? o.total : 0),
    0,
  );
  const totalRevenue = realOrders.reduce(
    (s, o) => s + (o.paymentStatus === "Paid" ? o.total : 0),
    0,
  );

  const bg = darkMode ? "#0f0f12" : "#f5f5f7";
  const surface = darkMode ? "#17171f" : "#ffffff";
  const border = darkMode ? "#2a2a3a" : "#e0e0e5";
  const accent = "#7c5ccc";
  const text = darkMode ? "#e8e0f0" : "#1a1a2e";
  const muted = darkMode ? "#6a6a8a" : "#6a6a8a";

  const generateInvoice = (order) => {
    const w = window.open("", "_blank");
    w.document
      .write(`<html><body style="font-family:serif;padding:40px;max-width:500px;margin:0 auto">
      <h1 style="color:#c17f2a;border-bottom:2px solid #c17f2a;padding-bottom:8px">🍽️ Grand Table Restaurant</h1>
      <p>Invoice #${order.id.toUpperCase()} | Table #${order.table}</p>
      <p>Date: ${new Date(order.timestamp).toLocaleString()}</p>
      <hr/><table width="100%">${order.items.map((i) => `<tr><td>${i.qty}× ${i.name}</td><td align="right">₦${(i.price * i.qty).toLocaleString()}</td></tr>`).join("")}
      </table><hr/>
      <p><b>Total: ₦${order.total.toLocaleString()}</b></p>
      <p>Payment: ${order.paymentStatus}</p>
      ${order.specialInstructions ? `<p>Notes: ${order.specialInstructions}</p>` : ""}
      <script>window.print()</script></body></html>`);
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: bg,
        minHeight: "100vh",
        color: text,
      }}
    >
      {/* Sidebar + Content */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "220px",
            background: surface,
            borderRight: `1px solid ${border}`,
            padding: "24px 0",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "0 20px 20px",
              borderBottom: `1px solid ${border}`,
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: "700", color: accent }}>
              🍽️ Grand Table
            </div>
            <div style={{ fontSize: "11px", color: muted, marginTop: "4px" }}>
              {user.role} • {user.username}
            </div>
          </div>
          {[
            {
              id: "orders",
              icon: "📋",
              label: "Orders",
              badge: realOrders.filter((o) => o.status === "Pending").length,
            },
            { id: "kitchen", icon: "👨‍🍳", label: "Kitchen View" },
            { id: "menu", icon: "🍴", label: "Menu Management" },
            { id: "tables", icon: "🪑", label: "Tables" },
            { id: "analytics", icon: "📊", label: "Analytics" },
            { id: "qrcodes", icon: "📱", label: "QR Codes" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: "100%",
                background: tab === t.id ? accent + "22" : "transparent",
                color: tab === t.id ? accent : muted,
                border: "none",
                borderLeft:
                  tab === t.id
                    ? `3px solid ${accent}`
                    : "3px solid transparent",
                padding: "12px 20px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "inherit",
              }}
            >
              <span>{t.icon}</span>
              <span style={{ flex: 1 }}>{t.label}</span>
              {t.badge > 0 && (
                <span
                  style={{
                    background: "#ff4444",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
          <div style={{ marginTop: "auto", padding: "20px" }}>
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: "100%",
                background: showNotifications ? accent + "22" : "transparent",
                border: `1px solid ${border}`,
                color: text,
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "13px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>🔔 Notifications</span>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span
                  style={{
                    background: "#ff4444",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div
                style={{
                  background: surface,
                  border: `1px solid ${border}`,
                  borderRadius: "8px",
                  marginBottom: "12px",
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: muted,
                      fontSize: "12px",
                    }}
                  >
                    No notifications
                  </div>
                ) : (
                  <>
                    {notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        style={{
                          padding: "10px 12px",
                          borderBottom: `1px solid ${border}`,
                          cursor: "pointer",
                          background: n.read ? "transparent" : accent + "15",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: text,
                          }}
                        >
                          {n.title}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: muted,
                            marginTop: "2px",
                          }}
                        >
                          {n.message}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: muted,
                            marginTop: "4px",
                          }}
                        >
                          {timeAgo(n.timestamp)}
                        </div>
                      </div>
                    ))}
                    {notifications.length > 0 && (
                      <button
                        onClick={() => clearNotifications()}
                        style={{
                          width: "100%",
                          padding: "8px",
                          background: "transparent",
                          border: "none",
                          color: muted,
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Clear all
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {waiterCalls.filter(
              (w) => w.timestamp > Date.now() - 300000 && w.status !== "Served",
            ).length > 0 && (
              <div
                style={{
                  background: "#ff9500" + "22",
                  border: `1px solid ${"#ff9500"}`,
                  borderRadius: "8px",
                  padding: "10px",
                  marginBottom: "12px",
                  fontSize: "12px",
                  color: "#ff9500",
                  cursor: "pointer",
                }}
                onClick={() => setShowWaiterCalls(!showWaiterCalls)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    🔔{" "}
                    {
                      waiterCalls.filter(
                        (w) =>
                          w.timestamp > Date.now() - 300000 &&
                          w.status !== "Served",
                      ).length
                    }{" "}
                    waiter call(s)
                  </span>
                  <span>{showWaiterCalls ? "▲" : "▼"}</span>
                </div>
                {showWaiterCalls && (
                  <div
                    style={{
                      marginTop: "8px",
                      paddingTop: "8px",
                      borderTop: "1px solid #ff9500",
                    }}
                  >
                    {waiterCalls
                      .filter(
                        (w) =>
                          w.timestamp > Date.now() - 300000 &&
                          w.status !== "Served",
                      )
                      .map((w) => (
                        <div
                          key={w.id}
                          style={{
                            padding: "4px 0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Table {w.table}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrder(w.id, { status: "Served" });
                            }}
                            style={{
                              background: "#ff9500",
                              border: "none",
                              color: "#fff",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "10px",
                            }}
                          >
                            Mark Served
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Ready to Serve Orders */}
            {readyOrders.length > 0 && (
              <div
                style={{
                  background: "#22c55e" + "22",
                  border: `1px solid ${"#22c55e"}`,
                  borderRadius: "8px",
                  padding: "10px",
                  marginBottom: "12px",
                  fontSize: "12px",
                  color: "#22c55e",
                  cursor: "pointer",
                }}
                onClick={() => setShowReadyOrders(!showReadyOrders)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>🍽️ {readyOrders.length} ready to serve</span>
                  <span>{showReadyOrders ? "▲" : "▼"}</span>
                </div>
                {showReadyOrders && (
                  <div
                    style={{
                      marginTop: "8px",
                      paddingTop: "8px",
                      borderTop: "1px solid #22c55e",
                    }}
                  >
                    {readyOrders.map((o) => (
                      <div
                        key={o.id}
                        style={{
                          padding: "4px 0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Table {o.table}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrder(o.id, { status: "Served" });
                          }}
                          style={{
                            background: "#22c55e",
                            border: "none",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "10px",
                          }}
                        >
                          Served
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: "100%",
                background: darkMode ? "#ffffff10" : "#00000010",
                border: `1px solid ${border}`,
                color: text,
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "13px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                background: "transparent",
                border: `1px solid ${border}`,
                color: muted,
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "13px",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ marginLeft: "220px", flex: 1, padding: "24px" }}>
          {/* Stats Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {[
              {
                label: "Today's Orders",
                value: todayOrders.length,
                icon: "📋",
                color: "#3b82f6",
              },
              {
                label: "Today's Revenue",
                value: fmt(todayRevenue),
                icon: "💰",
                color: "#22c55e",
              },
              {
                label: "Total Revenue",
                value: fmt(totalRevenue),
                icon: "📈",
                color: "#a855f7",
              },
              {
                label: "Pending Orders",
                value: realOrders.filter((o) => o.status === "Pending").length,
                icon: "⏳",
                color: "#f59e0b",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: surface,
                  border: `1px solid ${border}`,
                  borderRadius: "12px",
                  padding: "18px",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                  {s.icon}
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: s.color,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "4px" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* ORDERS TAB */}
          {tab === "orders" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: "700" }}>
                  Orders
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <input
                    placeholder="Filter by table"
                    value={filterTable}
                    onChange={(e) => setFilterTable(e.target.value)}
                    style={{
                      background: surface,
                      border: `1px solid ${border}`,
                      color: text,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      outline: "none",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      width: "120px",
                    }}
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      background: surface,
                      border: `1px solid ${border}`,
                      color: text,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      outline: "none",
                      fontFamily: "inherit",
                      fontSize: "13px",
                    }}
                  >
                    <option value="">All Status</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={filterPay}
                    onChange={(e) => setFilterPay(e.target.value)}
                    style={{
                      background: surface,
                      border: `1px solid ${border}`,
                      color: text,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      outline: "none",
                      fontFamily: "inherit",
                      fontSize: "13px",
                    }}
                  >
                    <option value="">All Payments</option>
                    <option>Paid</option>
                    <option>Unpaid</option>
                  </select>
                </div>
              </div>
              {filteredOrders.length === 0 ? (
                <div
                  style={{ textAlign: "center", padding: "60px", color: muted }}
                >
                  No orders found
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: surface,
                        border: `1px solid ${border}`,
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "16px" }}>
                            Table #{order.table}
                          </div>
                          <div
                            style={{
                              color: muted,
                              fontSize: "12px",
                              marginTop: "2px",
                            }}
                          >
                            {new Date(order.timestamp).toLocaleString()} • #
                            {order.id}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              background: STATUS_COLORS[order.status] + "33",
                              color: STATUS_COLORS[order.status],
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {order.status}
                          </span>
                          <span
                            style={{
                              background:
                                order.paymentStatus === "Paid"
                                  ? "#22c55e22"
                                  : "#f59e0b22",
                              color:
                                order.paymentStatus === "Paid"
                                  ? "#22c55e"
                                  : "#f59e0b",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {order.paymentStatus}
                          </span>
                          <span style={{ color: accent, fontWeight: "700" }}>
                            {fmt(order.total)}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: "10px",
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        {order.items.map((i) => (
                          <span
                            key={i.id}
                            style={{
                              background: "#ffffff0a",
                              border: `1px solid ${border}`,
                              borderRadius: "6px",
                              padding: "3px 8px",
                              fontSize: "12px",
                              color: muted,
                            }}
                          >
                            {i.qty}× {i.name}
                          </span>
                        ))}
                      </div>
                      {order.specialInstructions && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "12px",
                            color: "#ff9500",
                            background: "#ff950011",
                            padding: "6px 10px",
                            borderRadius: "6px",
                          }}
                        >
                          📝 {order.specialInstructions}
                        </div>
                      )}
                      <div
                        style={{
                          marginTop: "12px",
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          style={{
                            background: bg,
                            border: `1px solid ${border}`,
                            color: text,
                            padding: "6px 10px",
                            borderRadius: "6px",
                            outline: "none",
                            fontFamily: "inherit",
                            fontSize: "12px",
                          }}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                        {order.paymentStatus === "Unpaid" && (
                          <button
                            onClick={() => markPaid(order.id)}
                            style={{
                              background: "#22c55e22",
                              border: "1px solid #22c55e",
                              color: "#22c55e",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              fontSize: "12px",
                            }}
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => generateInvoice(order)}
                          style={{
                            background: accent + "22",
                            border: `1px solid ${accent}`,
                            color: accent,
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: "12px",
                          }}
                        >
                          🧾 Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* KITCHEN TAB */}
          {tab === "kitchen" && (
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "16px",
                }}
              >
                Kitchen Overview
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "12px",
                }}
              >
                {realOrders
                  .filter((o) =>
                    ["Pending", "Confirmed", "Preparing"].includes(o.status),
                  )
                  .map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: surface,
                        border: `2px solid ${STATUS_COLORS[order.status]}`,
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "18px",
                            color: "#ff9500",
                          }}
                        >
                          Table #{order.table}
                        </div>
                        <div
                          style={{
                            background: STATUS_COLORS[order.status] + "33",
                            color: STATUS_COLORS[order.status],
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
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
                          marginBottom: "8px",
                        }}
                      >
                        {timeAgo(order.timestamp)}
                      </div>
                      {order.items.map((i) => (
                        <div
                          key={i.id}
                          style={{
                            fontSize: "13px",
                            marginBottom: "4px",
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          <span style={{ color: "#ff9500", fontWeight: "700" }}>
                            ×{i.qty}
                          </span>
                          <span>{i.name}</span>
                        </div>
                      ))}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        style={{
                          width: "100%",
                          marginTop: "10px",
                          background: bg,
                          border: `1px solid ${border}`,
                          color: text,
                          padding: "8px",
                          borderRadius: "6px",
                          outline: "none",
                          fontFamily: "inherit",
                          fontSize: "12px",
                        }}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                {realOrders.filter((o) =>
                  ["Pending", "Confirmed", "Preparing"].includes(o.status),
                ).length === 0 && (
                  <div
                    style={{
                      color: muted,
                      padding: "40px",
                      textAlign: "center",
                    }}
                  >
                    No active kitchen orders
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MENU TAB */}
          {tab === "menu" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: "700" }}>
                  Menu Management ({menuItems.length} items)
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    onClick={() => setShowAddItem(true)}
                    style={{
                      background: accent,
                      border: "none",
                      color: "#fff",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    + Add Item
                  </button>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    style={{
                      background: accent + "22",
                      border: `1px solid ${accent}`,
                      color: accent,
                      padding: "10px 18px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    + Add Category
                  </button>
                </div>
              </div>
              {showAddItem && (
                <ItemForm
                  item={null}
                  categories={categories}
                  onSave={(item) => {
                    let updated = [...menuItems, { ...item, id: Date.now() }];
                    setMenuItems(updated);
                    saveMenu(updated);
                    setShowAddItem(false);
                  }}
                  onCancel={() => {
                    setShowAddItem(false);
                  }}
                  bg={bg}
                  surface={surface}
                  border={border}
                  text={text}
                  accent={accent}
                  muted={muted}
                />
              )}
              {/* Add Category Form at Top */}
              {showAddCategory && (
                <div
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "12px",
                      color: accent,
                    }}
                  >
                    Add New Category
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddCategory()
                      }
                      autoFocus
                      style={{
                        flex: 1,
                        background: bg,
                        border: `1px solid ${border}`,
                        color: text,
                        padding: "10px 12px",
                        borderRadius: "6px",
                        outline: "none",
                        fontFamily: "inherit",
                        fontSize: "13px",
                      }}
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim()}
                      style={{
                        background: accent,
                        border: "none",
                        color: "#fff",
                        padding: "10px 16px",
                        borderRadius: "6px",
                        cursor: newCategoryName.trim()
                          ? "pointer"
                          : "not-allowed",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        opacity: newCategoryName.trim() ? 1 : 0.5,
                      }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategoryName("");
                      }}
                      style={{
                        background: "transparent",
                        border: `1px solid ${border}`,
                        color: muted,
                        padding: "10px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gap: "8px" }}>
                {categories
                  .filter((c) => c !== "All")
                  .map((cat) => {
                    const items = menuItems.filter((m) => m.category === cat);
                    if (!items.length) return null;
                    return (
                      <div key={cat}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: accent,
                            margin: "16px 0 8px",
                            borderLeft: `3px solid ${accent}`,
                            paddingLeft: "10px",
                          }}
                        >
                          {cat}
                        </div>
                        {items.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              background: surface,
                              border: `1px solid ${border}`,
                              borderRadius: "10px",
                              padding: "12px 16px",
                              marginBottom: "6px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "8px",
                              opacity: item.available ? 1 : 0.5,
                            }}
                          >
                            <div>
                              <div
                                style={{ fontWeight: "600", fontSize: "14px" }}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "24px",
                                    height: "24px",
                                    verticalAlign: "middle",
                                    marginRight: "6px",
                                    overflow: "hidden",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {item.image &&
                                  item.image.startsWith("data:") ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    item.image
                                  )}
                                </span>
                                {item.name}
                              </div>
                              <div
                                style={{
                                  color: muted,
                                  fontSize: "12px",
                                  marginTop: "2px",
                                }}
                              >
                                {fmt(item.price)} •{" "}
                                {item.tags.join(", ") || "No tags"}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => {
                                  const updated = menuItems.map((m) =>
                                    m.id === item.id
                                      ? { ...m, available: !m.available }
                                      : m,
                                  );
                                  setMenuItems(updated);
                                  saveMenu(updated);
                                }}
                                style={{
                                  background: item.available
                                    ? "#22c55e22"
                                    : "#ff444422",
                                  border: `1px solid ${item.available ? "#22c55e" : "#ff4444"}`,
                                  color: item.available ? "#22c55e" : "#ff4444",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontFamily: "inherit",
                                }}
                              >
                                {item.available ? "Active" : "Hidden"}
                              </button>
                              <button
                                onClick={() => {
                                  setEditItem(item);
                                  // Scroll to the item after a small delay to allow state update
                                  setTimeout(() => {
                                    const element = document.getElementById(
                                      `item-${item.id}`,
                                    );
                                    if (element) {
                                      element.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                    }
                                  }, 100);
                                }}
                                style={{
                                  background: accent + "22",
                                  border: `1px solid ${accent}`,
                                  color: accent,
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontFamily: "inherit",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Delete item?")) {
                                    const u = menuItems.filter(
                                      (m) => m.id !== item.id,
                                    );
                                    setMenuItems(u);
                                    saveMenu(u);
                                  }
                                }}
                                style={{
                                  background: "#ff444422",
                                  border: "1px solid #ff4444",
                                  color: "#ff4444",
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontFamily: "inherit",
                                }}
                              >
                                Del
                              </button>
                            </div>
                            {/* Inline Edit Form */}
                            {editItem && editItem.id === item.id && (
                              <div
                                id={`item-${item.id}`}
                                style={{ width: "100%", marginTop: "12px" }}
                              >
                                <ItemForm
                                  item={editItem}
                                  categories={categories}
                                  onSave={(updatedItem) => {
                                    const updated = menuItems.map((m) =>
                                      m.id === updatedItem.id ? updatedItem : m,
                                    );
                                    setMenuItems(updated);
                                    saveMenu(updated);
                                    setEditItem(null);
                                  }}
                                  onCancel={() => setEditItem(null)}
                                  bg={bg}
                                  surface={surface}
                                  border={border}
                                  text={text}
                                  accent={accent}
                                  muted={muted}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TABLES TAB */}
          {tab === "tables" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: "700" }}>
                  Table Management ({tables.length} tables)
                </div>
                <button
                  onClick={() => {
                    setEditingTable({
                      number: tables.length + 1,
                      name: `Table ${tables.length + 1}`,
                      capacity: 4,
                      active: true,
                    });
                    setShowAddTable(true);
                  }}
                  style={{
                    background: accent,
                    border: "none",
                    color: "#fff",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  + Add Table
                </button>
              </div>

              {/* Table Edit Form */}
              {(editingTable || showAddTable) && (
                <div
                  style={{
                    background: surface,
                    border: `1px solid ${accent}`,
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      marginBottom: "16px",
                    }}
                  >
                    {editingTable?.id ? "Edit Table" : "Add New Table"}
                  </div>
                  <div
                    style={{ display: "grid", gap: "12px", maxWidth: "400px" }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: muted,
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Table Number
                      </label>
                      <input
                        type="number"
                        value={editingTable?.number || ""}
                        onChange={(e) =>
                          setEditingTable({
                            ...editingTable,
                            number: parseInt(e.target.value) || 1,
                          })
                        }
                        style={{
                          width: "100%",
                          background: bg,
                          border: `1px solid ${border}`,
                          color: text,
                          padding: "10px",
                          borderRadius: "8px",
                          fontFamily: "inherit",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: muted,
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Table Name
                      </label>
                      <input
                        type="text"
                        value={editingTable?.name || ""}
                        onChange={(e) =>
                          setEditingTable({
                            ...editingTable,
                            name: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          background: bg,
                          border: `1px solid ${border}`,
                          color: text,
                          padding: "10px",
                          borderRadius: "8px",
                          fontFamily: "inherit",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: muted,
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Capacity
                      </label>
                      <input
                        type="number"
                        value={editingTable?.capacity || 4}
                        onChange={(e) =>
                          setEditingTable({
                            ...editingTable,
                            capacity: parseInt(e.target.value) || 1,
                          })
                        }
                        style={{
                          width: "100%",
                          background: bg,
                          border: `1px solid ${border}`,
                          color: text,
                          padding: "10px",
                          borderRadius: "8px",
                          fontFamily: "inherit",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", gap: "10px", marginTop: "8px" }}
                    >
                      <button
                        onClick={() => {
                          if (editingTable?.id) {
                            const updated = tables.map((t) =>
                              t.id === editingTable.id
                                ? { ...editingTable }
                                : t,
                            );
                            setTables(updated);
                            saveTables(updated);
                          } else {
                            const newTable = {
                              ...editingTable,
                              id: Date.now(),
                            };
                            const updated = [...tables, newTable];
                            setTables(updated);
                            saveTables(updated);
                          }
                          setEditingTable(null);
                          setShowAddTable(false);
                        }}
                        style={{
                          background: accent,
                          border: "none",
                          color: "#fff",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingTable(null);
                          setShowAddTable(false);
                        }}
                        style={{
                          background: "transparent",
                          border: `1px solid ${border}`,
                          color: muted,
                          padding: "10px 20px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: "13px",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "12px",
                }}
              >
                {tables
                  .filter((t) => t.active)
                  .map((table) => {
                    const tableOrders = realOrders.filter(
                      (o) =>
                        String(o.table) === String(table.number) &&
                        !["Completed", "Served"].includes(o.status),
                    );
                    const occupied = tableOrders.length > 0;
                    const waiterCall = waiterCalls.find(
                      (w) =>
                        w.table === table.number &&
                        w.timestamp > Date.now() - 300000,
                    );
                    return (
                      <div
                        key={table.id}
                        style={{
                          background: surface,
                          border: `2px solid ${occupied ? "#22c55e" : border}`,
                          borderRadius: "12px",
                          padding: "16px",
                          textAlign: "center",
                          position: "relative",
                        }}
                      >
                        {waiterCall && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "-8px",
                              background: "#ff9500",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              fontSize: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            🔔
                          </div>
                        )}
                        <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                          {occupied ? "🟢" : "⚪"}
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "16px" }}>
                          {table.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: muted,
                            marginTop: "2px",
                          }}
                        >
                          #{table.number} • {table.capacity} seats
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: occupied ? "#22c55e" : muted,
                            marginTop: "4px",
                          }}
                        >
                          {occupied
                            ? `${tableOrders.length} order(s)`
                            : "Available"}
                        </div>
                        {occupied && (
                          <div
                            style={{
                              marginTop: "6px",
                              fontSize: "11px",
                              color: muted,
                            }}
                          >
                            {fmt(tableOrders.reduce((s, o) => s + o.total, 0))}{" "}
                            total
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            marginTop: "12px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => setEditingTable({ ...table })}
                            style={{
                              background: accent + "22",
                              border: `1px solid ${accent}`,
                              color: accent,
                              padding: "5px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontFamily: "inherit",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete table "${table.name}"?`)) {
                                const updated = tables.filter(
                                  (t) => t.id !== table.id,
                                );
                                setTables(updated);
                                saveTables(updated);
                              }
                            }}
                            style={{
                              background: "#ff444422",
                              border: "1px solid #ff4444",
                              color: "#ff4444",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontFamily: "inherit",
                            }}
                          >
                            Del
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {tables.filter((t) => t.active).length === 0 && (
                <div
                  style={{ textAlign: "center", padding: "40px", color: muted }}
                >
                  No tables yet. Click "Add Table" to create one.
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {tab === "analytics" && (
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "20px",
                }}
              >
                Analytics
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: muted,
                      marginBottom: "12px",
                    }}
                  >
                    Orders by Status
                  </div>
                  {ORDER_STATUSES.map((s) => {
                    const count = realOrders.filter(
                      (o) => o.status === s,
                    ).length;
                    const pct = realOrders.length
                      ? ((count / realOrders.length) * 100).toFixed(0)
                      : 0;
                    return (
                      <div key={s} style={{ marginBottom: "8px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                            marginBottom: "3px",
                          }}
                        >
                          <span style={{ color: STATUS_COLORS[s] }}>{s}</span>
                          <span>{count}</span>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            background: "#1a1a22",
                            borderRadius: "3px",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: STATUS_COLORS[s],
                              borderRadius: "3px",
                              transition: "width 0.5s",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: muted,
                      marginBottom: "12px",
                    }}
                  >
                    Revenue Summary
                  </div>
                  {[
                    ["Today", todayRevenue],
                    ["Total Paid", totalRevenue],
                    [
                      "Pending",
                      realOrders
                        .filter((o) => o.paymentStatus === "Unpaid")
                        .reduce((s, o) => s + o.total, 0),
                    ],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: `1px solid ${border}`,
                        fontSize: "14px",
                      }}
                    >
                      <span style={{ color: muted }}>{l}</span>
                      <span style={{ fontWeight: "700", color: accent }}>
                        {fmt(v)}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      background: accent + "22",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: muted }}>
                      Total Orders
                    </div>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: accent,
                      }}
                    >
                      {realOrders.length}
                    </div>
                  </div>
                </div>
              </div>
              {/* Top Items */}
              <div
                style={{
                  background: surface,
                  border: `1px solid ${border}`,
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: muted,
                    marginBottom: "12px",
                  }}
                >
                  Top Ordered Items
                </div>
                {(() => {
                  const counts = {};
                  realOrders.forEach((o) =>
                    o.items?.forEach((i) => {
                      counts[i.name] = (counts[i.name] || 0) + i.qty;
                    }),
                  );
                  return Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([name, qty]) => (
                      <div
                        key={name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: `1px solid ${border}`,
                          fontSize: "13px",
                        }}
                      >
                        <span>{name}</span>
                        <span style={{ color: accent, fontWeight: "600" }}>
                          {qty}× ordered
                        </span>
                      </div>
                    ));
                })()}
                {realOrders.length === 0 && (
                  <div
                    style={{
                      color: muted,
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No order data yet
                  </div>
                )}
              </div>

              {/* Busy Time Analytics */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                {/* Busy by Hour */}
                <div
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: muted,
                      marginBottom: "12px",
                    }}
                  >
                    🕐 Busy by Hour
                  </div>
                  {(() => {
                    const hourCounts = {};
                    realOrders.forEach((o) => {
                      const hour = new Date(o.timestamp).getHours();
                      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                    });
                    const maxHour = Math.max(...Object.values(hourCounts), 1);
                    return Object.entries(hourCounts)
                      .sort((a, b) => a[0] - b[0])
                      .map(([hour, count]) => (
                        <div key={hour} style={{ marginBottom: "6px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "11px",
                              marginBottom: "2px",
                            }}
                          >
                            <span>{hour}:00</span>
                            <span
                              style={{
                                color: count === maxHour ? "#22c55e" : muted,
                              }}
                            >
                              {count} orders
                            </span>
                          </div>
                          <div
                            style={{
                              height: "6px",
                              background: darkMode ? "#1a1a22" : "#eee",
                              borderRadius: "3px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${(count / maxHour) * 100}%`,
                                background:
                                  count === maxHour ? "#22c55e" : accent,
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                        </div>
                      ));
                  })()}
                  {realOrders.length === 0 && (
                    <div
                      style={{
                        color: muted,
                        fontSize: "12px",
                        textAlign: "center",
                        padding: "10px",
                      }}
                    >
                      No data
                    </div>
                  )}
                </div>

                {/* Busy by Day of Week */}
                <div
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: muted,
                      marginBottom: "12px",
                    }}
                  >
                    📅 Busy by Day
                  </div>
                  {(() => {
                    const dayNames = [
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ];
                    const dayCounts = {};
                    realOrders.forEach((o) => {
                      const day = new Date(o.timestamp).getDay();
                      dayCounts[day] = (dayCounts[day] || 0) + 1;
                    });
                    const maxDay = Math.max(...Object.values(dayCounts), 1);
                    return dayNames.map((name, idx) => {
                      const count = dayCounts[idx] || 0;
                      return (
                        <div key={idx} style={{ marginBottom: "6px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "11px",
                              marginBottom: "2px",
                            }}
                          >
                            <span>{name}</span>
                            <span
                              style={{
                                color: count === maxDay ? "#22c55e" : muted,
                              }}
                            >
                              {count} orders
                            </span>
                          </div>
                          <div
                            style={{
                              height: "6px",
                              background: darkMode ? "#1a1a22" : "#eee",
                              borderRadius: "3px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${(count / maxDay) * 100}%`,
                                background:
                                  count === maxDay ? "#22c55e" : accent,
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Busy by Month */}
                <div
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: muted,
                      marginBottom: "12px",
                    }}
                  >
                    📆 Busy by Month
                  </div>
                  {(() => {
                    const monthNames = [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ];
                    const monthCounts = {};
                    realOrders.forEach((o) => {
                      const month = new Date(o.timestamp).getMonth();
                      monthCounts[month] = (monthCounts[month] || 0) + 1;
                    });
                    const maxMonth = Math.max(...Object.values(monthCounts), 1);
                    return monthNames.map((name, idx) => {
                      const count = monthCounts[idx] || 0;
                      return (
                        <div key={idx} style={{ marginBottom: "6px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "11px",
                              marginBottom: "2px",
                            }}
                          >
                            <span>{name}</span>
                            <span
                              style={{
                                color: count === maxMonth ? "#22c55e" : muted,
                              }}
                            >
                              {count} orders
                            </span>
                          </div>
                          <div
                            style={{
                              height: "6px",
                              background: darkMode ? "#1a1a22" : "#eee",
                              borderRadius: "3px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${(count / maxMonth) * 100}%`,
                                background:
                                  count === maxMonth ? "#22c55e" : accent,
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* QR CODES TAB */}
          {tab === "qrcodes" && (
            <QRCodesTab
              accent={accent}
              muted={muted}
              surface={surface}
              border={border}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
