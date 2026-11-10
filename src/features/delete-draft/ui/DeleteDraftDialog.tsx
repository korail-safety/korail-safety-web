"use client";

import { ConfirmDialog } from "@/shared/ui";

import { useDeleteDraft } from "../api/deleteDraft";

interface DeleteDraftDialogProps {
  /** 삭제할 작업 id. null이면 닫힘 */
  videoId: string | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteDraftDialog({
  videoId,
  onClose,
  onDeleted,
}: DeleteDraftDialogProps) {
  const remove = useDeleteDraft();

  return (
    <ConfirmDialog
      open={videoId !== null}
      title="임시저장한 영상을 삭제하시겠습니까?"
      description={
        remove.isError
          ? "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요."
          : "삭제한 작업은 복구할 수 없습니다.\n업로드한 보고서와 분석 결과도 함께 삭제됩니다."
      }
      cancelLabel="취소"
      confirmLabel={remove.isPending ? "삭제 중..." : "삭제하기"}
      danger
      onCancel={() => {
        remove.reset();
        onClose();
      }}
      onConfirm={() => {
        if (!videoId) return;
        remove.mutate(videoId, {
          onSuccess: () => {
            onClose();
            onDeleted?.();
          },
        });
      }}
    />
  );
}
