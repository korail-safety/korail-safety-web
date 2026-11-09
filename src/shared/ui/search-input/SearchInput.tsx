"use client";

import type { InputHTMLAttributes, Ref } from "react";

import { cn } from "@/shared/lib";

import { SearchIcon } from "../icons";

export interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value"
> {
  value: string;
  onClear?: () => void;
  ref?: Ref<HTMLInputElement>;
}

export function SearchInput({
  value,
  onClear,
  placeholder = "검색",
  className,
  ...props
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-[300px] items-center gap-[15px] rounded-control border border-canvas bg-white px-[15px]",
        "focus-within:border-primary",
        className,
      )}
    >
      <SearchIcon className="shrink-0 text-ink-tertiary" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-tertiary [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="검색어 지우기"
          className="shrink-0 text-2xs text-ink-tertiary"
        >
          ✕
        </button>
      )}
    </div>
  );
}
