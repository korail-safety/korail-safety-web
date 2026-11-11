"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { getApiErrorCode } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import {
  Button,
  Checkbox,
  ChevronLeftIcon,
  FieldError,
  TextField,
} from "@/shared/ui";

import { useCheckIdDuplicate, useSignup } from "../api/signup";
import { SIGNUP_ERROR_CODE } from "../api/errorCodes";
import { signupSchema, type SignupFormValues } from "../model/schema";

export function SignupForm() {
  const router = useRouter();
  const signup = useSignup();
  const checkId = useCheckIdDuplicate();

  // 중복 확인을 통과한 아이디. 입력값이 바뀌면 다시 확인해야 한다.
  const [checkedId, setCheckedId] = useState<string | null>(null);
  // 특정 필드에 표시할 수 없는 가입 실패 메시지
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      adminCode: "",
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

  const onSubmit = ({
    name,
    adminCode,
    email,
    id,
    password,
  }: SignupFormValues) => {
    if (!isIdChecked) {
      setError("id", { message: "아이디 중복 확인을 해 주세요." });
      return;
    }

    setSubmitError(null);
    signup.mutate(
      { name, adminCode, email, id, password },
      {
        onSuccess: () => router.push(ROUTES.login),
        onError: (error) => {
          const code = getApiErrorCode(error);
          if (code === SIGNUP_ERROR_CODE.invalidAdminCode) {
            setError("adminCode", {
              message: "유효하지 않은 관리자 코드입니다.",
            });
            return;
          }
          if (code === SIGNUP_ERROR_CODE.idDuplicated) {
            // 중복 확인 이후 다른 사람이 먼저 가입한 경우
            setCheckedId(null);
            setError("id", { message: "중복된 아이디입니다." });
            return;
          }
          setSubmitError(
            "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          );
        },
      },
    );
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col"
    >
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.login}
          aria-label="로그인으로 돌아가기"
          className="-ml-2 flex size-9 items-center justify-center rounded-control text-ink transition-colors hover:bg-canvas"
        >
          <ChevronLeftIcon />
        </Link>
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">회원가입</h2>
      </div>

      <div className="mt-[30px] flex flex-col gap-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[15px]">
          <TextField
            label="이름 *"
            placeholder="이름을 입력하세요."
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="관리자 코드 *"
            placeholder="관리자에게 받은 코드를 입력하세요."
            autoComplete="off"
            error={errors.adminCode?.message}
            {...register("adminCode")}
          />
        </div>

        <TextField
          type="email"
          label="이메일 *"
          placeholder="이메일을 입력하세요."
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[15px]">
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
        {submitError}
      </p>
    </form>
  );
}
