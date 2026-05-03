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
  const { isLoading, user, isAdmin } = useAuth();

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

  if (!user) {
    return (
      <AccessMessage
        title="Sign in required"
        message="Please sign in to access this page."
        actionLabel="Sign in"
        actionHref="/auth"
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <AccessMessage
        title="Admin access required"
        message="You do not have the required permissions to view this workspace. Please contact support if you believe this is an error."
        actionLabel="Go back"
        actionHref="/"
      />
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
