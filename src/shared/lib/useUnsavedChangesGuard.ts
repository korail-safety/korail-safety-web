"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { setLeaveHandler } from "./leaveRequest";

/**
 * 확인을 기다리는 이동의 종류
 * - dirty: 쓰다 만 내용이 있는데 이동하려 함 (같은 작업 안 이동 포함)
 * - leave: 작업 화면 자체를 벗어나려 함 (사이드바 메뉴, 로그아웃)
 */
export type LeaveReason = "dirty" | "leave";

interface Options {
  /** true면 작업 화면을 벗어날 때마다(사이드바 링크·로그아웃) 확인을 받는다 */
  confirmLeave?: boolean;
}

/**
 * 페이지를 벗어나는 것을 막고 확인을 받는다.
 *
 * - 새로고침·탭 닫기: 쓰다 만 내용(dirty)이 있을 때만 브라우저 기본 확인창
 *   (브라우저 정책상 직접 만든 모달은 띄울 수 없다)
 * - 사이트 안의 링크 클릭(사이드바 등): confirmLeave면 "leave", 아니면 dirty일 때 "dirty"
 * - 로그아웃: confirmLeave면 "leave" (requestLeave로 연결)
 * - 버튼으로 같은 작업 안에서 이동: guard(() => router.push(...)) — dirty일 때만 확인
 *
 * 브라우저 뒤로가기 버튼은 Next.js App Router가 막는 방법을 제공하지 않아 처리하지 않는다.
 */
export function useUnsavedChangesGuard(
  dirty: boolean,
  { confirmLeave = false }: Options = {},
) {
  const router = useRouter();
  const [pending, setPending] = useState<{
    reason: LeaveReason;
    action: () => void;
  } | null>(null);
  const dirtyRef = useRef(dirty);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // 새로고침·탭 닫기
  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  // 사이트 내부 링크 클릭을 가로챈다 (캡처 단계)
  useEffect(() => {
    if (!dirty && !confirmLeave) return;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const anchor = (event.target as Element).closest("a");
      if (!anchor || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      event.stopPropagation();
      setPending({
        reason: confirmLeave ? "leave" : "dirty",
        action: () => router.push(url.pathname + url.search),
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [dirty, confirmLeave, router]);

  // 로그아웃 등 페이지 밖 버튼
  useEffect(() => {
    if (!confirmLeave) return;
    return setLeaveHandler((proceed) =>
      setPending({ reason: "leave", action: proceed }),
    );
  }, [confirmLeave]);

  /** 같은 작업 안 이동: 쓰다 만 내용이 있으면 확인을 먼저 받고, 없으면 바로 실행한다 */
  const guard = (action: () => void) => {
    if (dirtyRef.current) setPending({ reason: "dirty", action });
    else action();
  };

  const confirm = () => {
    const action = pending?.action;
    setPending(null);
    action?.();
  };

  const cancel = () => setPending(null);

  return {
    /** 확인을 기다리는 이동이 있는지 */
    pending: pending !== null,
    /** 어떤 확인인지 (모달 종류를 고를 때) */
    reason: pending?.reason ?? null,
    guard,
    confirm,
    cancel,
  };
}
