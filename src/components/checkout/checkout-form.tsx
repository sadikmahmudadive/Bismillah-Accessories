"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  ShoppingBag,
  User,
  Navigation,
} from "lucide-react";
import { FormEvent, useState } from "react";

import dynamic from "next/dynamic";
const MapPicker = dynamic(() => import("@/components/ui/map-picker").then((mod) => mod.MapPicker), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm font-bold">Loading Map...</div>
});

import { useAuth } from "@/components/auth/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import type { PaymentMethod } from "@/types/domain";
import { cn } from "@/lib/utils";

const DELIVERY_FEE_DHAKA = 80;
const DELIVERY_FEE_OUTSIDE = 120;

type CheckoutFormData = {
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  bkashNumber: string;
  bkashTransactionId: string;
};

const emptyForm: CheckoutFormData = {
  customerName: "",
  phone: "",
  address: "",
  paymentMethod: "cash_on_delivery",
  bkashNumber: "",
  bkashTransactionId: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { items, subtotal, clearCart } = useCartStore();
  const [form, setForm] = useState<CheckoutFormData>({
    ...emptyForm,
    customerName: profile?.displayName || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Location states
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Promo state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const discountAmount = appliedPromo?.discountAmount || 0;

  const deliveryFee = form.address.toLowerCase().includes("dhaka")
    ? DELIVERY_FEE_DHAKA
    : DELIVERY_FEE_OUTSIDE;

  const total = subtotal + deliveryFee - discountAmount;

  async function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoError(null);
    setIsValidatingPromo(true);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, subtotal }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Invalid code");
      
      setAppliedPromo({
        code: payload.data.code,
        discountAmount: payload.data.discountAmount,
      });
      setPromoInput("");
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : "Failed to apply code");
    } finally {
      setIsValidatingPromo(false);
    }
  }

  function setField<K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function finalizeOrder(trxId?: string) {
    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Unauthorized");
      const token = await user.getIdToken();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerEmail: user.email,
          phone: form.phone.trim(),
          address: form.address.trim(),
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            imageUrl: item.imageUrl,
            price: item.price,
            quantity: item.quantity,
            variantId: item.variantId,
            variantName: item.variantName,
          })),
          subtotal,
          deliveryFee,
          promoCode: appliedPromo?.code,
          discountAmount,
          total,
          paymentMethod: form.paymentMethod,
          bkashTransactionId: trxId,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Order creation failed");

      clearCart();
      router.push(`/orders/${payload.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGps = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const addr = data.display_name || "";
          setField("address", addr);
        } catch (err) {
          console.error("Geocoding failed", err);
          alert("Could not determine your address. Please enter it manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        alert("Permission denied or location unavailable.");
      }
    );
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be signed in to place an order.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!form.customerName.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("Please fill in all delivery details.");
      return;
    }


    if (
      form.paymentMethod === "bkash" &&
      (!form.bkashNumber.trim() || !form.bkashTransactionId.trim())
    ) {
      setError("Please provide your bKash number and transaction ID.");
      return;
    }

    // Use finalizeOrder for all payment methods
    await finalizeOrder(
      form.paymentMethod === "bkash" ? form.bkashTransactionId.trim() : undefined
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-neutral-100 text-neutral-400">
          <ShoppingBag className="size-7" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">Your cart is empty</h2>
          <p className="mt-1 text-sm text-neutral-500">Add items to your cart before checking out.</p>
        </div>
        <ButtonLink href="/products" showArrow>
          Browse products
        </ButtonLink>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[1fr_0.5fr] lg:items-start"
    >

      {/* Left col: delivery + payment */}
      <div className="grid gap-5">
        {/* Delivery */}
        <motion.section
          variants={itemVariants}
          className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
            <MapPin className="size-4 text-[#2f9e74]" />
            Delivery details
          </div>

          <div className="mt-5 grid gap-4">
            <FormField
              label="Full name"
              icon={<User className="size-4" />}
              value={form.customerName}
              onChange={(v) => setField("customerName", v)}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
            <FormField
              label="Phone number"
              icon={<Phone className="size-4" />}
              value={form.phone}
              onChange={(v) => setField("phone", v)}
              placeholder="01XXXXXXXXX"
              autoComplete="tel"
              required
            />
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-neutral-700">Delivery address</label>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#2f9e74] hover:underline"
                >
                  <MapPin className="size-3.5" />
                  {showMap ? "Hide Map" : "Open Map Picker"}
                </button>
              </div>

              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <MapPicker 
                      onAddressSelect={(addr) => setField("address", addr)}
                      className="mb-4"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <textarea
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="House, road, area, district…"
                  rows={3}
                  required
                  className="w-full rounded-2xl border border-neutral-200 bg-[#fafaf8] p-4 pr-12 text-sm font-medium text-neutral-950 outline-none transition focus:border-neutral-950 focus:bg-white placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  title="Use my current location"
                  onClick={handleGps}
                  disabled={isLocating}
                  className="absolute right-4 top-4 text-neutral-400 hover:text-[#2f9e74] disabled:opacity-50 transition-colors"
                >
                  {isLocating ? <Loader2 className="size-4 animate-spin" /> : <Navigation className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Payment method */}
        <motion.section
          variants={itemVariants}
          className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
            <CreditCard className="size-4 text-[#b8860b]" />
            Payment method
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PaymentOption
              selected={form.paymentMethod === "cash_on_delivery"}
              onSelect={() => setField("paymentMethod", "cash_on_delivery")}
              icon={<Banknote className="size-5 text-[#2f9e74]" />}
              label="Cash on Delivery"
              description="Pay when your order arrives"
            />
            <PaymentOption
              selected={form.paymentMethod === "bkash"}
              onSelect={() => setField("paymentMethod", "bkash")}
              icon={
                <span className="text-base font-bold text-[#e2136e]">b</span>
              }
              label="bKash"
              description="Pay securely with bKash"
            />
          </div>

          <AnimatePresence>
            {form.paymentMethod === "bkash" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="grid gap-4 rounded-2xl border border-[#e2136e]/20 bg-[#e2136e]/5 p-4">
                  <p className="text-xs font-semibold text-[#a50f52]">
                    Send ৳{total.toLocaleString("en-BD")} to{" "}
                    <span className="font-bold">01XXXXXXXXX</span> (Bismillah Accessories)
                    and enter your details below.
                  </p>
                  <FormField
                    label="Your bKash number"
                    icon={<Phone className="size-4" />}
                    value={form.bkashNumber}
                    onChange={(v) => setField("bkashNumber", v)}
                    placeholder="01XXXXXXXXX"
                    required={form.paymentMethod === "bkash"}
                  />
                  <FormField
                    label="Transaction ID"
                    icon={<CheckCircle2 className="size-4" />}
                    value={form.bkashTransactionId}
                    onChange={(v) => setField("bkashTransactionId", v)}
                    placeholder="e.g. 8N6RT4HI9O"
                    required={form.paymentMethod === "bkash"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* Right col: summary + submit */}
      <motion.div
        variants={itemVariants}
        className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
      >
        <h2 className="text-lg font-semibold text-neutral-950">Order summary</h2>

        <div className="mt-4 grid gap-2">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId || "base"}`} className="flex justify-between text-sm text-neutral-600">
              <span className="truncate flex-1 pr-3">
                {item.name} {item.variantName ? `(${item.variantName})` : ""}
                <span className="text-neutral-400"> ×{item.quantity}</span>
              </span>
              <span className="font-semibold text-neutral-800 shrink-0">
                ৳{(item.price * item.quantity).toLocaleString("en-BD")}
              </span>
            </div>
          ))}
        </div>

        <div className="my-4 h-px bg-neutral-100" />

        {/* Promo Code Input */}
        <div className="mb-4">
          {!appliedPromo ? (
            <div className="grid gap-2">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  className="h-10 flex-1 rounded-xl border border-neutral-200 bg-[#fafaf8] px-3 text-sm font-bold outline-none focus:border-neutral-950"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="h-10 rounded-xl px-4"
                  onClick={handleApplyPromo}
                  disabled={isValidatingPromo || !promoInput.trim()}
                >
                  Apply
                </Button>
              </div>
              {promoError && <p className="text-[10px] font-bold text-[#d65f5f]">{promoError}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-[#2f9e74]/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#2f9e74]" />
                <span className="text-xs font-bold text-[#2f9e74]">{appliedPromo.code} Applied</span>
              </div>
              <button 
                type="button" 
                onClick={() => setAppliedPromo(null)}
                className="text-[10px] font-bold text-neutral-500 hover:text-neutral-950 underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-2 text-sm text-neutral-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">৳{subtotal.toLocaleString("en-BD")}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span className="font-semibold">৳{deliveryFee}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-[#d65f5f]">
              <span>Discount</span>
              <span className="font-semibold">-৳{discountAmount.toLocaleString("en-BD")}</span>
            </div>
          )}
          <div className="my-1 h-px bg-neutral-100" />
          <div className="flex justify-between text-base font-semibold text-neutral-950">
            <span>Total</span>
            <span>৳{total.toLocaleString("en-BD")}</span>
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-[#d65f5f]/25 bg-[#d65f5f]/10 px-4 py-3 text-sm font-medium text-[#8f3434]"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" className="mt-5 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Placing order…
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              {form.paymentMethod === "bkash" ? "Pay with bKash" : "Place order"}
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}

// Sub-components

function FormField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-700">
      {label}
      <span className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fafaf8] px-4 py-3 text-neutral-400 transition focus-within:border-neutral-950 focus-within:bg-white">
        {icon}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-950 outline-none placeholder:text-neutral-400"
        />
      </span>
    </label>
  );
}

function PaymentOption({
  selected,
  onSelect,
  icon,
  label,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-[1.5rem] border p-4 text-left transition",
        selected
          ? "border-neutral-950 bg-neutral-950 text-white shadow-lg shadow-neutral-950/15"
          : "border-neutral-200 bg-[#fafaf8] hover:border-neutral-300",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full",
          selected ? "bg-white/15" : "bg-white",
        )}
      >
        {icon}
      </span>
      <div>
        <p className={cn("text-sm font-semibold", selected ? "text-white" : "text-neutral-950")}>
          {label}
        </p>
        <p className={cn("mt-0.5 text-xs", selected ? "text-white/70" : "text-neutral-500")}>
          {description}
        </p>
      </div>
    </motion.button>
  );
}
