import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

type AlertVariant = "info" | "warning" | "error";

const variantStyle: Record<
  AlertVariant,
  { container: string; icon: string; iconColor: string }
> = {
  info: {
    container: "border-info-bg bg-info-bg",
    icon: "i",
    iconColor: "text-primary",
  },
  warning: {
    container: "border-caution-border bg-caution-bg",
    icon: "!",
    iconColor: "text-caution",
  },
  error: {
    container: "border-danger-border bg-danger-bg",
    icon: "×",
    iconColor: "text-danger",
  },
};

export interface AlertProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  /** 하단 버튼 영역 (예: 취소 / 삭제하기) */
  actions?: ReactNode;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  description,
  actions,
  className,
}: AlertProps) {
  const style = variantStyle[variant];

  return (
    <div
      role={variant === "info" ? "status" : "alert"}
      className={cn(
        "flex min-h-24 w-full gap-4 rounded-card border p-4",
        style.container,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "w-5 shrink-0 text-xl leading-none font-bold",
          style.iconColor,
        )}
      >
        {style.icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm font-bold text-ink">{title}</p>
        {description && (
          <p className="text-xs leading-[1.5] text-ink-secondary">
            {description}
          </p>
        )}
        {actions && <div className="mt-1 flex gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}
