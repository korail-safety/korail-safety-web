"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useMe } from "@/entities/session";
import { LogoutButton } from "@/features/logout";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib";

const NAV_ITEMS = [
  { label: "영상 제작", href: ROUTES.videoCreate },
  { label: "라이브러리", href: ROUTES.library },
  { label: "임시저장", href: ROUTES.drafts },
] as const;

function Brand() {
  return (
    <div className="px-1">
      <p className="text-xl font-bold text-white">KORAIL</p>
      <p className="mt-3 text-[11px] font-semibold text-on-navy-subtle">
        안전교육 영상 제작
      </p>
    </div>
  );
}

function NavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="주 메뉴">
      <ul className="flex flex-col gap-2.5">
        {NAV_ITEMS.map(({ label, href }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex h-11 items-center rounded-control px-5 text-sm font-bold text-white transition-colors",
                  active ? "bg-primary" : "hover:bg-white/10",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppSidebar() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const { data: me } = useMe();

  const content = (
    <>
      <Brand />
      <hr className="mt-6 border-navy-divider" />
      <div className="mt-[30px]">
        {/* 메뉴를 누르면 모바일 서랍을 닫는다 */}
        <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
      </div>
      <div className="mt-auto pt-6">
        {/* 사용자 정보를 받기 전에는 자리만 잡아둔다 */}
        <p className="h-[20px] truncate px-1 text-sm text-on-navy-muted">
          {me && (
            <>
              <span className="font-bold text-white">{me.name} </span>님
            </>
          )}
        </p>
        <LogoutButton className="mt-3" />
      </div>
    </>
  );

  return (
    <>
      {/* 데스크톱: 왼쪽 고정 사이드바 */}
      <aside className="sticky top-0 hidden h-screen w-[247px] shrink-0 flex-col bg-navy px-6 pt-7 pb-8 lg:flex">
        {content}
      </aside>

      {/* 모바일·태블릿: 상단 바 + 서랍 메뉴 */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-navy px-5 lg:hidden">
        <p className="text-lg font-bold text-white">KORAIL</p>
        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex size-10 cursor-pointer items-center justify-center rounded-control text-white transition-colors hover:bg-white/10"
        >
          <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
            <path
              d="M1 1h18M1 7h18M1 13h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          open ? "visible" : "invisible",
        )}
      >
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          aria-label="메뉴"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[247px] flex-col bg-navy px-6 pt-7 pb-10 transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
