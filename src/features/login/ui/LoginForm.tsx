"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/shared/config";
import { Button, Checkbox, TextField } from "@/shared/ui";

import { useLogin } from "../api/login";
import { getRememberedId, setRememberedId } from "../model/rememberedId";
import { loginSchema, type LoginFormValues } from "../model/schema";

export function LoginForm() {
  const router = useRouter();
  const { mutate: login, isPending, isError } = useLogin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { id: "", password: "", rememberId: false },
  });

  // 저장된 아이디 불러오기 (localStorage는 클라이언트에서만 접근 가능)
  useEffect(() => {
    const savedId = getRememberedId();
    if (savedId) reset({ id: savedId, password: "", rememberId: true });
  }, [reset]);

  const onSubmit = ({ id, password, rememberId }: LoginFormValues) => {
    login(
      { id, password },
      {
        onSuccess: () => {
          setRememberedId(rememberId ? id : null);
          // TODO: 토큰 저장 방식 확정 후 처리
          router.push(ROUTES.dashboard);
        },
      },
    );
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-[560px] flex-col"
    >
      <p className="text-sm font-semibold text-primary">
        철도 안전교육 콘텐츠 제작 자동화 시스템
      </p>
      <h2 className="mt-4 text-3xl font-bold text-ink">로그인</h2>
      <p className="mt-1 text-sm text-ink-secondary">
        업무 계정으로 로그인해 주세요.
      </p>

      <div className="mt-[46px] flex flex-col gap-2">
        <TextField
          label="아이디"
          placeholder="사번 또는 아이디를 입력하세요."
          autoComplete="username"
          error={errors.id?.message}
          {...register("id")}
        />
        <TextField
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요."
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="mt-1 flex items-center justify-between">
        <Checkbox label="아이디 저장" {...register("rememberId")} />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-[21px] self-start"
      >
        {isPending ? "로그인 중..." : "로그인"}
      </Button>

      <p className="mt-4 text-xs text-ink-secondary">
        아직 계정이 없나요?{" "}
        <Link
          href={ROUTES.signup}
          className="font-bold text-primary underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current"
        >
          회원가입
        </Link>
      </p>

      {/* 메시지 자리를 미리 확보해 에러 시 레이아웃이 밀리지 않게 한다 */}
      <p role="alert" className="mt-[21px] h-[18px] text-xs text-danger">
        {isError && "아이디 또는 비밀번호를 확인해 주세요."}
      </p>
    </form>
  );
}
