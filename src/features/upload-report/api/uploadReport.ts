import { apiClient } from "@/shared/api";

// TODO: 백엔드 API 명세 확정 후 엔드포인트·응답 타입 맞추기

export interface UploadReportResponse {
  /** 업로드한 보고서로 만들어진 영상 작업 id */
  videoId: string;
}

export async function uploadReport(
  file: File,
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<UploadReportResponse>(
    "/videos/reports",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0, // 큰 파일 업로드는 시간 제한 없음
      onUploadProgress: (event) => {
        if (event.total) onProgress?.((event.loaded / event.total) * 100);
      },
    },
  );
  return data;
}
