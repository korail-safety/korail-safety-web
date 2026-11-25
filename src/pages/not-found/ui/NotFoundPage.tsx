"use client";

import { useRouter } from "next/navigation";

import { ROUTES } from "@/shared/config";
import { Button } from "@/shared/ui";
import { AppTopBar } from "@/widgets/app-top-bar";

const TOP_BAR_ITEMS = [""];

/** 없는 주소로 들어왔을 때 (404) */
export function NotFoundPage() {
  const router = useRouter();

  // 주소를 직접 입력해서 들어온 경우처럼 돌아갈 화면이 없으면 영상 제작으로 보낸다
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(ROUTES.videoCreate);
  };

  return (
    <>
      <title>페이지를 찾을 수 없습니다 | 코레일 안전교육 영상 자동화</title>
      <AppTopBar items={TOP_BAR_ITEMS} />
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0 lg:overflow-y-auto">
        <section className="flex w-full max-w-[676px] flex-col items-center rounded-card bg-white px-5 py-16 text-center sm:px-10 sm:py-[94px]">
          <p className="text-[64px] leading-none font-bold text-primary sm:text-[88px]">
            404
          </p>
          <h1 className="mt-6 text-xl font-bold text-ink sm:text-2xl">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-ink-secondary">
            주소가 잘못 되었거나, 삭제 또는 이동된 페이지일 수 있습니다.
            <br />
            다시 시도해주세요.
          </p>

          <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              variant="secondary"
              className="h-12 w-full px-4 text-[15px] sm:w-[136px]"
              onClick={goBack}
            >
              이전 화면
            </Button>
            <Button
              className="h-12 w-full px-4 text-[15px] sm:w-[196px]"
              onClick={() => router.push(ROUTES.videoCreate)}
            >
              영상 제작으로 이동
            </Button>
          </div>

          <p className="mt-3 text-[13px] text-ink-secondary">
            문제가 계속되면 담당자에게 문의해 주세요.
          </p>
        </section>
      </main>
    </>
  );
}
