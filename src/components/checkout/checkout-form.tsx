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
} from "lucide-react";
import { FormEvent, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import type { PaymentMethod } from "@/types/domain";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 99;

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

  const total = subtotal + DELIVERY_FEE;

  function setField<K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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
      form.paymentMethod === "bkash_mock" &&
      (!form.bkashNumber.trim() || !form.bkashTransactionId.trim())
    ) {
      setError("Please provide your bKash number and transaction ID.");
      return;
    }

    setIsSubmitting(true);

    try {
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
          })),
          subtotal,
          deliveryFee: DELIVERY_FEE,
          total,
          paymentMethod: form.paymentMethod,
          bkashTransactionId:
            form.paymentMethod === "bkash_mock"
              ? form.bkashTransactionId.trim()
              : undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to place order. Please try again.");
      }

      clearCart();
      router.push(`/orders/${payload.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
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
          className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"
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
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Delivery address
              <textarea
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="House, road, area, district…"
                rows={3}
                required
                className="rounded-2xl border border-neutral-200 bg-[#fafaf8] p-4 text-sm font-medium text-neutral-950 outline-none transition focus:border-neutral-950 placeholder:text-neutral-400"
              />
            </label>
          </div>
        </motion.section>

        {/* Payment method */}
        <motion.section
          variants={itemVariants}
          className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"
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
              selected={form.paymentMethod === "bkash_mock"}
              onSelect={() => setField("paymentMethod", "bkash_mock")}
              icon={
                <span className="text-base font-bold text-[#e2136e]">b</span>
              }
              label="bKash"
              description="Mobile payment (simulated)"
            />
          </div>

          <AnimatePresence>
            {form.paymentMethod === "bkash_mock" && (
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
                    required={form.paymentMethod === "bkash_mock"}
                  />
                  <FormField
                    label="Transaction ID"
                    icon={<CheckCircle2 className="size-4" />}
                    value={form.bkashTransactionId}
                    onChange={(v) => setField("bkashTransactionId", v)}
                    placeholder="e.g. 8N6RT4HI9O"
                    required={form.paymentMethod === "bkash_mock"}
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
            <div key={item.productId} className="flex justify-between text-sm text-neutral-600">
              <span className="truncate flex-1 pr-3">
                {item.name}
                <span className="text-neutral-400"> ×{item.quantity}</span>
              </span>
              <span className="font-semibold text-neutral-800 shrink-0">
                ৳{(item.price * item.quantity).toLocaleString("en-BD")}
              </span>
            </div>
          ))}
        </div>

        <div className="my-4 h-px bg-neutral-100" />

        <div className="grid gap-2 text-sm text-neutral-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">৳{subtotal.toLocaleString("en-BD")}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span className="font-semibold">৳{DELIVERY_FEE}</span>
          </div>
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
              Place order
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
