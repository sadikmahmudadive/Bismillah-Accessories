import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-neutral-950 text-white shadow-[0_16px_40px_rgba(18,18,18,0.18)] hover:bg-neutral-800 focus-visible:outline-neutral-950",
  secondary:
    "border border-neutral-200 bg-white/80 text-neutral-950 shadow-sm backdrop-blur hover:border-neutral-300 hover:bg-white focus-visible:outline-neutral-500",
  ghost:
    "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-neutral-400",
} as const;

const sizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  showArrow?: boolean;
};

const MotionLink = motion.create(Link);

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(buttonBase, variants[variant], sizes[size], className)}
      {...(props as any)}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  showArrow = false,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <MotionLink
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(buttonBase, variants[variant], sizes[size], className)}
      {...(props as any)}
    >
      {children}
      {showArrow ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
    </MotionLink>
  );
}
