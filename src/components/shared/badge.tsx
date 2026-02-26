"use client";

type BadgeVariant = "green" | "amber" | "red" | "blue" | "gray" | "purple" | "cyan" | "orange";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  amber:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red:    "bg-red-500/15 text-red-400 border-red-500/30",
  blue:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
  gray:   "bg-slate-500/15 text-slate-400 border-slate-500/30",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  cyan:   "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

export function Badge({ children, variant = "gray", pulse = false, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${variantClasses[variant]} ${pulse ? "review-pulse" : ""} ${className}`}>
      {children}
    </span>
  );
}
