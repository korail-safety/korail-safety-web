"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ROUTES } from "@/shared/config";
import {
  Button,
  Checkbox,
  ChevronLeftIcon,
  FieldError,
  TextField,
} from "@/shared/ui";

import {
  useCheckIdDuplicate,
  useSendEmailCode,
  useSignup,
} from "../api/signup";
import { signupSchema, type SignupFormValues } from "../model/schema";

export function SignupForm() {
  const router = useRouter();
  const signup = useSignup();
  const checkId = useCheckIdDuplicate();
  const sendEmailCode = useSendEmailCode();

  // 중복 확인을 통과한 아이디. 입력값이 바뀌면 다시 확인해야 한다.
  const [checkedId, setCheckedId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      employeeNo: "",
      email: "",
      id: "",
      password: "",
      passwordConfirm: "",
      agreeTerms: false,
    },
  });

  const idValue = useWatch({ control, name: "id" });
  const isIdChecked = checkedId !== null && checkedId === idValue.trim();

  const handleCheckId = async () => {
    if (!(await trigger("id"))) return;
    const id = getValues("id").trim();

    checkId.mutate(id, {
      onSuccess: ({ available }) => {
        if (available) {
          setCheckedId(id);
          clearErrors("id");
        } else {
          setCheckedId(null);
          setError("id", { message: "중복된 아이디입니다." });
        }
      },
      onError: () =>
        setError("id", {
          message: "중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        }),
    });
  };

  const handleSendEmailCode = async () => {
    if (!(await trigger("email"))) return;

    sendEmailCode.mutate(getValues("email").trim(), {
      onError: () =>
        setError("email", {
          message: "인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        }),
    });
  };

  const onSubmit = ({
    name,
    employeeNo,
    email,
    id,
    password,
  }: SignupFormValues) => {
    if (!isIdChecked) {
      setError("id", { message: "아이디 중복 확인을 해 주세요." });
      return;
    }

    signup.mutate(
      { name, employeeNo, email, id, password },
      { onSuccess: () => router.push(ROUTES.login) },
    );
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-[560px] flex-col"
    >
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.login}
          aria-label="로그인으로 돌아가기"
          className="-ml-2 flex size-9 items-center justify-center rounded-control text-ink transition-colors hover:bg-canvas"
        >
          <ChevronLeftIcon />
        </Link>
        <h2 className="text-3xl font-bold text-ink">회원가입</h2>
      </div>

      <div className="mt-[30px] flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-[15px]">
          <TextField
            label="이름 *"
            placeholder="이름을 입력하세요."
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="사번 *"
            placeholder="사번을 입력하세요."
            error={errors.employeeNo?.message}
            {...register("employeeNo")}
          />
        </div>

        <TextField
          type="email"
          label="이메일 *"
          placeholder="이메일을 입력하세요."
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
          endAdornment={
            <Button
              size="xs"
              onClick={handleSendEmailCode}
              disabled={sendEmailCode.isPending}
            >
              {sendEmailCode.isSuccess ? "재전송" : "인증번호 받기"}
            </Button>
          }
        />

        <TextField
          label="아이디 *"
          placeholder="아이디를 입력하세요. 4 ~ 20자"
          autoComplete="username"
          error={errors.id?.message}
          {...register("id")}
          endAdornment={
            <Button
              size="xs"
              onClick={handleCheckId}
              disabled={checkId.isPending || isIdChecked}
            >
              {isIdChecked ? "확인 완료" : "중복 확인"}
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-[15px]">
          <TextField
            type="password"
            label="비밀번호 *"
            placeholder="비밀번호를 입력하세요. 8자 이상"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <TextField
            type="password"
            label="비밀번호 확인 *"
            placeholder="비밀번호를 한 번 더 입력하세요."
            autoComplete="new-password"
            error={errors.passwordConfirm?.message}
            {...register("passwordConfirm")}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col">
        <Checkbox
          label="[필수] 이용약관 및 개인정보 수집 동의 보기"
          {...register("agreeTerms")}
        />
        <FieldError message={errors.agreeTerms?.message} />
      </div>

      <Button
        type="submit"
        disabled={signup.isPending}
        className="mt-[10px] w-full"
      >
        {signup.isPending ? "가입 중..." : "가입하기"}
      </Button>

      {/* 메시지 자리를 미리 확보해 에러 시 레이아웃이 밀리지 않게 한다 */}
      <p role="alert" className="mt-4 h-[18px] text-xs text-danger">
        {signup.isError &&
          "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요."}
      </p>
    </form>
  );
}
