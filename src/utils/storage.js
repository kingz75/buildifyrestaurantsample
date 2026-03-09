// ============================================================
// FIREBASE-BACKED STORAGE (Real-time sync across devices)
// ============================================================
import {
  ref,
  set,
  get,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  push,
  remove,
  update,
  query,
  orderByChild,
  equalTo,
  limitToLast,
} from "firebase/database";
import { database } from "../firebase";

import {
  DEFAULT_BILLING_SETTINGS,
  normalizeBillingSettings,
} from "./billing";

// ============================================================
// CATEGORIES
// ============================================================
const categoriesRef = ref(database, "categories");
const itemTagsRef = ref(database, "settings/itemTags");
const DEFAULT_ITEM_TAGS = ["Spicy", "Vegan", "Vegetarian", "Halal"];

export const getCategories = () => {
  return [];
};

// Subscribe to categories changes (real-time)
export const subscribeToCategories = (callback) => {
  return onValue(
    categoriesRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        callback(Array.isArray(val) ? val : Object.values(val));
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error("Firebase categories subscription error:", error);
      callback([]);
    },
  );
};

export const saveCategories = async (categories) => {
  await set(categoriesRef, categories);
};

export const getItemTags = () => {
  return [...DEFAULT_ITEM_TAGS];
};

export const saveItemTags = async (tags) => {
  await set(itemTagsRef, tags);
};

export const subscribeToItemTags = (callback) => {
  return onValue(
    itemTagsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        callback(Array.isArray(val) ? val : Object.values(val));
      } else {
        callback([...DEFAULT_ITEM_TAGS]);
      }
    },
    (error) => {
      console.error("Firebase item tags subscription error:", error);
      callback([...DEFAULT_ITEM_TAGS]);
    },
  );
};

// ============================================================
// ORDERS
// ============================================================
const ordersRef = ref(database, "orders");
const DEFAULT_RECENT_ORDERS_LIMIT = 80;
const DEFAULT_TABLE_ORDERS_LIMIT = 40;
const TABLE_ACCESS_CODE_LENGTH = 24;
const toSafeLimit = (rawLimit, fallback) => {
  const parsed = Number(rawLimit);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};
const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;
const mapOrderSnapshot = (snapshot) => ({
  ...(snapshot.val() || {}),
  id: snapshot.key,
});
const sortOrdersByTimestampDesc = (orders = []) =>
  [...orders].sort((a, b) => Number(b?.timestamp || 0) - Number(a?.timestamp || 0));
const createRandomToken = (size = TABLE_ACCESS_CODE_LENGTH) => {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789_-";
  const values = new Uint32Array(size);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(values);
    return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  }
  return Array.from({ length: size }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
};

export const getOrders = async (options = {}) => {
  const includeAll = options.includeAll === true;
  const limit = toSafeLimit(options.limit, DEFAULT_RECENT_ORDERS_LIMIT);
  const ordersQuery = includeAll
    ? ordersRef
    : query(
      ordersRef,
      orderByChild("timestamp"),
      limitToLast(limit),
    );
  const snapshot = await get(ordersQuery);
  if (snapshot.exists()) {
    return sortOrdersByTimestampDesc(
      Object.entries(snapshot.val()).map(([firebaseKey, data]) => ({
        ...data,
        id: firebaseKey,
      })),
    );
  }
  return [];
};

export const saveOrders = async (orders) => {
  await set(
    ordersRef,
    orders.reduce((acc, order) => {
      acc[order.id] = order;
      return acc;
    }, {}),
  );
};

// Add a new order (uses order's own id as the Firebase key)
export const addOrder = async (order) => {
  const orderRef = ref(database, `orders/${order.id}`);
  await set(orderRef, order);
  return order.id;
};

// Update an existing order
export const updateOrder = async (orderId, updates) => {
  const orderRef = ref(database, `orders/${orderId}`);
  try {
    await update(orderRef, updates);
  } catch (error) {
    console.error("updateOrder: Failed with error:", error);
    throw error;
  }
};

