import { Suspense, lazy } from "react";

const CustomerApp = lazy(() => import("./components/customer/CustomerApp"));
const AdminApp = lazy(() => import("./components/admin/AdminApp"));
const KitchenView = lazy(() => import("./components/kitchen/KitchenView"));

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get("table");
  const view = params.get("view");
  const tableNumber = tableParam ? Number.parseInt(tableParam, 10) : null;

  if (view === "customer" || tableParam)
    return (
      <Suspense fallback={null}>
        <CustomerApp tableNumber={tableNumber} />
      </Suspense>
    );

  if (view === "kitchen")
    return (
      <Suspense fallback={null}>
        <KitchenView />
      </Suspense>
    );

  return (
    <Suspense fallback={null}>
      <AdminApp />
    </Suspense>
  );
}
