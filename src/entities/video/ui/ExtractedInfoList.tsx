import { cn } from "@/shared/lib";

import type { ExtractedItem } from "../api/analysisResult";
import {
  EXTRACTED_FIELD,
  EXTRACTED_FIELD_ORDER,
  type ExtractedFieldKey,
} from "../model/enums";

interface ExtractedInfoListProps {
  items: ExtractedItem[];
  /** 원문에서 근거를 보고 있는 항목 */
  selectedKey?: ExtractedFieldKey;
  onShowSource: (item: ExtractedItem) => void;
  onEdit: (key: ExtractedFieldKey) => void;
}

/** AI 추출 정보 목록 (항목별 내용 + 원문 보기 + 수정하기) */
export function ExtractedInfoList({
  items,
  selectedKey,
  onShowSource,
  onEdit,
}: ExtractedInfoListProps) {
  const sorted = EXTRACTED_FIELD_ORDER.map((key) =>
    items.find((item) => item.key === key),
  ).filter((item): item is ExtractedItem => !!item);

  return (
    <ul className="grid h-full divide-y divide-canvas border-t border-canvas [grid-auto-rows:1fr]">
      {sorted.map((item) => {
        const selected = item.key === selectedKey;
        return (
          <li
            key={item.key}
            className={cn(
              // 모든 항목이 가장 긴 항목과 같은 높이(남는 공간은 똑같이 나눔), 버튼 줄은 항상 아래
              "flex min-h-[120px] flex-col px-1 py-4 transition-colors",
              selected && "bg-primary-subtle",
            )}
          >
            <p className="text-sm font-bold text-ink">
              {EXTRACTED_FIELD[item.key]}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed whitespace-pre-wrap text-ink">
              {item.content}
            </p>
            <div className="mt-auto flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => onShowSource(item)}
                aria-pressed={selected}
                className={cn(
                  "cursor-pointer underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current",
                  selected ? "font-bold text-primary" : "text-ink-secondary",
                )}
              >
                원문 p.{item.sourcePage} 보기
              </button>
              <button
                type="button"
                onClick={() => onEdit(item.key)}
                className="cursor-pointer text-ink-secondary underline decoration-transparent underline-offset-2 transition-colors hover:text-ink hover:decoration-current"
              >
                수정하기
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
