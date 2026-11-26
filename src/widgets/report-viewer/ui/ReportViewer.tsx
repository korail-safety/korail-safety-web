"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { useReportPage, type SourceRect } from "@/entities/video";
import { cn } from "@/shared/lib";
import { Pager } from "@/shared/ui";

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

/**
 * AI가 참고한 근거 문장. 근거가 여러 개면 첫 문장만 보여주고 나머지는 개수만 표시한다
 * (위치는 이미지 위 박스로 전부 칠해지므로 상자가 길어지지 않게)
 */
function SourceQuotes({ texts }: { texts: string[] }) {
  const [first, ...rest] = texts;
  return (
    <div className="shrink-0 rounded-sm border-l-2 border-primary bg-[#F4F6F9] px-3 py-2 text-[13px] leading-relaxed">
      <p className="text-xs font-bold text-ink-secondary">AI가 참고한 문장</p>
      <p className="mt-1 text-ink">
        “{first}”
        {rest.length > 0 && (
          <span className="ml-1.5 text-xs whitespace-nowrap text-ink-secondary">
            외 {rest.length}문장
          </span>
        )}
      </p>
    </div>
  );
}

/** 이미지가 없을 때 A4 크기 자리에 안내 문구 */
function PagePlaceholder({ children }: { children: ReactNode }) {
  return (
    <div className="flex aspect-[210/297] w-full items-center justify-center rounded-control bg-canvas/70 px-5 text-center text-ink-secondary">
      {children}
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

  // 이미지가 다 그려진 뒤, 박스가 화면 밖에 있을 때만 보이는 곳까지 스크롤
  // (그 전에는 높이가 0이라 위치가 틀림)
  useEffect(() => {
    if (loaded) {
      firstRectRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [loaded, rectsKey]);

  return (
    <div className="relative">
      {/* 이미지를 불러오는 동안은 A4 크기 자리를 잡아 둬서 화면이 들썩이지 않게 */}
      {!loaded && (
        <div className="aspect-[210/297] w-full animate-pulse rounded-control bg-canvas" />
      )}
      {/* 서버가 주는 S3 임시 주소라 next/image 최적화 대상이 아님 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`원문 ${pageNo}페이지`}
        onLoad={() => setLoaded(true)}
        className={cn(
          "w-full rounded-control border border-canvas bg-white",
          loaded ? "block animate-fade-in" : "absolute inset-0 opacity-0",
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
        <Pager
          page={page}
          total={totalPages}
          onChange={onPageChange}
          label="원문 페이지"
        />
      </div>

      {!!highlightQuotes?.length && (
        // 원문(A4) 영역 밖에 둬서 인용이 있어도 페이지가 잘리거나 스크롤되지 않게
        <div className="mt-4">
          <SourceQuotes texts={highlightQuotes} />
        </div>
      )}

      {/* 페이지 이미지 자체가 원문 영역 (따로 테두리 상자를 두지 않음) */}
      <div
        className="mt-4 text-[13px] text-ink transition-opacity"
        style={{ opacity: isFetching ? 0.6 : 1 }}
      >
        {isError ? (
          <PagePlaceholder>
            <span className="text-danger">원문을 불러오지 못했습니다.</span>
          </PagePlaceholder>
        ) : data?.imageUrl ? (
          <PageImage
            key={data.imageUrl}
            src={data.imageUrl}
            pageNo={data.pageNo}
            rects={highlightRects}
          />
        ) : data ? (
          // 페이지 이미지를 만들지 못한 경우 (이미지 저장 기능 전에 분석한 작업 등)
          <PagePlaceholder>원문 이미지를 불러올 수 없습니다.</PagePlaceholder>
        ) : (
          <PagePlaceholder>원문을 불러오는 중...</PagePlaceholder>
        )}
      </div>
    </div>
  );
}
