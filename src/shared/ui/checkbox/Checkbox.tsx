"use client";

import { useId, type InputHTMLAttributes, type Ref } from "react";

import { cn } from "@/shared/lib";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ label, id, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-2.5 text-xs text-ink",
        "has-disabled:cursor-not-allowed has-disabled:text-ink-disabled",
        className,
      )}
    >
      <span className="relative inline-flex size-[18px] shrink-0">
        <input
          id={inputId}
          type="checkbox"
          className={cn(
            "peer size-full cursor-[inherit] appearance-none rounded-[4px] border border-canvas bg-white transition-colors",
            "checked:border-primary checked:bg-primary",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "disabled:bg-surface-disabled disabled:checked:border-canvas",
          )}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden items-center justify-center text-xs font-bold text-white peer-checked:flex peer-disabled:text-ink-disabled"
        >
          ✓
        </span>
      </span>
      {label}
    </label>
  );
}
