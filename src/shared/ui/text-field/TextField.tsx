"use client";

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

import { cn } from "@/shared/lib";

import { FieldError } from "../field-error";

type TextFieldSize = "lg" | "md";

const sizeClass: Record<TextFieldSize, string> = {
  lg: "h-[52px] text-sm", // 로그인 ID/PW
  md: "h-[45px] text-xs", // 회원가입·자막 등 폼 입력
};

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  /** 값이 있으면 에러 상태로 표시하고 아래에 메시지를 보여준다. */
  error?: string;
  /** false면 에러가 없을 때 메시지 자리를 비워두지 않는다. (기본 true) */
  reserveErrorSpace?: boolean;
  size?: TextFieldSize;
  /** 입력창 오른쪽 안에 들어가는 요소 (예: 중복 확인 버튼) */
  endAdornment?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({
  label,
  error,
  reserveErrorSpace = true,
  size = "lg",
  endAdornment,
  id,
  className,
  disabled,
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
      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-control border bg-white px-4 transition-[color,background-color,border-color,box-shadow]",
          error
            ? "border-danger"
            : "border-canvas focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
          disabled && "cursor-not-allowed bg-surface-disabled",
          sizeClass[size],
          !!endAdornment && "pr-2",
        )}
      >
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-ink outline-none",
            "placeholder:text-ink-secondary",
            "disabled:cursor-not-allowed disabled:text-ink-disabled",
          )}
          {...props}
        />
        {endAdornment}
      </div>
      <FieldError
        id={errorId}
        message={error}
        reserveSpace={reserveErrorSpace}
      />
    </div>
  );
}
