"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { isUnauthorized, useMe } from "@/entities/session";
import { ROUTES } from "@/shared/config";

/** 로그인하지 않은 사용자를 로그인 화면으로 보낸다 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { error } = useMe();
  const unauthorized = isUnauthorized(error);

  useEffect(() => {
    if (unauthorized) router.replace(ROUTES.login);
  }, [unauthorized, router]);

  if (unauthorized) return null;
  return <>{children}</>;
}
