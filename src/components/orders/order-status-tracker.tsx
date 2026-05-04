"use client";

import { motion } from "framer-motion";
import { 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  LucideIcon,
  XCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

interface StatusStep {
  id: OrderStatus;
  label: string;
  icon: LucideIcon;
  description: string;
}

const STEPS: StatusStep[] = [
  { id: "pending", label: "Pending", icon: Clock, description: "Order received" },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2, description: "Verified & accepted" },
  { id: "processing", label: "Processing", icon: Package, description: "Preparing items" },
  { id: "shipped", label: "Shipped", icon: Truck, description: "On the way" },
  { id: "delivered", label: "Delivered", icon: MapPin, description: "Order received" },
];

interface OrderStatusTrackerProps {
  status: OrderStatus;
}

export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  if (status === "cancelled") {
    return (
      <div className="rounded-[2.5rem] border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-100 text-red-600">
          <XCircle className="size-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-red-950">Order Cancelled</h2>
        <p className="mt-1 text-sm text-red-600/80">This order has been cancelled and will not be processed.</p>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === status);
  const progressPercent = (currentStepIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="relative w-full py-12">
      {/* Progress Bar Background */}
      <div className="absolute left-0 top-[4.5rem] h-1.5 w-full rounded-full bg-neutral-100" />
      
      {/* Animated Progress Fill */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="absolute left-0 top-[4.5rem] h-1.5 rounded-full bg-gradient-to-r from-[#2f9e74] to-[#257a5a] shadow-[0_0_15px_rgba(47,158,116,0.4)]"
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Icon Node */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isCompleted || isActive ? "#2f9e74" : "#ffffff",
                  color: isCompleted || isActive ? "#ffffff" : "#a3a3a3",
                  borderColor: isActive ? "#2f9e74" : isCompleted ? "#2f9e74" : "#e5e5e5"
                }}
                className={cn(
                  "z-10 grid size-12 place-items-center rounded-full border-2 text-sm shadow-sm transition-all duration-500",
                  isActive && "shadow-[0_0_20px_rgba(47,158,116,0.3)] ring-4 ring-[#2f9e74]/10"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <Icon className={cn("size-5", isActive && "animate-pulse")} />
                )}
              </motion.div>

              {/* Label & Description */}
              <div className="mt-4 text-center">
                <p className={cn(
                  "text-xs font-black uppercase tracking-widest transition-colors duration-500",
                  isActive ? "text-neutral-950" : isCompleted ? "text-[#2f9e74]" : "text-neutral-400"
                )}>
                  {step.label}
                </p>
                <motion.p 
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                  className="mt-1 max-w-[100px] text-[10px] font-medium leading-tight text-neutral-500"
                >
                  {step.description}
                </motion.p>
              </div>

              {/* Liquid Pulse Effect for Active Step */}
              {isActive && (
                <motion.div
                  layoutId="pulse"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute top-0 size-12 rounded-full bg-[#2f9e74]/20"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
