import { Suspense, lazy } from "react";

const CustomerApp = lazy(() => import("./components/customer/CustomerApp"));
const AdminApp = lazy(() => import("./components/admin/AdminApp"));
const KitchenApp = lazy(() => import("./components/kitchen/KitchenApp"));

function CustomerLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        background: "radial-gradient(circle at 50% 30%, #2d1200, #0d0d0d 70%)",
        color: "#f5f0e8",
        fontFamily: "'Playfair Display', Georgia, serif",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #4a2f16",
          borderTop: "3px solid #e8b86d",
          borderRadius: "9999px",
          animation: "customer-chunk-spin 0.85s linear infinite",
        }}
      />
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#e8b86d" }}>
        Loading Customer...
      </div>
      <style>{`@keyframes customer-chunk-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AdminLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        background: "radial-gradient(circle at 20% 20%, #1e1b3a, #09090f 65%)",
        color: "#e8e0f0",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #3a3355",
          borderTop: "3px solid #7c5ccc",
          borderRadius: "9999px",
          animation: "admin-chunk-spin 0.85s linear infinite",
        }}
      />
      <div style={{ fontSize: "14px", fontWeight: 600 }}>Loading Admin...</div>
      <style>{`@keyframes admin-chunk-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get("table");
  const accessCode = params.get("access");
  const view = params.get("view");
  const tableNumber = tableParam ? Number.parseInt(tableParam, 10) : null;

  if (view === "customer" || tableParam)
    return (
      <Suspense fallback={<CustomerLoadingScreen />}>
        <CustomerApp tableNumber={tableNumber} tableAccessCode={accessCode} />
      </Suspense>
    );

  if (view === "kitchen")
    return (
      <Suspense fallback={<AdminLoadingScreen />}>
        <KitchenApp />
      </Suspense>
    );

  return (
    <Suspense fallback={<AdminLoadingScreen />}>
      <AdminApp />
    </Suspense>
  );
}
