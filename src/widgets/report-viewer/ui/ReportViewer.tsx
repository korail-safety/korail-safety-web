"use client";

import { Fragment, useEffect, useRef } from "react";

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

function HighlightedText({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) {
  const markRef = useRef<HTMLElement>(null);

  // 강조 문장이 보이도록 스크롤
  useEffect(() => {
    markRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [text, highlight]);

  if (!highlight || !text.includes(highlight)) return <>{text}</>;

  const parts = text.split(highlight);
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <mark
              ref={index === 0 ? markRef : undefined}
              className="animate-fade-in rounded-sm bg-highlight px-0.5 text-ink"
            >
              {highlight}
            </mark>
          )}
        </Fragment>
      ))}
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
            <span>이전</span>
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
            <span>다음</span>
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
