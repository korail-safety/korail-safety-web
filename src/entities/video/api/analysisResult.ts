import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

import type { ExtractedFieldKey } from "../model/enums";

// TODO: 백엔드 API 명세 확정 후 엔드포인트·응답 타입 맞추기

export interface ExtractedItem {
  key: ExtractedFieldKey;
  content: string;
  /** 근거가 된 원문 페이지 (1부터) */
  sourcePage: number;
  /** 원문에서 강조할 근거 문장 */
  sourceText: string;
}

export interface AnalysisResultResponse {
  totalPages: number;
  items: ExtractedItem[];
}

export interface ReportPageResponse {
  page: number;
  totalPages: number;
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
