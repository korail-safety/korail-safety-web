"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useVideoResult,
  VIDEO_CREATION_STEP,
  VIDEO_CREATION_STEPS,
} from "@/entities/video";
import { SaveVideoForm } from "@/features/save-video";
import { ROUTES } from "@/shared/config";
import { Button, ConfirmDialog, Toast, VideoPlayer } from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";

const FORM_ID = "save-video-form";

export function VideoCompletePage({ videoId }: { videoId: string }) {
  const router = useRouter();
  const { data, isError, refetch } = useVideoResult(videoId);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorToastId, setErrorToastId] = useState<number | null>(null);

  return (
    <>
      <AppTopBar
        items={VIDEO_CREATION_STEPS}
        currentIndex={VIDEO_CREATION_STEP.generate}
      />
      <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 pt-6 pb-8 sm:px-8 lg:px-[35px] lg:pt-[33px]">
          <h1 className="text-2xl font-bold text-ink sm:text-[28px]">
            영상이 성공적으로 제작되었습니다.
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            지금 바로 영상을 시청하고 저장할 수 있습니다.
          </p>

          {isError ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-card bg-white px-5 py-16 text-center">
              <p className="text-[15px] text-ink">
                영상을 불러오지 못했습니다.
              </p>
              <Button variant="secondary" onClick={() => refetch()}>
                다시 불러오기
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:min-h-[440px] lg:flex-1 lg:grid-cols-[5fr_3fr]">
              <VideoPlayer
                src={data?.videoUrl}
                durationSec={data?.durationSec}
                className={
                  data
                    ? "aspect-video lg:aspect-auto lg:min-h-0"
                    : "aspect-video animate-pulse lg:aspect-auto"
                }
              />

              <section className="flex flex-col rounded-card bg-white p-5 sm:p-[30px]">
                <h2 className="text-lg font-bold text-ink">
                  영상이 준비됐어요
                </h2>
                <div className="mt-5">
                  {data && (
                    <SaveVideoForm
                      formId={FORM_ID}
                      videoId={videoId}
                      defaultFileName={data.suggestedFileName}
                      onSaved={() => setSaved(true)}
                      onError={() => setErrorToastId(Date.now())}
                      onPendingChange={setSaving}
                    />
                  )}
                </div>
              </section>
            </div>
          )}

          <div className="mt-6 flex shrink-0 flex-col sm:flex-row sm:justify-end">
            <Button type="submit" form={FORM_ID} disabled={!data || saving}>
              {saving ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </main>
      </div>

      {/* 8-1 · 저장 완료 */}
      <ConfirmDialog
        open={saved}
        dismissible={false}
        title="저장을 완료했습니다."
        cancelLabel="첫 화면으로 이동"
        confirmLabel="라이브러리 가기"
        onCancel={() => router.push(ROUTES.videoCreate)}
        onConfirm={() => router.push(ROUTES.library)}
      />

      {errorToastId && (
        <div className="fixed right-5 bottom-5 left-5 z-50 flex justify-end lg:left-auto lg:w-[720px]">
          <Toast
            key={errorToastId}
            variant="error"
            message="저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
            duration={4000}
            onClose={() => setErrorToastId(null)}
          />
        </div>
      )}
    </>
  );
}
