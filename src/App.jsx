import { CustomerApp, AdminApp, KitchenView } from './components';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get("table");
  const view = params.get("view");

  if(view === "admin") return <AdminApp />;
  if(view === "kitchen") return <KitchenView />;
  return <CustomerApp tableNumber={tableParam ? parseInt(tableParam) : null} />;
}
