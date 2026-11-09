import { cn } from "@/shared/lib";

export interface FieldErrorProps {
  id?: string;
  message?: string;
  /** 메시지가 없어도 자리를 차지해 에러 발생 시 레이아웃이 밀리지 않게 한다. */
  reserveSpace?: boolean;
  className?: string;
}

/** 입력 필드 아래 에러 문구 (10px). 기본적으로 한 줄 높이를 항상 확보한다. */
export function FieldError({
  id,
  message,
  reserveSpace = true,
  className,
}: FieldErrorProps) {
  if (!message && !reserveSpace) return null;

  return (
    <p
      id={id}
      aria-live="polite"
      className={cn("h-3 truncate text-2xs leading-3 text-danger", className)}
    >
      {message}
    </p>
  );
}
