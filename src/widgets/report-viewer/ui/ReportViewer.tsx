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
  /** 이 페이지의 근거 위치. 페이지 이미지 위에 박스로 표시 */
  highlightRects?: SourceRect[];
  /** 이 페이지의 근거 문장들. 이미지 위에 항상 보여준다 */
  highlightQuotes?: string[];
}

/**
 * 서버는 단어(글자 조각)마다 사각형을 줘서 그대로 그리면 띄엄띄엄 칠해진다.
 * 같은 줄에서 가까이 붙은 사각형은 하나로 이어서 형광펜처럼 보이게 한다.
 */
function mergeLineRects(rects: SourceRect[]): SourceRect[] {
  const sorted = [...rects].sort((a, b) => a.y - b.y || a.x - b.x);
  const merged: SourceRect[] = [];
  for (const rect of sorted) {
    const last = merged.find((m) => {
      // 세로로 절반 이상 겹치면 같은 줄
      const overlap =
        Math.min(m.y + m.height, rect.y + rect.height) - Math.max(m.y, rect.y);
      const sameLine = overlap > Math.min(m.height, rect.height) * 0.5;
      // 띄어쓰기 정도의 간격이면 이어 붙인다
      const gap = rect.x - (m.x + m.width);
      return sameLine && gap < Math.max(m.height, rect.height) * 2;
    });
    if (!last) {
      merged.push({ ...rect });
      continue;
    }
    const right = Math.max(last.x + last.width, rect.x + rect.width);
    const bottom = Math.max(last.y + last.height, rect.y + rect.height);
    last.x = Math.min(last.x, rect.x);
    last.y = Math.min(last.y, rect.y);
    last.width = right - last.x;
    last.height = bottom - last.y;
  }
  return merged;
}

/** AI가 참고한 근거 문장 (박스가 있든 없든 이미지 위에 항상 보여준다) */
function SourceQuotes({ texts }: { texts: string[] }) {
  return (
    <div className="shrink-0 rounded-sm border-l-2 border-primary bg-[#F4F6F9] px-3 py-2 text-[13px] leading-relaxed">
      <p className="text-xs font-bold text-ink-secondary">AI가 참고한 문장</p>
      {texts.map((text, index) => (
        <p key={index} className="mt-1 text-ink">
          “{text}”
        </p>
      ))}
    </div>
  );
}

/** 페이지 이미지(가로에 맞춤) + 근거 위치에 반투명 박스 */
function PageImage({
  src,
  pageNo,
  rects,
}: {
  src: string;
  pageNo: number;
  rects?: SourceRect[];
}) {
  const [loaded, setLoaded] = useState(false);
  const boxes = rects?.length ? mergeLineRects(rects) : [];
  // 부모가 다시 그려질 때마다 새 배열이 와도, 위치가 같으면 다시 스크롤하지 않게
  const rectsKey = JSON.stringify(rects ?? []);
  const firstRectRef = useRef<HTMLDivElement>(null);

  // 이미지가 다 그려진 뒤에 박스 위치로 스크롤 (그 전에는 높이가 0이라 위치가 틀림)
  useEffect(() => {
    if (loaded) {
      firstRectRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [loaded, rectsKey]);

  return (
    // 가로로 긴 페이지처럼 A4보다 짧으면 세로 가운데에 둔다
    <div className="flex min-h-full flex-col justify-center gap-3">
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
          boxes.map((rect, index) => (
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
    </div>
  );
}

/** 원문 보고서를 페이지 단위로 보여준다 */
export function ReportViewer({
  videoId,
  page,
  totalPages,
  onPageChange,
  highlightRects,
  highlightQuotes,
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

      {!!highlightQuotes?.length && (
        // 원문(A4) 영역 밖에 둬서 인용이 있어도 페이지가 잘리거나 스크롤되지 않게
        <div className="mt-4">
          <SourceQuotes texts={highlightQuotes} />
        </div>
      )}

      <div
        // 보고서는 대부분 A4(210×297)라 영역도 A4 비율로 두면 한 페이지가 딱 맞게 들어간다.
        // A4보다 긴 페이지만 안에서 스크롤된다
        className="mt-4 aspect-[210/297] w-full overflow-y-auto rounded-control bg-canvas/70 p-3 text-[13px] leading-relaxed text-ink transition-opacity"
        style={{ opacity: isFetching ? 0.6 : 1 }}
      >
        {isError ? (
          <p className="p-2 text-danger">원문을 불러오지 못했습니다.</p>
        ) : data?.imageUrl ? (
          <PageImage
            key={data.imageUrl}
            src={data.imageUrl}
            pageNo={data.pageNo}
            rects={highlightRects}
          />
        ) : data ? (
          // 페이지 이미지를 만들지 못한 경우 (이미지 저장 기능 전에 분석한 작업 등)
          <div className="flex flex-col gap-3">
            <p className="p-2 text-ink-secondary">
              원문 이미지를 불러올 수 없습니다.
            </p>
          </div>
        ) : (
          <p className="p-2 text-ink-secondary">원문을 불러오는 중...</p>
        )}
      </div>
    </div>
  );
}
