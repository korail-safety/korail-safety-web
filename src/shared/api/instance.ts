import axios from "axios";

import { env } from "@/shared/config";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: 공통 에러 처리 (인증 만료, 토스트 등)
    return Promise.reject(error);
  },
);
