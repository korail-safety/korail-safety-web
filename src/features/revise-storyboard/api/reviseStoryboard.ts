import { useMutation, useQueryClient } from "@tanstack/react-query";

import { storyboardQueryKey, type StoryboardResponse } from "@/entities/video";
import { apiClient } from "@/shared/api";

interface ReviseVariables {
  /** 고칠 장면 번호 (1부터) */
  sceneIndex: number;
  prompt: string;
}

/** 장면 하나를 수정 요청대로 다시 만든다 (다른 장면은 그대로) */
export function useReviseStoryboard(videoId: string) {
  const queryClient = useQueryClient();
  const key = storyboardQueryKey(videoId);

  return useMutation({
    mutationFn: async ({ sceneIndex, prompt }: ReviseVariables) => {
      await apiClient.post(`/videos/${videoId}/storyboard/revisions`, {
        sceneIndex,
        prompt,
      });
    },
    onSuccess: (_, { sceneIndex }) => {
      // 그 장면만 바로 "만드는 중"으로 바꾸고 폴링을 다시 시작한다
      queryClient.setQueryData<StoryboardResponse>(key, (prev) =>
        prev
          ? {
              ...prev,
              status: "IN_PROGRESS",
              scenes: prev.scenes.map((scene) =>
                scene.index === sceneIndex
                  ? { ...scene, status: "IN_PROGRESS", errorCode: null }
                  : scene,
              ),
            }
          : prev,
      );
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
