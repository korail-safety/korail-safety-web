import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  analysisResultQueryKey,
  type AnalysisResultResponse,
  type ExtractedFieldKey,
  type ExtractedItem,
} from "@/entities/video";
import { apiClient } from "@/shared/api";

interface UpdateVariables {
  key: ExtractedFieldKey;
  content: string;
}

export function useUpdateExtractedField(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, content }: UpdateVariables) => {
      const { data } = await apiClient.patch<ExtractedItem>(
        `/videos/${videoId}/analysis/result/items/${key}`,
        { content },
      );
      return data;
    },
    // 저장한 항목만 캐시에서 바꿔 목록을 다시 불러오지 않는다
    onSuccess: (updated) => {
      queryClient.setQueryData<AnalysisResultResponse>(
        analysisResultQueryKey(videoId),
        (prev) =>
          prev && {
            ...prev,
            items: prev.items.map((item) =>
              item.key === updated.key ? updated : item,
            ),
          },
      );
    },
  });
}
