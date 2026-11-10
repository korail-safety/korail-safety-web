import { cn, formatFileSize } from "@/shared/lib";

import { Badge } from "../badge";
import { ProgressBar } from "../progress-bar";

export type FileItemStatus = "uploading" | "success" | "error";

export interface FileItemProps {
  name: string;
  /** 바이트 */
  size: number;
  status: FileItemStatus;
  /** status가 uploading일 때 0 ~ 100 */
  progress?: number;
  /** 상태 문구를 바꾸고 싶을 때 */
  message?: string;
  className?: string;
}

const defaultMessage: Record<FileItemStatus, string> = {
  uploading: "업로드 중",
  success: "파일 확인 완료",
  error: "다시 업로드해 주세요.",
};

function getExtension(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "";
}

/** Figma FileItem. 업로드한 파일 1개의 상태를 보여준다. */
export function FileItem({
  name,
  size,
  status,
  progress = 0,
  message,
  className,
}: FileItemProps) {
  const extension = getExtension(name);
  const text = message ?? defaultMessage[status];

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-card border border-canvas bg-white p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-control text-2xs font-bold",
            extension === "PDF"
              ? "bg-danger-bg text-danger"
              : "bg-info-bg text-primary",
          )}
        >
          {extension}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{name}</p>
          {status === "error" ? (
            <p className="mt-0.5 text-xs text-danger">{text}</p>
          ) : (
            <p className="mt-0.5 text-xs text-ink-secondary">
              {formatFileSize(size)} · {text}
              {status === "uploading" && ` ${Math.round(progress)}%`}
            </p>
          )}
        </div>
        {status === "success" && (
          <Badge tone="success" className="shrink-0">
            업로드 완료
          </Badge>
        )}
        {status === "error" && (
          <Badge tone="danger" className="shrink-0">
            업로드 실패
          </Badge>
        )}
      </div>

      {status === "uploading" && (
        <ProgressBar value={progress} label={`${name} 업로드 진행률`} />
      )}
    </div>
  );
}
