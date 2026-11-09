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
  onClose?: () => void;
  className?: string;
}

export function Toast({
  variant = "success",
  message,
  onClose,
  className,
}: ToastProps) {
  const style = variantStyle[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex h-12 w-full max-w-[720px] items-center gap-3 rounded-control px-4 text-white",
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
          onClick={onClose}
          aria-label="알림 닫기"
          className="shrink-0 text-xl leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}
