import type { Metadata } from "next";

import { LibraryPage } from "@/pages/library";

export const metadata: Metadata = {
  title: "라이브러리 | 코레일 안전교육 영상 자동화",
};

export default function Page() {
  return <LibraryPage />;
}
