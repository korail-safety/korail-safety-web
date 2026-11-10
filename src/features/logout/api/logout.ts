import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { apiClient } from "@/shared/api";
import { ROUTES } from "@/shared/config";

/** 로그아웃 후 캐시를 비우고 로그인 화면으로 이동한다. */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    // 서버 요청이 실패해도 화면에서는 로그아웃 처리한다
    onSettled: () => {
      // TODO: 토큰 저장 방식 확정 후 저장된 토큰 삭제
      queryClient.clear();
      router.replace(ROUTES.login);
    },
  });
}
