import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

export type BadgeTone = "info" | "success" | "warning" | "danger" | "neutral";

const toneClass: Record<BadgeTone, string> = {
  info: "bg-info-bg text-primary",
  success: "bg-success-bg text-success",
  warning: "bg-caution-bg text-caution",
  danger: "bg-danger-bg text-danger",
  neutral: "bg-canvas text-ink-secondary",
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/** Figma StatusBadge. 상태 라벨을 둥근 알약 모양으로 표시한다. */
export function Badge({ tone = "info", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[26px] min-w-[88px] items-center justify-center rounded-[12px] px-2.5 text-2xs whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
