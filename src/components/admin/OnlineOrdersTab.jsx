import { useState, useEffect } from "react";
import { ONLINE_ORDER_STATUSES, STATUS_COLORS } from "../../data/constants";
import { timeAgo } from "../../utils/storage";

export default function OnlineOrdersTab({
  orders = [],
  onUpdateStatus,
  onMarkPaid,
  onOpenInvoice,
  fmt,
  bg,
  surface,
  border,
  text,
  muted,
  accent,
  darkMode,
}) {
  const onlineOrders = orders.filter((o) => o.type === "delivery");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter orders based on search term
  const filteredOrders = onlineOrders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.customer?.name?.toLowerCase().includes(searchLower) ||
      order.customer?.phone?.toLowerCase().includes(searchLower)
    );
  });

  const pendingCount = filteredOrders.filter(
    (o) => o.status === "Pending" || o.status === "Preparing",
  ).length;

  // Force re-render every minute to update timeAgo
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "800",
            color: text,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Online Orders ({filteredOrders.length})
          {pendingCount > 0 && (
            <span
              style={{
                marginLeft: "12px",
                background: "#f59e0b22",
                color: "#f59e0b",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {pendingCount} Pending
            </span>
          )}
        </div>

        {/* Search Box - Right side, 20% width */}
        <div style={{ width: "20%" }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              border: `1px solid ${border}`,
              background: surface,
              color: text,
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: muted,
            background: surface,
            borderRadius: "16px",
            border: `1px dashed ${border}`,
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🌐</div>
          <div>
            {searchTerm
              ? "No orders match your search"
              : "No online orders found"}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {[...filteredOrders]
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => toggleExpand(order.id)}
                  style={{
                    background: surface,
                    border: `1px solid ${isExpanded ? accent : border}`,
                    borderRadius: "16px",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isExpanded
                      ? `0 10px 25px -5px ${accent}22`
                      : "none",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "800",
                            fontSize: "17px",
                            color: text,
                          }}
                        >
                          {order.customer?.name || "Guest Customer"}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: accent,
                            background: accent + "15",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontFamily: "monospace",
                          }}
                        >
                          ID: {order.id}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: muted,
                            background: border,
                            padding: "2px 8px",
                            borderRadius: "10px",
                          }}
                        >
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ color: muted, fontSize: "13px" }}>
                        {new Date(order.timestamp).toLocaleString()} •{" "}
                        {timeAgo(order.timestamp)}
                      </div>

                      {!isExpanded && (
                        <div
                          style={{
                            marginTop: "12px",
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              color: accent,
                              fontSize: "14px",
                              fontWeight: "700",
                            }}
                          >
                            {fmt(order.total)}
                          </span>
                          <span style={{ color: border }}>•</span>
                          <span style={{ fontSize: "13px", color: text }}>
                            {order.items?.length} items
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          background: STATUS_COLORS[order.status] + "22",
                          color: STATUS_COLORS[order.status],
                          padding: "6px 14px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
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
                          padding: "6px 14px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {order.paymentStatus}
                      </span>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: muted,
                          transform: isExpanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.3s",
                        }}
                      >
                        ▼
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        marginTop: "24px",
                        paddingTop: "24px",
                        borderTop: `1px solid ${border}`,
                        animation: "fadeIn 0.3s ease-out",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "24px",
                        }}
                      >
                        {/* Customer Info */}
                        <section>
                          <h4
                            style={{
                              fontSize: "13px",
                              fontWeight: "800",
                              textTransform: "uppercase",
                              color: muted,
                              marginBottom: "12px",
                              letterSpacing: "1px",
                            }}
                          >
                            Customer Details
                          </h4>
                          <div style={{ display: "grid", gap: "10px" }}>
                            <div style={{ display: "flex", gap: "12px" }}>
                              <span style={{ fontSize: "16px" }}>📞</span>
                              <div>
                                <div style={{ fontSize: "11px", color: muted }}>
                                  Phone Number
                                </div>
                                <div
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {order.customer?.phone || "Not provided"}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                              <span style={{ fontSize: "16px" }}>📍</span>
                              <div>
                                <div style={{ fontSize: "11px", color: muted }}>
                                  Delivery Address
                                </div>
                                <div
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {order.customer?.address ||
                                    "No address provided"}
                                </div>
                                {order.customer?.location && (
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: accent,
                                      fontWeight: "700",
                                      marginTop: "4px",
                                    }}
                                  >
                                    Region: {order.customer.location}
                                  </div>
                                )}
                              </div>
                            </div>
                            {order.customer?.notes && (
                              <div style={{ display: "flex", gap: "12px" }}>
                                <span style={{ fontSize: "16px" }}>📝</span>
                                <div>
                                  <div
                                    style={{ fontSize: "11px", color: muted }}
                                  >
                                    Special Instructions
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "14px",
                                      color: "#ff9500",
                                      background: "#ff950011",
                                      padding: "8px 12px",
                                      borderRadius: "8px",
                                      marginTop: "4px",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    "{order.customer.notes}"
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </section>

                        {/* Order Items */}
                        <section>
                          <h4
                            style={{
                              fontSize: "13px",
                              fontWeight: "800",
                              textTransform: "uppercase",
                              color: muted,
                              marginBottom: "12px",
                              letterSpacing: "1px",
                            }}
                          >
                            Order Content
                          </h4>
                          <div
                            style={{
                              background: darkMode ? "#ffffff05" : "#00000003",
                              borderRadius: "12px",
                              padding: "16px",
                            }}
                          >
                            {(order.items || []).map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                <span style={{ color: text }}>
                                  <strong style={{ color: accent }}>
                                    {item.qty}x
                                  </strong>{" "}
                                  {item.name}
                                </span>
                                <span style={{ fontWeight: "600" }}>
                                  {fmt(item.price * item.qty)}
                                </span>
                              </div>
                            ))}
                            <div
                              style={{
                                borderTop: `1px solid ${border}`,
                                marginTop: "12px",
                                paddingTop: "12px",
                              }}
                            >
                              {order.deliveryFee > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "13px",
                                    color: muted,
                                    marginBottom: "4px",
                                  }}
                                >
                                  <span>Delivery Fee</span>
                                  <span>{fmt(order.deliveryFee)}</span>
                                </div>
                              )}
                              {order.packagingFee > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "13px",
                                    color: muted,
                                    marginBottom: "8px",
                                  }}
                                >
                                  <span>Packaging Fee</span>
                                  <span>{fmt(order.packagingFee)}</span>
                                </div>
                              )}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: "18px",
                                  fontWeight: "900",
                                  color: text,
                                }}
                              >
                                <span>Total</span>
                                <span>{fmt(order.total)}</span>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          marginTop: "24px",
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                          alignItems: "center",
                          borderTop: `1px solid ${border}`,
                          paddingTop: "20px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          {/* Status select moved to main card */}
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          {order.paymentStatus !== "Paid" && (
                            <button
                              onClick={() => onMarkPaid(order.id)}
                              style={{
                                background: "#22c55e",
                                color: "#fff",
                                padding: "10px 20px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "inherit",
                                fontSize: "14px",
                                fontWeight: "700",
                              }}
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => onOpenInvoice(order)}
                            style={{
                              background: accent + "22",
                              border: `1px solid ${accent}`,
                              color: accent,
                              padding: "10px 20px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              fontSize: "14px",
                              fontWeight: "700",
                            }}
                          >
                            🧾 Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
