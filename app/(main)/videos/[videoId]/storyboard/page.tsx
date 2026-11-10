import type { Metadata } from "next";

import { VideoStoryboardPage } from "@/pages/video-storyboard";

export const metadata: Metadata = {
  title: "스토리보드 확인 | 코레일 안전교육 영상 자동화",
};

export default async function Page({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return <VideoStoryboardPage videoId={videoId} />;
}
