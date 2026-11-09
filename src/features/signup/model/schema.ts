import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "이름을 입력해 주세요."),
    /** 관리자가 발급한 가입 코드. 코드 검증은 서버에서 한다. */
    adminCode: z.string().trim().min(1, "관리자 코드를 입력해 주세요."),
    email: z
      .string()
      .trim()
      .min(1, "이메일을 입력해 주세요.")
      .pipe(z.email("이메일 형식이 올바르지 않습니다.")),
    id: z
      .string()
      .trim()
      .min(1, "아이디를 입력해 주세요.")
      .min(4, "아이디는 4~20자로 입력해 주세요.")
      .max(20, "아이디는 4~20자로 입력해 주세요."),
    password: z
      .string()
      .min(1, "비밀번호를 입력해 주세요.")
      .min(8, "비밀번호는 8자 이상 입력해 주세요."),
    passwordConfirm: z.string().min(1, "비밀번호를 한 번 더 입력해 주세요."),
    agreeTerms: z.boolean().refine((v) => v, "필수 약관에 동의해 주세요."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
