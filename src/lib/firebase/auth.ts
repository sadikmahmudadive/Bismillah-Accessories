import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase/client";
import type { AppUserProfile } from "@/types/domain";

export type AuthCredentials = {
  email: string;
  password: string;
  displayName?: string;
};

export async function createCustomerAccount({
  email,
  password,
  displayName,
}: AuthCredentials) {
  const auth = getFirebaseAuth();
  const database = getFirestoreDb();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const cleanName = displayName?.trim() || email.split("@")[0] || "Customer";

  await updateProfile(credential.user, { displayName: cleanName });

  // Try to store user profile in Firestore
  let profileSaved = false;
  
  // First, try client-side Firestore
  try {
    await setDoc(doc(database, "users", credential.user.uid), {
      id: credential.user.uid,
      email: credential.user.email,
      displayName: cleanName,
      role: "customer",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`✅ User profile created in Firestore (client) for ${credential.user.uid}`);
    profileSaved = true;
  } catch (clientError) {
    console.warn("⚠️  Client-side Firestore failed, trying server API...", clientError);
    
    // Fall back to server API
    try {
      const token = await credential.user.getIdToken();
      const response = await fetch("/api/auth/save-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: cleanName,
        }),
      });

      if (response.ok) {
        console.log(`✅ User profile created in Firestore (server) for ${credential.user.uid}`);
        profileSaved = true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save profile");
      }
    } catch (serverError) {
      console.error("❌ Both client and server profile save failed:", serverError);
      // Log but don't prevent auth - user is authenticated even if profile save fails
      console.error("Firestore Database Issue: Ensure the database is created and service account has permissions");
    }
  }

  if (!profileSaved) {
    console.warn("⚠️  User profile could not be saved to Firestore, but authentication succeeded");
    // Consider this a warning, not a fatal error
  }

  return credential.user;
}

export async function signInCustomer({ email, password }: AuthCredentials) {
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutCustomer() {
  await firebaseSignOut(getFirebaseAuth());
}

export async function getUserProfile(user: User) {
  const database = getFirestoreDb();
  
  try {
    const snapshot = await getDoc(doc(database, "users", user.uid));

    if (!snapshot.exists()) {
      console.warn(`User profile not found in Firestore for ${user.uid}. User may not have completed signup.`);
      return null;
    }

    const profile = {
      id: user.uid,
      ...snapshot.data(),
    } as AppUserProfile;
    
    console.log(`✅ User profile loaded from Firestore for ${user.uid}`);
    return profile;
  } catch (error) {
    console.error("❌ Failed to load user profile from Firestore:", error);
    console.error("Firestore Database Issue: Ensure the database is created in Firebase Console > Firestore Database");
    throw error;
  }
}

export function getFriendlyAuthError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes("permission denied")) {
    return "You don't have permission to perform this action. Check Firestore security rules.";
  }

  if (errorMessage.includes("firestore") || errorMessage.includes("database")) {
    return "Database connection error. Please ensure Firestore is configured correctly.";
  }

  if (error.message.includes("Missing Firebase environment values")) {
    return "Firebase is not configured yet. Add your NEXT_PUBLIC_FIREBASE_* values to .env.local.";
  }

  if (error.message.includes("auth/email-already-in-use")) {
    return "This email already has an account.";
  }

  if (error.message.includes("auth/invalid-credential")) {
    return "The email or password is incorrect.";
  }

  if (error.message.includes("auth/weak-password")) {
    return "Use a password with at least 6 characters.";
  }

  if (error.message.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }

  return error.message;
}
