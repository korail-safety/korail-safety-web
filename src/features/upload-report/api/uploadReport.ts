import { apiClient } from "@/shared/api";

// TODO: 백엔드 API 명세 확정 후 엔드포인트·응답 타입 맞추기

export interface UploadReportResponse {
  /** 업로드한 보고서로 만들어진 영상 작업 id */
  videoId: string;
}

type ProgressHandler = (percent: number) => void;

function uploadConfig(onProgress?: ProgressHandler) {
  return {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0, // 큰 파일 업로드는 시간 제한 없음
    onUploadProgress: (event: { loaded: number; total?: number }) => {
      if (event.total) onProgress?.((event.loaded / event.total) * 100);
    },
  };
}

function toFormData(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

/** 첫 업로드: 영상 작업을 새로 만든다 (stage = UPLOADED) */
export async function uploadReport(file: File, onProgress?: ProgressHandler) {
  const { data } = await apiClient.post<UploadReportResponse>(
    "/videos/reports",
    toFormData(file),
    uploadConfig(onProgress),
  );
  return data;
}

/** 파일 변경: 같은 영상 작업의 보고서만 바꾼다 (분석 시작 전에만 가능) */
export async function replaceReport(
  videoId: string,
  file: File,
  onProgress?: ProgressHandler,
) {
  const { data } = await apiClient.put<UploadReportResponse>(
    `/videos/${videoId}/report`,
    toFormData(file),
    uploadConfig(onProgress),
  );
  return data;
}
