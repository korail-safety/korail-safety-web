import type { StoryboardResponse } from "@/entities/video";
import { Button } from "@/shared/ui";

interface StoryboardViewProps {
  storyboard?: StoryboardResponse;
  retrying?: boolean;
  onRetry: () => void;
}

/** 스토리보드 이미지 영역 (만드는 중·실패·완료) */
export function StoryboardView({
  storyboard,
  retrying,
  onRetry,
}: StoryboardViewProps) {
  const status = storyboard?.status;

  return (
    <div className="flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-control bg-canvas/70 lg:min-h-0">
      {status === "COMPLETED" && storyboard?.imageUrl ? (
        // 서버가 주는 이미지 크기를 모르므로 next/image 대신 img 사용
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={storyboard.imageUrl}
          alt="스토리보드"
          className="size-full animate-fade-in object-contain"
        />
      ) : status === "FAILED" ? (
        <div className="flex flex-col items-center gap-2 px-6 text-center">
          <span className="text-2xl font-bold text-danger">!</span>
          <p className="text-[15px] font-bold text-danger">
            스토리보드를 만들지 못했습니다.
          </p>
          <p className="text-sm text-ink-secondary">
            다시 시도하거나 수정 프롬프트를 바꿔 보세요.
            {storyboard?.errorCode && ` (오류 코드 ${storyboard.errorCode})`}
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
      ) : (
        <div className="flex flex-col items-center gap-3 text-sm text-ink-secondary">
          <span className="size-9 animate-spin rounded-full border-[3px] border-info-bg border-t-primary" />
          스토리보드를 만들고 있어요...
        </div>
      )}
    </div>
  );
}
