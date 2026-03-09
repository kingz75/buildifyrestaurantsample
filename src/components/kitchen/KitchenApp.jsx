import StaffAccessGate from "../auth/StaffAccessGate";
import KitchenView from "./KitchenView";

export default function KitchenApp() {
  return (
    <StaffAccessGate
      title="Kitchen Access"
      subtitle="Grand Table Restaurant"
      description="Sign in with a Firebase staff account that is allowlisted in /staffMembers."
      loadingLabel="Loading kitchen access..."
    >
      {({ user, onLogout }) => (
        <KitchenView user={user} onLogout={onLogout} />
      )}
    </StaffAccessGate>
  );
}
