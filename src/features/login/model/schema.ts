import { z } from "zod";

export const loginSchema = z.object({
  id: z.string().trim().min(1, "아이디를 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
  rememberId: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
