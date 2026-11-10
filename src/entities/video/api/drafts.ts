import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";
import { ROUTES } from "@/shared/config";

import type { DraftStep, SortOrder } from "../model/enums";

export interface DraftVideo {
  id: string;
  /** 보고서 제목 (분석 전이면 보고서 파일명) */
  title: string;
  /** ISO 날짜 문자열 */
  updatedAt: string;
  /** 어느 단계에서 멈췄는지 */
  step: DraftStep;
  /** 그 단계 작업(분석·스토리보드 생성)이 실패했는지 → "오류 발생" */
  failed: boolean;
}

export interface DraftsParams {
  keyword?: string;
  sort: SortOrder;
}

export const draftsQueryKey = ["drafts"] as const;

export function useDrafts(params: DraftsParams) {
  return useQuery({
    queryKey: [...draftsQueryKey, params],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: DraftVideo[] }>("/drafts", {
        params,
      });
      return data.items;
    },
    placeholderData: keepPreviousData,
  });
}

/** "이어서 작업하기"로 갈 화면 */
export function getDraftResumeRoute(draft: DraftVideo) {
  if (draft.step === "STORYBOARD") return ROUTES.videoStoryboard(draft.id);
  // 분석이 실패했으면 분석 화면(다시 시도), 아니면 분석 결과 화면
  return draft.failed
    ? ROUTES.videoAnalysis(draft.id)
    : ROUTES.videoAnalysisResult(draft.id);
}
