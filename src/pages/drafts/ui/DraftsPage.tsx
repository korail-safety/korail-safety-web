"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import {
  DraftVideoCard,
  getDraftResumeRoute,
  SORT_ORDER,
  useDrafts,
  type SortOrder,
} from "@/entities/video";
import { DeleteDraftDialog } from "@/features/delete-draft";
import { cn, useDebouncedValue } from "@/shared/lib";
import {
  Button,
  buttonClassName,
  SearchInput,
  Select,
  Toast,
} from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";

const SORT_OPTIONS = (Object.keys(SORT_ORDER) as SortOrder[]).map((value) => ({
  value,
  label: SORT_ORDER[value],
}));

/** 10 · 임시저장한 영상 */
export function DraftsPage() {
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortOrder>("LATEST");
  const debouncedKeyword = useDebouncedValue(keyword.trim());

  const {
    data: drafts = [],
    isPending,
    isError,
    isPlaceholderData,
    refetch,
  } = useDrafts({ keyword: debouncedKeyword || undefined, sort });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastId, setToastId] = useState<number | null>(null);

  return (
    <>
      <AppTopBar items={["임시저장한 영상"]} />
      <div className="flex flex-1 flex-col lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 pt-6 pb-8 sm:px-8 lg:px-[35px] lg:pt-[33px]">
          <h1 className="text-2xl font-bold text-ink sm:text-[28px]">
            임시저장한 영상
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            임시저장한 영상을 확인 및 관리할 수 있습니다.
          </p>

          <div className="mt-4 flex gap-2.5 sm:justify-between">
            <SearchInput
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onClear={() => setKeyword("")}
              placeholder="검색"
              aria-label="임시저장 검색"
              className="min-w-0 flex-1 sm:w-[300px] sm:flex-none"
            />
            <Select
              aria-label="정렬"
              options={SORT_OPTIONS}
              value={sort}
              onChange={setSort}
              className="w-[110px] shrink-0"
            />
          </div>

          <section
            aria-label="임시저장 목록"
            aria-busy={isPending || isPlaceholderData}
            className={cn(
              "mt-4 flex flex-1 flex-col transition-opacity",
              isPlaceholderData && "opacity-60",
            )}
          >
            {isError ? (
              <EmptyState message="임시저장 목록을 불러오지 못했습니다.">
                <Button variant="secondary" onClick={() => refetch()}>
                  다시 불러오기
                </Button>
              </EmptyState>
            ) : isPending ? (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <li
                    key={i}
                    className="h-[136px] animate-pulse rounded-card bg-white"
                  />
                ))}
              </ul>
            ) : drafts.length === 0 ? (
              debouncedKeyword ? (
                <EmptyState message="검색어에 맞는 작업이 없습니다." />
              ) : (
                <EmptyState message="임시저장한 영상이 없습니다." />
              )
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {drafts.map((draft) => (
                  <li key={draft.id} className="animate-fade-in">
                    <DraftVideoCard
                      draft={draft}
                      actions={
                        <>
                          <Link
                            href={getDraftResumeRoute(draft)}
                            className={buttonClassName({
                              size: "xs",
                              className: "flex-[3]",
                            })}
                          >
                            이어서 작업하기
                          </Link>
                          <Button
                            variant="secondary"
                            size="xs"
                            className="flex-[2]"
                            onClick={() => setDeletingId(draft.id)}
                          >
                            삭제
                          </Button>
                        </>
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

      <DeleteDraftDialog
        videoId={deletingId}
        onClose={() => setDeletingId(null)}
        onDeleted={() => setToastId(Date.now())}
      />

      {toastId && (
        <div className="fixed right-5 bottom-5 left-5 z-50 flex justify-end lg:left-auto lg:w-[480px]">
          <Toast
            key={toastId}
            variant="success"
            message="임시저장한 작업을 삭제했습니다."
            duration={3000}
            onClose={() => setToastId(null)}
          />
        </div>
      )}
    </>
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
