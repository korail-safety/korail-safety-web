import { replaceEqualDeep, useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";
import { keepPresignedUrl } from "@/shared/lib";

import type { GenerationStatus } from "../model/enums";

/** 스토리보드 장면 1개 (장면마다 따로 만들고 따로 수정한다) */
export interface StoryboardScene {
  /** 장면 번호 (1부터) */
  index: number;
  /** 장면 이미지 주소. 아직 없거나 만들지 못했으면 null */
  imageUrl: string | null;
  /** 장면 설명 (나레이션·자막용) */
  description: string | null;
  /** 예상 길이(초) */
  durationSec: number | null;
  /** 이 장면 이미지를 만드는 중 / 완료 / 실패 */
  status: GenerationStatus;
  errorCode: string | null;
}

export interface StoryboardResponse {
  /**
   * 전체 상태. 장면을 구성하는 중이거나 어느 장면이든 만드는 중이면 IN_PROGRESS,
   * 장면 구성 자체가 실패했거나 실패한 장면이 있으면 FAILED
   */
  status: GenerationStatus;
  errorCode: string | null;
  /** 장면 목록 (장면 구성이 끝나기 전에는 빈 배열) */
  scenes: StoryboardScene[];
}

export const storyboardQueryKey = (videoId: string) =>
  ["videos", videoId, "storyboard"] as const;

const POLLING_INTERVAL_MS = 3000;

/**
 * 서버는 조회할 때마다 이미지 주소의 서명만 바꿔서 준다.
 * 같은 이미지면 이전 주소를 유지해서, 3초마다 같은 사진을 다시 받고 다시 그리지 않게 한다.
 */
function keepSceneImageUrls(
  prev: unknown,
  next: StoryboardResponse,
): StoryboardResponse {
  const prevScenes = (prev as StoryboardResponse | undefined)?.scenes ?? [];
  const merged: StoryboardResponse = {
    ...next,
    scenes: next.scenes.map((scene) => {
      const prevScene = prevScenes.find((item) => item.index === scene.index);
      return {
        ...scene,
        imageUrl: keepPresignedUrl(prevScene?.imageUrl, scene.imageUrl),
      };
    }),
  };
  // 바뀐 게 없으면 이전 객체를 그대로 돌려줘서 불필요한 리렌더링도 막는다
  return replaceEqualDeep(prev, merged);
}

/** 스토리보드. 만드는 중이면 3초마다 다시 조회한다. */
export function useStoryboard(videoId: string) {
  return useQuery({
    queryKey: storyboardQueryKey(videoId),
    queryFn: async () => {
      const { data } = await apiClient.get<StoryboardResponse>(
        `/videos/${videoId}/storyboard`,
      );
      return data;
    },
    structuralSharing: (prev, next) =>
      keepSceneImageUrls(prev, next as StoryboardResponse),
    // 장면 구성 중이거나, 어느 장면이든 만드는 중이면 계속 조회
    refetchInterval: (query) => {
      const data = query.state.data;
      const busy =
        data?.status === "IN_PROGRESS" ||
        data?.scenes.some((scene) => scene.status === "IN_PROGRESS");
      return busy ? POLLING_INTERVAL_MS : false;
    },
  });
}

/**
 * 분석 결과로 스토리보드 만들기를 시작한다.
 * 이미 만든 스토리보드가 있으면 서버가 409 STORYBOARD_ALREADY_EXISTS를 준다
 */
export function useStartStoryboard(videoId: string) {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/videos/${videoId}/storyboard`);
    },
  });
}
