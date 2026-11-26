"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useDeleteDraft } from "@/features/delete-draft";
import { useSaveVideoDraft } from "@/features/save-video-draft";
import { getApiErrorCode } from "@/shared/api";
import { Button } from "@/shared/ui";

interface LeaveWorkDialogProps {
  open: boolean;
  videoId: string;
  /** 보내지(저장하지) 않은 입력이 있으면 사라진다는 안내를 같이 보여준다 */
  hasUnsavedInput?: boolean;
  /** 임시저장 또는 삭제가 끝난 뒤 원래 하려던 이동을 진행한다 */
  onLeave: () => void;
  onCancel: () => void;
}

/**
 * 작업 화면(분석 결과·스토리보드)을 벗어날 때 묻는 모달.
 * 작업은 이미 서버에 있으므로 "임시저장"은 목록에 남기고 나가는 것, "삭제"는 작업을 지우고 나가는 것.
 */
export function LeaveWorkDialog({
  open,
  videoId,
  hasUnsavedInput,
  onLeave,
  onCancel,
}: LeaveWorkDialogProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const saveDraft = useSaveVideoDraft(videoId);
  const deleteDraft = useDeleteDraft();
  const [error, setError] = useState<string>();
  const busy = saveDraft.isPending || deleteDraft.isPending;

  // 닫힐 때 에러 문구를 지워서 다음에 열 때 남아 있지 않게 한다
  const close = (next: () => void) => {
    setError(undefined);
    next();
  };

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) close(onCancel);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const handleSave = () =>
    saveDraft.mutate(undefined, {
      onSuccess: () => close(onLeave),
      onError: () =>
        setError("임시저장에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    });

  const handleDelete = () =>
    deleteDraft.mutate(videoId, {
      onSuccess: () => close(onLeave),
      onError: (err) => {
        const code = getApiErrorCode(err);
        // 이미 지워진 작업이면 그대로 나간다
        if (code === "VIDEO_NOT_FOUND") close(onLeave);
        else if (code === "JOB_IN_PROGRESS")
          setError(
            "AI가 아직 만드는 중이라 삭제할 수 없어요. 끝난 뒤 다시 시도해 주세요.",
          );
        else setError("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      },
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div
        aria-hidden="true"
        onClick={busy ? undefined : () => close(onCancel)}
        className="absolute inset-0 animate-fade-in bg-black/40"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[480px] animate-fade-in rounded-card bg-white p-7 text-center shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-bold text-ink">
          작업을 임시저장할까요?
        </h2>
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-secondary">
          {
            "임시저장하면 임시저장 목록에서 이어서 작업할 수 있어요.\n삭제하면 보고서와 작업 내용이 모두 지워지고 복구할 수 없어요."
          }
        </p>
        {hasUnsavedInput && (
          <p className="mt-2 text-[13px] text-ink-secondary">
            ⓘ 작성 중인 수정 내용은 저장되지 않아요.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-[13px] text-danger">
            {error}
          </p>
        )}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Button
            ref={cancelRef}
            variant="secondary"
            className="w-full px-3"
            disabled={busy}
            onClick={() => close(onCancel)}
          >
            취소
          </Button>
          <Button
            variant="danger"
            className="w-full px-3"
            disabled={busy}
            onClick={handleDelete}
          >
            {deleteDraft.isPending ? "삭제 중..." : "삭제"}
          </Button>
          <Button className="w-full px-3" disabled={busy} onClick={handleSave}>
            {saveDraft.isPending ? "저장 중..." : "임시저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
