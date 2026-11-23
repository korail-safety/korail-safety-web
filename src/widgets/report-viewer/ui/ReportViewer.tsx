"use client";

import { useEffect, useRef, useState } from "react";

import { useReportPage, type SourceRect } from "@/entities/video";
import { cn } from "@/shared/lib";
import { Button, ChevronLeftIcon } from "@/shared/ui";

interface ReportViewerProps {
  videoId: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 이 페이지에서 강조할 문장 (AI가 알려준 근거 문장) */
  highlight?: string;
  /** 강조할 문장의 위치. 있으면 페이지 이미지 위에 박스로 표시 */
  highlightRects?: SourceRect[];
}

type ViewMode = "image" | "text";

/** 원문에서 근거 위치를 못 찾았을 때 AI가 참고한 문장만 따로 보여준다 */
function SourceQuote({ text }: { text: string }) {
  return (
    <div className="mb-4 rounded-sm border-l-2 border-primary bg-white px-3 py-2 text-[13px] leading-relaxed whitespace-normal">
      <p className="text-xs font-bold text-ink-secondary">AI가 참고한 문장</p>
      <p className="mt-1 text-ink">“{text}”</p>
    </div>
  );
}

/** 페이지 이미지 + 근거 위치에 반투명 박스 */
function PageImage({
  src,
  pageNo,
  rects,
  quote,
}: {
  src: string;
  pageNo: number;
  rects?: SourceRect[];
  quote?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const firstRectRef = useRef<HTMLDivElement>(null);

  // 이미지가 다 그려진 뒤에 박스 위치로 스크롤 (그 전에는 높이가 0이라 위치가 틀림)
  useEffect(() => {
    if (loaded) {
      firstRectRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [loaded, rects]);

  return (
    <>
      {!rects?.length && quote && <SourceQuote text={quote} />}
      <div className="relative">
        {/* 서버가 주는 S3 임시 주소라 next/image 최적화 대상이 아님 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`원문 ${pageNo}페이지`}
          onLoad={() => setLoaded(true)}
          className={cn(
            "block w-full rounded-sm bg-white shadow-sm transition-opacity",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
        {loaded &&
          rects?.map((rect, index) => (
            <div
              key={index}
              ref={index === 0 ? firstRectRef : undefined}
              aria-hidden
              className="pointer-events-none absolute animate-fade-in rounded-[2px] bg-highlight-mark/50 mix-blend-multiply"
              style={{
                left: `${rect.x * 100}%`,
                top: `${rect.y * 100}%`,
                width: `${rect.width * 100}%`,
                height: `${rect.height * 100}%`,
              }}
            />
          ))}
      </div>
    </>
  );
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
        {highlight && <SourceQuote text={highlight} />}
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
  highlightRects,
}: ReportViewerProps) {
  const { data, isError, isFetching } = useReportPage(videoId, page);
  // 기본은 이미지 보기. 페이지 이미지가 없으면(예전 데이터) 텍스트로만 보여준다
  const [mode, setMode] = useState<ViewMode>("image");
  const viewMode: ViewMode = data?.imageUrl ? mode : "text";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-ink">원문 보기</h2>
          {data?.imageUrl && (
            <div
              role="group"
              aria-label="원문 보기 방식"
              className="flex rounded-control bg-canvas p-0.5 text-xs"
            >
              {(
                [
                  ["image", "원본"],
                  ["text", "텍스트"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={viewMode === value}
                  onClick={() => setMode(value)}
                  className={cn(
                    "cursor-pointer rounded-[6px] px-2.5 py-1 transition-colors",
                    viewMode === value
                      ? "bg-white font-bold text-ink shadow-sm"
                      : "text-ink-secondary hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
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
        className={cn(
          "mt-4 h-[480px] flex-1 overflow-y-auto rounded-control bg-canvas/70 text-[13px] leading-relaxed text-ink transition-opacity [scrollbar-gutter:stable] lg:h-auto lg:min-h-0",
          viewMode === "image" ? "p-3" : "p-5 whitespace-pre-wrap",
        )}
        style={{ opacity: isFetching ? 0.6 : 1 }}
      >
        {isError ? (
          <p className="text-danger">원문을 불러오지 못했습니다.</p>
        ) : data && viewMode === "image" && data.imageUrl ? (
          <PageImage
            key={data.imageUrl}
            src={data.imageUrl}
            pageNo={data.pageNo}
            rects={highlightRects}
            quote={highlight}
          />
        ) : data ? (
          <HighlightedText text={data.text} highlight={highlight} />
        ) : (
          <p className="text-ink-secondary">원문을 불러오는 중...</p>
        )}
      </div>
    </div>
  );
}
