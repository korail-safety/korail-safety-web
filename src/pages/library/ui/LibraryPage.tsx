"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { useAccidentTypes } from "@/entities/accident-type";
import {
  LibraryVideoCard,
  SORT_ORDER,
  useLibraryVideos,
  type LibraryVideo,
  type SortOrder,
} from "@/entities/video";
import { DeleteVideoDialog } from "@/features/delete-video";
import { EditVideoInfoDialog } from "@/features/edit-video-info";
import { ROUTES } from "@/shared/config";
import { cn, useDebouncedValue } from "@/shared/lib";
import { Button, MoreMenu, SearchInput, Select, Toast } from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";

const SORT_OPTIONS = (Object.keys(SORT_ORDER) as SortOrder[]).map((value) => ({
  value,
  label: SORT_ORDER[value],
}));

/** 9 · 라이브러리 */
export function LibraryPage() {
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortOrder>("LATEST");
  const [accidentTypeId, setAccidentTypeId] = useState<string>();
  const debouncedKeyword = useDebouncedValue(keyword.trim());

  const { data, isPending, isError, isPlaceholderData, refetch } =
    useLibraryVideos({
      keyword: debouncedKeyword || undefined,
      accidentTypeId,
      sort,
    });
  const { data: accidentTypes = [] } = useAccidentTypes();

  const [editing, setEditing] = useState<LibraryVideo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null,
  );
  const showToast = (message: string) => setToast({ id: Date.now(), message });

  const videos = data?.items ?? [];
  const filtered = Boolean(debouncedKeyword || accidentTypeId);

  return (
    <>
      <AppTopBar items={["라이브러리"]} />
      <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 pt-6 pb-8 sm:px-8 lg:px-[35px] lg:pt-[33px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink sm:text-[28px]">
                라이브러리
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                제작한 영상을 확인 및 관리할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-2.5">
              <SearchInput
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onClear={() => setKeyword("")}
                placeholder="영상 이름으로 검색"
                aria-label="영상 검색"
                className="min-w-0 flex-1 md:w-[300px] md:flex-none"
              />
              <Select
                aria-label="정렬"
                options={SORT_OPTIONS}
                value={sort}
                onChange={setSort}
                className="w-[110px] shrink-0"
              />
            </div>
          </div>

          {/* 사고 유형 필터 */}
          <div
            role="group"
            aria-label="사고 유형"
            className="mt-4 flex flex-wrap gap-2"
          >
            <CategoryPill
              active={!accidentTypeId}
              onClick={() => setAccidentTypeId(undefined)}
            >
              전체 {data?.totalCount ?? ""}
            </CategoryPill>
            {accidentTypes.map((type) => (
              <CategoryPill
                key={type.id}
                active={accidentTypeId === type.id}
                onClick={() => setAccidentTypeId(type.id)}
              >
                {type.name} {type.videoCount ?? ""}
              </CategoryPill>
            ))}
          </div>

          <section
            aria-label="영상 목록"
            aria-busy={isPending || isPlaceholderData}
            className={cn(
              "mt-5 flex flex-1 flex-col transition-opacity",
              isPlaceholderData && "opacity-60",
            )}
          >
            {isError ? (
              <EmptyState message="영상 목록을 불러오지 못했습니다.">
                <Button variant="secondary" onClick={() => refetch()}>
                  다시 불러오기
                </Button>
              </EmptyState>
            ) : isPending ? (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <li
                    key={i}
                    className="aspect-[4/3] animate-pulse rounded-card bg-white"
                  />
                ))}
              </ul>
            ) : videos.length === 0 ? (
              filtered ? (
                <EmptyState message="조건에 맞는 영상이 없습니다." />
              ) : (
                <EmptyState message="영상이 없습니다." />
              )
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {videos.map((video) => (
                  <li key={video.id} className="animate-fade-in">
                    <LibraryVideoCard
                      video={video}
                      onOpen={() => router.push(ROUTES.libraryVideo(video.id))}
                      menu={
                        <MoreMenu
                          label={`${video.title} 메뉴`}
                          items={[
                            {
                              label: "이름 및 유형 수정",
                              onSelect: () => setEditing(video),
                            },
                            {
                              label: "삭제",
                              danger: true,
                              onSelect: () => setDeletingId(video.id),
                            },
                          ]}
                        />
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

      {/* 9-1 · 이름 및 유형 수정 */}
      {editing && (
        <EditVideoInfoDialog
          key={editing.id}
          video={editing}
          onClose={() => setEditing(null)}
          onSaved={() => showToast("수정을 완료했습니다.")}
        />
      )}

      {/* 9-2 · 영상 삭제 */}
      <DeleteVideoDialog
        videoId={deletingId}
        onClose={() => setDeletingId(null)}
        onDeleted={() => showToast("영상을 삭제했습니다.")}
      />

      {toast && (
        <div className="fixed right-5 bottom-5 left-5 z-50 flex justify-end lg:left-auto lg:w-[480px]">
          <Toast
            key={toast.id}
            variant="success"
            message={toast.message}
            duration={3000}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 cursor-pointer rounded-full border px-4 text-xs transition-colors",
        active
          ? "border-primary bg-primary font-bold text-white"
          : "border-navy border-[0.5px] bg-white text-navy font-medium hover:bg-primary-subtle",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) {
  return (
    // 9-4 · 빈 라이브러리: 카드 없이 남은 영역 가운데에 문구만
    <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm text-ink-secondary">{message}</p>
      {children}
    </div>
  );
}
