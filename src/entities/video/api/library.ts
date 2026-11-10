import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

import type { SortOrder } from "../model/enums";

// TODO: 백엔드 API 명세 확정 후 맞추기 (페이지네이션 포함)

export interface LibraryVideo {
  id: string;
  title: string;
  thumbnailUrl?: string;
  /** ISO 날짜 문자열 */
  updatedAt: string;
  /** 유형이 없으면 null (미분류) */
  accidentType: { id: string; name: string } | null;
}

export interface LibraryVideoDetail extends LibraryVideo {
  videoUrl?: string;
  durationSec: number;
}

export interface LibraryVideosParams {
  keyword?: string;
  /** 없으면 전체 */
  accidentTypeId?: string;
  sort: SortOrder;
}

export interface LibraryVideosResponse {
  items: LibraryVideo[];
  /** 검색·필터와 상관없는 전체 영상 수 ("전체 N") */
  totalCount: number;
}

export const libraryVideosQueryKey = ["library", "videos"] as const;

export function useLibraryVideos(params: LibraryVideosParams) {
  return useQuery({
    queryKey: [...libraryVideosQueryKey, params],
    queryFn: async () => {
      const { data } = await apiClient.get<LibraryVideosResponse>(
        "/library/videos",
        { params },
      );
      return data;
    },
    // 검색·필터를 바꾸는 동안 이전 목록을 유지해 깜빡이지 않게
    placeholderData: keepPreviousData,
  });
}

export const libraryVideoQueryKey = (videoId: string) =>
  ["library", "videos", "detail", videoId] as const;

export function useLibraryVideo(videoId: string) {
  return useQuery({
    queryKey: libraryVideoQueryKey(videoId),
    queryFn: async () => {
      const { data } = await apiClient.get<LibraryVideoDetail>(
        `/library/videos/${videoId}`,
      );
      return data;
    },
  });
}

/** "2026-11-10T..." → "26-11-10" (디자인의 yy-mm-dd) */
export function formatShortDate(iso: string) {
  const date = new Date(iso);
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
