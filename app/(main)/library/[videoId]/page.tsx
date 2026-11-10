import type { Metadata } from "next";

import { LibraryVideoPage } from "@/pages/library-video";

export const metadata: Metadata = {
  title: "영상 시청 | 코레일 안전교육 영상 자동화",
};

export default async function Page({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return <LibraryVideoPage videoId={videoId} />;
}
