import { useEffect, type ReactNode } from "react";

import type { StoryboardResponse } from "@/entities/video";
import { cn, stripUrlQuery } from "@/shared/lib";
import { Button } from "@/shared/ui";

interface StoryboardViewProps {
  storyboard?: StoryboardResponse;
  /** 보고 있는 장면 번호 (1부터) */
  sceneIndex: number;
  retrying?: boolean;
  /** 장면 구성 자체가 실패했을 때 처음부터 다시 만들기 */
  onRetry: () => void;
}

// 장면 설명은 3줄 높이로 고정 (장면마다 설명 길이가 달라도 카드 높이가 바뀌지 않게, 넘치면 안에서 스크롤)
const CAPTION =
  "h-[calc(3*1.625em)] overflow-y-auto text-[14px] leading-relaxed text-ink";

const FRAME =
  "flex aspect-video w-full items-center justify-center overflow-hidden rounded-control bg-canvas/70";

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 text-center text-sm text-ink-secondary">
      <span className="size-9 animate-spin rounded-full border-[3px] border-info-bg border-t-primary" />
      {label}
    </div>
  );
}

/** 이미지 + 설명 자리 (상태와 상관없이 높이를 같게) */
function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {children}
      <div className={CAPTION} aria-hidden />
    </div>
  );
}

/** 스토리보드 장면 1개 (이미지 + 설명). 장면 구성 중·실패도 여기서 보여준다 */
export function StoryboardView({
  storyboard,
  sceneIndex,
  retrying,
  onRetry,
}: StoryboardViewProps) {
  const scenes = storyboard?.scenes ?? [];
  const scene = scenes.find((item) => item.index === sceneIndex);
  const nextImageUrl = scenes.find(
    (item) => item.index === sceneIndex + 1,
  )?.imageUrl;

  // 다음 장면 이미지를 미리 받아둔다 (넘기자마자 바로 보이게, 브라우저 캐시에 남음)
  useEffect(() => {
    if (!nextImageUrl) return;
    const image = new Image();
    image.src = nextImageUrl;
  }, [nextImageUrl]);

  // 장면 구성(시나리오) 단계: 아직 장면 목록이 없다
  if (scenes.length === 0) {
    if (storyboard?.status === "FAILED") {
      return (
        <Layout>
          <div className={FRAME}>
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <span className="text-2xl font-bold text-danger">!</span>
              <p className="text-[15px] font-bold text-danger">
                스토리보드를 만들지 못했습니다.
              </p>
              <p className="text-sm text-ink-secondary">
                잠시 후 다시 시도해 주세요.
                {storyboard.errorCode && ` (오류 코드 ${storyboard.errorCode})`}
              </p>
              <Button
                variant="secondary"
                className="mt-3"
                disabled={retrying}
                onClick={onRetry}
              >
                {retrying ? "다시 시도 중..." : "다시 만들기"}
              </Button>
            </div>
          </div>
        </Layout>
      );
    }
    return (
      <Layout>
        <div className={FRAME}>
          <Spinner label="보고서 내용으로 장면을 구성하고 있어요..." />
        </div>
      </Layout>
    );
  }

  if (!scene) {
    return (
      <Layout>
        <div className={FRAME} />
      </Layout>
    );
  }

  const building = scene.status === "IN_PROGRESS";

  return (
    <div className="flex flex-col gap-3">
      <div className={cn(FRAME, "relative")}>
        {scene.imageUrl && (
          // 서버가 주는 S3 임시 주소라 next/image 대신 img 사용
          // eslint-disable-next-line @next/next/no-img-element
          <img
            // 서명(? 뒤)이 바뀌어도 같은 파일이면 다시 그리지 않게 경로로 key를 잡는다
            key={stripUrlQuery(scene.imageUrl)}
            src={scene.imageUrl}
            alt={`스토리보드 장면 ${scene.index}`}
            className={cn(
              "size-full animate-fade-in object-contain transition-opacity",
              // 수정 중이면 이전 이미지를 흐리게 두고 위에 진행 표시
              building && "opacity-30",
            )}
          />
        )}
        {building ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner label={`장면 ${scene.index}을 만들고 있어요...`} />
          </div>
        ) : scene.status === "FAILED" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-canvas/80 px-6 text-center">
            <span className="text-2xl font-bold text-danger">!</span>
            <p className="text-[15px] font-bold text-danger">
              이 장면을 만들지 못했습니다.
            </p>
            <p className="text-sm text-ink-secondary">
              오른쪽에 수정 요청을 입력해 다시 만들어 보세요.
              {scene.errorCode && ` (오류 코드 ${scene.errorCode})`}
            </p>
          </div>
        ) : null}
      </div>

      <p className={CAPTION}>
        <span className="font-bold">장면 {scene.index}</span>
        {scene.durationSec !== null && (
          <span className="text-ink-secondary">
            {" "}
            · 예상 {scene.durationSec}초
          </span>
        )}
        {scene.description && (
          <span className="text-ink-secondary"> — {scene.description}</span>
        )}
      </p>
    </div>
  );
}
