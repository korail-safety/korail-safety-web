import { useMutation, useQueryClient } from "@tanstack/react-query";

import { draftsQueryKey } from "@/entities/video";
import { apiClient } from "@/shared/api";

/** 임시저장한 작업을 삭제한다 (보고서·분석 결과 포함, 복구 불가) */
export function useDeleteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      await apiClient.delete(`/drafts/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: draftsQueryKey });
    },
  });
}
