import type { ReactNode } from "react";

import { formatShortDate, type LibraryVideo } from "../api/library";

interface LibraryVideoCardProps {
  video: LibraryVideo;
  onOpen: () => void;
  /** 오른쪽 위 "⋯" 메뉴 자리 */
  menu?: ReactNode;
}

/** Figma VideoBox. 라이브러리 영상 카드 */
export function LibraryVideoCard({
  video,
  onOpen,
  menu,
}: LibraryVideoCardProps) {
  return (
    <article className="group flex flex-col rounded-card bg-white p-5">
      {/* 메뉴는 버튼 안에 넣을 수 없어서 겹쳐 띄운다. 기준 = 썸네일 오른쪽 위 */}
      <div className="relative">
        {menu && <div className="absolute top-1.5 right-1.5 z-10">{menu}</div>}

        <button
          type="button"
          onClick={onOpen}
          className="flex w-full cursor-pointer flex-col text-left"
          aria-label={`${video.title} 시청하기`}
        >
          <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-control bg-canvas">
            {video.thumbnailUrl ? (
              // 썸네일 크기를 모르므로 img 사용
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.thumbnailUrl}
                alt=""
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <span className="text-sm text-ink-tertiary">영상 썸네일</span>
            )}
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="min-w-0 truncate text-[15px] font-bold text-ink">
              {video.title}
            </p>
            <span
              className={
                video.accidentType
                  ? "shrink-0 rounded-full bg-primary px-3.5 py-1 text-2xs font-semibold text-white"
                  : "shrink-0 rounded-full bg-canvas px-3.5 py-1 font-semibold text-2xs text-ink-secondary"
              }
            >
              {video.accidentType?.name ?? "미분류"}
            </span>
          </div>
          <p className="mt-2 text-2xs text-ink-secondary">
            수정일 {formatShortDate(video.updatedAt)}
          </p>
        </button>
      </div>
    </article>
  );
}
