import { z } from "zod";

export const saveVideoSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "파일명을 입력해 주세요.")
    .max(100, "파일명은 100자 이내로 입력해 주세요."),
  accidentTypeName: z.string().trim().min(1, "사고 유형을 선택해 주세요."),
});

export type SaveVideoFormValues = z.infer<typeof saveVideoSchema>;
