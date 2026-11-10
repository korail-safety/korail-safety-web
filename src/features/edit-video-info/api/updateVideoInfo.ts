import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accidentTypesQueryKey } from "@/entities/accident-type";
import { libraryVideosQueryKey, type LibraryVideo } from "@/entities/video";
import { apiClient } from "@/shared/api";

export interface UpdateVideoInfoRequest {
  fileName: string;
  /** 기존 유형 이름 또는 새 유형 이름 (서버가 없으면 만든다) */
  accidentTypeName: string;
}

/** 라이브러리 영상의 이름과 사고 유형을 바꾼다 */
export function useUpdateVideoInfo(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateVideoInfoRequest) => {
      const { data } = await apiClient.patch<LibraryVideo>(
        `/library/videos/${videoId}`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      // 목록·상세·카테고리 개수가 모두 바뀔 수 있다
      queryClient.invalidateQueries({ queryKey: libraryVideosQueryKey });
      queryClient.invalidateQueries({ queryKey: accidentTypesQueryKey });
    },
  });
}
