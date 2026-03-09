import { useState, useEffect, useRef } from "react";
import { ORDER_STATUSES, STATUS_COLORS } from "../../data/constants";
import {
  getMenuItems,
  saveMenu,
  getTables,
  saveTables,
  getCategories,
  saveCategories,
  getItemTags,
  saveItemTags,
  fmt,
  timeAgo,
  getNotifications,
  markNotificationRead,
  clearNotifications,
  saveNotification,
  getOrderLock,
  subscribeToOrders,
  subscribeToMenu,
  subscribeToTables,
  subscribeToCategories,
  subscribeToItemTags,
  getBillingSettings,
  saveBillingSettings,
  subscribeToBillingSettings,
  updateOrder,
} from "../../utils/storage";
import ItemForm from "./ItemForm";
import QRCodesTab from "./QRCodesTab";
import { getOrderBreakdown } from "../../utils/billing";
import AnalyticsTab from "./dashboard/AnalyticsTab";
import BillingConfigTab from "./dashboard/BillingConfigTab";
import {
  markOrderAsPaid,
  openInvoiceWindow,
  updateOrderStatusWithGuard,
} from "./dashboard/orderActions";

export default function AdminDashboard({ user, onLogout }) {
  const toBillerDraft = (biller = {}, index = 0) => ({
    id: String(biller.id || `biller_${index}`),
    name: String(biller.name || "").trim() || `Biller ${index + 1}`,
    amount:
      Number(biller.amount || 0) === 0 ? "" : String(Number(biller.amount || 0)),
    percent:
      Number(biller.percent || 0) === 0
        ? ""
        : String(Number(biller.percent || 0)),
    active: biller.active !== false,
  });

  const toBillingDraft = (settings = {}) => ({
    customBillers: Array.isArray(settings.customBillers)
      ? settings.customBillers.map(toBillerDraft)
      : [],
  });

  const toBillingPayload = (draft = {}) => ({
    customBillers: (Array.isArray(draft.customBillers) ? draft.customBillers : []).map(
      (biller, index) => ({
        id: String(biller.id || `biller_${index}`),
        name: String(biller.name || "").trim() || `Biller ${index + 1}`,
        amount: Number(biller.amount || 0),
        percent: Number(biller.percent || 0),
        active: biller.active !== false,
      }),
    ),
  });

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
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [adminBootDelayDone, setAdminBootDelayDone] = useState(false);
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
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [itemTags, setItemTags] = useState(getItemTags);
  const [orderVersion, setOrderVersion] = useState(0);
  const [billingSettings, setBillingSettings] = useState(getBillingSettings);
  const [billingDraft, setBillingDraft] = useState(() =>
    toBillingDraft(getBillingSettings()),
  );
  const [savingBillingSettings, setSavingBillingSettings] = useState(false);
  const [billingSaveState, setBillingSaveState] = useState("idle");
  const billingSaveResetTimerRef = useRef(null);
  const [modalState, setModalState] = useState(null);
  const shouldSubscribeMenuData = tab === "menu";
  const shouldSubscribeTables =
    tab === "orders" || tab === "tables" || tab === "qrcodes";
  const shouldSubscribeBillingSettings =
    tab === "billing" || tab === "analytics";

  const closeModal = () => setModalState(null);
  const showInfoModal = (title, message) => {
    setModalState({
      type: "info",
      title,
      message,
    });
  };
  const showConfirmModal = ({
    title,
    message,
    confirmLabel = "Confirm",
    confirmTone = "danger",
    onConfirm,
  }) => {
    setModalState({
      type: "confirm",
      title,
      message,
      confirmLabel,
      confirmTone,
      onConfirm,
    });
  };
  const runModalConfirm = () => {
    const confirmAction = modalState?.onConfirm;
    closeModal();
    if (typeof confirmAction === "function") {
      confirmAction();
    }
  };

  // Mark as paid function
  const markPaid = (id) => {
    markOrderAsPaid(id, setOrders, updateOrder)
      .catch((error) => console.error("markPaid: Error:", error));
  };

  // Make function available globally for testing
  window.testMarkPaid = markPaid;

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
    if (!shouldSubscribeBillingSettings) return undefined;
    const unsubBillingSettings = subscribeToBillingSettings((settings) => {
      setBillingSettings(settings);
      setBillingDraft(toBillingDraft(settings));
      setBillingSaveState("idle");
    });
    return () => unsubBillingSettings();
  }, [shouldSubscribeBillingSettings]);

  useEffect(
    () => () => {
      if (billingSaveResetTimerRef.current) {
        clearTimeout(billingSaveResetTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => setAdminBootDelayDone(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Keep a capped, recent-orders listener for the dashboard.
  useEffect(() => {
    setOrdersLoaded(false);
    const unsubOrders = subscribeToOrders((all) => {
      setOrders(all);
      setOrdersLoaded(true);
    }, { limit: 80 });

    return () => {
      unsubOrders();
    };
  }, []);

  useEffect(() => {
    if (!shouldSubscribeMenuData) return undefined;
    setMenuLoaded(false);
    let hasMenuSnapshot = false;
    let hasCategoriesSnapshot = false;
    let hasTagsSnapshot = false;
    const markMenuLoaded = () => {
      if (hasMenuSnapshot && hasCategoriesSnapshot && hasTagsSnapshot) {
        setMenuLoaded(true);
      }
    };

    const unsubMenu = subscribeToMenu((items) => {
      setMenuItems(items);
      hasMenuSnapshot = true;
      markMenuLoaded();
    });
    const unsubCategories = subscribeToCategories((cats) => {
      setCategories(cats);
      hasCategoriesSnapshot = true;
      markMenuLoaded();
    });
    const unsubItemTags = subscribeToItemTags((tags) => {
      setItemTags(tags);
      hasTagsSnapshot = true;
      markMenuLoaded();
    });

    return () => {
      unsubMenu();
      unsubCategories();
      unsubItemTags();
    };
  }, [shouldSubscribeMenuData]);

  useEffect(() => {
    if (!shouldSubscribeTables) return undefined;
    const unsubTables = subscribeToTables((nextTables) => {
      setTables(nextTables);
    });
    return () => {
      unsubTables();
    };
  }, [shouldSubscribeTables]);

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

  const handleDeleteCategory = (categoryToDelete) => {
    if (!categoryToDelete || categoryToDelete === "All") return;
    const inUse = menuItems.some((item) => item.category === categoryToDelete);
    if (inUse) {
      showInfoModal(
        "Cannot Delete Category",
        "Some menu items still use this category. Reassign or delete those items first.",
      );
      return;
    }
    showConfirmModal({
      title: "Delete Category",
      message: `Delete "${categoryToDelete}"?`,
      confirmLabel: "Delete",
      confirmTone: "danger",
      onConfirm: () => {
        const updatedCategories = categories.filter((c) => c !== categoryToDelete);
        setCategories(updatedCategories);
        saveCategories(updatedCategories);
      },
    });
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const normalized = newTagName.trim();
    const exists = itemTags.some(
      (tag) => String(tag).toLowerCase() === normalized.toLowerCase(),
    );
    if (!exists) {
      const updated = [...itemTags, normalized];
      setItemTags(updated);
      saveItemTags(updated);
    }
    setNewTagName("");
    setShowAddTag(false);
  };

  const handleDeleteTag = (tagToDelete) => {
    if (!tagToDelete) return;
    showConfirmModal({
      title: "Delete Tag",
      message: `Delete "${tagToDelete}"?`,
      confirmLabel: "Delete",
      confirmTone: "danger",
      onConfirm: () => {
        const updatedTags = itemTags.filter((tag) => tag !== tagToDelete);
        setItemTags(updatedTags);
        saveItemTags(updatedTags);

        const hasTagInMenu = menuItems.some((item) =>
          Array.isArray(item.tags) && item.tags.includes(tagToDelete),
        );
        if (hasTagInMenu) {
          const updatedMenu = menuItems.map((item) => ({
            ...item,
            tags: Array.isArray(item.tags)
              ? item.tags.filter((tag) => tag !== tagToDelete)
              : [],
          }));
          setMenuItems(updatedMenu);
          saveMenu(updatedMenu);
        }
      },
    });
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await updateOrderStatusWithGuard({
        orderId: id,
        status,
        orders,
        getOrderLock,
        updateOrder,
        saveNotification,
      });
    } catch (error) {
      showInfoModal("Update Blocked", error?.message || "Could not update order.");
    }
  };

  const realOrders = orders.filter((o) => o.items);
  const waiterCalls = orders.filter((o) => o.type === "waiter_call");
  const readyOrders = realOrders.filter((o) => o.status === "Ready");
  const kitchenOrders = realOrders.filter((o) =>
    ["Pending", "Confirmed", "Preparing"].includes(o.status),
  );
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
  const paidOrders = realOrders.filter((o) => o.paymentStatus === "Paid");
  const unpaidOrders = realOrders.filter((o) => o.paymentStatus === "Unpaid");
  const todayRevenue = todayOrders.reduce(
    (sum, order) =>
      sum +
      (order.paymentStatus === "Paid"
        ? getOrderBreakdown(order, billingSettings).total
        : 0),
    0,
  );
  const todayPendingRevenue = todayOrders.reduce(
    (sum, order) =>
      sum +
      (order.paymentStatus === "Unpaid"
        ? getOrderBreakdown(order, billingSettings).total
        : 0),
    0,
  );
  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + getOrderBreakdown(order, billingSettings).total,
    0,
  );
  const pendingRevenue = unpaidOrders.reduce(
    (sum, order) => sum + getOrderBreakdown(order, billingSettings).total,
    0,
  );

  const bg = darkMode ? "#0f0f12" : "#f5f5f7";
  const surface = darkMode ? "#17171f" : "#ffffff";
  const border = darkMode ? "#2a2a3a" : "#e0e0e5";
  const accent = "#7c5ccc";
  const text = darkMode ? "#e8e0f0" : "#1a1a2e";
  const muted = darkMode ? "#6a6a8a" : "#646485";
  const isOrdersLoading = !adminBootDelayDone || !ordersLoaded;

  const handleAddCustomBiller = () => {
    setBillingDraft((prev) => ({
      ...prev,
      customBillers: [
        ...(Array.isArray(prev.customBillers) ? prev.customBillers : []),
        {
          id: `biller_${Date.now()}`,
          name: "New Biller",
          amount: "",
          percent: "",
          active: true,
        },
      ],
    }));
    setBillingSaveState("idle");
  };

  const handleCustomBillerFieldChange = (billerId, field, rawValue) => {
    setBillingDraft((prev) => ({
      ...prev,
      customBillers: (Array.isArray(prev.customBillers) ? prev.customBillers : []).map(
        (biller) => {
          if (biller.id !== billerId) return biller;
          const nextBiller = { ...biller, [field]: rawValue };
          const numericValue = Number(rawValue);
          if (field === "amount" && Number.isFinite(numericValue) && numericValue > 0) {
            nextBiller.percent = "";
          }
          if (field === "percent" && Number.isFinite(numericValue) && numericValue > 0) {
            nextBiller.amount = "";
          }
          return nextBiller;
        },
      ),
    }));
    setBillingSaveState("idle");
  };

  const handleDeleteCustomBiller = (billerId, billerName = "this biller") => {
    showConfirmModal({
      title: "Delete Biller",
      message: `Delete "${billerName}"?`,
      confirmLabel: "Delete",
      confirmTone: "danger",
      onConfirm: () => {
        setBillingDraft((prev) => ({
          ...prev,
          customBillers: (Array.isArray(prev.customBillers) ? prev.customBillers : []).filter(
            (biller) => biller.id !== billerId,
          ),
        }));
        setBillingSaveState("idle");
      },
    });
  };

  const handleToggleCustomBiller = (billerId, billerName = "this biller") => {
    const target = (Array.isArray(billingDraft.customBillers) ? billingDraft.customBillers : [])
      .find((biller) => biller.id === billerId);
    const isActive = target?.active !== false;
    const applyToggle = () => {
      setBillingDraft((prev) => ({
        ...prev,
        customBillers: (Array.isArray(prev.customBillers) ? prev.customBillers : []).map(
          (biller) =>
            biller.id === billerId
              ? { ...biller, active: biller.active === false }
              : biller,
          ),
      }));
      setBillingSaveState("idle");
    };

    if (isActive) {
      showConfirmModal({
        title: "Deactivate Biller",
        message: `Deactivate "${billerName}"?`,
        confirmLabel: "Deactivate",
        confirmTone: "warning",
        onConfirm: applyToggle,
      });
      return;
    }

    applyToggle();
  };

  const hasBillingChanges =
    JSON.stringify(toBillingPayload(billingDraft)) !==
    JSON.stringify(toBillingPayload(toBillingDraft(billingSettings)));
  const showBillingSaveButton =
    hasBillingChanges || savingBillingSettings || billingSaveState === "saved";

  const handleSaveBillingSettings = async () => {
    setSavingBillingSettings(true);
    setBillingSaveState("saving");
    try {
      await saveBillingSettings(toBillingPayload(billingDraft));
      setBillingSaveState("saved");
      if (billingSaveResetTimerRef.current) {
        clearTimeout(billingSaveResetTimerRef.current);
      }
      billingSaveResetTimerRef.current = setTimeout(() => {
        setBillingSaveState("idle");
      }, 1800);
    } catch (error) {
      console.error("Failed to save billing settings:", error);
      showInfoModal(
        "Save Failed",
        "Could not save billing settings. Please try again.",
      );
      setBillingSaveState("idle");
    } finally {
      setSavingBillingSettings(false);
    }
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
            <div style={{ fontSize:  "12px", color: muted, marginTop: "4px" }}>
              {user.role} 
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
            { id: "billing", icon: "⚙️", label: "Billing Config" },
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
              {isOrdersLoading ? (
                <div
                  style={{ textAlign: "center", padding: "60px", color: muted }}
                >
                  Loading orders...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div
                  style={{ textAlign: "center", padding: "60px", color: muted }}
                >
                  No orders found
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {[...filteredOrders].sort((a, b) => b.timestamp - a.timestamp).map((order) => (
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
                        {order.paymentStatus !== "Paid" && (
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
                          onClick={() => openInvoiceWindow(order)}
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
                {isOrdersLoading && (
                  <div
                    style={{
                      color: muted,
                      padding: "40px",
                      textAlign: "center",
                    }}
                  >
                    Loading kitchen orders...
                  </div>
                )}
                {!isOrdersLoading &&
                  kitchenOrders.map((order) => (
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
                {!isOrdersLoading && kitchenOrders.length === 0 && (
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
                    onClick={() => {
                      setShowAddCategory((prev) => !prev);
                      setShowAddTag(false);
                      setShowAddItem(false);
                    }}
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
                  <button
                    onClick={() => {
                      setShowAddTag((prev) => !prev);
                      setShowAddCategory(false);
                      setShowAddItem(false);
                    }}
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
                    + Add Tag
                  </button>
                </div>
              </div>
              {!menuLoaded ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px",
                    color: muted,
                  }}
                >
                  Loading menu management data...
                </div>
              ) : (
                <>
              {showAddItem && (
                <ItemForm
                  item={null}
                  categories={categories}
                  availableTags={itemTags}
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
                  <div style={{ marginTop: "12px" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: muted,
                        marginBottom: "8px",
                      }}
                    >
                      Existing Categories
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {categories
                        .filter((c) => c !== "All")
                        .map((cat) => (
                        <span
                          key={cat}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: bg,
                            border: `1px solid ${border}`,
                            borderRadius: "20px",
                            padding: "4px 10px",
                            fontSize: "12px",
                          }}
                        >
                          {cat}
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ff4444",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "700",
                              lineHeight: 1,
                              padding: 0,
                            }}
                            title={`Delete ${cat}`}
                          >
                            x
                          </button>
                        </span>
                      ))}
                      {categories.filter((c) => c !== "All").length === 0 && (
                        <div style={{ fontSize: "12px", color: muted }}>
                          No custom categories yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {showAddTag && (
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
                    Add New Tag
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
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
                      onClick={handleAddTag}
                      disabled={!newTagName.trim()}
                      style={{
                        background: accent,
                        border: "none",
                        color: "#fff",
                        padding: "10px 16px",
                        borderRadius: "6px",
                        cursor: newTagName.trim() ? "pointer" : "not-allowed",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        opacity: newTagName.trim() ? 1 : 0.5,
                      }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTag(false);
                        setNewTagName("");
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
                  <div style={{ marginTop: "12px" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: muted,
                        marginBottom: "8px",
                      }}
                    >
                      Existing Tags
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {itemTags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: bg,
                            border: `1px solid ${border}`,
                            borderRadius: "20px",
                            padding: "4px 10px",
                            fontSize: "12px",
                          }}
                        >
                          {tag}
                          <button
                            onClick={() => handleDeleteTag(tag)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ff4444",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "700",
                              lineHeight: 1,
                              padding: 0,
                            }}
                            title={`Delete ${tag}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
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
                                  {item?.image &&
                                    String(item.image).startsWith("data:") ? (
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
                                {fmt(item?.price || 0)} •{" "}
                                {item?.tags?.join(", ") || "No tags"}
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
                                  showConfirmModal({
                                    title: "Delete Item",
                                    message: `Delete "${item.name}"?`,
                                    confirmLabel: "Delete",
                                    confirmTone: "danger",
                                    onConfirm: () => {
                                      const updatedMenu = menuItems.filter(
                                        (m) => m.id !== item.id,
                                      );
                                      setMenuItems(updatedMenu);
                                      saveMenu(updatedMenu);
                                    },
                                  });
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
                                  availableTags={itemTags}
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
                </>
              )}
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
                              showConfirmModal({
                                title: "Delete Table",
                                message: `Delete table "${table.name}"?`,
                                confirmLabel: "Delete",
                                confirmTone: "danger",
                                onConfirm: () => {
                                  const updated = tables.filter(
                                    (t) => t.id !== table.id,
                                  );
                                  setTables(updated);
                                  saveTables(updated);
                                },
                              });
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

          {/* BILLING TAB */}
          {tab === "billing" && (
            <BillingConfigTab
              settings={billingDraft}
              onAddBiller={handleAddCustomBiller}
              onBillerFieldChange={handleCustomBillerFieldChange}
              onDeleteBiller={handleDeleteCustomBiller}
              onToggleBiller={handleToggleCustomBiller}
              onSave={handleSaveBillingSettings}
              isSaving={savingBillingSettings}
              saveState={billingSaveState}
              showSaveButton={showBillingSaveButton}
              bg={bg}
              surface={surface}
              border={border}
              text={text}
              muted={muted}
              accent={accent}
            />
          )}

          {/* ANALYTICS TAB */}
          {tab === "analytics" && (
            <AnalyticsTab
              realOrders={realOrders}
              todayOrders={todayOrders}
              todayRevenue={todayRevenue}
              todayPendingRevenue={todayPendingRevenue}
              totalRevenue={totalRevenue}
              pendingRevenue={pendingRevenue}
              darkMode={darkMode}
            />
          )}

          {/* QR CODES TAB */}
          {tab === "qrcodes" && (
            <QRCodesTab
              accent={accent}
              muted={muted}
              surface={surface}
              border={border}
              darkMode={darkMode}
              tables={tables}
            />
          )}
        </div>
      </div>
      {modalState && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              background: surface,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: "700", color: text }}>
              {modalState.title || "Notice"}
            </div>
            <div style={{ fontSize: "13px", color: muted, marginTop: "8px" }}>
              {modalState.message || ""}
            </div>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              {modalState.type === "confirm" && (
                <button
                  onClick={closeModal}
                  style={{
                    background: "transparent",
                    border: `1px solid ${border}`,
                    color: muted,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={modalState.type === "confirm" ? runModalConfirm : closeModal}
                style={{
                  background:
                    modalState.confirmTone === "warning"
                      ? "#f59e0b"
                      : modalState.confirmTone === "danger"
                        ? "#ef4444"
                        : accent,
                  border: "none",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  fontWeight: "600",
                }}
              >
                {modalState.type === "confirm"
                  ? modalState.confirmLabel || "Confirm"
                  : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
