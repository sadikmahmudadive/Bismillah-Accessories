"use client";

import { motion } from "framer-motion";
import {
  Boxes,
  LayoutDashboard,
  ReceiptText,
} from "lucide-react";

import { AuthGate } from "@/components/auth/auth-gate";
import { ProductManager } from "@/components/admin/product-manager";

const dashboardCards = [
  {
    icon: ReceiptText,
    title: "Order Management",
    description:
      "Review COD and mock bKash orders, change status, and prepare fulfillment.",
  },
];

export function AdminDashboardShell() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <AuthGate requireAdmin>
      <motion.div
        className="grid gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
                <LayoutDashboard className="size-4 text-[#2f9e74]" />
                Admin workspace
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-normal text-neutral-950">
                Store operations
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                Create and manage Firestore products, upload product images to
                Cloudinary, and prepare the catalog for storefront browsing.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProductManager />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-4 md:grid-cols-1"
        >
          {dashboardCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="grid size-11 place-items-center rounded-full bg-neutral-950 text-white">
                <card.icon className="size-5" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-neutral-950">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {card.description}
              </p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-[2rem] border border-dashed border-neutral-300 bg-[#f6f4ee] p-6"
        >
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-neutral-950">
              <Boxes className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                Next admin module
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Product CRUD forms, image upload route, and orders table will be
                extended with order workflows after the cart and checkout module.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AuthGate>
  );
}
