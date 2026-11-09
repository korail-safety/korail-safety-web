"use client";

import { useId, type Ref, type TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  error,
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
          "w-full resize-none rounded-control border bg-white px-4 py-[15px] text-xs leading-[1.5] text-ink outline-none transition-colors",
          "placeholder:text-ink-secondary",
          "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-ink-disabled",
          error
            ? "border-danger"
            : "border-canvas focus:border-primary focus:ring-1 focus:ring-primary",
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
