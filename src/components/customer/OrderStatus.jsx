import { ORDER_STATUSES, STATUS_COLORS } from "../../data/constants";
import { fmt } from "../../utils/storage";
import { useState } from "react";

export default function OrderStatus({
  order,
  onBack,
  onNewOrder,
  isEditing,
  editingCart,
  onUpdateEditingQty,
  onSaveEdit,
  onCancelEdit,
  onAddItems,
  menuItems,
  onPay,
  otherOrders = [],
  onSelectOrder,
  payAllOrders = false,
  onTogglePayAll,
  unpaidTableOrders = [],
  allUnpaidTotal,
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showOrderSelector, setShowOrderSelector] = useState(false);
  if (!order)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        Loading...
      </div>
    );
  const statusIndex = ORDER_STATUSES.indexOf(order.status);
  const canEdit =
    order.paymentStatus !== "Paid" &&
    !["Confirmed", "Preparing", "Served", "Completed"].includes(order.status);
  const isUnpaid = order.paymentStatus === "Unpaid";
  const showPayNow =
    isUnpaid && ["Confirmed", "Preparing", "Ready"].includes(order.status);
  const hasMultipleUnpaid = unpaidTableOrders.length > 1;
  const combinedUnpaidTotal =
    typeof allUnpaidTotal === "number"
      ? allUnpaidTotal
      : unpaidTableOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const editingTotal =
    editingCart?.reduce((s, i) => s + i.price * i.qty, 0) || 0;

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        background: "#f8f9fa",
        minHeight: "100vh",
        color: "#1a1a1a",
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>
            {order.status === "Completed"
              ? "✅"
              : order.status === "Ready"
                ? "🎉"
                : isEditing
                  ? "✏️"
                  : "⏳"}
          </div>
          <div
            style={{ fontSize: "22px", fontWeight: "700", color: "#c17f2a" }}
          >
            {isEditing
              ? "Editing Order"
              : order.status === "Completed"
                ? "Order Complete!"
                : "Order Placed!"}
          </div>
          <div style={{ color: "#64748b", marginTop: "4px" }}>
            Table #{order.table} •{" "}
            {new Date(order.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Order Selector - for tables with multiple active orders */}
        {otherOrders.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setShowOrderSelector(!showOrderSelector)}
              style={{
                width: "100%",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#c17f2a",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                📋 {otherOrders.length} Other Order
                {otherOrders.length > 1 ? "s" : ""} for Table {order.table}
              </span>
              <span
                style={{
                  transition: "transform 0.2s",
                  transform: showOrderSelector
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  fontSize: "12px",
                }}
              >
                ▼
              </span>
            </button>
            {showOrderSelector && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px",
                  marginTop: "10px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "10px",
                  }}
                >
                  Select an order to view:
                </div>
                {otherOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      onSelectOrder(o.id);
                      setShowOrderSelector(false);
                    }}
                    style={{
                      width: "100%",
                      background: "#f8f9fa",
                      border: "1px solid #e2e8f0",
                      color: "#1a1a1a",
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      marginBottom: "8px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Order #{o.id.slice(-6)}</span>
                    <span
                      style={{ color: STATUS_COLORS[o.status] || "#64748b" }}
                    >
                      {o.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!isEditing && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "16px",
              }}
            >
              Order Status
            </div>
            {ORDER_STATUSES.map((s, i) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: i < ORDER_STATUSES.length - 1 ? "8px" : "0",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: i <= statusIndex ? STATUS_COLORS[s] : "#f1f5f9",
                    border: `2px solid ${i <= statusIndex ? STATUS_COLORS[s] : "#e2e8f0"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    flexShrink: 0,
                    color: i <= statusIndex ? "#fff" : "#94a3b8",
                  }}
                >
                  {i < statusIndex ? "✓" : i === statusIndex ? "●" : "○"}
                </div>
                <span
                  style={{
                    color: i <= statusIndex ? "#1a1a1a" : "#94a3b8",
                    fontWeight: i === statusIndex ? "700" : "400",
                  }}
                >
                  {s}
                </span>
                {i === statusIndex && (
                  <span
                    style={{
                      background: STATUS_COLORS[s] + "11",
                      color: STATUS_COLORS[s],
                      border: `1px solid ${STATUS_COLORS[s]}33`,
                      borderRadius: "10px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      marginLeft: "auto",
                      fontWeight: "600",
                    }}
                  >
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {isEditing ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "12px",
              }}
            >
              Edit Your Order
            </div>
            {editingCart?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#475569" }}>
                  {item.qty}x {item.name}
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ color: "#475569", fontWeight: "600" }}>
                    {fmt(item.price * item.qty)}
                  </span>
                  <button
                    onClick={() => onUpdateEditingQty(item.id, -1)}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      color: "#1a1a1a",
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdateEditingQty(item.id, 1)}
                    style={{
                      background: "#c17f2a",
                      border: "none",
                      color: "#ffffff",
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            {editingCart.length === 0 && (
              <div
                style={{
                  color: "#94a3b8",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                All items removed
              </div>
            )}
            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                marginTop: "10px",
                paddingTop: "10px",
                display: "flex",
                justifyContent: "space-between",
                color: "#c17f2a",
                fontWeight: "700",
                fontSize: "16px",
              }}
            >
              <span>New Total</span>
              <span>{fmt(editingTotal)}</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "12px",
              }}
            >
              Order Summary
            </div>
            {order.items?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  color: "#475569",
                  fontSize: "14px",
                }}
              >
                <span>
                  {item.qty}x {item.name}
                </span>
                <span style={{ fontWeight: "600" }}>{fmt(item.price * item.qty)}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                marginTop: "10px",
                paddingTop: "10px",
                display: "flex",
                justifyContent: "space-between",
                color: "#c17f2a",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              <span>Total</span>
              <span>{fmt(order.total)}</span>
            </div>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "13px" }}>Payment</span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: order.paymentStatus === "Paid" ? "#22c55e" : "#f59e0b",
                  fontWeight: "700",
                  fontSize: "14px",
                  background: order.paymentStatus === "Paid" ? "#22c55e11" : "#f59e0b11",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {order.paymentStatus === "Paid" ? "✓ Paid" : "⏳ Unpaid"}
              </span>
            </div>
          </div>
        )}

        {isEditing ? (
          <div>
            <button
              onClick={() => setShowAddMenu(true)}
              style={{
                width: "100%",
                background: "#ffffff",
                border: "2px solid #c17f2a",
                color: "#c17f2a",
                padding: "14px",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "700",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              + Add More Items
            </button>
            <button
              onClick={onSaveEdit}
              disabled={editingCart.length === 0}
              style={{
                width: "100%",
                background: editingCart.length > 0 ? "#c17f2a" : "#cbd5e1",
                border: "none",
                color: "#fff",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                marginBottom: "12px",
                cursor: "pointer",
                boxShadow: editingCart.length > 0 ? "0 4px 6px rgba(193, 127, 42, 0.2)" : "none",
              }}
            >
              Save Changes
            </button>
            <button
              onClick={onCancelEdit}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                padding: "12px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            {showPayNow ? (
              <>
                {/* Pay for All Toggle */}
                {hasMultipleUnpaid && (
                  <div
                    style={{
                      background: payAllOrders ? "#22c55e08" : "#ffffff",
                      border: `2px solid ${payAllOrders ? "#22c55e44" : "#e2e8f0"}`,
                      borderRadius: "16px",
                      padding: "16px",
                      marginBottom: "16px",
                      transition: "all 0.3s",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                      }}
                      onClick={onTogglePayAll}
                    >
                      <div>
                        <div style={{ color: "#c17f2a", fontWeight: "700", fontSize: "15px" }}>
                          Pay for all orders
                        </div>
                        <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                          {unpaidTableOrders.length} unpaid orders for Table #{order.table}
                        </div>
                      </div>
                      {/* Toggle Switch */}
                      <div
                        style={{
                          width: "48px",
                          height: "26px",
                          borderRadius: "13px",
                          background: payAllOrders ? "#22c55e" : "#e2e8f0",
                          position: "relative",
                          transition: "background 0.3s",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: "#ffffff",
                            position: "absolute",
                            top: "2px",
                            left: payAllOrders ? "24px" : "2px",
                            transition: "left 0.3s",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        />
                      </div>
                    </div>
                    {payAllOrders && (
                      <div
                        style={{
                          marginTop: "12px",
                          paddingTop: "12px",
                          borderTop: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#22c55e",
                          fontWeight: "800",
                          fontSize: "16px",
                        }}
                      >
                        <span>Combined Total</span>
                        <span>{fmt(combinedUnpaidTotal)}</span>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => onPay && onPay()}
                  style={{
                    width: "100%",
                    background: "#22c55e",
                    border: "none",
                    color: "#fff",
                    padding: "16px",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "800",
                    marginBottom: "12px",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(34, 197, 94, 0.2)",
                  }}
                >
                  💳 {payAllOrders ? `Pay All ${fmt(combinedUnpaidTotal)}` : "Pay Now"}
                </button>
              </>
            ) : (
              <>
                {canEdit && (
                  <button
                    onClick={() => onNewOrder(true)}
                    style={{
                      width: "100%",
                      background: "#ffffff",
                      border: "2px solid #c17f2a",
                      color: "#c17f2a",
                      padding: "14px",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: "700",
                      marginBottom: "12px",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Edit Order
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => onNewOrder(false)}
              style={{
                width: "100%",
                background: "#c17f2a",
                border: "none",
                color: "#fff",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                marginBottom: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(193, 127, 42, 0.2)",
              }}
            >
              + Add More Items
            </button>
            <button
              onClick={onBack}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                padding: "12px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>

      {/* Add Items Modal */}
      {showAddMenu && menuItems && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.95)",
            zIndex: 1000,
            overflowY: "auto",
            padding: "20px",
            backdropFilter: "blur(4px)",
          }}
        >
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                paddingTop: "20px",
              }}
            >
              <h3 style={{ color: "#1a1a1a", margin: 0, fontSize: "20px" }}>Add Items</h3>
              <button
                onClick={() => setShowAddMenu(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  color: "#64748b",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  fontSize: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
            {menuItems
              .filter((m) => m.available)
              .map((item) => {
                const inCart = editingCart.find((c) => c.id === item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#1a1a1a", fontWeight: "700" }}>
                        {item.name}
                      </div>
                      <div style={{ color: "#c17f2a", fontSize: "14px", fontWeight: "600", marginTop: "2px" }}>
                        {fmt(item.price)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {inCart && (
                        <span style={{ color: "#22c55e", fontSize: "12px", fontWeight: "700" }}>
                          {inCart.qty} in order
                        </span>
                      )}
                      <button
                        onClick={() => {
                          onAddItems(item);
                        }}
                        style={{
                          background: "#c17f2a",
                          border: "none",
                          color: "#fff",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                );
              })}
            <button
              onClick={() => setShowAddMenu(false)}
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: "none",
                color: "#ffffff",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                marginTop: "24px",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              Done Adding
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
