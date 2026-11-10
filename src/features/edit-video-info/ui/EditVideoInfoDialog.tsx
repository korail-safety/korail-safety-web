"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { AccidentTypeField } from "@/entities/accident-type";
import type { LibraryVideo } from "@/entities/video";
import { Button, TextField } from "@/shared/ui";

import { useUpdateVideoInfo } from "../api/updateVideoInfo";

const schema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "파일명을 입력해 주세요.")
    .max(100, "파일명은 100자 이내로 입력해 주세요."),
  accidentTypeName: z.string().trim().min(1, "사고 유형을 선택해 주세요."),
});
type FormValues = z.infer<typeof schema>;

interface EditVideoInfoDialogProps {
  video: LibraryVideo;
  onClose: () => void;
  onSaved?: () => void;
}

/** 9-1 · 이름 및 유형 수정 모달 */
export function EditVideoInfoDialog({
  video,
  onClose,
  onSaved,
}: EditVideoInfoDialogProps) {
  const titleId = useId();
  const update = useUpdateVideoInfo(video.id);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fileName: video.title,
      accidentTypeName: video.accidentType?.name ?? "",
    },
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[404px] animate-fade-in rounded-card bg-white p-8 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-bold text-ink">
          이름 및 유형 수정
        </h2>

        <form
          noValidate
          className="mt-5 flex flex-col gap-1.5"
          onSubmit={handleSubmit((values) =>
            update.mutate(values, {
              onSuccess: () => {
                onSaved?.();
                onClose();
              },
            }),
          )}
          // Enter로 저장되지 않게 (저장은 버튼으로만)
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              (event.target as HTMLElement).tagName === "INPUT"
            ) {
              event.preventDefault();
            }
          }}
        >
          <TextField
            label="파일명"
            placeholder="파일명을 입력해 주세요."
            error={errors.fileName?.message}
            {...register("fileName")}
          />
          <Controller
            control={control}
            name="accidentTypeName"
            render={({ field }) => (
              <AccidentTypeField
                value={field.value}
                onChange={field.onChange}
                error={errors.accidentTypeName?.message}
              />
            )}
          />

          {update.isError && (
            <p role="alert" className="text-xs text-danger">
              저장하지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2.5">
            <Button variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
