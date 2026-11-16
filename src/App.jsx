import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

const PublicLayout = lazy(() => import("./components/public/PublicLayout"));
const PublicLanding = lazy(() => import("./components/public/PublicLanding"));
const PublicMenu = lazy(() => import("./components/public/PublicMenu"));
const PublicCart = lazy(() => import("./components/public/PublicCart"));
const PublicCheckout = lazy(() => import("./components/public/PublicCheckout"));
const PublicTrackOrder = lazy(() => import("./components/public/PublicTrackOrder"));
const CustomerApp = lazy(() => import("./components/customer/CustomerApp"));
const AdminApp = lazy(() => import("./components/admin/AdminApp"));
const KitchenApp = lazy(() => import("./components/kitchen/KitchenApp"));

function PublicLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        background: "#0a0a0a",
        color: "#f5f0e8",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #1a1a2e",
          borderTop: "3px solid #e8b86d",
          borderRadius: "9999px",
          animation: "public-spin 0.85s linear infinite",
        }}
      />
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#e8b86d" }}>
        Loading...
      </div>
      <style>{`@keyframes public-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

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

/* Redirects legacy ?view=... and ?table=... query params to proper routes */
/**
 * Higher-order component to decide which "App" to show based on URL parameters.
 * If ?table=X is present, show the in-house CustomerApp (bypassing login).
 * Otherwise, show the intended target (Public Website or Staff Portal).
 */
function QueryParamDispatcher({ fallback }) {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");
  const view = searchParams.get("view");
  const accessCode = searchParams.get("access");

  if (tableParam || view === "customer") {
    const tableNumber = tableParam ? Number.parseInt(tableParam, 10) : null;
    return (
      <Suspense fallback={<CustomerLoadingScreen />}>
        <CustomerApp tableNumber={tableNumber} tableAccessCode={accessCode} />
      </Suspense>
    );
  }

  return fallback;
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Root route: Shows public website unless table params exist */}
        <Route
          path="/"
          element={
            <QueryParamDispatcher
              fallback={
                <Suspense fallback={<PublicLoadingScreen />}>
                  <PublicLayout />
                </Suspense>
              }
            />
          }
        >
          <Route index element={<PublicLanding />} />
          <Route path="menu" element={<PublicMenu />} />
          <Route path="cart" element={<PublicCart />} />
          <Route path="checkout" element={<PublicCheckout />} />
          <Route path="track" element={<PublicTrackOrder />} />
        </Route>

        {/* /login/admin and /login/kitchen routes: Show Staff Portal unless table params exist */}
        <Route
          path="/login/admin"
          element={
            <QueryParamDispatcher
              fallback={
                <Suspense fallback={<AdminLoadingScreen />}>
                  <AdminApp />
                </Suspense>
              }
            />
          }
        />
        <Route
          path="/login/kitchen"
          element={
            <QueryParamDispatcher
              fallback={
                <Suspense fallback={<AdminLoadingScreen />}>
                  <KitchenApp />
                </Suspense>
              }
            />
          }
        />

        {/* Redirect old routes to new ones */}
        <Route path="/login" element={<Navigate to="/login/admin" replace />} />
        <Route path="/admin" element={<Navigate to="/login/admin" replace />} />
        <Route path="/kitchen" element={<Navigate to="/login/kitchen" replace />} />

        {/* Legacy query-param-based routing for existing QR codes */}
        <Route
          path="/order"
          element={
            <QueryParamDispatcher
              fallback={<Navigate to="/" replace />}
            />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}
