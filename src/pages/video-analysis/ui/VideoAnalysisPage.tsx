"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ANALYSIS_JOB_STEPS,
  analysisQueryKey,
  type AnalysisStatusResponse,
  useAnalysisStatus,
  useStartAnalysis,
  VIDEO_CREATION_STEP,
  VIDEO_CREATION_STEPS,
} from "@/entities/video";
import { useCancelAnalysis } from "@/features/cancel-analysis";
import { getApiErrorCode } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useUnsavedChangesGuard } from "@/shared/lib";
import { ConfirmDialog, DocumentIcon, Toast } from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";
import { JobErrorCard, JobProgressCard } from "@/widgets/job-status";

interface VideoAnalysisPageProps {
  videoId: string;
}

export function VideoAnalysisPage({ videoId }: VideoAnalysisPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isError } = useAnalysisStatus(videoId);
  const retry = useStartAnalysis();
  const cancel = useCancelAnalysis(videoId);
  const [error, setError] = useState<{ id: number; message: string }>();

  const status = data?.status;
  // 분석이 도는 중에는 사이드바 이동·로그아웃 때 "분석이 중단된다"고 묻는다
  const analyzing = status === "IN_PROGRESS" || retry.isPending;
  const leaveGuard = useUnsavedChangesGuard(false, {
    confirmLeave: analyzing,
  });

  /** "나가기": 분석을 중단(작업 삭제)한 뒤 원래 하려던 이동을 진행한다 */
  const handleCancelAndLeave = () =>
    cancel.mutate(undefined, {
      onSuccess: leaveGuard.confirm,
      onError: (err) => {
        // 이미 지워진 작업이면 그대로 나간다
        if (getApiErrorCode(err) === "VIDEO_NOT_FOUND") {
          leaveGuard.confirm();
          return;
        }
        leaveGuard.cancel();
        setError({
          id: Date.now(),
          message: "분석을 중단하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        });
      },
    });

  // 분석이 끝나면 완료 표시를 잠깐 보여준 뒤 결과 확인 화면으로 이동
  useEffect(() => {
    if (status !== "COMPLETED") return;
    const timer = setTimeout(
      () => router.replace(ROUTES.videoAnalysisResult(videoId)),
      1200,
    );
    return () => clearTimeout(timer);
  }, [status, router, videoId]);

  const handleRetry = () => {
    retry.mutate(videoId, {
      onSuccess: () => {
        // 진행 화면으로 바로 바꾸고 폴링을 다시 시작한다
        queryClient.setQueryData<AnalysisStatusResponse>(
          analysisQueryKey(videoId),
          { status: "IN_PROGRESS", step: "READ_FILE" },
        );
        queryClient.invalidateQueries({ queryKey: analysisQueryKey(videoId) });
      },
    });
  };

  // 분석 실패 또는 상태 조회 자체가 실패한 경우
  const failed = status === "FAILED" || isError;

  return (
    <>
      <AppTopBar
        items={VIDEO_CREATION_STEPS}
        currentIndex={VIDEO_CREATION_STEP.analysis}
      />
      <main className="flex flex-1 flex-col items-center px-5 py-10 sm:px-8 lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable] [&>*]:my-auto">
        {failed && !retry.isPending ? (
          <JobErrorCard
            title="보고서를 분석하지 못했습니다."
            errorCode={data?.errorCode}
            retrying={retry.isPending}
            onBack={() => router.push(ROUTES.videoCreate)}
            onRetry={handleRetry}
          />
        ) : (
          <JobProgressCard
            icon={<DocumentIcon />}
            title="보고서를 분석하고 있습니다"
            completedTitle="분석이 완료되었습니다"
            completedDescription="결과 확인 화면으로 이동합니다."
            footnote="분석이 완료되면 자동으로 다음 단계로 이동합니다. 이 화면을 벗어나면 분석이 중단돼요."
            steps={ANALYSIS_JOB_STEPS}
            currentStep={data?.step}
            estimatedMinutes={data?.estimatedMinutes}
            progress={data?.progress}
            completed={status === "COMPLETED"}
          />
        )}
      </main>

      <ConfirmDialog
        open={leaveGuard.reason === "leave"}
        title="지금 나가면 분석이 중단됩니다"
        description={
          "업로드한 보고서와 분석 내용이 삭제되고 복구할 수 없어요.\n그래도 나가시겠어요?"
        }
        cancelLabel="분석 계속하기"
        confirmLabel={cancel.isPending ? "중단 중..." : "나가기"}
        danger
        dismissible={!cancel.isPending}
        onCancel={leaveGuard.cancel}
        onConfirm={() => {
          if (!cancel.isPending) handleCancelAndLeave();
        }}
      />

      {error && (
        <div className="fixed right-5 bottom-5 left-5 z-50 flex justify-end lg:left-auto lg:w-[720px]">
          <Toast
            key={error.id}
            variant="error"
            message={error.message}
            duration={4000}
            onClose={() => setError(undefined)}
          />
        </div>
      )}
    </>
  );
}
