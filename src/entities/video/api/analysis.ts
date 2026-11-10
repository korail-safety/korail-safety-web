import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

import type { AnalysisStatus, AnalysisStep } from "../model/enums";

// TODO: 백엔드 API 명세 확정 후 엔드포인트·응답 타입 맞추기

export interface AnalysisStatusResponse {
  status: AnalysisStatus;
  /** 지금 진행 중인 세부 단계 */
  step: AnalysisStep;
  /** 예상 남은 시간(분). 모르면 생략 */
  estimatedMinutes?: number;
  /** 실패 시 사용자에게 보여줄 오류 코드 (예: "E-102") */
  errorCode?: string;
}

const POLLING_INTERVAL_MS = 3000;

export const analysisQueryKey = (videoId: string) =>
  ["videos", videoId, "analysis"] as const;

async function getAnalysisStatus(videoId: string) {
  const { data } = await apiClient.get<AnalysisStatusResponse>(
    `/videos/${videoId}/analysis`,
  );
  return data;
}

/** 분석이 진행 중인 동안 3초마다 상태를 다시 조회한다. */
export function useAnalysisStatus(videoId: string) {
  return useQuery({
    queryKey: analysisQueryKey(videoId),
    queryFn: () => getAnalysisStatus(videoId),
    refetchInterval: (query) =>
      query.state.data?.status === "IN_PROGRESS" ? POLLING_INTERVAL_MS : false,
    retry: 1,
  });
}

async function startAnalysis(videoId: string) {
  await apiClient.post(`/videos/${videoId}/analysis`);
}

/** 보고서 분석을 시작(또는 재시도)한다. */
export function useStartAnalysis() {
  return useMutation({ mutationFn: startAnalysis });
}
