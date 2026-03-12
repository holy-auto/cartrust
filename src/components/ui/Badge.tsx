import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-zinc-800 text-zinc-300 border-zinc-700",
  success: "bg-[rgba(16,185,129,0.1)] text-emerald-400 border-emerald-500/30",
  warning: "bg-[rgba(245,158,11,0.1)] text-amber-400 border-amber-500/30",
  danger: "bg-[rgba(239,68,68,0.1)] text-red-400 border-red-500/30",
  info: "bg-[rgba(6,182,212,0.1)] text-cyan-400 border-cyan-500/30",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export default function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
