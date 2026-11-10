export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  /** true면 백엔드 대신 가짜 API(shared/api/mock)를 사용한다 */
  useMockApi: process.env.NEXT_PUBLIC_API_MOCK === "true",
} as const;
