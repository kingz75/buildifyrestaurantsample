import { useState } from 'react';
import { ADMIN_USERS } from '../../data/constants';

export default function AdminLogin({ onLogin }) {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  const submit = () => {
    const found = ADMIN_USERS.find(u => u.username === creds.username && u.password === creds.password);
    if (found) onLogin(found);
    else setErr("Invalid credentials");
  };

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", background: "#0f0f12", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#e8e0f0" }}>
      <div style={{ background: "#17171f", border: "1px solid #2a2a3a", borderRadius: "20px", padding: "40px", maxWidth: "380px", width: "100%", margin: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px" }}>🔐</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#b89dff", marginTop: "8px" }}>Admin Portal</div>
          <div style={{ color: "#6a6a8a", fontSize: "13px", marginTop: "4px" }}>Grand Table Restaurant</div>
        </div>
        {err && <div style={{ background: "#ff444422", border: "1px solid #ff4444", color: "#ff8888", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>{err}</div>}
        <input placeholder="Username" value={creds.username} onChange={e => setCreds({ ...creds, username: e.target.value })} style={{ width: "100%", background: "#0f0f12", border: "1px solid #2a2a3a", color: "#e8e0f0", padding: "12px 14px", borderRadius: "10px", marginBottom: "12px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px" }} />
        <input type="password" placeholder="Password" value={creds.password} onChange={e => setCreds({ ...creds, password: e.target.value })} onKeyDown={e => e.key === "Enter" && submit()} style={{ width: "100%", background: "#0f0f12", border: "1px solid #2a2a3a", color: "#e8e0f0", padding: "12px 14px", borderRadius: "10px", marginBottom: "6px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px" }} />
        <div style={{ fontSize: "11px", color: "#4a4a6a", marginBottom: "20px" }}>Test: owner/123 | manager/123 | staff/123</div>
        <button onClick={submit} style={{ width: "100%", background: "#8464d4", border: "none", color: "#fff", padding: "14px", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>Login</button>
      </div>
    </div>
  );
}
