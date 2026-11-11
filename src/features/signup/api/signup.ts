import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

// TODO: 백엔드 API 명세 확정 후 엔드포인트·요청/응답 타입 맞추기

export interface SignupRequest {
  name: string;
  adminCode: string;
  email: string;
  id: string;
  password: string;
}

async function signup(body: SignupRequest) {
  await apiClient.post("/auth/signup", body);
}

export function useSignup() {
  return useMutation({ mutationFn: signup });
}

interface CheckIdResponse {
  available: boolean;
}

async function checkIdDuplicate(id: string) {
  const { data } = await apiClient.get<CheckIdResponse>("/auth/check-id", {
    params: { id },
  });
  return data;
}

export function useCheckIdDuplicate() {
  return useMutation({ mutationFn: checkIdDuplicate });
}
