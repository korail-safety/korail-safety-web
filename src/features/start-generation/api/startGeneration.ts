import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

/** 검토를 마친 분석 결과로 영상 생성을 시작한다 */
export function useStartGeneration(videoId: string) {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/videos/${videoId}/generation`);
    },
  });
}
