import type { ReactNode } from "react";

import { Badge, DocumentIcon } from "@/shared/ui";

import type { DraftVideo } from "../api/drafts";
import { formatShortDate } from "../api/library";
import { DRAFT_STEP } from "../model/enums";

interface DraftVideoCardProps {
  draft: DraftVideo;
  /** 아래 버튼 자리 (이어서 작업하기 · 삭제) */
  actions: ReactNode;
}

/**
 * 10 · 임시저장 카드.
 * 아직 영상이 없어서 썸네일 대신 보고서 아이콘을 보여준다.
 */
export function DraftVideoCard({ draft, actions }: DraftVideoCardProps) {
  return (
    <article className="flex h-full flex-col rounded-card bg-white p-5 sm:px-6">
      <div className="flex items-start gap-3.5">
        <div
          aria-hidden="true"
          className={
            draft.failed
              ? "flex size-11 shrink-0 items-center justify-center rounded-control bg-danger-bg text-danger"
              : "flex size-11 shrink-0 items-center justify-center rounded-control bg-primary-subtle text-primary"
          }
        >
          <DocumentIcon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{draft.title}</p>
          <p className="mt-1 text-2xs text-ink-secondary">
            수정일 {formatShortDate(draft.updatedAt)}
          </p>
        </div>
        <Badge
          tone={
            draft.failed
              ? "danger"
              : draft.step === "STORYBOARD"
                ? "success"
                : "info"
          }
          className="shrink-0"
        >
          {draft.failed ? "오류 발생" : DRAFT_STEP[draft.step]}
        </Badge>
      </div>

      <div className="mt-5 flex gap-2.5">{actions}</div>
    </article>
  );
}
