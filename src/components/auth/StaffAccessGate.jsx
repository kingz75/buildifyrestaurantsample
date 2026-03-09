import { useEffect, useState } from "react";
import AdminLogin from "../admin/AdminLogin";
import {
  signInStaff,
  signOutStaff,
  subscribeToStaffSession,
} from "../../utils/staffAuth";

function StaffLoadingScreen({ label = "Loading staff access..." }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 20% 20%, #1e1b3a, #09090f 65%)",
        color: "#e8e0f0",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "999px",
          border: "3px solid #3a3355",
          borderTop: "3px solid #7c5ccc",
          animation: "staff-auth-spin 0.85s linear infinite",
        }}
      />
      <div style={{ fontSize: "14px", fontWeight: 600 }}>{label}</div>
      <style>{`@keyframes staff-auth-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function StaffAccessGate({
  title,
  subtitle,
  description,
  loadingLabel,
  children,
}) {
  const [isBooting, setIsBooting] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToStaffSession((nextUser) => {
      setUser(nextUser);
      setIsBooting(false);
    });

    return () => unsubscribe();
  }, []);

  if (isBooting) {
    return <StaffLoadingScreen label={loadingLabel} />;
  }

  if (!user) {
    return (
      <AdminLogin
        title={title}
        subtitle={subtitle}
        description={description}
        onLogin={signInStaff}
      />
    );
  }

  return children({
    user,
    onLogout: signOutStaff,
  });
}
