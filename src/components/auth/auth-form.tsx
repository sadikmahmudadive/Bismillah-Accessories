"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

export function AuthForm() {
  const router = useRouter();
  const { authError, clearAuthError, isLoading, signIn, signUp, sendPasswordReset, loginWithGoogle, user, profile } =
    useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const isSignUp = mode === "sign-up";
  const isForgot = mode === "forgot-password";

  const title = isForgot
    ? "Reset your password"
    : isSignUp
    ? "Create your account"
    : "Welcome back";
  const subtitle = isForgot
    ? "Enter your email address and we'll send you a link to reset your password."
    : isSignUp
    ? "Set up a customer account for checkout and order history."
    : "Sign in to manage checkout, saved details, and admin access.";

  const initials = useMemo(() => {
    const source = profile?.displayName || user?.displayName || user?.email || "BA";
    return source.slice(0, 2).toUpperCase();
  }, [profile?.displayName, user?.displayName, user?.email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    clearAuthError();
    setResetSuccess(false);

    if (isForgot) {
      if (!email.trim()) {
        setLocalError("Please enter your email address.");
        return;
      }
      try {
        await sendPasswordReset(email);
        setResetSuccess(true);
      } catch {
        return;
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }

    if (isSignUp && !displayName.trim()) {
      setLocalError("Please add your name.");
      return;
    }

    try {
      if (isSignUp) {
        await signUp({ email, password, displayName });
      } else {
        await signIn({ email, password });
      }
      // Redirect to checkout after successful auth
      router.replace("/checkout");
    } catch {
      return;
    }
  }

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-xl shadow-neutral-950/5"
      >
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full bg-neutral-950 text-lg font-semibold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-500">Signed in as</p>
            <h2 className="text-xl font-semibold text-neutral-950">
              {profile?.displayName || user.displayName || user.email}
            </h2>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-[#f6f4ee] p-4 text-sm leading-6 text-neutral-600">
          Your account is connected. Admin access is role-based through the
          Firestore user profile.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
    >
      {/* Decorative Gradient Glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-48 rounded-full bg-[#2f9e74]/5 blur-3xl" />
      
      <form onSubmit={handleSubmit} className="p-2 sm:p-3">
        {/* Header Section */}
        <div className="rounded-[2rem] bg-gradient-to-b from-[#f6f4ee] to-[#faf9f6] p-6 sm:p-8">
          <div className="inline-flex rounded-2xl bg-white/60 p-1.5 shadow-inner backdrop-blur-sm">
            {(["sign-in", "sign-up"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setLocalError(null);
                  setResetSuccess(false);
                  clearAuthError();
                }}
                className={cn(
                  "relative rounded-xl px-5 py-2 text-sm font-bold transition-all duration-300",
                  (mode === item && !isForgot) || (isForgot && item === "sign-in")
                    ? "bg-neutral-950 text-white shadow-lg shadow-neutral-950/20"
                    : "text-neutral-500 hover:text-neutral-950"
                )}
              >
                {item === "sign-in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 className="mt-8 text-4xl font-semibold tracking-tight text-neutral-950">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 max-w-[280px]">
            {subtitle}
          </p>
        </div>

        {/* Form Body */}
        <div className="px-6 pb-8 pt-8 sm:px-8">
          <div className="grid gap-5">
            {isSignUp ? (
              <LabelledInput
                icon={<UserRound className="size-4" />}
                label="Full Name"
                value={displayName}
                onChange={setDisplayName}
                placeholder="Ex. Sadik Mahmud"
                autoComplete="name"
              />
            ) : null}

            <LabelledInput
              icon={<Mail className="size-4" />}
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="name@example.com"
              autoComplete="email"
            />

            {!isForgot ? (
              <div>
                <LabelledInput
                  icon={<Lock className="size-4" />}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                {!isSignUp ? (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot-password");
                        setLocalError(null);
                        setResetSuccess(false);
                        clearAuthError();
                      }}
                      className="text-xs font-bold text-[#2f9e74] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {resetSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-800"
            >
              <p className="font-bold">Reset email sent!</p>
              <p className="mt-1 text-xs text-emerald-700">
                Check your inbox at <strong>{email}</strong> for instructions to reset your password.
              </p>
            </motion.div>
          ) : null}

          {localError || authError ? (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 overflow-hidden"
            >
              <p className="rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-xs font-bold text-red-600">
                {localError || authError}
              </p>
            </motion.div>
          ) : null}

          <Button type="submit" className="mt-8 h-14 w-full rounded-2xl text-base shadow-xl shadow-neutral-950/10" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="size-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Processing...
              </span>
            ) : isForgot ? "Send Reset Link" : isSignUp ? "Create account" : "Sign in to Account"}
          </Button>

          {isForgot ? (
            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setLocalError(null);
                setResetSuccess(false);
                clearAuthError();
              }}
              className="mt-4 w-full text-center text-xs font-bold text-neutral-500 hover:text-neutral-950"
            >
              Back to Sign in
            </button>
          ) : null}

          {/* Social Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-neutral-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="bg-white px-6 text-neutral-400">Secure Access</span>
            </div>
          </div>

          {/* Google Login */}
          <motion.button
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isLoading}
            onClick={async () => {
              try {
                await loginWithGoogle();
                router.replace("/checkout");
              } catch (e) {
                console.error("Google sign in failed", e);
              }
            }}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white text-sm font-bold text-neutral-700 transition-all hover:border-neutral-950 hover:bg-neutral-50 disabled:opacity-50"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

function LabelledInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <motion.label
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-2 text-sm font-semibold text-neutral-700"
    >
      {label}
      <motion.span
        whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(47, 158, 116, 0.1)" }}
        className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-500 transition focus-within:border-neutral-950"
      >
        <motion.div
          whileFocus={{ scale: 1.1, color: "#2f9e74" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {icon}
        </motion.div>
        <input
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-950 outline-none placeholder:text-neutral-400"
        />
        {isPassword ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev);
            }}
            className="grid size-8 place-items-center rounded-xl text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </motion.span>
    </motion.label>
  );
}
