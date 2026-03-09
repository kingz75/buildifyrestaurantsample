import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, database } from "../firebase";

const staffMemberRef = (uid) => ref(database, `staffMembers/${uid}`);

const toStaffUser = (authUser, profile = {}) => ({
  uid: authUser.uid,
  email: authUser.email || String(profile.email || ""),
  username:
    String(profile.username || "").trim() ||
    authUser.email ||
    String(profile.email || "").trim() ||
    "staff",
  name:
    String(profile.name || "").trim() ||
    authUser.displayName ||
    authUser.email ||
    "Staff",
  role: String(profile.role || "").trim() || "Staff",
  active: profile.active !== false,
});

const loadStaffProfile = async (authUser) => {
  const snapshot = await get(staffMemberRef(authUser.uid));
  if (!snapshot.exists()) {
    throw new Error(
      "This account is not allowlisted in /staffMembers. Add the signed-in UID before granting access.",
    );
  }

  const profile = snapshot.val() || {};
  if (profile.active === false) {
    throw new Error("This staff account has been disabled.");
  }

  return toStaffUser(authUser, profile);
};

export const signInStaff = async ({ email, password }) => {
  await setPersistence(auth, browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(
    auth,
    String(email || "").trim(),
    String(password || ""),
  );

  try {
    return await loadStaffProfile(credential.user);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
};

export const signOutStaff = () => signOut(auth);

export const subscribeToStaffSession = (callback) =>
  onAuthStateChanged(auth, async (authUser) => {
    if (!authUser) {
      callback(null);
      return;
    }

    try {
      const staffUser = await loadStaffProfile(authUser);
      callback(staffUser);
    } catch (error) {
      console.error("Failed to restore staff session:", error);
      await signOut(auth);
      callback(null);
    }
  });
