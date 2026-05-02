"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createCustomerAccount,
  getFriendlyAuthError,
  getUserProfile,
  signInCustomer,
  signOutCustomer,
  type AuthCredentials,
} from "@/lib/firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import type { AppUserProfile } from "@/types/domain";

type AuthContextValue = {
  user: User | null;
  profile: AppUserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadProfile = useCallback(async (nextUser: User | null) => {
    setUser(nextUser);

    if (!nextUser) {
      setProfile(null);
      return;
    }

    try {
      const userProfile = await getUserProfile(nextUser);
      setProfile(userProfile);
      
      if (!userProfile) {
        console.warn(`ℹ️ No Firestore profile found for user ${nextUser.uid}. This is normal for fresh signups if Firestore is not yet provisioned.`);
      }
    } catch (error) {
      console.error("🔴 Firestore Error:", error);
      
      // Show error to user but allow them to continue with cached auth
      if (error instanceof Error && error.message.includes("Database")) {
        setAuthError("⚠️ Firestore Database Error: Please ensure you've created a Firestore database in Firebase Console > Firestore Database, and have proper security rules allowing authenticated users to write to /users collection.");
      } else {
        setAuthError(getFriendlyAuthError(error));
      }
      
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    let unsubscribe: (() => void) | undefined;
    const handleAuthSetupError = (error: unknown) => {
      if (!isActive) return;
      setAuthError(getFriendlyAuthError(error));
      setIsLoading(false);
    };

    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
        await loadProfile(nextUser);
        setIsLoading(false);
      });
    } catch (error) {
      window.setTimeout(() => handleAuthSetupError(error), 0);
    }

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, [loadProfile]);

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      setAuthError(null);
      setIsLoading(true);

      try {
        const nextUser = await signInCustomer(credentials);
        await loadProfile(nextUser);
      } catch (error) {
        setAuthError(getFriendlyAuthError(error));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [loadProfile],
  );

  const signUp = useCallback(
    async (credentials: AuthCredentials) => {
      setAuthError(null);
      setIsLoading(true);

      try {
        const nextUser = await createCustomerAccount(credentials);
        await loadProfile(nextUser);
      } catch (error) {
        setAuthError(getFriendlyAuthError(error));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [loadProfile],
  );

  const signOut = useCallback(async () => {
    setAuthError(null);
    setIsLoading(true);

    try {
      await signOutCustomer();
      setUser(null);
      setProfile(null);
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAdmin: profile?.role === "admin",
      isLoading,
      authError,
      signIn,
      signUp,
      signOut,
      clearAuthError: () => setAuthError(null),
    }),
    [authError, isLoading, profile, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
