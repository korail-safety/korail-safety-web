"use client";

import { useRouter } from "next/navigation";

import { useStartAnalysis } from "@/entities/video";
import { ROUTES } from "@/shared/config";
import { Button, Dropzone, FileItem } from "@/shared/ui";

import { ACCEPT_ATTRIBUTE } from "../model/fileRules";
import { useReportUpload } from "../model/useReportUpload";

export function ReportUploadSection() {
  const router = useRouter();
  const { state, zoneError, selectFile } = useReportUpload();
  const startAnalysis = useStartAnalysis();

  const handleStart = () => {
    if (state.status !== "success") return;
    const { videoId } = state;
    startAnalysis.mutate(videoId, {
      onSuccess: () => router.push(ROUTES.videoAnalysis(videoId)),
    });
  };

  return (
    <>
      <section className="flex flex-col rounded-card bg-white p-5 sm:p-[30px] lg:flex-1">
        <h2 className="text-lg font-bold text-ink">조사보고서 등록</h2>

        <Dropzone
          className="mt-4 lg:flex-1"
          accept={ACCEPT_ATTRIBUTE}
          hint="PDF, DOCX · 파일 크기는 운영 정책에 따릅니다."
          error={zoneError}
          hasFile={state.status !== "idle"}
          disabled={state.status === "uploading"}
          onFileSelect={selectFile}
        />

        {state.status !== "idle" && (
          <FileItem
            className="mt-6"
            name={state.file.name}
            size={state.file.size}
            status={state.status}
            progress={state.status === "uploading" ? state.progress : 0}
          />
        )}
      </section>

      <div className="mt-6 flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <Button
          disabled={state.status !== "success" || startAnalysis.isPending}
          onClick={handleStart}
        >
          {startAnalysis.isPending ? "요청 중..." : "영상 제작"}
        </Button>
        {/* 메시지 자리를 미리 확보해 에러 시 레이아웃이 밀리지 않게 한다 */}
        <p role="alert" className="h-[18px] text-xs text-danger">
          {startAnalysis.isError &&
            "분석을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요."}
        </p>
      </div>
    </>
  );
}
