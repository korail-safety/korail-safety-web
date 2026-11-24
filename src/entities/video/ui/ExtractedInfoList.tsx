import { cn } from "@/shared/lib";

import { getSourcePages, type ExtractedItem } from "../api/analysisResult";
import {
  EXTRACTED_FIELD,
  EXTRACTED_FIELD_ORDER,
  type ExtractedFieldKey,
} from "../model/enums";

interface ExtractedInfoListProps {
  items: ExtractedItem[];
  /** 원문에서 근거를 보고 있는 항목 */
  selectedKey?: ExtractedFieldKey;
  /** 원문에서 보고 있는 페이지 (선택한 항목의 근거 페이지 표시용) */
  currentPage?: number;
  onShowSource: (item: ExtractedItem, page: number) => void;
  onEdit: (key: ExtractedFieldKey) => void;
}

/** AI 추출 정보 목록 (항목별 내용 + 원문 보기 + 수정하기) */
export function ExtractedInfoList({
  items,
  selectedKey,
  currentPage,
  onShowSource,
  onEdit,
}: ExtractedInfoListProps) {
  const sorted = EXTRACTED_FIELD_ORDER.map((key) =>
    items.find((item) => item.fieldKey === key),
  ).filter((item): item is ExtractedItem => !!item);

  return (
    <ul className="grid min-h-full divide-y divide-canvas border-t border-canvas [grid-auto-rows:1fr]">
      {sorted.map((item) => {
        const selected = item.fieldKey === selectedKey;
        const pages = getSourcePages(item);
        return (
          <li
            key={item.fieldKey}
            className={cn(
              // 모든 항목이 가장 긴 항목과 같은 높이(남는 공간은 똑같이 나눔), 버튼 줄은 항상 아래
              "flex min-h-[120px] flex-col px-1 py-4 transition-colors",
              selected && "bg-primary-subtle",
            )}
          >
            <p className="text-sm font-bold text-ink">
              {EXTRACTED_FIELD[item.fieldKey]}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed whitespace-pre-wrap text-ink">
              {item.content}
            </p>
            <div className="mt-auto flex items-center justify-between pt-2 text-xs">
              {pages.length === 0 ? (
                // AI가 문서에서 근거를 특정하지 못한 항목
                <span className="text-ink-secondary">원문 근거 없음</span>
              ) : (
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className="text-ink-secondary">원문 근거</span>
                  {pages.map((page) => {
                    const active = selected && page === currentPage;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => onShowSource(item, page)}
                        aria-pressed={active}
                        aria-label={`원문 ${page}페이지 근거 보기`}
                        className={cn(
                          "cursor-pointer underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current",
                          active
                            ? "font-bold text-primary"
                            : selected
                              ? "text-primary"
                              : "text-ink-secondary",
                        )}
                      >
                        p.{page}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                onClick={() => onEdit(item.fieldKey)}
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
