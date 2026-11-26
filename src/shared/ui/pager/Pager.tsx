import { cn } from "@/shared/lib";

import { Button } from "../button";
import { ChevronLeftIcon } from "../icons";

interface PagerProps {
  /** 지금 보고 있는 번호 (1부터) */
  page: number;
  /** 전체 개수. 0이면 버튼이 모두 비활성 */
  total: number;
  onChange: (page: number) => void;
  /** 화면 읽기 프로그램용 이름. 예: "원문 페이지", "장면" */
  label?: string;
  className?: string;
}

/** 이전 · 1/N · 다음 (원문 보기, 스토리보드 장면 넘기기에서 같이 쓴다) */
export function Pager({ page, total, onChange, label, className }: PagerProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex items-center gap-2", className)}
    >
      <Button
        variant="secondary"
        size="sm"
        className="h-9 items-center gap-1.5 px-3 text-[13px]"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeftIcon width={7} height={10} />
        <span className="mb-0.5">이전</span>
      </Button>
      <span className="min-w-12 text-center text-xs text-ink-secondary tabular-nums">
        {total > 0 ? `${page}/${total}` : "-"}
      </span>
      <Button
        variant="secondary"
        size="sm"
        className="h-9 items-center gap-1.5 px-3 text-[13px]"
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
      >
        <span className="mb-0.5">다음</span>
        <ChevronLeftIcon width={7} height={10} className="rotate-180" />
      </Button>
    </div>
  );
}
