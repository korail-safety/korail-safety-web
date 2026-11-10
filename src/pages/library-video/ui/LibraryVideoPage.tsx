"use client";

import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatShortDate, useLibraryVideo } from "@/entities/video";
import { DeleteVideoDialog } from "@/features/delete-video";
import { ROUTES } from "@/shared/config";
import { Button, VideoPlayer } from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";

/** 9-3 · 영상 시청 */
export function LibraryVideoPage({ videoId }: { videoId: string }) {
  const router = useRouter();
  const { data, isError, error, refetch } = useLibraryVideo(videoId);
  const [deleting, setDeleting] = useState(false);

  const notFound = isAxiosError(error) && error.response?.status === 404;

  return (
    <>
      <AppTopBar items={["라이브러리", "영상 시청"]} currentIndex={1} />
      <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 pt-6 pb-8 sm:px-8 lg:px-[35px] lg:pt-[33px]">
          {isError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-card bg-white px-5 py-16 text-center">
              <p className="text-[15px] text-ink">
                {notFound
                  ? "삭제되었거나 없는 영상입니다."
                  : "영상을 불러오지 못했습니다."}
              </p>
              <div className="flex gap-2.5">
                {!notFound && (
                  <Button variant="secondary" onClick={() => refetch()}>
                    다시 불러오기
                  </Button>
                )}
                <Button onClick={() => router.push(ROUTES.library)}>
                  라이브러리로 가기
                </Button>
              </div>
            </div>
          ) : (
            <>
              {data ? (
                <>
                  <h1 className="truncate text-2xl font-bold text-ink sm:text-[28px]">
                    {data.title}
                  </h1>
                  <p className="mt-1 text-sm text-ink-secondary">
                    최종 수정일 {formatShortDate(data.updatedAt)}
                    <span className="mx-2 text-canvas" aria-hidden="true">
                      |
                    </span>
                    {data.accidentType?.name ?? "미분류"}
                  </p>
                </>
              ) : (
                <div aria-hidden="true">
                  <div className="h-9 w-80 max-w-full animate-pulse rounded-control bg-white" />
                  <div className="mt-2 h-5 w-48 animate-pulse rounded-control bg-white" />
                </div>
              )}

              <VideoPlayer
                src={data?.videoUrl}
                durationSec={data?.durationSec}
                className={
                  data
                    ? "mt-6 aspect-video lg:aspect-auto lg:min-h-[360px] lg:flex-1"
                    : "mt-6 aspect-video animate-pulse lg:aspect-auto lg:min-h-[360px] lg:flex-1"
                }
              />

              <div className="mt-6 flex shrink-0 flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  disabled={!data}
                  onClick={() => setDeleting(true)}
                >
                  삭제하기
                </Button>
                <Button onClick={() => router.push(ROUTES.library)}>
                  라이브러리로 가기
                </Button>
              </div>
            </>
          )}
        </main>
      </div>

      <DeleteVideoDialog
        videoId={deleting ? videoId : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => router.replace(ROUTES.library)}
      />
    </>
  );
}
