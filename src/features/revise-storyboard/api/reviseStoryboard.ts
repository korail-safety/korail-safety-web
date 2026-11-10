import { useMutation, useQueryClient } from "@tanstack/react-query";

import { storyboardQueryKey, type StoryboardResponse } from "@/entities/video";
import { apiClient } from "@/shared/api";

/** 수정 프롬프트로 스토리보드를 다시 만든다 */
export function useReviseStoryboard(videoId: string) {
  const queryClient = useQueryClient();
  const key = storyboardQueryKey(videoId);

  return useMutation({
    mutationFn: async (prompt: string) => {
      await apiClient.post(`/videos/${videoId}/storyboard/revisions`, {
        prompt,
      });
    },
    onSuccess: () => {
      // 바로 "만드는 중"으로 바꾸고 폴링을 다시 시작한다
      queryClient.setQueryData<StoryboardResponse>(key, (prev) => ({
        ...prev,
        status: "IN_PROGRESS",
      }));
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
