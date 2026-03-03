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
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showOrderSelector, setShowOrderSelector] = useState(false);
  if (!order)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#7a5c30" }}>
        Loading...
      </div>
    );
  const statusIndex = ORDER_STATUSES.indexOf(order.status);
  const canEdit = !["Confirmed", "Preparing", "Served", "Completed"].includes(
    order.status,
  );
  const isUnpaid = order.paymentStatus === "Unpaid";
  const showPayNow =
    isUnpaid && ["Confirmed", "Preparing", "Ready"].includes(order.status);
  const hasMultipleUnpaid = unpaidTableOrders.length > 1;
  const allUnpaidTotal = unpaidTableOrders.reduce(
    (s, o) => s + o.items.reduce((sum, i) => sum + i.price * i.qty, 0),
    0,
  );
  const editingTotal =
    editingCart?.reduce((s, i) => s + i.price * i.qty, 0) || 0;

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        background: "#0d0d0d",
        minHeight: "100vh",
        color: "#f5f0e8",
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
            style={{ fontSize: "22px", fontWeight: "700", color: "#e8b86d" }}
          >
            {isEditing
              ? "Editing Order"
              : order.status === "Completed"
                ? "Order Complete!"
                : "Order Placed!"}
          </div>
          <div style={{ color: "#7a5c30", marginTop: "4px" }}>
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
                background: "#2d1200",
                border: "1px solid #4a2000",
                color: "#e8b86d",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
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
                  background: "#1a0a00",
                  border: "1px solid #2d1200",
                  borderRadius: "10px",
                  padding: "12px",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#a07040",
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
                      background: "#0d0d0d",
                      border: "1px solid #2d1200",
                      color: "#f5f0e8",
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
                      style={{ color: STATUS_COLORS[o.status] || "#a07040" }}
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
              background: "#1a0a00",
              border: "1px solid #2d1200",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#a07040",
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
                    background: i <= statusIndex ? STATUS_COLORS[s] : "#2d1200",
                    border: `2px solid ${i <= statusIndex ? STATUS_COLORS[s] : "#3d2200"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    flexShrink: 0,
                  }}
                >
                  {i < statusIndex ? "✓" : i === statusIndex ? "●" : "○"}
                </div>
                <span
                  style={{
                    color: i <= statusIndex ? "#f5f0e8" : "#3d2200",
                    fontWeight: i === statusIndex ? "700" : "400",
                  }}
                >
                  {s}
                </span>
                {i === statusIndex && (
                  <span
                    style={{
                      background: STATUS_COLORS[s] + "33",
                      color: STATUS_COLORS[s],
                      border: `1px solid ${STATUS_COLORS[s]}66`,
                      borderRadius: "10px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      marginLeft: "auto",
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
              background: "#1a0a00",
              border: "1px solid #2d1200",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#a07040",
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
                <span style={{ color: "#c8b49c" }}>
                  {item.qty}x {item.name}
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ color: "#c8b49c" }}>
                    {fmt(item.price * item.qty)}
                  </span>
                  <button
                    onClick={() => onUpdateEditingQty(item.id, -1)}
                    style={{
                      background: "#2d1200",
                      border: "none",
                      color: "#e8b86d",
                      width: "24px",
                      height: "24px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdateEditingQty(item.id, 1)}
                    style={{
                      background: "#2d1200",
                      border: "none",
                      color: "#e8b86d",
                      width: "24px",
                      height: "24px",
                      borderRadius: "4px",
                      cursor: "pointer",
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
                  color: "#7a5c30",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                All items removed
              </div>
            )}
            <div
              style={{
                borderTop: "1px solid #2d1200",
                marginTop: "10px",
                paddingTop: "10px",
                display: "flex",
                justifyContent: "space-between",
                color: "#e8b86d",
                fontWeight: "700",
              }}
            >
              <span>New Total</span>
              <span>{fmt(editingTotal)}</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#1a0a00",
              border: "1px solid #2d1200",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#a07040",
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
                  marginBottom: "6px",
                  color: "#c8b49c",
                }}
              >
                <span>
                  {item.qty}x {item.name}
                </span>
                <span>{fmt(item.price * item.qty)}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: "1px solid #2d1200",
                marginTop: "10px",
                paddingTop: "10px",
                display: "flex",
                justifyContent: "space-between",
                color: "#e8b86d",
                fontWeight: "700",
              }}
            >
              <span>Total</span>
              <span>{fmt(order.total)}</span>
            </div>
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#7a5c30" }}>Payment</span>
              <span
                style={{
                  color: order.paymentStatus === "Paid" ? "#22c55e" : "#f59e0b",
                  fontWeight: "600",
                }}
              >
                {order.paymentStatus}
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
                background: "#2d1200",
                border: "1px solid #c17f2a",
                color: "#e8b86d",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              + Add More Items
            </button>
            <button
              onClick={onSaveEdit}
              disabled={editingCart.length === 0}
              style={{
                width: "100%",
                background: editingCart.length > 0 ? "#c17f2a" : "#4a3020",
                border: "none",
                color: "#fff",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              Save Changes
            </button>
            <button
              onClick={onCancelEdit}
              style={{
                width: "100%",
                background: "#1a0a00",
                border: "1px solid #2d1200",
                color: "#a07040",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "14px",
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
                      background: payAllOrders ? "#22c55e11" : "#1a0a00",
                      border: `1px solid ${payAllOrders ? "#22c55e44" : "#2d1200"}`,
                      borderRadius: "12px",
                      padding: "14px 16px",
                      marginBottom: "12px",
                      transition: "all 0.3s",
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
                        <div style={{ color: "#e8b86d", fontWeight: "600", fontSize: "14px" }}>
                          Pay for all orders
                        </div>
                        <div style={{ color: "#7a5c30", fontSize: "12px", marginTop: "2px" }}>
                          {unpaidTableOrders.length} unpaid orders on Table #{order.table}
                        </div>
                      </div>
                      {/* Toggle Switch */}
                      <div
                        style={{
                          width: "44px",
                          height: "24px",
                          borderRadius: "12px",
                          background: payAllOrders ? "#22c55e" : "#3d2200",
                          position: "relative",
                          transition: "background 0.3s",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#fff",
                            position: "absolute",
                            top: "2px",
                            left: payAllOrders ? "22px" : "2px",
                            transition: "left 0.3s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                          }}
                        />
                      </div>
                    </div>
                    {payAllOrders && (
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "10px",
                          borderTop: "1px solid #2d1200",
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#22c55e",
                          fontWeight: "700",
                          fontSize: "15px",
                        }}
                      >
                        <span>Combined Total</span>
                        <span>{fmt(allUnpaidTotal)}</span>
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
                    padding: "14px",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: "700",
                    marginBottom: "10px",
                  }}
                >
                  💳 {payAllOrders ? `Pay All ${fmt(allUnpaidTotal)}` : "Pay Now"}
                </button>
              </>
            ) : (
              <>
                {canEdit && (
                  <button
                    onClick={() => onNewOrder(true)}
                    style={{
                      width: "100%",
                      background: "#2d1200",
                      border: "1px solid #c17f2a",
                      color: "#e8b86d",
                      padding: "14px",
                      borderRadius: "10px",
                      fontSize: "15px",
                      fontWeight: "700",
                      marginBottom: "10px",
                    }}
                  >
                    Edit Order
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
                padding: "14px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              + Add More Items
            </button>
            <button
              onClick={onBack}
              style={{
                width: "100%",
                background: "#1a0a00",
                border: "1px solid #2d1200",
                color: "#a07040",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "14px",
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
            background: "rgba(0,0,0,0.9)",
            zIndex: 1000,
            overflowY: "auto",
            padding: "20px",
          }}
        >
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ color: "#e8b86d", margin: 0 }}>Add Items</h3>
              <button
                onClick={() => setShowAddMenu(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#e8b86d",
                  fontSize: "24px",
                  cursor: "pointer",
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
                      background: "#1a0a00",
                      border: "1px solid #3d2010",
                      borderRadius: "10px",
                      padding: "12px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#e8b86d", fontWeight: "600" }}>
                        {item.name}
                      </div>
                      <div style={{ color: "#a07020", fontSize: "13px" }}>
                        ₦{item.price?.toLocaleString()}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {inCart && (
                        <span style={{ color: "#c17f2a", fontSize: "12px" }}>
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
                          fontWeight: "600",
                          cursor: "pointer",
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
                background: "#2d1200",
                border: "1px solid #c17f2a",
                color: "#e8b86d",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                marginTop: "20px",
                cursor: "pointer",
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
