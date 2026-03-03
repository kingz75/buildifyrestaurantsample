// ============================================================
// FIREBASE-BACKED STORAGE (Real-time sync across devices)
// ============================================================
import { ref, set, get, onValue, push, remove, update } from "firebase/database";
import { database } from "../firebase";
import {
  MENU_ITEMS,
  MENU_CATEGORIES as DEFAULT_CATEGORIES,
} from "../data/constants";

// ============================================================
// CATEGORIES
// ============================================================
const categoriesRef = ref(database, "categories");

export const getCategories = () => {
  return DEFAULT_CATEGORIES;
};

export const saveCategories = async (categories) => {
  await set(categoriesRef, categories);
};

// ============================================================
// ORDERS
// ============================================================
const ordersRef = ref(database, "orders");

export const getOrders = async () => {
  const snapshot = await get(ordersRef);
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...data,
    }));
  }
  return [];
};

export const saveOrders = async (orders) => {
  // For simplicity, we'll replace all orders
  await set(ordersRef, orders.reduce((acc, order) => {
    acc[order.id] = order;
    return acc;
  }, {}));
};

// Add a new order
export const addOrder = async (order) => {
  const newOrderRef = push(ordersRef);
  await set(newOrderRef, order);
  return newOrderRef.key;
};

// Update an existing order
export const updateOrder = async (orderId, updates) => {
  const orderRef = ref(database, `orders/${orderId}`);
  await update(orderRef, updates);
};

// Delete an order
export const deleteOrder = async (orderId) => {
  const orderRef = ref(database, `orders/${orderId}`);
  await remove(orderRef);
};

// Subscribe to orders changes (real-time)
export const subscribeToOrders = (callback) => {
  return onValue(ordersRef, (snapshot) => {
    if (snapshot.exists()) {
      const orders = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
      callback(orders);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Firebase orders subscription error:", error);
    callback([]);
  });
};

// ============================================================
// MENU ITEMS
// ============================================================
const menuRef = ref(database, "menu");

export const getMenuItems = () => {
  return MENU_ITEMS;
};

export const saveMenu = async (items) => {
  await set(menuRef, items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {}));
};

// Subscribe to menu changes (real-time)
export const subscribeToMenu = (callback) => {
  return onValue(menuRef, (snapshot) => {
    if (snapshot.exists()) {
      const items = Object.values(snapshot.val());
      callback(items);
    } else {
      callback(MENU_ITEMS);
    }
  }, (error) => {
    console.error("Firebase menu subscription error:", error);
    callback(MENU_ITEMS);
  });
};

// ============================================================
// TABLES
// ============================================================
const DEFAULT_TABLES = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  name: `Table ${i + 1}`,
  capacity: 4,
  active: true,
}));

const tablesRef = ref(database, "tables");

export const getTables = () => {
  return DEFAULT_TABLES;
};

export const saveTables = async (tables) => {
  await set(tablesRef, tables.reduce((acc, table) => {
    acc[table.id] = table;
    return acc;
  }, {}));
};

// Subscribe to tables changes (real-time)
export const subscribeToTables = (callback) => {
  return onValue(tablesRef, (snapshot) => {
    if (snapshot.exists()) {
      const tables = Object.values(snapshot.val());
      callback(tables);
    } else {
      callback(DEFAULT_TABLES);
    }
  }, (error) => {
    console.error("Firebase tables subscription error:", error);
    callback(DEFAULT_TABLES);
  });
};

// ============================================================
// SOUNDS
// ============================================================
export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.15 + 0.3,
      );
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch {}
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
export const fmt = (n) => `₦${Number(n).toLocaleString()}`;

export const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
};

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ============================================================
// NOTIFICATIONS (localStorage for simplicity)
// ============================================================
export const getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem("rqs_notifications") || "[]");
  } catch {
    return [];
  }
};

export const saveNotification = (notification) => {
  const notifications = getNotifications();
  const newNotification = {
    id: Date.now(),
    timestamp: Date.now(),
    read: false,
    ...notification,
  };
  notifications.unshift(newNotification);
  const trimmed = notifications.slice(0, 50);
  localStorage.setItem("rqs_notifications", JSON.stringify(trimmed));
  window.dispatchEvent(new Event("rqs_notification"));
};

export const markNotificationRead = (id) => {
  const notifications = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
  localStorage.setItem("rqs_notifications", JSON.stringify(notifications));
  window.dispatchEvent(new Event("rqs_notification"));
};

export const clearNotifications = () => {
  localStorage.setItem("rqs_notifications", JSON.stringify([]));
  window.dispatchEvent(new Event("rqs_notification"));
};

// ============================================================
// ORDER LOCKING (localStorage for simplicity - per browser session)
// ============================================================
export const lockOrder = (orderId, userType) => {
  const locks = JSON.parse(localStorage.getItem("rqs_order_locks") || "{}");
  locks[orderId] = { userType, timestamp: Date.now() };
  localStorage.setItem("rqs_order_locks", JSON.stringify(locks));
  window.dispatchEvent(new Event("rqs_lock"));
};

export const unlockOrder = (orderId) => {
  const locks = JSON.parse(localStorage.getItem("rqs_order_locks") || "{}");
  delete locks[orderId];
  localStorage.setItem("rqs_order_locks", JSON.stringify(locks));
  window.dispatchEvent(new Event("rqs_lock"));
};

export const getOrderLock = (orderId) => {
  const locks = JSON.parse(localStorage.getItem("rqs_order_locks") || "{}");
  return locks[orderId] || null;
};

export const getAllLocks = () => {
  return JSON.parse(localStorage.getItem("rqs_order_locks") || "{}");
};
