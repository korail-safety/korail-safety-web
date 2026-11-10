import type { Metadata } from "next";

import { VideoAnalysisResultPage } from "@/pages/video-analysis-result";

export const metadata: Metadata = {
  title: "분석 결과 확인 | 코레일 안전교육 영상 자동화",
};

export default async function Page({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return <VideoAnalysisResultPage videoId={videoId} />;
}
