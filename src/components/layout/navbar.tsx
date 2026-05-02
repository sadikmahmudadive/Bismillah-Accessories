"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useCartStore } from "@/lib/store/cart";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/products", label: "Shop" },
  { href: "/products", label: "Collections" },
  { href: "/checkout", label: "Checkout" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, profile, signOut, user } = useAuth();
  const cartCount = useCartStore((state) => state.itemCount);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(250,250,248,0.78)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 text-sm font-semibold text-neutral-950"
          aria-label="Bismillah Accessories home"
        >
          <span className="grid size-9 place-items-center rounded-full bg-neutral-950 text-sm font-bold text-white shadow-lg shadow-neutral-950/20 transition group-hover:scale-105">
            BA
          </span>
          <span className="hidden sm:inline">Bismillah Accessories</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-white/65 p-1 shadow-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <IconButton label="Search">
            <Search className="size-4" />
          </IconButton>
          <Link
            href="/auth"
            aria-label="Account"
            title={user ? profile?.displayName || user.email || "Account" : "Account"}
            className="grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:text-neutral-950 hover:shadow-md"
          >
            <User className="size-4" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            title={`Cart (${cartCount} ${cartCount === 1 ? "item" : "items"})`}
            className="relative grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:text-neutral-950 hover:shadow-md"
          >
            <ShoppingBag className="size-4" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#2f9e74] text-[10px] font-bold text-white"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </motion.span>
            )}
          </Link>
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={isLoading}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:-translate-y-0.5 hover:text-neutral-950 disabled:opacity-60"
            >
              Sign out
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-950 md:hidden"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-neutral-200 bg-white px-4 py-4 shadow-xl md:hidden"
          >
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <ButtonLink href="/products" className="mt-2 w-full">
                Start shopping
              </ButtonLink>
              <ButtonLink href="/auth" variant="secondary" className="w-full">
                {user ? "Account" : "Sign in"}
              </ButtonLink>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    void signOut();
                  }}
                  disabled={isLoading}
                  className="rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700"
                >
                  Sign out
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function IconButton({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:text-neutral-950 hover:shadow-md",
        className,
      )}
    >
      {children}
    </button>
  );
}
