import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

import type { ExtractedFieldKey } from "../model/enums";

/**
 * 근거 문장이 원문 페이지에서 차지하는 사각형.
 * 페이지 크기에 대한 비율(0~1), 왼쪽 위가 (0, 0)이라 이미지 크기와 상관없이 위치가 맞는다.
 */
export interface SourceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 근거 문장 1개 (원문 페이지, 문장, 위치) */
export interface ExtractedSource {
  /** 원문 페이지 (1부터) */
  page: number;
  /** 근거 문장 */
  text: string;
  /** 문장 위치. 원문에서 못 찾았거나 글자가 없는 페이지면 null */
  rects: SourceRect[] | null;
}

export interface ExtractedItem {
  fieldKey: ExtractedFieldKey;
  /** 지금 보여주는 내용 (사용자가 고쳤으면 고친 내용) */
  content: string;
  /** AI가 처음 뽑은 내용 */
  aiContent: string;
  /** 근거가 된 원문 페이지 (1부터). 근거를 못 찾았으면 null */
  sourcePage: number | null;
  /**
   * AI가 근거라고 알려준 문장. 원문에서 잘라온 게 아니라 AI가 옮겨 적은 것이라
   * 원문과 띄어쓰기·표현이 조금 다를 수 있다. 근거를 못 찾았으면 null
   */
  sourceText: string | null;
  /**
   * 근거 문장의 위치 (한 줄에 사각형 1개). 원문에서 문장을 못 찾았거나
   * 글자가 없는 페이지(스캔본 등)면 null
   */
  sourceRects: SourceRect[] | null;
  /**
   * 근거 여러 개 (요약에 쓴 내용마다 하나씩). 서버가 아직 안 주면 없음 →
   * sourcePage·sourceText·sourceRects 하나로 대신한다 (getItemSources)
   */
  sources?: ExtractedSource[];
  /** 사용자가 마지막으로 고친 시각 (ISO). 안 고쳤으면 null */
  editedAt: string | null;
}

export interface AnalysisResultResponse {
  totalPages: number;
  items: ExtractedItem[];
}

export interface ReportPageResponse {
  pageNo: number;
  /**
   * 페이지에서 뽑은 글자. 스캔본처럼 글자를 뽑을 수 없으면 빈 문자열.
   * 화면에는 이미지만 보여주고, 이 값은 쓰지 않는다 (서버가 근거 좌표를 찾을 때 사용)
   */
  text: string;
  /** 페이지 이미지 주소 (일정 시간 뒤 만료). 이미지가 없으면 null */
  imageUrl: string | null;
}

export const analysisResultQueryKey = (videoId: string) =>
  ["videos", videoId, "analysis", "result"] as const;

export function useAnalysisResult(videoId: string) {
  return useQuery({
    queryKey: analysisResultQueryKey(videoId),
    queryFn: async () => {
      const { data } = await apiClient.get<AnalysisResultResponse>(
        `/videos/${videoId}/analysis/result`,
      );
      return data;
    },
  });
}

/** 원문 보고서의 한 페이지. 페이지를 넘기는 동안 이전 페이지를 계속 보여준다. */
export function useReportPage(videoId: string, page: number) {
  return useQuery({
    queryKey: ["videos", videoId, "report", "pages", page],
    queryFn: async () => {
      const { data } = await apiClient.get<ReportPageResponse>(
        `/videos/${videoId}/report/pages/${page}`,
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

/** 항목의 근거 목록. 예전 형식(근거 1개)도 같은 모양으로 바꿔 준다 */
export function getItemSources(item: ExtractedItem): ExtractedSource[] {
  if (item.sources?.length) return item.sources;
  if (item.sourcePage === null) return [];
  return [
    {
      page: item.sourcePage,
      text: item.sourceText ?? "",
      rects: item.sourceRects,
    },
  ];
}

/** 근거가 있는 페이지들 (작은 순, 중복 없이) */
export function getSourcePages(item: ExtractedItem): number[] {
  return [...new Set(getItemSources(item).map((source) => source.page))].sort(
    (a, b) => a - b,
  );
}
