import { useState, useEffect, useRef } from "react";
import {
  getMenuItems,
  getOrders,
  generateId,
  saveNotification,
  lockOrder,
  unlockOrder,
  getCategories,
  getTables,
  subscribeToMenu,
  subscribeToOrders,
  subscribeToTables,
  addOrder,
} from "../../utils/storage";
import TableSelect from "./TableSelect";
import OrderStatus from "./OrderStatus";
import PaymentView from "./PaymentView";
import CartDrawer from "./CartDrawer";
import MenuItem from "./MenuItem";

export default function CustomerApp({ tableNumber: initialTable }) {
  // Restore table from localStorage if no URL param
  const [table, setTable] = useState(() => {
    if (initialTable) return initialTable;
    const saved = localStorage.getItem('rqs_table');
    return saved ? parseInt(saved) : null;
  });
  const [menuItems, setMenuItems] = useState(getMenuItems);
  const [categories, setCategories] = useState(getCategories);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState(() => {
    // Restore view from localStorage
    const saved = localStorage.getItem('rqs_view');
    if (initialTable || saved === 'menu') return 'menu';
    return 'table_select';
  });
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [payMode, setPayMode] = useState(null); // 'now' | 'later'
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingCart, setEditingCart] = useState([]);
  const [payingOrder, setPayingOrder] = useState(null); // order being paid for
  const [tables, setTables] = useState(getTables);
  const [tableOrders, setTableOrders] = useState([]); // multiple active orders for current table
  const [orders, setOrders] = useState([]); // all orders from Firebase
  const [isRestored, setIsRestored] = useState(false); // Track if we've restored state

  // Restore order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('rqs_orderPlaced');
    if (savedOrder) {
      try {
        setOrderPlaced(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Failed to parse saved order:', e);
      }
    }
    setIsRestored(true);
  }, []);

  // Persist session to localStorage when state changes
  useEffect(() => {
    if (!isRestored) return;
    if (table) {
      localStorage.setItem('rqs_table', table.toString());
    }
    localStorage.setItem('rqs_view', view);
    if (orderPlaced) {
      localStorage.setItem('rqs_orderPlaced', JSON.stringify(orderPlaced));
    }
  }, [table, view, orderPlaced, isRestored]);

  // Listen for real-time updates from Firebase
  useEffect(() => {
    const unsubMenu = subscribeToMenu((items) => {
      setMenuItems(items);
    });
    const unsubTables = subscribeToTables((tables) => {
      setTables(tables);
    });
    const unsubOrders = subscribeToOrders((orders) => {
      setOrders(orders); // Store all orders
      // Update table orders if we have an active table
      if (table) {
        const tableOrdersList = orders.filter(
          (o) =>
            o.table === table &&
            o.status !== "completed" &&
            o.status !== "cancelled",
        );
        setTableOrders(tableOrdersList);
      }
      // Update live order if we have one
      if (orderPlaced) {
        const found = orders.find((o) => o.id === orderPlaced.id);
        if (found) {
          setLiveOrder(found);
          // Detect status change and notify
          if (prevStatusRef.current && prevStatusRef.current !== found.status) {
            saveNotification({
              type: "order_update",
              title: "Order Status Update",
              message: `Your order is now: ${found.status}`,
              table: found.table,
            });
          }
          prevStatusRef.current = found.status;
        }
      }
    });
    return () => {
      unsubMenu();
      unsubTables();
      unsubOrders();
    };
  }, [table, orderPlaced]);

  // Subscribe to table orders when table changes
  useEffect(() => {
    if (!table) return;
    const unsub = subscribeToOrders((orders) => {
      const tableOrdersList = orders.filter(
        (o) =>
          o.table === table &&
          o.status !== "completed" &&
          o.status !== "cancelled",
      );
      setTableOrders(tableOrdersList);
    });
    return () => unsub();
  }, [table]);

  // Poll for order status if order placed (backup for real-time)
  const [liveOrder, setLiveOrder] = useState(null);
  const prevStatusRef = useRef(null);
  useEffect(() => {
    if (!orderPlaced) return;
    // Initial fetch
    getOrders().then((orders) => {
      setOrders(orders); // Also update orders state
      const found = orders.find((o) => o.id === orderPlaced.id);
      if (found) {
        setLiveOrder(found);
        prevStatusRef.current = found.status;
      }
    });
  }, [orderPlaced]);

  const addToCart = (item) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === item.id);
      if (ex)
        return c.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((c) =>
      c
        .map((i) =>
          i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountedTotal = cartTotal - (cartTotal * discount) / 100;

  const applyPromo = () => {
    const codes = { WELCOME10: 10, FEAST20: 20, VIP50: 50 };
    if (codes[promoCode.toUpperCase()]) {
      setDiscount(codes[promoCode.toUpperCase()]);
      alert(`Promo applied! ${codes[promoCode.toUpperCase()]}% off`);
    } else alert("Invalid promo code");
  };

  const placeOrder = async (paid = false) => {
    if (cart.length === 0) return;
    const order = {
      id: generateId(),
      table,
      items: cart,
      total: discountedTotal,
      specialInstructions,
      status: "Pending",
      paymentStatus: paid ? "Paid" : "Unpaid",
      paymentMethod: paid ? "Card" : "Cash",
      timestamp: Date.now(),
      discount,
    };
    await addOrder(order);
    setOrderPlaced(order);
    setLiveOrder(order);
    setCart([]);
    setCartOpen(false);
    setView("order_status");
  };

  const startEditingOrder = (order) => {
    if (
      ["Confirmed", "Preparing", "Served", "Completed"].includes(order.status)
    ) {
      alert("Cannot edit order that has already been confirmed");
      return;
    }
    setEditingCart([...order.items]);
    setIsEditingOrder(true);
    lockOrder(order.id, "customer");
  };

  const saveEditedOrder = () => {
    if (!liveOrder || editingCart.length === 0) return;
    const all = orders;
    const updated = all.map((o) => {
      if (o.id === liveOrder.id) {
        return {
          ...o,
          items: editingCart,
          total: editingCart.reduce((s, i) => s + i.price * i.qty, 0),
        };
      }
      return o;
    });
    saveOrders(updated);
    unlockOrder(liveOrder.id);
    setIsEditingOrder(false);
    setEditingCart([]);
    setLiveOrder(updated.find((o) => o.id === liveOrder.id));
  };

  const cancelEditing = () => {
    if (liveOrder) {
      unlockOrder(liveOrder.id);
    }
    setIsEditingOrder(false);
    setEditingCart([]);
  };

  const updateEditingQty = (id, delta) => {
    setEditingCart((c) =>
      c
        .map((i) =>
          i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  };

  const addToEditingCart = (item) => {
    setEditingCart((c) => {
      const ex = c.find((i) => i.id === item.id);
      if (ex)
        return c.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...item, qty: 1 }];
    });
  };

  const handlePayNow = () => {
    if (!liveOrder) return;
    setPayingOrder(liveOrder);
  };

  const callWaiter = () => {
    const currentOrders = orders;
    currentOrders.unshift({
      id: generateId(),
      table,
      type: "waiter_call",
      timestamp: Date.now(),
      status: "Pending",
    });
    saveOrders(orders);
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 5000);
  };

  const filteredItems = menuItems.filter(
    (m) =>
      m.available &&
      (category === "All" || m.category === category) &&
      (search === "" || m.name.toLowerCase().includes(search.toLowerCase())),
  );

  if (view === "table_select")
    return (
      <TableSelect
        tables={tables}
        onSelect={(t) => {
          setTable(t);
          // Check for existing active orders for this table (use state)
          const activeOrders = tableOrders.filter(
            (o) =>
              o.table === t &&
              o.items &&
              !["Completed", "Served"].includes(o.status),
          );
          if (activeOrders.length > 1) {
            // Multiple active orders - show selection
            setTableOrders(activeOrders);
            setView("order_select");
          } else if (activeOrders.length === 1) {
            // One active order - continue with it
            setOrderPlaced(activeOrders[0]);
            setLiveOrder(activeOrders[0]);
            setView("menu");
          } else {
            // No active orders - go to menu
            setView("menu");
          }
        }}
      />
    );

  // Order selection view for tables with multiple active orders
  if (view === "order_select") {
    return (
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          background:
            "radial-gradient(circle at 50% 30%, #2d1200, #0d0d0d 70%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f5f0e8",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "360px", width: "100%" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📋</div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#e8b86d",
              marginBottom: "8px",
            }}
          >
            Select Your Order
          </div>
          <div
            style={{ color: "#7a5c30", marginBottom: "24px", fontSize: "14px" }}
          >
            Table {table} has multiple active orders
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {tableOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => {
                  setOrderPlaced(order);
                  setLiveOrder(order);
                  setView("menu");
                }}
                style={{
                  background: "#1a0a00",
                  border: "1px solid #c17f2a",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    color: "#e8b86d",
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  Order #{order.id.toString().slice(-6)}
                </div>
                <div
                  style={{
                    color: "#a07040",
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  Status: {order.status} •{" "}
                  {order.items.reduce((s, i) => s + i.qty, 0)} items
                </div>
                <div
                  style={{
                    color: "#7a5c30",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {order.items
                    .map((i) => i.name)
                    .slice(0, 3)
                    .join(", ")}
                  {order.items.length > 3 && "..."}
                </div>
              </button>
            ))}
            <button
              onClick={() => {
                setView("menu");
              }}
              style={{
                background: "transparent",
                border: "1px solid #3d2200",
                borderRadius: "12px",
                padding: "12px",
                cursor: "pointer",
                color: "#7a5c30",
                fontSize: "14px",
              }}
            >
              + Start New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (payingOrder) {
    const orderTotal = payingOrder.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    return (
      <PaymentView
        total={orderTotal}
        table={payingOrder.table}
        onSuccess={() => {
          const currentOrders = orders;
          const updated = currentOrders.map((o) =>
            o.id === payingOrder.id
              ? { ...o, paymentStatus: "Paid", paymentMethod: "Card" }
              : o,
          );
          saveOrders(updated);
          setLiveOrder(updated.find((o) => o.id === payingOrder.id));
          setPayingOrder(null);
        }}
        onCancel={() => setPayingOrder(null)}
      />
    );
  }
  if (view === "order_status") {
    // Check if there are multiple active orders for this table
    const allOrders = orders;
    const activeOrders = allOrders.filter(
      (o) =>
        o.table === table &&
        o.items &&
        !["Completed", "Served"].includes(o.status),
    );

    // If there are multiple active orders and liveOrder is not in the list, show selection
    if (
      activeOrders.length > 1 &&
      !activeOrders.find((o) => o.id === liveOrder?.id)
    ) {
      return (
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            background:
              "radial-gradient(circle at 50% 30%, #2d1200, #0d0d0d 70%)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f5f0e8",
            padding: "24px",
          }}
        >
          <div
            style={{ textAlign: "center", maxWidth: "360px", width: "100%" }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>📋</div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#e8b86d",
                marginBottom: "8px",
              }}
            >
              Select Your Order
            </div>
            <div
              style={{
                color: "#7a5c30",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            >
              Table {table} has multiple active orders
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {activeOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => {
                    setLiveOrder(order);
                    setOrderPlaced(order);
                  }}
                  style={{
                    background: "#1a0a00",
                    border: "1px solid #c17f2a",
                    borderRadius: "12px",
                    padding: "16px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      color: "#e8b86d",
                      fontWeight: "700",
                      fontSize: "16px",
                    }}
                  >
                    Order #{order.id.toString().slice(-6)}
                  </div>
                  <div
                    style={{
                      color: "#a07040",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    Status: {order.status} •{" "}
                    {order.items.reduce((s, i) => s + i.qty, 0)} items
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <OrderStatus
        order={liveOrder}
        onBack={() => setView("menu")}
        onNewOrder={(startEdit) => {
          if (startEdit && liveOrder) {
            startEditingOrder(liveOrder);
          } else {
            setOrderPlaced(null);
            setView("menu");
          }
        }}
        isEditing={isEditingOrder}
        editingCart={editingCart}
        onUpdateEditingQty={updateEditingQty}
        onSaveEdit={saveEditedOrder}
        onCancelEdit={cancelEditing}
        onAddItems={addToEditingCart}
        menuItems={menuItems}
        onPay={handlePayNow}
        otherOrders={
          liveOrder
            ? tableOrders.filter(
                (o) =>
                  o.table === liveOrder.table &&
                  o.id !== liveOrder.id &&
                  o.items &&
                  !["Completed", "Served"].includes(o.status),
              )
            : []
        }
        onSelectOrder={(orderId) => {
          const selectedOrder = tableOrders.find((o) => o.id === orderId);
          if (selectedOrder) {
            setLiveOrder(selectedOrder);
            setOrderPlaced(selectedOrder);
          }
        }}
      />
    );
  }
  if (payMode === "now")
    return (
      <PaymentView
        total={discountedTotal}
        table={table}
        onSuccess={() => placeOrder(true)}
        onCancel={() => setPayMode(null)}
      />
    );
  if (payMode === "later") {
    placeOrder(false);
    setPayMode(null);
    return null;
  }

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        background: "#0d0d0d",
        minHeight: "100vh",
        color: "#f5f0e8",
        maxWidth: "480px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #1a0a00 100%)",
          padding: "20px 16px 16px",
          borderBottom: "2px solid #c17f2a",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#e8b86d",
                letterSpacing: "0.5px",
              }}
            >
              🍽️ Grand Table
            </div>
            <div
              style={{ fontSize: "12px", color: "#a07040", marginTop: "2px" }}
            >
              Table #{table} • Fine Dining
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={callWaiter}
              style={{
                background: waiterCalled ? "#22c55e" : "#2d1200",
                border: "1px solid #c17f2a",
                color: waiterCalled ? "#fff" : "#e8b86d",
                padding: "8px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              {waiterCalled ? "✓ Called!" : "🔔 Waiter"}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              style={{
                background: "#c17f2a",
                border: "none",
                color: "#fff",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                fontSize: "18px",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🛒
              {cart.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "#e84444",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                  }}
                >
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </button>
            {/* Order Status Button */}
            {orderPlaced && (
              <button
                onClick={() => setView("order_status")}
                style={{
                  background:
                    liveOrder &&
                    ["Pending", "Confirmed", "Preparing", "Ready"].includes(
                      liveOrder.status,
                    )
                      ? "#22c55e"
                      : "#2d1200",
                  border: "1px solid #22c55e",
                  color: "#fff",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  fontSize: "16px",
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="View Order Status"
              >
                📋
                {(() => {
                  const allOrders = orders;
                  const activeOrders = allOrders.filter(
                    (o) =>
                      o.table === table &&
                      o.items &&
                      !["Completed", "Served"].includes(o.status),
                  );
                  return activeOrders.length > 1 ? (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "#e84444",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                      }}
                    >
                      {activeOrders.length}
                    </span>
                  ) : null;
                })()}
              </button>
            )}
          </div>
        </div>
        {/* Search */}
        <input
          placeholder="🔍 Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            marginTop: "12px",
            background: "#1a0a00",
            border: "1px solid #3d2200",
            color: "#f5f0e8",
            padding: "10px 14px",
            borderRadius: "24px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Categories */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
          overflowX: "auto",
          borderBottom: "1px solid #1f1000",
          scrollbarWidth: "none",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              background: category === cat ? "#c17f2a" : "#1a0a00",
              color: category === cat ? "#fff" : "#a07040",
              border: `1px solid ${category === cat ? "#c17f2a" : "#2d1200"}`,
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div style={{ padding: "16px", paddingBottom: "100px" }}>
        {categories
          .filter((c) => c !== "All" && (category === "All" || category === c))
          .map((cat) => {
            const items = filteredItems.filter((i) => i.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                {category === "All" && (
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#e8b86d",
                      margin: "16px 0 10px",
                      borderLeft: "3px solid #c17f2a",
                      paddingLeft: "10px",
                    }}
                  >
                    {cat}
                  </div>
                )}
                {items.map((item) => {
                  const inCart = cart.find((c) => c.id === item.id);
                  return (
                    <MenuItem
                      key={item.id}
                      item={item}
                      inCart={inCart}
                      onAddToCart={addToCart}
                      onUpdateQty={updateQty}
                    />
                  );
                })}
              </div>
            );
          })}
        {filteredItems.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#7a5c30",
              padding: "40px 0",
              fontSize: "15px",
            }}
          >
            No items found
          </div>
        )}
      </div>

      {/* Sticky Cart Bar */}
      {cart.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "480px",
            background: "#c17f2a",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 200,
          }}
        >
          <div style={{ color: "#fff" }}>
            <span style={{ fontWeight: "700" }}>
              {cart.reduce((s, i) => s + i.qty, 0)} items
            </span>
            <span style={{ marginLeft: "8px", opacity: 0.9 }}>
              ₦{cartTotal.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              background: "#fff",
              color: "#c17f2a",
              border: "none",
              padding: "8px 20px",
              borderRadius: "20px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            View Order →
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          specialInstructions={specialInstructions}
          setSpecialInstructions={setSpecialInstructions}
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          discount={discount}
          cartTotal={cartTotal}
          discountedTotal={discountedTotal}
          updateQty={updateQty}
          onClose={() => setCartOpen(false)}
          onPayNow={() => {
            setCartOpen(false);
            setPayMode("now");
          }}
          onPayLater={() => {
            setCartOpen(false);
            placeOrder(false);
          }}
        />
      )}
    </div>
  );
}
