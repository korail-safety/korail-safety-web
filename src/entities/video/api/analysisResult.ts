import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

import type { ExtractedFieldKey } from "../model/enums";

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
  /** 사용자가 마지막으로 고친 시각 (ISO). 안 고쳤으면 null */
  editedAt: string | null;
}

export interface AnalysisResultResponse {
  totalPages: number;
  items: ExtractedItem[];
}

export interface ReportPageResponse {
  pageNo: number;
  /** 페이지에서 뽑은 글자. 스캔본처럼 글자를 뽑을 수 없으면 빈 문자열 */
  text: string;
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