// Delete an order
export const deleteOrder = async (orderId) => {
  const orderRef = ref(database, `orders/${orderId}`);
  await remove(orderRef);
};

// Subscribe to orders changes (real-time)
export const subscribeToOrders = (callback, options = {}) => {
  const limit = toSafeLimit(options.limit, DEFAULT_RECENT_ORDERS_LIMIT);
  const ordersQuery = query(
    ordersRef,
    orderByChild("timestamp"),
    limitToLast(limit),
  );
  const orderCache = new Map();
  let disposed = false;
  let emitTimer = null;
  let initialSnapshotResolved = false;

  const emit = () => {
    if (disposed) return;
    callback(sortOrdersByTimestampDesc(Array.from(orderCache.values())));
  };

  const scheduleEmit = () => {
    if (disposed || emitTimer) return;
    emitTimer = setTimeout(() => {
      emitTimer = null;
      emit();
    }, 16);
  };

  const upsertOrder = (snapshot) => {
    if (!snapshot.exists()) return;
    orderCache.set(snapshot.key, mapOrderSnapshot(snapshot));
    scheduleEmit();
  };

  const removeOrderFromCache = (snapshot) => {
    orderCache.delete(snapshot.key);
    scheduleEmit();
  };

  const resolveInitialSnapshot = (snapshot) => {
    if (disposed || initialSnapshotResolved) return;
    initialSnapshotResolved = true;
    if (snapshot.exists()) {
      Object.entries(snapshot.val()).forEach(([firebaseKey, data]) => {
        orderCache.set(firebaseKey, { ...data, id: firebaseKey });
      });
    }
    emit();
  };

  const handleError = (error) => {
    console.error("subscribeToOrders: Error:", error);
    if (!disposed) callback(sortOrdersByTimestampDesc(Array.from(orderCache.values())));
  };

  const unsubInitial = onValue(
    ordersQuery,
    resolveInitialSnapshot,
    handleError,
    { onlyOnce: true },
  );
  const unsubAdded = onChildAdded(ordersQuery, upsertOrder, handleError);
  const unsubChanged = onChildChanged(ordersQuery, upsertOrder, handleError);
  const unsubRemoved = onChildRemoved(ordersQuery, removeOrderFromCache, handleError);

  return () => {
    disposed = true;
    if (emitTimer) {
      clearTimeout(emitTimer);
    }
    unsubInitial();
    unsubAdded();
    unsubChanged();
    unsubRemoved();
  };
};

export const subscribeToTableOrders = (accessCode, callback, options = {}) => {
  if (!isNonEmptyString(accessCode)) {
    callback([]);
    return () => {};
  }
  const limit = toSafeLimit(options.limit, DEFAULT_TABLE_ORDERS_LIMIT);
  const tableOrdersQuery = query(
    ordersRef,
    orderByChild("accessCode"),
    equalTo(String(accessCode).trim()),
    limitToLast(limit),
  );
  const orderCache = new Map();
  let disposed = false;
  let emitTimer = null;
  let initialSnapshotResolved = false;

  const emit = () => {
    if (disposed) return;
    callback(sortOrdersByTimestampDesc(Array.from(orderCache.values())));
  };

  const scheduleEmit = () => {
    if (disposed || emitTimer) return;
    emitTimer = setTimeout(() => {
      emitTimer = null;
      emit();
    }, 16);
  };

  const upsertOrder = (snapshot) => {
    if (!snapshot.exists()) return;
    orderCache.set(snapshot.key, mapOrderSnapshot(snapshot));
    scheduleEmit();
  };

  const removeOrderFromCache = (snapshot) => {
    orderCache.delete(snapshot.key);
    scheduleEmit();
  };

  const resolveInitialSnapshot = (snapshot) => {
    if (disposed || initialSnapshotResolved) return;
    initialSnapshotResolved = true;
    if (snapshot.exists()) {
      Object.entries(snapshot.val()).forEach(([firebaseKey, data]) => {
        orderCache.set(firebaseKey, { ...data, id: firebaseKey });
      });
    }
    emit();
  };

  const handleError = (error) => {
    console.error("subscribeToTableOrders: Error:", error);
    if (!disposed) callback(sortOrdersByTimestampDesc(Array.from(orderCache.values())));
  };

  const unsubInitial = onValue(
    tableOrdersQuery,
    resolveInitialSnapshot,
    handleError,
    { onlyOnce: true },
  );
  const unsubAdded = onChildAdded(tableOrdersQuery, upsertOrder, handleError);
  const unsubChanged = onChildChanged(tableOrdersQuery, upsertOrder, handleError);
  const unsubRemoved = onChildRemoved(tableOrdersQuery, removeOrderFromCache, handleError);

  return () => {
    disposed = true;
    if (emitTimer) {
      clearTimeout(emitTimer);
    }
    unsubInitial();
    unsubAdded();
    unsubChanged();
    unsubRemoved();
  };
};

