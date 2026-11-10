import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { apiClient } from "@/shared/api";

// TODO: 백엔드 API 명세 확정 후 응답 타입 맞추기

export interface Me {
  id: string;
  name: string;
}

export const meQueryKey = ["auth", "me"] as const;

/** 로그인한 사용자 정보. 로그인하지 않았으면 401 에러가 된다. */
export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<Me>("/auth/me");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    // 401(로그인 안 됨)은 다시 시도해도 같으므로 재시도하지 않는다
    retry: (count, error) =>
      !(isAxiosError(error) && error.response?.status === 401) && count < 1,
  });
}

export function isUnauthorized(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401;
}
