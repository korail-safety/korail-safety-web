"use client";

import { cn } from "@/shared/lib";

import { useLogout } from "../api/logout";

export function LogoutButton({ className }: { className?: string }) {
  const { mutate: logout, isPending } = useLogout();

  return (
    <button
      type="button"
      onClick={() => logout()}
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
