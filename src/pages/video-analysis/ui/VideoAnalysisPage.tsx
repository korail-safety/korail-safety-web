"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  ANALYSIS_JOB_STEPS,
  analysisQueryKey,
  type AnalysisStatusResponse,
  useAnalysisStatus,
  useStartAnalysis,
  VIDEO_CREATION_STEP,
  VIDEO_CREATION_STEPS,
} from "@/entities/video";
import { ROUTES } from "@/shared/config";
import { DocumentIcon } from "@/shared/ui";
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

  const status = data?.status;

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
      <main className="flex flex-1 flex-col items-center px-5 py-10 sm:px-8 lg:min-h-0 lg:overflow-y-auto [&>*]:my-auto">
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
            footnote="분석이 완료되면 자동으로 다음 단계로 이동합니다. 이 화면을 벗어나도 분석은 계속돼요."
            steps={ANALYSIS_JOB_STEPS}
            currentStep={data?.step}
            estimatedMinutes={data?.estimatedMinutes}
            completed={status === "COMPLETED"}
          />
        )}
      </main>
    </>
  );
}
