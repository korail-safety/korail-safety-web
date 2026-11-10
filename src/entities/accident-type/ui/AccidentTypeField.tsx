"use client";

import { useState } from "react";

import { getApiErrorCode } from "@/shared/api";
import { ConfirmDialog, CreatableCombobox, InputDialog } from "@/shared/ui";

import {
  ACCIDENT_TYPE_ERROR_CODE,
  useAccidentTypes,
  useCreateAccidentType,
  useDeleteAccidentType,
  useUpdateAccidentType,
  type AccidentType,
} from "../api/accidentTypes";

interface AccidentTypeFieldProps {
  /** 선택된 유형 이름 (없으면 빈 문자열) */
  value: string;
  onChange: (name: string) => void;
  error?: string;
  label?: string;
}

/**
 * 사고 유형 입력칸.
 * 기존 유형 검색·선택 + 새 유형 만들기 + 유형 이름 수정·삭제까지 한 곳에서 처리한다.
 */
export function AccidentTypeField({
  value,
  onChange,
  error,
  label = "사고유형",
}: AccidentTypeFieldProps) {
  const { data: accidentTypes = [] } = useAccidentTypes();
  const createType = useCreateAccidentType();
  const updateType = useUpdateAccidentType();
  const deleteType = useDeleteAccidentType();

  const [createError, setCreateError] = useState<string>();
  // 이름 수정 / 삭제 확인 중인 유형
  const [editing, setEditing] = useState<AccidentType | null>(null);
  const [editError, setEditError] = useState<string>();
  const [deleting, setDeleting] = useState<AccidentType | null>(null);
  const [deleteError, setDeleteError] = useState<string>();
  const findType = (name: string) =>
    accidentTypes.find((type) => type.name === name) ?? null;

  return (
    <>
      <CreatableCombobox
        label={label}
        placeholder="사고 유형을 검색하거나 새로 입력해 주세요."
        value={value}
        onChange={(next) => {
          setCreateError(undefined);
          onChange(next);
        }}
        options={accidentTypes.map((type) => type.name)}
        optionsTitle="기존 유형"
        createLabel={(input) => `"${input}" 새 유형 만들기`}
        creating={createType.isPending}
        onEditOption={(name) => {
          setEditError(undefined);
          setEditing(findType(name));
        }}
        onDeleteOption={(name) => {
          setDeleteError(undefined);
          setDeleting(findType(name));
        }}
        onCreate={async (name) => {
          setCreateError(undefined);
          try {
            await createType.mutateAsync(name);
          } catch (createFailure) {
            setCreateError("유형을 추가하지 못했습니다. 다시 시도해 주세요.");
            throw createFailure;
          }
        }}
        error={createError ?? error}
      />

      {editing && (
        <InputDialog
          key={editing.id}
          open
          title="사고 유형 이름 수정"
          label="유형 이름"
          defaultValue={editing.name}
          error={editError}
          pending={updateType.isPending}
          onCancel={() => setEditing(null)}
          onConfirm={(name) => {
            if (name === editing.name) {
              setEditing(null);
              return;
            }
            updateType.mutate(
              { id: editing.id, name },
              {
                onSuccess: (updated) => {
                  // 지금 고른 유형이었다면 바뀐 이름으로 맞춘다
                  if (value === editing.name) onChange(updated.name);
                  setEditing(null);
                },
                onError: (updateFailure) =>
                  setEditError(
                    getApiErrorCode(updateFailure) ===
                      ACCIDENT_TYPE_ERROR_CODE.duplicated
                      ? "이미 있는 유형 이름입니다."
                      : "이름을 바꾸지 못했습니다. 다시 시도해 주세요.",
                  ),
              },
            );
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title={`'${deleting?.name ?? ""}' 유형을 삭제할까요?`}
        description={
          deleteError ??
          "삭제한 유형은 목록과 라이브러리 카테고리에서 사라집니다."
        }
        cancelLabel="취소"
        confirmLabel={deleteType.isPending ? "삭제 중..." : "삭제하기"}
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          deleteType.mutate(deleting.id, {
            onSuccess: () => {
              // 지금 고른 유형이었다면 선택을 비운다
              if (value === deleting.name) onChange("");
              setDeleting(null);
            },
            onError: (deleteFailure) =>
              setDeleteError(
                getApiErrorCode(deleteFailure) ===
                  ACCIDENT_TYPE_ERROR_CODE.inUse
                  ? "이 유형을 쓰는 영상이 있어서 삭제할 수 없습니다.\n영상의 유형을 먼저 바꿔 주세요."
                  : "삭제하지 못했습니다. 다시 시도해 주세요.",
              ),
          });
        }}
      />
    </>
  );
}
