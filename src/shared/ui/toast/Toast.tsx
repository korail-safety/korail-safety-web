"use client";

import { useState } from "react";

import { cn } from "@/shared/lib";

type ToastVariant = "success" | "error";

const variantStyle: Record<ToastVariant, { container: string; icon: string }> =
  {
    success: { container: "bg-navy", icon: "✓" },
    error: { container: "bg-danger", icon: "!" },
  };

export interface ToastProps {
  variant?: ToastVariant;
  message: string;
  /** 닫기 버튼을 누르면 사라지는 애니메이션이 끝난 뒤 호출된다. */
  onClose?: () => void;
  className?: string;
}

export function Toast({
  variant = "success",
  message,
  onClose,
  className,
}: ToastProps) {
  const [leaving, setLeaving] = useState(false);
  const style = variantStyle[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      onAnimationEnd={() => {
        if (leaving) onClose?.();
      }}
      className={cn(
        "flex h-12 w-full max-w-[720px] items-center gap-3 rounded-control px-4 text-white",
        leaving ? "animate-fade-out" : "animate-fade-in",
        style.container,
        className,
      )}
    >
      <span aria-hidden="true" className="shrink-0 text-base font-bold">
        {style.icon}
      </span>
      <p className="min-w-0 flex-1 truncate text-xs">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={() => setLeaving(true)}
          aria-label="알림 닫기"
          className="shrink-0 cursor-pointer text-xl leading-none opacity-80 transition-opacity hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
