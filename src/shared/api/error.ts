import { isAxiosError } from "axios";

/**
 * 서버 에러 응답 형식 (백엔드와 맞출 것)
 * 예) 400 { "code": "INVALID_ADMIN_CODE", "message": "..." }
 */
export interface ApiErrorBody {
  code?: string;
  message?: string;
}

/** API 에러에서 서버가 내려준 에러 코드를 꺼낸다. 없으면 undefined. */
export function getApiErrorCode(error: unknown) {
  if (!isAxiosError<ApiErrorBody>(error)) return undefined;
  return error.response?.data?.code;
}
