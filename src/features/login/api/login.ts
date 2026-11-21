import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

export interface LoginRequest {
  id: string;
  password: string;
}

/** 토큰은 body가 아니라 httpOnly 쿠키(Set-Cookie)로 받는다 */
export interface LoginResponse {
  id: string;
  name: string;
}

async function login(body: LoginRequest) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", body);
  return data;
}

export function useLogin() {
  return useMutation({ mutationFn: login });
}
