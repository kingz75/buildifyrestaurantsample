import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminApp() {
  const [user, setUser] = useState(() => { 
    try { return JSON.parse(sessionStorage.getItem("rqs_admin")); } 
    catch{ return null; }
  });
  if(!user) return <AdminLogin onLogin={u => { sessionStorage.setItem("rqs_admin", JSON.stringify(u)); setUser(u); }} />;
  return <AdminDashboard user={user} onLogout={() => { sessionStorage.removeItem("rqs_admin"); setUser(null); }} />;
}
