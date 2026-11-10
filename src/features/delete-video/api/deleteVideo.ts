import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accidentTypesQueryKey } from "@/entities/accident-type";
import { libraryVideoQueryKey, libraryVideosQueryKey } from "@/entities/video";
import { apiClient } from "@/shared/api";

/** 라이브러리 영상을 삭제한다 (복구 불가) */
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      await apiClient.delete(`/library/videos/${videoId}`);
    },
    onSuccess: (_, videoId) => {
      // 지운 영상 상세는 다시 불러오면 404라 캐시에서 빼기만 한다
      queryClient.removeQueries({ queryKey: libraryVideoQueryKey(videoId) });
      queryClient.invalidateQueries({
        queryKey: libraryVideosQueryKey,
        predicate: (query) => query.queryKey[2] !== "detail",
      });
      queryClient.invalidateQueries({ queryKey: accidentTypesQueryKey });
    },
  });
}
