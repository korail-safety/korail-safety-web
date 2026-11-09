"use client";

import { useId, type Ref, type TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

import { FieldError } from "../field-error";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  /** false면 에러가 없을 때 메시지 자리를 비워두지 않는다. (기본 true) */
  reserveErrorSpace?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  error,
  reserveErrorSpace = true,
  id,
  rows = 4,
  className,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-bold text-ink">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full resize-none rounded-control border bg-white px-4 py-[15px] text-xs leading-[1.5] text-ink outline-none transition-[color,background-color,border-color,box-shadow]",
          "placeholder:text-ink-secondary",
          "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-ink-disabled",
          error
            ? "border-danger"
            : "border-canvas focus:border-primary focus:ring-1 focus:ring-primary",
        )}
        {...props}
      />
      <FieldError
        id={errorId}
        message={error}
        reserveSpace={reserveErrorSpace}
      />
    </div>
  );
}
