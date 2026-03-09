import { useState } from "react";

export default function AdminLogin({
  onLogin,
  title = "Staff Portal",
  subtitle = "Grand Table Restaurant",
  description = "Sign in with a Firebase staff account that is allowlisted in /staffMembers.",
}) {
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const email = String(creds.email || "").trim();
    const password = String(creds.password || "");

    if (!email || !password) {
      setErr("Email and password are required.");
      return;
    }

    setErr("");
    setIsSubmitting(true);

    try {
      await onLogin({ email, password });
    } catch (error) {
      setErr(error?.message || "Sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        background: "#0f0f12",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e8e0f0",
      }}
    >
      <div
        style={{
          background: "#17171f",
          border: "1px solid #2a2a3a",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "380px",
          width: "100%",
          margin: "24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", letterSpacing: "0.08em" }}>LOCK</div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#b89dff",
              marginTop: "8px",
            }}
          >
            {title}
          </div>
          <div style={{ color: "#6a6a8a", fontSize: "13px", marginTop: "4px" }}>
            {subtitle}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#4a4a6a",
              marginTop: "10px",
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        </div>
        {err && (
          <div
            style={{
              background: "#ff444422",
              border: "1px solid #ff4444",
              color: "#ff8888",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
            }}
          >
            {err}
          </div>
        )}
        <input
          placeholder="Staff email"
          value={creds.email}
          onChange={(e) => setCreds({ ...creds, email: e.target.value })}
          autoComplete="username"
          style={{
            width: "100%",
            background: "#0f0f12",
            border: "1px solid #2a2a3a",
            color: "#e8e0f0",
            padding: "12px 14px",
            borderRadius: "10px",
            marginBottom: "12px",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            fontSize: "14px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={creds.password}
          onChange={(e) => setCreds({ ...creds, password: e.target.value })}
          autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{
            width: "100%",
            background: "#0f0f12",
            border: "1px solid #2a2a3a",
            color: "#e8e0f0",
            padding: "12px 14px",
            borderRadius: "10px",
            marginBottom: "20px",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            fontSize: "14px",
          }}
        />
        <button
          disabled={isSubmitting}
          onClick={submit}
          style={{
            width: "100%",
            background: isSubmitting ? "#5b4d86" : "#8464d4",
            border: "none",
            color: "#fff",
            padding: "14px",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: isSubmitting ? "wait" : "pointer",
            fontFamily: "inherit",
            opacity: isSubmitting ? 0.85 : 1,
          }}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
