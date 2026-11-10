"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useStartStoryboard,
  useStoryboard,
  VIDEO_CREATION_STEP,
  VIDEO_CREATION_STEPS,
} from "@/entities/video";
import { useReviseStoryboard } from "@/features/revise-storyboard";
import { useSaveVideoDraft } from "@/features/save-video-draft";
import { useStartGeneration } from "@/features/start-generation";
import { ROUTES } from "@/shared/config";
import { useUnsavedChangesGuard } from "@/shared/lib";
import { Button, ConfirmDialog, Textarea, Toast } from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";

import { StoryboardView } from "./StoryboardView";

interface ToastState {
  id: number;
  variant: "success" | "error";
  message: string;
}

const CARD = "flex flex-col rounded-card bg-white p-5 sm:p-[30px] lg:min-h-0";

export function VideoStoryboardPage({ videoId }: { videoId: string }) {
  const router = useRouter();
  const { data: storyboard, isError } = useStoryboard(videoId);
  const restart = useStartStoryboard(videoId);
  const revise = useReviseStoryboard(videoId);
  const saveDraft = useSaveVideoDraft(videoId);
  const startGeneration = useStartGeneration(videoId);

  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState<string>();
  const leaveGuard = useUnsavedChangesGuard(prompt.trim().length > 0);

  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = (variant: ToastState["variant"], message: string) =>
    setToast({ id: Date.now(), variant, message });

  const inProgress = !storyboard || storyboard.status === "IN_PROGRESS";
  const completed = storyboard?.status === "COMPLETED";

  const handleRevise = () => {
    if (!prompt.trim()) {
      setPromptError("수정할 내용을 입력해 주세요.");
      return;
    }
    revise.mutate(prompt.trim(), {
      onSuccess: () => {
        setPrompt("");
        showToast(
          "success",
          "수정 요청을 보냈어요. 스토리보드를 다시 만들고 있어요.",
        );
      },
      onError: () =>
        showToast(
          "error",
          "수정 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        ),
    });
  };

  const handleRetry = () =>
    restart.mutate(undefined, {
      onSuccess: () => revise.reset(),
      onError: () => showToast("error", "스토리보드를 다시 만들지 못했습니다."),
    });

  const handleNext = () =>
    startGeneration.mutate(undefined, {
      onSuccess: () => router.push(ROUTES.videoGeneration(videoId)),
      onError: () =>
        showToast(
          "error",
          "영상 생성을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        ),
    });

  const handleSaveDraft = () =>
    saveDraft.mutate(undefined, {
      onSuccess: () => showToast("success", "임시저장되었습니다."),
      onError: () =>
        showToast(
          "error",
          "임시저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        ),
    });

  return (
    <>
      <AppTopBar
        items={VIDEO_CREATION_STEPS}
        currentIndex={VIDEO_CREATION_STEP.storyboard}
      />
      <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 pt-6 pb-8 sm:px-8 lg:px-[35px] lg:pt-[33px]">
          <h1 className="text-2xl font-bold text-ink sm:text-[28px]">
            스토리보드 확인
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            영상 스토리보드를 검토해 주세요.
          </p>

          <div className="mt-6 grid gap-6 lg:min-h-[440px] lg:flex-1 lg:grid-cols-[3fr_2fr]">
            <section className={CARD}>
              <h2 className="text-lg font-bold text-ink">스토리보드</h2>
              <div className="mt-4 flex min-h-0 flex-1 flex-col">
                {isError ? (
                  <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-control bg-canvas/70 text-sm text-danger">
                    스토리보드를 불러오지 못했습니다.
                  </div>
                ) : (
                  <StoryboardView
                    storyboard={storyboard}
                    retrying={restart.isPending}
                    onRetry={handleRetry}
                  />
                )}
              </div>
            </section>

            <section className={CARD}>
              <h2 className="text-lg font-bold text-ink">수정 프롬프트</h2>
              <Textarea
                className="mt-4"
                rows={8}
                aria-label="수정 프롬프트"
                placeholder={
                  "수정하고 싶은 내용을 입력해 주세요.\n예시) 00:00~01:24 사고 사진 모자이크 처리해 줘."
                }
                value={prompt}
                error={promptError}
                disabled={inProgress}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  if (promptError) setPromptError(undefined);
                }}
              />
              <Button
                variant="secondary"
                className="-mt-2 self-end px-8"
                disabled={inProgress || revise.isPending}
                onClick={handleRevise}
              >
                {revise.isPending ? "요청 중..." : "수정하기"}
              </Button>
              {inProgress && (
                <p className="mt-3 text-xs text-ink-secondary">
                  ⓘ 스토리보드를 만드는 동안에는 입력할 수 없어요.
                </p>
              )}
            </section>
          </div>

          <div className="mt-6 flex shrink-0 flex-col gap-2.5 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() =>
                leaveGuard.guard(() =>
                  router.push(ROUTES.videoAnalysisResult(videoId)),
                )
              }
            >
              이전
            </Button>
            <Button
              variant="secondary"
              disabled={saveDraft.isPending}
              onClick={handleSaveDraft}
            >
              {saveDraft.isPending ? "저장 중..." : "임시저장"}
            </Button>
            <Button
              disabled={!completed || startGeneration.isPending}
              onClick={() => leaveGuard.guard(handleNext)}
            >
              {startGeneration.isPending
                ? "요청 중..."
                : "다음 단계: 영상 생성"}
            </Button>
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={leaveGuard.pending}
        title="보내지 않은 수정 내용이 있습니다"
        description="지금 나가면 입력한 수정 프롬프트가 사라져요. 그래도 나가시겠어요?"
        cancelLabel="계속 작성"
        confirmLabel="나가기"
        danger
        onCancel={leaveGuard.cancel}
        onConfirm={leaveGuard.confirm}
      />

      {toast && (
        <div className="fixed right-5 bottom-5 left-5 z-50 flex justify-end lg:left-auto lg:w-[720px]">
          <Toast
            key={toast.id}
            variant={toast.variant}
            message={toast.message}
            duration={4000}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}
