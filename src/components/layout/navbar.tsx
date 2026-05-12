"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/products", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { isLoading, isAdmin, profile, signOut, user } = useAuth();
  const cartCount = useCartStore((state) => state.itemCount);
  const favCount = useFavoritesStore((state) => state.itemCount);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-3xl transition-all duration-300">
      <div className="mx-auto flex h-20 w-full items-center justify-between px-6 sm:px-12 lg:px-24">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-4 text-sm font-bold text-neutral-950"
          aria-label="Bismillah Accessories home"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex size-11 items-center justify-center rounded-2xl bg-neutral-950 text-xs font-black text-white shadow-2xl shadow-neutral-950/20"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            BA
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-[900] tracking-tighter sm:text-xl">
              BISMILLAH
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2f9e74] sm:text-[10px]">
              Accessories
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-1 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] lg:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                )}
              >
                {item.label}
                {item.href === "/cart" && cartCount > 0 && !isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#2f9e74] text-[9px] font-black text-white"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                pathname === "/admin"
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              )}
            >
              <ShieldCheck className="size-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Search */}
          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                key="search-box"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 180 }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
                    }
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                  placeholder="Search products…"
                  className="h-10 w-full rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-neutral-950"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className={cn(
              "grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:text-neutral-950 hover:shadow-md",
              searchOpen && "border-neutral-950 bg-neutral-950 text-white"
            )}
          >
            {searchOpen ? (
              <X className="size-4" />
            ) : (
              <Search className="size-4" />
            )}
          </button>

          {/* Account */}
          <Link
            href={user ? "/profile" : "/auth"}
            aria-label="Account"
            title={user ? profile?.displayName || user.email || "Account" : "Sign in"}
            className="grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:text-neutral-950 hover:shadow-md overflow-hidden"
          >
            {user && profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.classList.add('hidden');
                }}
              />
            ) : null}
            <User className={cn("size-4", user && profile?.photoUrl ? "hidden" : "grid")} />
          </Link>

          {/* Favorites */}
          <Link
            href="/favorites"
            aria-label={`Favorites (${favCount} items)`}
            title="Favorites"
            className="relative grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:text-neutral-950 hover:shadow-md"
          >
            <Heart className="size-4" />
            <AnimatePresence>
              {favCount > 0 && (
                <motion.span
                  key="fav-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#d65f5f] text-[10px] font-black text-white shadow-sm"
                >
                  {favCount > 99 ? "99+" : favCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Cart (${cartCount} items)`}
            title={`Cart — ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
            className="relative grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:text-neutral-950 hover:shadow-md"
          >
            <ShoppingBag className="size-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key="cart-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#2f9e74] text-[10px] font-black text-white shadow-sm"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Sign out */}
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={isLoading}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:-translate-y-0.5 hover:text-neutral-950 disabled:opacity-50"
            >
              Sign out
            </button>
          ) : null}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile favorites */}
          <Link
            href="/favorites"
            aria-label="Favorites"
            className="relative grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-950"
          >
            <Heart className="size-4" />
            {favCount > 0 && (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#d65f5f] text-[9px] font-black text-white">
                {favCount}
              </span>
            )}
          </Link>

          {/* Mobile cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-950"
          >
            <ShoppingBag className="size-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#2f9e74] text-[9px] font-black text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-950"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsOpen((v) => !v)}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="size-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="size-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-neutral-200 bg-white shadow-xl lg:hidden"
          >
            <div className="grid gap-1.5 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    pathname === item.href
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                  {item.href === "/cart" && cartCount > 0 && (
                    <span className="ml-auto grid size-5 place-items-center rounded-full bg-[#2f9e74] text-[10px] font-black text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheck className="size-4" />
                  Admin dashboard
                </Link>
              )}
              <div className="mt-2 grid gap-2">
                <ButtonLink href="/products" className="w-full" onClick={() => setIsOpen(false)}>
                  Shop now
                </ButtonLink>
                <Link
                  href={user ? "/profile" : "/auth"}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50",
                    pathname === (user ? "/profile" : "/auth") && "border-neutral-950 bg-neutral-950 text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="grid size-6 place-items-center rounded-full bg-neutral-100 overflow-hidden text-neutral-600">
                    {user && profile?.photoUrl ? (
                      <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="size-3.5" />
                    )}
                  </div>
                  {user ? profile?.displayName || "My account" : "Sign in"}
                </Link>
                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      void signOut();
                    }}
                    disabled={isLoading}
                    className="rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
