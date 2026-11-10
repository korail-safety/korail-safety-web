"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { AccidentTypeField } from "@/entities/accident-type";
import { TextField } from "@/shared/ui";

import { useSaveVideo } from "../api/saveVideo";
import { saveVideoSchema, type SaveVideoFormValues } from "../model/schema";

interface SaveVideoFormProps {
  /** 바깥의 제출 버튼이 form 속성으로 연결할 id */
  formId: string;
  videoId: string;
  defaultFileName?: string;
  onSaved: () => void;
  onError: () => void;
  onPendingChange?: (pending: boolean) => void;
}

/** 파일명 + 사고 유형을 입력받아 영상을 저장한다 */
export function SaveVideoForm({
  formId,
  videoId,
  defaultFileName = "",
  onSaved,
  onError,
  onPendingChange,
}: SaveVideoFormProps) {
  const save = useSaveVideo(videoId);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SaveVideoFormValues>({
    resolver: zodResolver(saveVideoSchema),
    defaultValues: { fileName: defaultFileName, accidentTypeName: "" },
  });

  const onSubmit = (values: SaveVideoFormValues) => {
    onPendingChange?.(true);
    save.mutate(values, {
      onSuccess: onSaved,
      onError,
      onSettled: () => onPendingChange?.(false),
    });
  };

  return (
    <form
      id={formId}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      // 입력칸에서 Enter를 눌러도 저장(제출)되지 않게 한다. 저장은 버튼으로만
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          (event.target as HTMLElement).tagName === "INPUT"
        ) {
          event.preventDefault();
        }
      }}
      className="flex flex-col gap-4"
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
    </form>
  );
}
