"use client";

import { useRef, useState } from "react";

import { getApiErrorCode } from "@/shared/api";
import type { DropzoneError } from "@/shared/ui";

import { UPLOAD_ERROR_CODE } from "../api/errorCodes";
import { replaceReport, uploadReport } from "../api/uploadReport";
import { isAcceptedFile } from "./fileRules";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; file: File; progress: number }
  | { status: "success"; file: File; videoId: string }
  | { status: "error"; file: File };

const INVALID_FILE_ERROR: DropzoneError = {
  title: "파일을 업로드할 수 없습니다",
  description: "파일 형식 또는 암호 설정을 확인해 주세요.",
};

const TOO_LARGE_ERROR: DropzoneError = {
  title: "파일을 업로드할 수 없습니다",
  description: "파일 크기가 허용 범위를 넘었습니다.",
};

/** 보고서 파일 1개의 선택 → 업로드 → 결과 상태를 관리한다. */
export function useReportUpload() {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  // 업로드 영역에 표시할 에러 (파일 자체가 잘못된 경우)
  const [zoneError, setZoneError] = useState<DropzoneError | null>(null);
  // 이미 만든 영상 작업. 파일을 바꾸면 새로 만들지 않고 이 작업의 보고서만 교체한다
  const videoIdRef = useRef<string | null>(null);

  const selectFile = async (file: File) => {
    if (!isAcceptedFile(file)) {
      setState({ status: "idle" });
      setZoneError(INVALID_FILE_ERROR);
      return;
    }

    setZoneError(null);
    setState({ status: "uploading", file, progress: 0 });

    try {
      const onProgress = (progress: number) =>
        setState((prev) =>
          prev.status === "uploading" && prev.file === file
            ? { ...prev, progress }
            : prev,
        );
      const { videoId } = videoIdRef.current
        ? await replaceOrUpload(videoIdRef.current, file, onProgress)
        : await uploadReport(file, onProgress);
      videoIdRef.current = videoId;
      setState({ status: "success", file, videoId });
    } catch (error) {
      const code = getApiErrorCode(error);
      if (
        code === UPLOAD_ERROR_CODE.unsupportedFileType ||
        code === UPLOAD_ERROR_CODE.encryptedFile
      ) {
        setState({ status: "idle" });
        setZoneError(INVALID_FILE_ERROR);
        return;
      }
      if (code === UPLOAD_ERROR_CODE.fileTooLarge) {
        setState({ status: "idle" });
        setZoneError(TOO_LARGE_ERROR);
        return;
      }
      // 네트워크 오류 등: 파일 항목에 실패 표시
      setState({ status: "error", file });
    }
  };

  return { state, zoneError, selectFile };
}

/** 교체할 작업이 이미 정리됐으면(404) 새로 업로드한다 */
async function replaceOrUpload(
  videoId: string,
  file: File,
  onProgress: (percent: number) => void,
) {
  try {
    return await replaceReport(videoId, file, onProgress);
  } catch (error) {
    if (getApiErrorCode(error) === "VIDEO_NOT_FOUND") {
      return uploadReport(file, onProgress);
    }
    throw error;
  }
}
