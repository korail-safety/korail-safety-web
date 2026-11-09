import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

export interface LoginRequest {
  id: string;
  password: string;
}

// TODO: 백엔드 API 명세 확정 후 엔드포인트·응답 타입 맞추기
export interface LoginResponse {
  accessToken: string;
}

async function login(body: LoginRequest) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", body);
  return data;
}

export function useLogin() {
  return useMutation({ mutationFn: login });
}
