import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "md" | "sm";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white active:bg-navy",
  secondary: "border border-canvas bg-white text-ink active:bg-canvas",
  danger: "bg-danger text-white active:brightness-90",
};

const sizeClass: Record<ButtonSize, string> = {
  md: "h-[47px] px-10 text-sm",
  sm: "h-8 px-10 text-xs",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-control font-bold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-canvas disabled:text-ink-disabled",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
}
