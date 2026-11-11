"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  GENERATION_JOB_STEPS,
  generationQueryKey,
  useGenerationStatus,
  VIDEO_CREATION_STEP,
  VIDEO_CREATION_STEPS,
  type GenerationStatusResponse,
} from "@/entities/video";
import { useStartGeneration } from "@/features/start-generation";
import { ROUTES } from "@/shared/config";
import { FilmIcon } from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";
import { JobErrorCard, JobProgressCard } from "@/widgets/job-status";

export function VideoGenerationPage({ videoId }: { videoId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isError } = useGenerationStatus(videoId);
  const retry = useStartGeneration(videoId);

  const status = data?.status;

  // 생성이 끝나면 완료 표시를 잠깐 보여준 뒤 완성 화면으로 이동
  useEffect(() => {
    if (status !== "COMPLETED") return;
    const timer = setTimeout(
      () => router.replace(ROUTES.videoComplete(videoId)),
      1200,
    );
    return () => clearTimeout(timer);
  }, [status, router, videoId]);

  const handleRetry = () => {
    retry.mutate(undefined, {
      onSuccess: () => {
        // 진행 화면으로 바로 바꾸고 폴링을 다시 시작한다
        queryClient.setQueryData<GenerationStatusResponse>(
          generationQueryKey(videoId),
          { status: "IN_PROGRESS", step: "GENERATE_SCENES" },
        );
        queryClient.invalidateQueries({
          queryKey: generationQueryKey(videoId),
        });
      },
    });
  };

  // 생성 실패 또는 상태 조회 자체가 실패한 경우
  const failed = status === "FAILED" || isError;

  return (
    <>
      <AppTopBar
        items={VIDEO_CREATION_STEPS}
        currentIndex={VIDEO_CREATION_STEP.generate}
      />
      <main className="flex flex-1 flex-col items-center px-5 py-10 sm:px-8 lg:min-h-0 lg:overflow-y-auto [&>*]:my-auto">
        {failed && !retry.isPending ? (
          <JobErrorCard
            title="영상을 생성하지 못했습니다."
            errorCode={data?.errorCode}
            retrying={retry.isPending}
            onBack={() => router.push(ROUTES.videoStoryboard(videoId))}
            onRetry={handleRetry}
          />
        ) : (
          <JobProgressCard
            icon={<FilmIcon />}
            title="영상을 생성하고 있습니다"
            completedTitle="영상 생성이 완료되었습니다"
            completedDescription="완성된 영상 화면으로 이동합니다."
            footnote="생성이 완료되면 자동으로 다음 화면으로 이동합니다. 이 화면을 벗어나도 생성은 계속돼요."
            steps={GENERATION_JOB_STEPS}
            currentStep={data?.step}
            estimatedMinutes={data?.estimatedMinutes}
            progress={data?.progress}
            completed={status === "COMPLETED"}
          />
        )}
      </main>
    </>
  );
}
