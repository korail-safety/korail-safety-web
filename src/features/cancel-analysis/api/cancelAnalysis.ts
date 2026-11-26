import { useMutation, useQueryClient } from "@tanstack/react-query";

import { analysisQueryKey, draftsQueryKey } from "@/entities/video";
import { apiClient } from "@/shared/api";

/** 분석을 중단하고 작업(보고서·분석 결과)을 지운다. 복구 불가 */
export function useCancelAnalysis(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/videos/${videoId}/analysis`);
    },
    onSuccess: () => {
      // 지운 작업의 진행 상태를 더 조회하지 않게 하고, 임시저장 목록에서도 빠지게
      queryClient.removeQueries({ queryKey: analysisQueryKey(videoId) });
      queryClient.invalidateQueries({ queryKey: draftsQueryKey });
    },
  });
}
