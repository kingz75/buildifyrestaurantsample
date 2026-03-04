// ============================================================
// CONSTANTS & DATA
// ============================================================

export const PAYSTACK_PUBLIC_KEY = "pk_test_caad8a1bd916330da7c5368b9637208bea53dea8"; // Replace with real key

export const MENU_CATEGORIES = [];

export const MENU_ITEMS = [];

export const TAG_COLORS = {
  Spicy: "#ff4444",
  Vegan: "#22c55e",
  Vegetarian: "#86efac",
  Halal: "#60a5fa",
};
export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Served",
  "Completed",
];
export const STATUS_COLORS = {
  Pending: "#f59e0b",
  Confirmed: "#3b82f6",
  Preparing: "#8b5cf6",
  Ready: "#10b981",
  Served: "#06b6d4",
  Completed: "#6b7280",
};

// ============================================================
// ADMIN USERS
// ============================================================
export const ADMIN_USERS = [
  { username: "owner", password: "123", role: "Owner" },
  { username: "manager", password: "123", role: "Manager" },
  { username: "staff", password: "123", role: "Staff" },
];

// ============================================================
// PROMO CODES
// ============================================================
export const PROMO_CODES = { WELCOME10: 10, FEAST20: 20, VIP50: 50 };

