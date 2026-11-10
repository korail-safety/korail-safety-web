import type { Metadata } from "next";

import { VideoAnalysisPage } from "@/pages/video-analysis";

export const metadata: Metadata = {
  title: "보고서 분석 | 코레일 안전교육 영상 자동화",
};

export default async function Page({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return <VideoAnalysisPage videoId={videoId} />;
}
