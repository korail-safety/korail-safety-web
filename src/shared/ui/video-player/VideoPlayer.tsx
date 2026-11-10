import { cn } from "@/shared/lib";

export interface VideoPlayerProps {
  src?: string;
  durationSec?: number;
  className?: string;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 영상 재생 영역. 주소가 없으면 길이만 보여주는 자리 표시 */
export function VideoPlayer({ src, durationSec, className }: VideoPlayerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-card bg-player",
        className,
      )}
    >
      {src ? (
        <video src={src} controls className="size-full object-contain" />
      ) : (
        <p className="flex items-center gap-2 text-sm text-white">
          <span aria-hidden="true">▶</span>
          {durationSec !== undefined && formatDuration(durationSec)} 영상
        </p>
      )}
    </div>
  );
}
