import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

import type { GenerationStatus, GenerationStep } from "../model/enums";

// TODO: 백엔드 API 명세 확정 후 엔드포인트·응답 타입 맞추기

export interface GenerationStatusResponse {
  status: GenerationStatus;
  step: GenerationStep;
  estimatedMinutes?: number;
  /** 진행률 0~100. 서버가 셀 수 있을 때만 */
  progress?: number;
  errorCode?: string;
}

export const generationQueryKey = (videoId: string) =>
  ["videos", videoId, "generation"] as const;

const POLLING_INTERVAL_MS = 3000;

/** 영상 생성이 진행 중인 동안 3초마다 상태를 다시 조회한다. */
export function useGenerationStatus(videoId: string) {
  return useQuery({
    queryKey: generationQueryKey(videoId),
    queryFn: async () => {
      const { data } = await apiClient.get<GenerationStatusResponse>(
        `/videos/${videoId}/generation`,
      );
      return data;
    },
    refetchInterval: (query) =>
      query.state.data?.status === "IN_PROGRESS" ? POLLING_INTERVAL_MS : false,
    retry: 1,
  });
}
