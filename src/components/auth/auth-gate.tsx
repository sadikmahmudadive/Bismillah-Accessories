"use client";

import { ShieldAlert } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";

export function AuthGate({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { authError, isAdmin, isLoading, signOut, user } = useAuth();

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto size-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />
        <p className="mt-4 text-sm font-semibold text-neutral-600">
          Checking account access...
        </p>
      </div>
    );
  }

  if (authError && !user) {
    return (
      <AccessMessage
        title="Firebase setup needed"
        message={authError}
        actionLabel="Open auth page"
        actionHref="/auth"
      />
    );
  }

  if (!user) {
    return (
      <AccessMessage
        title="Sign in required"
        message="Admin tools are protected. Sign in first, then assign the admin role in Firestore for trusted store operators."
        actionLabel="Sign in"
        actionHref="/auth"
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#d65f5f]/10 text-[#d65f5f]">
            <ShieldAlert className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-950">
              Admin role required
            </h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Your account is signed in, but the Firestore profile role is not
              set to admin yet.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => void signOut()}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

function AccessMessage({
  title,
  message,
  actionLabel,
  actionHref,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f6f4ee] text-neutral-950">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-neutral-950">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{message}</p>
          <ButtonLink href={actionHref} className="mt-4">
            {actionLabel}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
