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
import { getApiErrorCode } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useUnsavedChangesGuard } from "@/shared/lib";
import { Button, ConfirmDialog, Pager, Textarea, Toast } from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";
import { LeaveWorkDialog } from "@/widgets/leave-work-dialog";

import { StoryboardView } from "./StoryboardView";

interface ToastState {
  id: number;
  variant: "success" | "error";
  message: string;
}

const CARD =
  "flex flex-col rounded-card bg-white p-5 sm:px-6 sm:px-[26px] sm:pb-[26px]";

export function VideoStoryboardPage({ videoId }: { videoId: string }) {
  const router = useRouter();
  const { data: storyboard, isError } = useStoryboard(videoId);
  const restart = useStartStoryboard(videoId);
  const revise = useReviseStoryboard(videoId);
  const saveDraft = useSaveVideoDraft(videoId);
  const startGeneration = useStartGeneration(videoId);

  const scenes = storyboard?.scenes ?? [];
  const [selectedIndex, setSelectedIndex] = useState(1);
  // 장면 수가 줄어든 경우에도 범위를 벗어나지 않게
  const sceneIndex = Math.min(selectedIndex, Math.max(scenes.length, 1));
  const scene = scenes.find((item) => item.index === sceneIndex);

  // 장면마다 따로 쓰는 수정 요청 (장면을 넘겨도 쓰던 내용이 남아 있게)
  const [prompts, setPrompts] = useState<Record<number, string>>({});
  const [promptError, setPromptError] = useState<string>();
  const prompt = prompts[sceneIndex] ?? "";
  const hasUnsent = Object.values(prompts).some((text) => text.trim());
  // "임시저장" 버튼을 눌렀으면 이 화면에서는 다시 묻지 않는다
  // (작업 내용은 서버에 바로 저장되므로, 이후 나갈 때는 쓰다 만 입력만 확인)
  const [draftSaved, setDraftSaved] = useState(false);
  // 사이드바 이동·로그아웃 때는 임시저장/삭제를 묻는다
  const leaveGuard = useUnsavedChangesGuard(hasUnsent, {
    confirmLeave: !draftSaved,
  });

  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = (variant: ToastState["variant"], message: string) =>
    setToast({ id: Date.now(), variant, message });

  const doneCount = scenes.filter((item) => item.status === "COMPLETED").length;
  const building =
    !storyboard ||
    storyboard.status === "IN_PROGRESS" ||
    scenes.some((item) => item.status === "IN_PROGRESS");
  const completed =
    scenes.length > 0 && scenes.every((item) => item.status === "COMPLETED");
  const sceneBusy = !scene || scene.status === "IN_PROGRESS";

  const changeScene = (next: number) => {
    setSelectedIndex(next);
    setPromptError(undefined);
  };

  const handleRevise = () => {
    if (!prompt.trim()) {
      setPromptError("수정할 내용을 입력해 주세요.");
      return;
    }
    const target = sceneIndex;
    revise.mutate(
      { sceneIndex: target, prompt: prompt.trim() },
      {
        onSuccess: () => {
          setPrompts((prev) => ({ ...prev, [target]: "" }));
          showToast(
            "success",
            `장면 ${target} 수정 요청을 보냈어요. 이 장면만 다시 만들고 있어요.`,
          );
        },
        onError: (error) =>
          showToast(
            "error",
            getApiErrorCode(error) === "STORYBOARD_IN_PROGRESS"
              ? "이 장면은 이미 다시 만드는 중이에요."
              : "수정 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          ),
      },
    );
  };

  const handleRetry = () =>
    restart.mutate(undefined, {
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
      onSuccess: () => {
        setDraftSaved(true);
        showToast("success", "임시저장되었습니다.");
      },
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
      <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
        <main className="mx-auto flex w-full max-w-[1280px] 2xl:max-w-[1600px] flex-1 flex-col px-5 pt-6 pb-8 sm:px-6 lg:px-[35px] lg:pt-[33px]">
          <h1 className="text-2xl font-bold text-ink sm:text-[28px]">
            스토리보드 확인
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            AI가 만든 장면을 한 장씩 넘겨보며, 장면마다 수정 요청을 할 수
            있어요.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
            <section className={CARD}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-ink">스토리보드</h2>
                  {building && scenes.length > 0 && (
                    <span className="text-xs text-ink-secondary">
                      {doneCount}/{scenes.length} 완성
                    </span>
                  )}
                </div>
                <Pager
                  page={sceneIndex}
                  total={scenes.length}
                  onChange={changeScene}
                  label="스토리보드 장면"
                />
              </div>
              <div className="mt-4">
                {isError ? (
                  <div className="flex aspect-video items-center justify-center rounded-control bg-canvas/70 text-sm text-danger">
                    스토리보드를 불러오지 못했습니다.
                  </div>
                ) : (
                  <StoryboardView
                    storyboard={storyboard}
                    sceneIndex={sceneIndex}
                    retrying={restart.isPending}
                    onRetry={handleRetry}
                  />
                )}
              </div>
            </section>

            {/* lg:h-0 + min-h-full: 오른쪽 카드는 줄 높이에 영향을 주지 않고 왼쪽 스토리보드 카드 높이에 맞춘다 */}
            <section className={`${CARD} lg:h-0 lg:min-h-full`}>
              <h2 className="pt-2 text-lg font-bold text-ink">
                수정 프롬프트
                {scene && (
                  <span className="text-primary"> · 장면 {sceneIndex}</span>
                )}
              </h2>
              <Textarea
                className="mt-4"
                rows={10}
                aria-label={`장면 ${sceneIndex} 수정 프롬프트`}
                placeholder={
                  "이 장면에서 수정하고 싶은 내용을 입력해 주세요.\n예시) 기관사가 무전기를 들고 있는 모습으로 바꿔 줘."
                }
                value={prompt}
                error={promptError}
                disabled={sceneBusy}
                onChange={(event) => {
                  const value = event.target.value;
                  setPrompts((prev) => ({ ...prev, [sceneIndex]: value }));
                  if (promptError) setPromptError(undefined);
                }}
              />
              {/* 안내 문구 + 버튼은 카드 아래에 붙인다 (입력창 에러 문구와 겹치지 않게) */}
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Button
                  className="self-end px-6"
                  disabled={sceneBusy || revise.isPending}
                  onClick={handleRevise}
                >
                  {revise.isPending
                    ? "요청 중..."
                    : `장면 ${sceneIndex} 수정하기`}
                </Button>
                <p className="ml-auto text-[11px] text-ink-secondary">
                  {sceneBusy
                    ? "ⓘ 장면을 만드는 동안에는 입력할 수 없어요."
                    : `ⓘ 여기서 수정하면 이 장면(${sceneIndex}번)만 다시 만들어요. 다른 장면은 그대로 유지돼요.`}
                </p>
              </div>
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

      <LeaveWorkDialog
        open={leaveGuard.reason === "leave"}
        videoId={videoId}
        hasUnsavedInput={hasUnsent}
        onLeave={leaveGuard.confirm}
        onCancel={leaveGuard.cancel}
      />

      <ConfirmDialog
        open={leaveGuard.reason === "dirty"}
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
