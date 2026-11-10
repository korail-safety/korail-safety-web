import { Button } from "@/shared/ui";

interface JobErrorCardProps {
  title: string;
  errorCode?: string;
  retrying?: boolean;
  onBack: () => void;
  onRetry: () => void;
}

/** 오래 걸리는 서버 작업이 실패했을 때의 카드 (진행 카드와 같은 크기) */
export function JobErrorCard({
  title,
  errorCode,
  retrying,
  onBack,
  onRetry,
}: JobErrorCardProps) {
  return (
    <section
      role="alert"
      className="flex min-h-[460px] w-full max-w-[800px] flex-col items-center justify-center rounded-card border border-danger bg-danger-bg px-5 py-12 text-center sm:px-10"
    >
      <span
        aria-hidden="true"
        className="flex size-14 animate-pop-in items-center justify-center rounded-full bg-white text-2xl font-bold text-danger"
      >
        !
      </span>
      <h1 className="mt-5 text-xl font-bold text-danger sm:text-[22px]">
        {title}
      </h1>
      <p className="mt-3 text-[15px] text-ink-secondary">
        일시적인 문제일 수 있어요. 다시 시도해 주세요.
        {errorCode && ` (오류 코드 ${errorCode})`}
      </p>

      <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button
          variant="secondary"
          className="h-12 w-full px-4 text-[15px] sm:w-[168px]"
          onClick={onBack}
        >
          이전
        </Button>
        <Button
          variant="danger"
          className="h-12 w-full px-4 text-[15px] sm:w-[168px]"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? "다시 시도 중..." : "다시 시도하기"}
        </Button>
      </div>

      <p className="mt-5 text-[13px] text-ink-secondary">
        ⓘ 문제가 계속되면 담당자에게 문의해 주세요.
      </p>
    </section>
  );
}
