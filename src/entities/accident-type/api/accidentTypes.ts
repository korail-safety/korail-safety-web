import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

// TODO: 백엔드 API 명세 확정 후 맞추기

export interface AccidentType {
  id: string;
  name: string;
  /** 이 유형으로 저장된 영상 수 (라이브러리 카테고리 탭에 표시) */
  videoCount?: number;
}

export const accidentTypesQueryKey = ["accident-types"] as const;

/** 지금까지 만들어진 사고 유형 목록 (사용자가 새 유형을 추가할 수 있다) */
export function useAccidentTypes() {
  return useQuery({
    queryKey: accidentTypesQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: AccidentType[] }>(
        "/accident-types",
      );
      return data.items;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** 새 사고 유형을 만들어 DB에 저장하고, 목록에 바로 추가한다 */
export function useCreateAccidentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiClient.post<AccidentType>("/accident-types", {
        name,
      });
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<AccidentType[]>(accidentTypesQueryKey, (prev) =>
        prev?.some((type) => type.id === created.id)
          ? prev
          : [...(prev ?? []), created],
      );
    },
  });
}

/** 사고 유형 이름을 바꾼다 (이 유형을 쓰는 영상에도 함께 반영된다) */
export function useUpdateAccidentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: AccidentType) => {
      const { data } = await apiClient.patch<AccidentType>(
        `/accident-types/${id}`,
        { name },
      );
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AccidentType[]>(accidentTypesQueryKey, (prev) =>
        prev?.map((type) => (type.id === updated.id ? updated : type)),
      );
    },
  });
}

/** 사고 유형을 삭제한다 (쓰는 영상이 있으면 서버가 거절한다) */
export function useDeleteAccidentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/accident-types/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<AccidentType[]>(accidentTypesQueryKey, (prev) =>
        prev?.filter((type) => type.id !== deletedId),
      );
    },
  });
}

/** 사고 유형 API 에러 코드 (서버 API 명세 문서와 맞출 것) */
export const ACCIDENT_TYPE_ERROR_CODE = {
  duplicated: "ACCIDENT_TYPE_DUPLICATED",
  inUse: "ACCIDENT_TYPE_IN_USE",
} as const;
