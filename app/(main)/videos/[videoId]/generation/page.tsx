import type { Metadata } from "next";

import { VideoGenerationPage } from "@/pages/video-generation";

export const metadata: Metadata = {
  title: "영상 생성 | 코레일 안전교육 영상 자동화",
};

export default async function Page({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return <VideoGenerationPage videoId={videoId} />;
}
