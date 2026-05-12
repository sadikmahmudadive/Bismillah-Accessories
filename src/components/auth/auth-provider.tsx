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
  signInWithGoogle as firebaseSignInWithGoogle,
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
  loginWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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

      if (!userProfile) {
        // No Firestore profile yet — build a stub from Auth data so the app
        // can function without a DB write (e.g. social sign-in, legacy users).
        setProfile({
          id: nextUser.uid,
          email: nextUser.email ?? "",
          displayName:
            nextUser.displayName ||
            nextUser.email?.split("@")[0] ||
            "Customer",
          role: "customer",
          // Timestamps will be absent — cast to avoid needing a real Timestamp
          createdAt: null as unknown as import("firebase/firestore").Timestamp,
          updatedAt: null as unknown as import("firebase/firestore").Timestamp,
        });
      } else {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("🔴 Firestore Error:", error);

      if (error instanceof Error && error.message.includes("Database")) {
        setAuthError(
          "⚠️ Firestore Database Error: Please ensure you've created a Firestore database in Firebase Console > Firestore Database."
        );
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

    const setupAuth = () => {
      try {
        unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
          await loadProfile(nextUser);
          if (isActive) setIsLoading(false);
        });
      } catch (error) {
        window.setTimeout(() => handleAuthSetupError(error), 0);
      }
    };

    // Delay auth setup to move third-party iframe out of critical load path
    const timer = setTimeout(setupAuth, 1500);

    return () => {
      isActive = false;
      clearTimeout(timer);
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

  const loginWithGoogle = useCallback(async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const nextUser = await firebaseSignInWithGoogle();
      await loadProfile(nextUser);
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

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

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user);
  }, [loadProfile, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAdmin: profile?.role === "admin",
      isLoading,
      authError,
      signIn,
      signUp,
      loginWithGoogle,
      signOut,
      refreshProfile,
      clearAuthError: () => setAuthError(null),
    }),
    [authError, isLoading, profile, signIn, signOut, signUp, loginWithGoogle, user, refreshProfile],
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
