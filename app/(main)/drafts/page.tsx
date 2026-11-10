import type { Metadata } from "next";

import { DraftsPage } from "@/pages/drafts";

export const metadata: Metadata = {
  title: "임시저장 | 코레일 안전교육 영상 자동화",
};

export default function Page() {
  return <DraftsPage />;
}
