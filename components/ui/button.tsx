import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "inverse";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-stone-800 text-white hover:bg-stone-700 focus-visible:ring-stone-500",
  secondary:
    "bg-stone-100 text-stone-800 hover:bg-stone-200 focus-visible:ring-stone-400",
  outline:
    "border border-stone-300 text-stone-700 hover:bg-stone-50 focus-visible:ring-stone-400",
  ghost: "text-stone-600 hover:bg-stone-100 focus-visible:ring-stone-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  inverse:
    "bg-white text-stone-800 hover:bg-stone-100 focus-visible:ring-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
);

Button.displayName = "Button";
