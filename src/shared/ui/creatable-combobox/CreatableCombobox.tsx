"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/shared/lib";

import { FieldError } from "../field-error";
import { PencilIcon, TrashIcon } from "../icons";

export interface CreatableComboboxProps {
  label?: string;
  placeholder?: string;
  /** 선택된 값 (없으면 빈 문자열) */
  value: string;
  options: string[];
  /** 목록 위에 표시할 제목 (예: "기존 유형") */
  optionsTitle?: string;
  /** 새 값 만들기 문구 (예: (v) => `"${v}" 새 유형 만들기`) */
  createLabel?: (input: string) => string;
  error?: string;
  /** 새 항목 만들기를 골랐을 때 (예: 서버에 저장). 끝나면 그 값이 선택된다 */
  onCreate?: (value: string) => Promise<void> | void;
  /** 새 항목을 만드는 중 */
  creating?: boolean;
  /** 넘기면 기존 항목마다 수정 버튼이 생긴다 */
  onEditOption?: (option: string) => void;
  /** 넘기면 기존 항목마다 삭제 버튼이 생긴다 */
  onDeleteOption?: (option: string) => void;
  onChange: (value: string) => void;
}

/** 입력해서 기존 항목을 고르거나, 없으면 새로 만들 수 있는 선택 상자 (Figma 사고유형 Textarea/active) */
export function CreatableCombobox({
  label,
  placeholder,
  value,
  options,
  optionsTitle = "기존 항목",
  createLabel = (input) => `"${input}" 새로 만들기`,
  error,
  onCreate,
  creating,
  onEditOption,
  onDeleteOption,
  onChange,
}: CreatableComboboxProps) {
  const inputId = useId();
  const listId = useId();
  const errorId = `${inputId}-error`;
  const rootRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState(value);
  // 바깥에서 값이 바뀌면(이름 수정·삭제 등) 입력칸도 맞춘다
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setInput(value);
  }
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const keyword = input.trim();
  const filtered = keyword
    ? options.filter((option) => option.includes(keyword))
    : options;
  const canCreate = keyword.length > 0 && !options.includes(keyword);
  // 키보드로 고를 수 있는 항목: 기존 항목들 + (있으면) 새로 만들기
  const items = canCreate ? [...filtered, keyword] : filtered;

  const select = (next: string) => {
    onChange(next);
    setInput(next);
    setOpen(false);
  };

  const create = async (next: string) => {
    setOpen(false);
    try {
      await onCreate?.(next);
      select(next);
    } catch {
      // 실패 처리는 onCreate를 넘긴 쪽에서 (에러 메시지 등)
    }
  };

  const choose = (index: number) => {
    const isCreate = canCreate && index === items.length - 1;
    if (isCreate) void create(items[index]);
    else select(items[index]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // 한글 입력 중(조합 중) Enter는 글자 확정용이므로 무시
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      // Enter로 폼이 제출되지 않게 막고, 목록이 열려 있으면 항목을 고른다
      event.preventDefault();
      if (open && items[activeIndex]) choose(activeIndex);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative flex w-full flex-col gap-2"
      onBlur={(event) => {
        // 목록 안을 누르는 중이면 닫지 않는다
        if (!rootRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
          // 고르지 않고 벗어나면 선택된 값으로 되돌린다
          setInput(value);
        }
      }}
    >
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-ink">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex h-[52px] w-full items-center gap-2 rounded-control border bg-white px-4 transition-[border-color,box-shadow]",
          error
            ? "border-danger"
            : "border-canvas focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
        )}
      >
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          disabled={creating}
          placeholder={placeholder}
          value={input}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setInput(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-secondary"
        />
        {input && (
          <button
            type="button"
            aria-label="입력 지우기"
            onClick={() => {
              setInput("");
              onChange("");
              setOpen(true);
            }}
            className="shrink-0 cursor-pointer text-sm text-ink-secondary transition-colors hover:text-ink"
          >
            ✕
          </button>
        )}
      </div>

      {open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%-18px)] left-0 z-20 max-h-60 w-full animate-fade-in overflow-y-auto rounded-control border border-canvas bg-white py-1 shadow-lg"
        >
          {filtered.length > 0 && (
            <li
              role="presentation"
              className="px-4 py-2 text-[11px] text-ink-secondary"
            >
              {optionsTitle}
            </li>
          )}
          {items.map((item, index) => {
            const isCreate = canCreate && index === items.length - 1;
            return (
              <li
                key={`${item}-${isCreate}`}
                role="presentation"
                className={cn(
                  "group flex items-center pr-2 transition-colors",
                  index === activeIndex && "bg-canvas/70",
                )}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  // 클릭해도 입력칸 포커스가 유지되도록 (Safari 대응)
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(index)}
                  className={cn(
                    "flex min-w-0 flex-1 cursor-pointer px-4 py-2.5 text-left text-[13px]",
                    isCreate ? "text-ink-secondary" : "text-ink",
                  )}
                >
                  {isCreate ? (
                    `+ ${createLabel(item)}`
                  ) : (
                    <HighlightMatch text={item} keyword={keyword} />
                  )}
                </button>
                {!isCreate && onEditOption && (
                  <button
                    type="button"
                    aria-label={`${item} 이름 수정`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      onEditOption(item);
                    }}
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-white hover:text-ink"
                  >
                    <PencilIcon />
                  </button>
                )}
                {!isCreate && onDeleteOption && (
                  <button
                    type="button"
                    aria-label={`${item} 삭제`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      onDeleteOption(item);
                    }}
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-white hover:text-danger"
                  >
                    <TrashIcon />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <FieldError id={errorId} message={error} />
    </div>
  );
}

function HighlightMatch({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword) return <>{text}</>;
  const index = text.indexOf(keyword);
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <span className="text-primary">{keyword}</span>
      {text.slice(index + keyword.length)}
    </>
  );
}
