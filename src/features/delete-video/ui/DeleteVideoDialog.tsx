"use client";

import { ConfirmDialog } from "@/shared/ui";

import { useDeleteVideo } from "../api/deleteVideo";

interface DeleteVideoDialogProps {
  /** 삭제할 영상 id. null이면 닫힘 */
  videoId: string | null;
  onClose: () => void;
  onDeleted?: () => void;
}

/** 9-2 · 영상 삭제 확인 */
export function DeleteVideoDialog({
  videoId,
  onClose,
  onDeleted,
}: DeleteVideoDialogProps) {
  const remove = useDeleteVideo();

  return (
    <ConfirmDialog
      open={videoId !== null}
      title="영상을 삭제하시겠습니까?"
      description={
        remove.isError
          ? "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요."
          : "삭제한 영상은 복구할 수 없습니다.\n영상과 관련된 정보도 함께 삭제됩니다."
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
