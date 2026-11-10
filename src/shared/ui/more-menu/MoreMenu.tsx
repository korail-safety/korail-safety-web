"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib";

export interface MoreMenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
}

export interface MoreMenuProps {
  items: MoreMenuItem[];
  /** 스크린리더용 버튼 이름 */
  label?: string;
  className?: string;
}

/** "⋯" 버튼을 누르면 열리는 작은 메뉴 */
export function MoreMenu({
  items,
  label = "더보기",
  className,
}: MoreMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          // 카드 전체 클릭(상세 이동)으로 번지지 않게
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink transition-colors hover:bg-black/5"
      >
        <svg
          width="14"
          height="4"
          viewBox="0 0 14 4"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="7" cy="2" r="1.5" />
          <circle cx="12" cy="2" r="1.5" />
        </svg>
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute top-[calc(100%+4px)] right-0 z-20 min-w-[142px] animate-fade-in overflow-hidden rounded-control border border-canvas bg-white shadow-lg"
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex w-full cursor-pointer px-3 py-2.5 text-left text-xs transition-colors hover:bg-navy hover:text-white",
                  item.danger ? "text-danger" : "text-ink",
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
