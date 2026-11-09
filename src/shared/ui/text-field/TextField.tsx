"use client";

import { useId, type InputHTMLAttributes, type Ref } from "react";

import { cn } from "@/shared/lib";

type TextFieldSize = "lg" | "md";

const sizeClass: Record<TextFieldSize, string> = {
  lg: "h-[52px] text-sm", // 로그인 ID/PW
  md: "h-[45px] text-xs", // 자막·파일명 등 폼 입력
};

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  /** 값이 있으면 에러 상태로 표시하고 아래에 메시지를 보여준다. */
  error?: string;
  size?: TextFieldSize;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({
  label,
  error,
  size = "lg",
  id,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full rounded-control border bg-white px-4 text-ink outline-none transition-colors",
          "placeholder:text-ink-secondary",
          "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-ink-disabled",
          error
            ? "border-danger"
            : "border-canvas focus:border-primary focus:ring-1 focus:ring-primary",
          sizeClass[size],
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-2xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
