"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  LayoutDashboard,
  ReceiptText,
  Package,
  Ticket,
} from "lucide-react";

import { AuthGate } from "@/components/auth/auth-gate";
import { OrderManager } from "@/components/admin/order-manager";
import { ProductManager } from "@/components/admin/product-manager";
import { PromoManager } from "@/components/admin/promo-manager";
import { cn } from "@/lib/utils";

type AdminTab = "products" | "orders" | "promos";

export function AdminDashboardShell() {
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

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
      },
    },
  };

  return (
    <AuthGate requireAdmin>
      <motion.div
        className="grid gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="rounded-[2.5rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <LayoutDashboard className="size-3.5 text-[#2f9e74]" />
                Admin Workspace
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
                Store Operations
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
                Manage your product inventory, track customer orders, and handle fulfillment 
                all from one central dashboard. Your data is synced in real-time with Firestore.
              </p>
            </div>

            <div className="flex rounded-2xl bg-neutral-100 p-1.5">
              <TabButton 
                active={activeTab === "products"} 
                onClick={() => setActiveTab("products")}
                icon={Package}
                label="Inventory"
              />
              <TabButton 
                active={activeTab === "orders"} 
                onClick={() => setActiveTab("orders")}
                icon={ReceiptText}
                label="Orders"
              />
              <TabButton 
                active={activeTab === "promos"} 
                onClick={() => setActiveTab("promos")}
                icon={Ticket}
                label="Promos"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div variants={itemVariants}>
          <AnimatePresence mode="wait">
            {activeTab === "products" ? (
              <motion.div
                key="products"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <ProductManager />
              </motion.div>
            ) : activeTab === "orders" ? (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <OrderManager />
              </motion.div>
            ) : (
              <motion.div
                key="promos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <PromoManager />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          variants={itemVariants}
          className="rounded-[2.5rem] border border-dashed border-neutral-300 bg-[#f6f4ee]/50 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-neutral-950 shadow-sm">
              <Boxes className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                System Status
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Firestore & Cloudinary connections are active. All operations are being logged 
                securely. Use the refresh buttons to pull the latest state if needed.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AuthGate>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-[0.85rem] px-5 py-2.5 text-sm font-bold transition-all",
        active 
          ? "bg-white text-neutral-950 shadow-md ring-1 ring-neutral-950/5" 
          : "text-neutral-500 hover:text-neutral-700"
      )}
    >
      <Icon className={cn("size-4", active ? "text-[#2f9e74]" : "text-neutral-400")} />
      {label}
    </button>
  );
}
