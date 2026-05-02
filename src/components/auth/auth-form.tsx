"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, UserRound } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm() {
  const router = useRouter();
  const { authError, clearAuthError, isLoading, signIn, signUp, user, profile } =
    useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";
  const title = isSignUp ? "Create your account" : "Welcome back";
  const subtitle = isSignUp
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
    <motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-xl shadow-neutral-950/5 sm:p-6"
    >
      <div className="rounded-[1.5rem] bg-[#f6f4ee] p-5">
        <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1">
          {(["sign-in", "sign-up"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMode(item);
                setLocalError(null);
                clearAuthError();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                mode === item
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:text-neutral-950",
              )}
            >
              {item === "sign-in" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-3xl font-semibold tracking-normal text-neutral-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4">
        {isSignUp ? (
          <LabelledInput
            icon={<UserRound className="size-4" />}
            label="Name"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Customer name"
            autoComplete="name"
          />
        ) : null}

        <LabelledInput
          icon={<Mail className="size-4" />}
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <LabelledInput
          icon={<Lock className="size-4" />}
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete={isSignUp ? "new-password" : "current-password"}
        />
      </div>

      {localError || authError ? (
        <p className="mt-4 rounded-2xl border border-[#d65f5f]/25 bg-[#d65f5f]/10 px-4 py-3 text-sm font-medium text-[#8f3434]">
          {localError || authError}
        </p>
      ) : null}

      <Button type="submit" className="mt-5 w-full" disabled={isLoading}>
        {isLoading ? "Working..." : isSignUp ? "Create account" : "Sign in"}
      </Button>
    </motion.form>
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
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-950 outline-none placeholder:text-neutral-400"
        />
      </motion.span>
    </motion.label>
  );
}
