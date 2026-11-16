import StaffAccessGate from "../auth/StaffAccessGate";
import AdminDashboard from "./AdminDashboard";

export default function AdminApp() {
  return (
    <StaffAccessGate
      title="Staff Portal"
      subtitle="Grand Table Restaurant"
      description="Sign in with a staff account."
      loadingLabel="Loading admin access..."
    >
      {({ user, onLogout }) => (
        <AdminDashboard user={user} onLogout={onLogout} />
      )}
    </StaffAccessGate>
  );
}