// ============================================================
// MENU ITEMS
// ============================================================
const menuRef = ref(database, "menu");

export const getMenuItems = () => {
  return [];
};

export const saveMenu = async (items) => {
  await set(
    menuRef,
    items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {}),
  );
};

// Subscribe to menu changes (real-time)
export const subscribeToMenu = (callback) => {
  return onValue(
    menuRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const items = Object.entries(val).map(([id, data]) => ({
          tags: [],
          image: "🍽️",
          ...data,
          id
        }));
        callback(items);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error("Firebase menu subscription error:", error);
      callback([]);
    },
  );
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
  accessCode: createRandomToken(),
}));

const tablesRef = ref(database, "tables");
const normalizeTable = (table, fallbackId) => ({
  ...table,
  id: table?.id ?? fallbackId,
  number: Number(table?.number ?? fallbackId) || fallbackId,
  name: String(table?.name || `Table ${fallbackId}`),
  capacity: Number(table?.capacity ?? 4) || 4,
  active: table?.active !== false,
  accessCode: isNonEmptyString(table?.accessCode)
    ? String(table.accessCode).trim()
    : createRandomToken(),
});

export const ensureTablesHaveAccessCodes = (tables = []) =>
  tables.map((table, index) => normalizeTable(table, index + 1));

export const getTables = () => {
  return ensureTablesHaveAccessCodes(DEFAULT_TABLES);
};

export const saveTables = async (tables) => {
  const normalizedTables = ensureTablesHaveAccessCodes(tables);
  await set(
    tablesRef,
    normalizedTables.reduce((acc, table) => {
      acc[table.id] = table;
      return acc;
    }, {}),
  );
};

// Subscribe to tables changes (real-time)
export const subscribeToTables = (callback) => {
  return onValue(
    tablesRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const rawTables = Object.entries(snapshot.val()).map(([id, data]) => ({
          ...data,
          id,
        }));
        const tables = ensureTablesHaveAccessCodes(rawTables);
        callback(tables);

        const missingAccessCode = rawTables.some(
          (table) => !isNonEmptyString(table?.accessCode),
        );
        if (missingAccessCode) {
          try {
            await saveTables(tables);
          } catch (error) {
            console.error("Firebase tables backfill error:", error);
          }
        }
      } else {
        callback(ensureTablesHaveAccessCodes(DEFAULT_TABLES));
      }
    },
    (error) => {
      console.error("Firebase tables subscription error:", error);
      callback(ensureTablesHaveAccessCodes(DEFAULT_TABLES));
    },
  );
};

// ============================================================
// BILLING SETTINGS
// ============================================================
const billingSettingsRef = ref(database, "settings/billing");

export const getBillingSettings = () => {
  return { ...DEFAULT_BILLING_SETTINGS };
};

export const saveBillingSettings = async (settings) => {
  await set(billingSettingsRef, normalizeBillingSettings(settings));
};

export const subscribeToBillingSettings = (callback) => {
  return onValue(
    billingSettingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(normalizeBillingSettings(snapshot.val()));
      } else {
        callback({ ...DEFAULT_BILLING_SETTINGS });
      }
    },
    (error) => {
      console.error("Firebase billing settings subscription error:", error);
      callback({ ...DEFAULT_BILLING_SETTINGS });
    },
  );
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
  } catch { }
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
