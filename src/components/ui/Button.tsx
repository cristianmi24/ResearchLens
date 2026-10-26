import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  // Degradado periwinkle → violeta suave con sombra de color: el botón principal "llama" sin gritar.
  primary:
    "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_8px_20px_-8px_rgb(96_76_216/0.7)] hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgb(96_76_216/0.8)]",
  secondary: "bg-pastel-lavender text-brand-700 hover:bg-brand-100",
  ghost: "text-ink-secondary hover:bg-pastel-lavender/70 hover:text-ink-primary",
  outline: "border border-border bg-white/80 text-ink-primary hover:border-brand-300 hover:bg-white",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-ring disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
