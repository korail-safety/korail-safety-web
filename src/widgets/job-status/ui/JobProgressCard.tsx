"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib";
import { CheckIcon, ProgressBar } from "@/shared/ui";

import { formatElapsed, useElapsedSeconds } from "./useElapsedSeconds";

export interface JobStep {
  key: string;
  label: string;
  /** 진행 중일 때 보여줄 문구 (예: "파일 읽는 중") */
  progressLabel: string;
  /** 진행 중일 때 아래에 보여줄 설명 */
  description: string;
}

interface JobProgressCardProps {
  /** 상단 아이콘 (회전 링 안에 들어감) */
  icon: ReactNode;
  title: string;
  completedTitle: string;
  completedDescription: string;
  footnote: string;
  steps: readonly JobStep[];
  /** 지금 진행 중인 단계 key. 없으면 첫 단계로 본다. */
  currentStep?: string;
  estimatedMinutes?: number;
  /** 작업 완료 (다음 화면으로 넘어가기 직전) */
  completed?: boolean;
}

type StepState = "done" | "current" | "pending";

function StepMarker({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span className="flex size-6 animate-pop-in items-center justify-center rounded-full bg-success text-white">
        <CheckIcon />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="size-6 animate-spin rounded-full border-[2.5px] border-info-bg border-t-primary" />
    );
  }
  return <span className="size-6 rounded-full border-2 border-canvas" />;
}

/** 오래 걸리는 서버 작업(분석, 영상 생성 등)의 진행 상태 카드 */
export function JobProgressCard({
  icon,
  title,
  completedTitle,
  completedDescription,
  footnote,
  steps,
  currentStep,
  estimatedMinutes,
  completed = false,
}: JobProgressCardProps) {
  const elapsed = useElapsedSeconds(!completed);
  const total = steps.length;
  const currentIndex = completed
    ? total
    : Math.max(
        0,
        steps.findIndex((step) => step.key === currentStep),
      );
  // 지난 단계 + 지금 단계의 절반만큼 채운다
  const progress = completed ? 100 : ((currentIndex + 0.5) / total) * 100;

  return (
    <section
      aria-live="polite"
      className="flex min-h-[460px] w-full max-w-[800px] flex-col items-center justify-center rounded-card border border-transparent bg-white px-5 py-12 text-center sm:px-10"
    >
      {/* 상단 아이콘: 진행 중이면 회전 링, 완료면 체크 */}
      {completed ? (
        <span className="flex size-14 animate-pop-in items-center justify-center rounded-full bg-success text-white">
          <CheckIcon className="scale-150" />
        </span>
      ) : (
        <span className="relative flex size-14 items-center justify-center rounded-full bg-info-bg text-primary">
          {icon}
          <span className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-t-primary [animation-duration:1.2s]" />
        </span>
      )}

      <h1 className="mt-5 text-xl font-bold text-ink sm:text-[22px]">
        {completed ? completedTitle : title}
      </h1>
      <p className="mt-3 text-[15px] text-ink-secondary">
        {completed ? (
          completedDescription
        ) : (
          <>
            잠시만 기다려 주세요.
            {estimatedMinutes !== undefined &&
              ` 약 ${estimatedMinutes}분 남았어요.`}
            <span className="ml-2 text-[13px] tabular-nums">
              경과 {formatElapsed(elapsed)}
            </span>
          </>
        )}
      </p>

      <div className="mt-6 w-full max-w-[560px]">
        <ProgressBar
          value={progress}
          animated={!completed}
          label={`${title} 진행률`}
          className="h-1.5"
        />
      </div>

      <ol className="mt-5 flex w-full max-w-[560px] flex-col gap-3 text-left">
        {steps.map((step, index) => {
          const state: StepState =
            index < currentIndex
              ? "done"
              : index === currentIndex
                ? "current"
                : "pending";
          return (
            <li
              key={step.key}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-control border px-4 py-3 transition-colors duration-300",
                state === "current"
                  ? "border-primary bg-primary-subtle"
                  : "border-canvas bg-white",
              )}
            >
              {/* key로 상태가 바뀔 때마다 마커 애니메이션을 다시 재생 */}
              <StepMarker key={state} state={state} />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[15px]",
                    state === "current" && "font-bold text-ink",
                    state === "done" && "text-ink",
                    state === "pending" && "text-ink-secondary",
                  )}
                >
                  {state === "current" ? step.progressLabel : step.label}
                  {state === "done" && <span className="sr-only"> (완료)</span>}
                </p>
                {state === "current" && (
                  <p className="mt-0.5 animate-fade-in text-[13px] text-ink-secondary">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-[13px] text-ink-secondary">ⓘ {footnote}</p>
    </section>
  );
}
