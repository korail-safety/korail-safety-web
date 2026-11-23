"use client";

import { EXTRACTED_FIELD, type ExtractedFieldKey } from "@/entities/video";
import { Button, ChevronLeftIcon, Textarea } from "@/shared/ui";

interface ExtractedFieldEditorProps {
  fieldKey: ExtractedFieldKey;
  value: string;
  error?: string;
  saving?: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  /** 목록으로 돌아가기 */
  onBack: () => void;
}

/** 추출 항목 1개를 고치는 편집 패널 */
export function ExtractedFieldEditor({
  fieldKey,
  value,
  error,
  saving,
  onChange,
  onSave,
  onBack,
}: ExtractedFieldEditorProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="추출 정보 목록으로 돌아가기"
          onClick={onBack}
          className="-ml-2 flex size-8 cursor-pointer items-center justify-center rounded-control text-ink transition-colors hover:bg-canvas"
        >
          <ChevronLeftIcon width={8} height={12} />
        </button>
        <h2 className="text-lg font-bold text-ink">
          {EXTRACTED_FIELD[fieldKey]}
        </h2>
      </div>
      <Textarea
        className="mt-4"
        rows={10}
        aria-label={`${EXTRACTED_FIELD[fieldKey]} 내용`}
        placeholder="내용을 입력해 주세요."
        value={value}
        error={error}
        autoFocus
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        variant="secondary"
        className="mt-2 self-end px-8"
        disabled={saving}
        onClick={onSave}
      >
        {saving ? "저장 중..." : "수정하기"}
      </Button>
    </div>
  );
}
