"use client";

import { cn, requestLeave } from "@/shared/lib";

import { useLogout } from "../api/logout";

export function LogoutButton({ className }: { className?: string }) {
  const { mutate: logout, isPending } = useLogout();

  return (
    <button
      type="button"
      // 작업 화면이면 임시저장/삭제를 먼저 묻는다 (작업 화면이 아니면 바로 로그아웃)
      onClick={() => requestLeave(() => logout())}
      disabled={isPending}
      className={cn(
        "flex h-9 w-full cursor-pointer items-center justify-center rounded-control border border-navy-divider text-xs font-bold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {isPending ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
