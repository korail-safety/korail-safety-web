"use client";

import { useEffect, useRef } from "react";

import { useReportPage } from "@/entities/video";
import { Button, ChevronLeftIcon } from "@/shared/ui";

interface ReportViewerProps {
  videoId: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 이 페이지에서 강조할 문장 */
  highlight?: string;
}

/**
 * 원문에서 강조 문장의 위치를 찾는다.
 * AI가 준 문장은 원문과 띄어쓰기·줄바꿈이 다를 수 있어서 공백은 무시하고 비교한다.
 */
function findHighlight(text: string, highlight: string) {
  const chars = [...highlight.replace(/\s+/g, "")];
  if (chars.length === 0) return null;
  const pattern = chars
    .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s*");
  const match = new RegExp(pattern).exec(text);
  return match
    ? { start: match.index, end: match.index + match[0].length }
    : null;
}

function HighlightedText({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) {
  const markRef = useRef<HTMLElement>(null);
  const range = highlight ? findHighlight(text, highlight) : null;

  // 강조 문장이 보이도록 스크롤
  useEffect(() => {
    markRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [text, highlight]);

  if (!text.trim()) {
    return (
      <p className="text-ink-secondary">
        텍스트를 추출할 수 없는 페이지입니다. (스캔한 문서 등)
      </p>
    );
  }

  if (!range) {
    return (
      <>
        {highlight && (
          // 원문에서 같은 문장을 찾지 못하면 AI가 참고한 문장만 따로 보여준다
          <div className="mb-4 rounded-sm border-l-2 border-primary bg-white px-3 py-2 whitespace-normal">
            <p className="text-xs font-bold text-ink-secondary">
              AI가 참고한 문장
            </p>
            <p className="mt-1 text-ink">“{highlight}”</p>
          </div>
        )}
        {text}
      </>
    );
  }

  return (
    <>
      {text.slice(0, range.start)}
      <mark
        ref={markRef}
        className="animate-fade-in rounded-sm bg-highlight px-0.5 text-ink"
      >
        {text.slice(range.start, range.end)}
      </mark>
      {text.slice(range.end)}
    </>
  );
}

/** 원문 보고서를 페이지 단위로 보여준다 */
export function ReportViewer({
  videoId,
  page,
  totalPages,
  onPageChange,
  highlight,
}: ReportViewerProps) {
  const { data, isError, isFetching } = useReportPage(videoId, page);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">원문 보기</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="items-center h-9 gap-1.5 px-3 text-[13px]"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon width={7} height={10} />
            <span className="mb-0.5">이전</span>
          </Button>
          <span className="min-w-12 text-center text-xs text-ink-secondary tabular-nums">
            {page}/{totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="items-center h-9 gap-1.5 px-3 text-[13px]"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <span className="mb-0.5">다음</span>
            <ChevronLeftIcon width={7} height={10} className="rotate-180" />
          </Button>
        </div>
      </div>

      <div
        className="mt-4 min-h-[280px] flex-1 overflow-y-auto lg:min-h-0 rounded-control bg-canvas/70 p-5 text-[13px] leading-relaxed whitespace-pre-wrap text-ink transition-opacity"
        style={{ opacity: isFetching ? 0.6 : 1 }}
      >
        {isError ? (
          <p className="text-danger">원문을 불러오지 못했습니다.</p>
        ) : data ? (
          <HighlightedText text={data.text} highlight={highlight} />
        ) : (
          <p className="text-ink-secondary">원문을 불러오는 중...</p>
        )}
      </div>
    </div>
  );
}
