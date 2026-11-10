"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * 저장하지 않은 변경이 있을 때 페이지를 벗어나는 것을 막는다.
 *
 * - 새로고침·탭 닫기: 브라우저 기본 확인창
 * - 사이트 안의 링크 클릭(사이드바 등): pending 상태가 되어 확인 모달을 띄울 수 있다
 * - 버튼으로 이동하는 경우: guard(() => router.push(...)) 로 감싸서 사용
 *
 * 브라우저 뒤로가기 버튼은 Next.js App Router가 막는 방법을 제공하지 않아 처리하지 않는다.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const router = useRouter();
  const [pending, setPending] = useState<(() => void) | null>(null);
  const dirtyRef = useRef(dirty);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    // 사이트 내부 링크 클릭을 가로챈다 (캡처 단계)
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
      setPending(() => () => router.push(url.pathname + url.search));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [dirty, router]);

  /** 변경이 있으면 확인을 먼저 받고, 없으면 바로 실행한다 */
  const guard = (action: () => void) => {
    if (dirtyRef.current) setPending(() => action);
    else action();
  };

  const confirm = () => {
    const action = pending;
    setPending(null);
    action?.();
  };

  const cancel = () => setPending(null);

  return { pending: pending !== null, guard, confirm, cancel };
}
