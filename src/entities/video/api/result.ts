import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

// TODO: 백엔드 API 명세 확정 후 맞추기

export interface VideoResultResponse {
  /** 완성된 영상 주소 */
  videoUrl?: string;
  durationSec: number;
  /** 파일명 입력칸에 미리 채울 이름 (예: 보고서 제목) */
  suggestedFileName?: string;
}

/** 생성이 끝난 최종 영상 정보 */
export function useVideoResult(videoId: string) {
  return useQuery({
    queryKey: ["videos", videoId, "result"],
    queryFn: async () => {
      const { data } = await apiClient.get<VideoResultResponse>(
        `/videos/${videoId}/result`,
      );
      return data;
    },
  });
}
