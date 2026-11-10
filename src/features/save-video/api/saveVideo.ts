import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accidentTypesQueryKey } from "@/entities/accident-type";
import { apiClient } from "@/shared/api";

export interface SaveVideoRequest {
  fileName: string;
  /** 기존 유형 이름 또는 새로 만들 유형 이름 (서버가 없으면 새로 만든다) */
  accidentTypeName: string;
}

/** 완성된 영상을 라이브러리에 저장한다 */
export function useSaveVideo(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: SaveVideoRequest) => {
      await apiClient.post(`/videos/${videoId}/save`, body);
    },
    // 새 사고 유형이 생겼을 수 있으므로 목록을 다시 불러온다
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accidentTypesQueryKey }),
  });
}
