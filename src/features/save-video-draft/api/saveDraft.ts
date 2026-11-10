import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

/** 지금 단계까지의 작업을 임시저장한다 (대시보드·라이브러리에서 이어서 작업) */
export function useSaveVideoDraft(videoId: string) {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/videos/${videoId}/draft`);
    },
  });
}
