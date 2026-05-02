"use client";

import { motion } from "framer-motion";
import { Banknote, CreditCard, MapPin, PackageCheck } from "lucide-react";

import { AuthGate } from "@/components/auth/auth-gate";

export default function CheckoutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <AuthGate>
      <main className="bg-[#fafaf8] px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.75fr]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.section
            variants={itemVariants}
            className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"
          >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
            <PackageCheck className="size-4 text-[#2f9e74]" />
            Checkout module shell
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-neutral-950">
            Delivery and payment
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Cart persistence, address capture, COD, and mock bKash order writes
            will be connected after the cart store module.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: MapPin, label: "Address form" },
              { icon: Banknote, label: "Cash on Delivery" },
              { icon: CreditCard, label: "Mock bKash" },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="rounded-[1.5rem] border border-neutral-200 bg-[#fafaf8] p-5 transition"
              >
                <item.icon className="size-5 text-[#2f9e74]" />
                <p className="mt-4 text-sm font-semibold text-neutral-700">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
          </motion.section>

          <motion.aside
            variants={itemVariants}
            className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"
          >
          <h2 className="text-xl font-semibold text-neutral-950">
            Order summary
          </h2>
          <div className="mt-5 rounded-2xl bg-[#f6f4ee] p-4 text-sm leading-6 text-neutral-600">
            Your cart store will populate this area with line items, delivery
            fee, and final payable total.
          </div>
          </motion.aside>
        </motion.div>
    </main>
    </AuthGate>
  );
}
