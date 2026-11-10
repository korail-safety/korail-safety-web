import { Fragment } from "react";

import { cn } from "@/shared/lib";

interface AppTopBarProps {
  /** 예: ["홈", "대시보드"], ["① 업로드", "② 보고서 분석", ...] */
  items: readonly string[];
  /** 강조할 항목 순서 (영상 제작 단계 표시용). 없으면 강조 없음 */
  currentIndex?: number;
}

export function AppTopBar({ items, currentIndex }: AppTopBarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center overflow-x-auto border-b border-canvas bg-white px-5 lg:h-[66px] lg:px-[39px]">
      <nav aria-label="현재 위치">
        <ol className="flex items-center gap-2 text-xs whitespace-nowrap text-ink-secondary">
          {items.map((item, index) => (
            <Fragment key={`${item}-${index}`}>
              {index > 0 && <li aria-hidden="true">›</li>}
              <li
                aria-current={index === currentIndex ? "step" : undefined}
                className={cn(index === currentIndex && "font-bold text-ink")}
              >
                {item}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
    </header>
  );
}
