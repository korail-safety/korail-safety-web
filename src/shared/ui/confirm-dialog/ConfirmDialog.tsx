"use client";

import { useEffect, useId, useRef } from "react";

import { Button } from "../button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 확인 버튼을 빨간색으로 (삭제·나가기 등) */
  danger?: boolean;
  /** false면 ESC·바깥 클릭으로 닫히지 않는다 (기본 true) */
  dismissible?: boolean;
  /** 버튼 문구가 길 때 넓은 모달 */
  wide?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 확인/취소를 묻는 모달. ESC나 바깥 클릭은 취소로 처리한다. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  danger,
  dismissible = true,
  wide,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel, dismissible]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div
        aria-hidden="true"
        onClick={dismissible ? onCancel : undefined}
        className="absolute inset-0 animate-fade-in bg-black/40"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full animate-fade-in ${wide ? "max-w-[600px]" : "max-w-[440px]"} rounded-card bg-white p-7 text-center shadow-xl`}
      >
        <h2 id={titleId} className="text-lg font-bold text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-secondary">
            {description}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Button
            ref={cancelRef}
            variant="secondary"
            className="w-full px-4"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            className="w-full px-4"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
