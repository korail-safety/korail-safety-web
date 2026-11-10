import { cn } from "@/shared/lib";

export interface ProgressBarProps {
  /** 0 ~ 100 */
  value: number;
  label?: string;
  /** 진행 중임을 보여주는 빛 효과 */
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  animated,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label}
      className={cn(
        "h-1 w-full overflow-hidden rounded-full bg-canvas",
        className,
      )}
    >
      <div
        className="relative h-full overflow-hidden rounded-full bg-primary transition-[width] duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      >
        {animated && (
          <span className="absolute inset-y-0 left-0 w-2/5 animate-shimmer bg-linear-to-r from-transparent via-white/50 to-transparent" />
        )}
      </div>
    </div>
  );
}
