import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "md" | "sm" | "xs";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white not-disabled:hover:bg-primary-hover not-disabled:active:bg-navy",
  secondary:
    "border border-canvas bg-white text-ink not-disabled:hover:bg-page not-disabled:active:bg-canvas",
  danger:
    "bg-danger text-white not-disabled:hover:bg-danger-hover not-disabled:active:bg-navy",
};

const sizeClass: Record<ButtonSize, string> = {
  md: "h-[47px] px-10 text-sm",
  sm: "h-8 px-10 text-xs",
  xs: "h-9 min-w-[88px] px-3.5 text-xs", // 입력창 안 보조 버튼
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** 버튼 스타일 클래스. Link 등 button이 아닌 요소를 버튼처럼 보이게 할 때 사용한다. */
export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-control font-bold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-canvas disabled:text-ink-disabled",
    variantClass[variant],
    sizeClass[size],
    className,
  );
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {}

export function Button({
  variant,
  size,
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
