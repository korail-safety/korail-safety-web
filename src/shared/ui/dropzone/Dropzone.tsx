"use client";

import { useRef, useState, type DragEvent } from "react";

import { cn } from "@/shared/lib";

import { Button } from "../button";
import { ArrowUpIcon } from "../icons";

export interface DropzoneError {
  title: string;
  description?: string;
}

export interface DropzoneProps {
  /** input accept 값. 예: ".pdf,.docx" */
  accept?: string;
  /** 안내 문구. 예: "PDF, DOCX · 파일 크기는 운영 정책에 따릅니다." */
  hint?: string;
  error?: DropzoneError | null;
  /** 이미 파일을 선택했으면 버튼 문구가 "파일 변경"으로 바뀐다 */
  hasFile?: boolean;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  className?: string;
}

/** Figma UploadZone. 끌어다 놓기 또는 버튼으로 파일 1개를 선택한다. */
export function Dropzone({
  accept,
  hint,
  error,
  hasFile,
  disabled,
  onFileSelect,
  className,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openFileDialog = () => inputRef.current?.click();

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex min-h-[220px] w-full flex-col items-center justify-center rounded-card border px-6 py-8 text-center transition-colors",
        error
          ? "border-danger bg-danger-bg"
          : dragging
            ? "border-primary bg-info-bg"
            : "border-primary bg-primary-subtle",
        className,
      )}
    >
      {error ? (
        <>
          <span aria-hidden="true" className="text-xl font-bold text-danger">
            !
          </span>
          <p role="alert" className="mt-3 text-sm font-bold text-danger">
            {error.title}
          </p>
          {error.description && (
            <p className="mt-2 text-xs text-ink-secondary">
              {error.description}
            </p>
          )}
        </>
      ) : (
        <>
          <span className="flex size-10 items-center justify-center rounded-full bg-info-bg text-primary">
            <ArrowUpIcon />
          </span>
          <p className="mt-3 text-sm font-bold text-ink">
            파일을 끌어다 놓거나 파일을 선택하세요
          </p>
          {hint && <p className="mt-2 text-xs text-ink-secondary">{hint}</p>}
        </>
      )}

      <Button
        variant="secondary"
        className="mt-4"
        disabled={disabled}
        onClick={openFileDialog}
      >
        {error ? "다시 선택" : hasFile ? "파일 변경" : "파일 선택"}
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelect(file);
          // 같은 파일을 다시 선택해도 onChange가 동작하도록 초기화
          event.target.value = "";
        }}
      />
    </div>
  );
}
