"use client";

import { useEffect, useId, useState } from "react";

import { Button } from "../button";
import { TextField } from "../text-field";

export interface InputDialogProps {
  open: boolean;
  title: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  /** 서버 에러 등 바깥에서 넘기는 에러 문구 */
  error?: string;
  pending?: boolean;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

/** 값 하나를 입력받는 모달 (예: 이름 수정) */
export function InputDialog({
  open,
  title,
  label,
  defaultValue = "",
  placeholder,
  error,
  pending,
  confirmLabel = "저장",
  onConfirm,
  onCancel,
}: InputDialogProps) {
  const titleId = useId();
  const [value, setValue] = useState(defaultValue);
  const [emptyError, setEmptyError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const submit = () => {
    if (!value.trim()) {
      setEmptyError(true);
      return;
    }
    onConfirm(value.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 animate-fade-in bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[440px] animate-fade-in rounded-card bg-white p-7 shadow-xl"
      >
        <h2 id={titleId} className="text-center text-lg font-bold text-ink">
          {title}
        </h2>
        <form
          noValidate
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <TextField
            label={label}
            placeholder={placeholder}
            value={value}
            autoFocus
            error={emptyError ? `${label}을(를) 입력해 주세요.` : error}
            onChange={(event) => {
              setValue(event.target.value);
              setEmptyError(false);
            }}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              className="w-full px-4"
              onClick={onCancel}
            >
              취소
            </Button>
            <Button type="submit" className="w-full px-4" disabled={pending}>
              {pending ? "저장 중..." : confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
