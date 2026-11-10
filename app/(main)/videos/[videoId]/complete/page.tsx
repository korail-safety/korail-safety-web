import type { Metadata } from "next";

import { VideoCompletePage } from "@/pages/video-complete";

export const metadata: Metadata = {
  title: "영상 완성 | 코레일 안전교육 영상 자동화",
};

export default async function Page({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return <VideoCompletePage videoId={videoId} />;
}
