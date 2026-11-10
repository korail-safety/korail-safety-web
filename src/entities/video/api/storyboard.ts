import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

import type { GenerationStatus } from "../model/enums";

// TODO: 백엔드 API 명세 확정 후 엔드포인트·응답 타입 맞추기

export interface StoryboardResponse {
  status: GenerationStatus;
  /** 완성된 스토리보드 이미지 주소 (COMPLETED일 때) */
  imageUrl?: string;
  /** 실패 시 사용자에게 보여줄 오류 코드 */
  errorCode?: string;
}

export const storyboardQueryKey = (videoId: string) =>
  ["videos", videoId, "storyboard"] as const;

const POLLING_INTERVAL_MS = 3000;

/** 스토리보드. 만드는 중이면 3초마다 다시 조회한다. */
export function useStoryboard(videoId: string) {
  return useQuery({
    queryKey: storyboardQueryKey(videoId),
    queryFn: async () => {
      const { data } = await apiClient.get<StoryboardResponse>(
        `/videos/${videoId}/storyboard`,
      );
      return data;
    },
    refetchInterval: (query) =>
      query.state.data?.status === "IN_PROGRESS" ? POLLING_INTERVAL_MS : false,
  });
}

/** 분석 결과로 스토리보드 만들기를 시작(또는 다시 시작)한다 */
export function useStartStoryboard(videoId: string) {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/videos/${videoId}/storyboard`);
    },
  });
}
