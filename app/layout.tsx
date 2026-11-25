import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";

import { Providers } from "@/app/entrypoint";
import "@/app/styles/globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const SITE_NAME = "코레일 안전교육 영상 자동화";
const DESCRIPTION = "생성형 AI 기반 철도 안전교육 영상 자동화 서비스";

export const metadata: Metadata = {
  // 링크 미리보기 이미지(app/opengraph-image.png)를 절대 주소로 만들 때 쓰는 사이트 주소.
  // 배포 환경에서는 NEXT_PUBLIC_SITE_URL에 실제 주소를 넣는다
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: SITE_NAME,
  description: DESCRIPTION,
  // 카카오톡·슬랙 등에 링크를 붙였을 때 보이는 미리보기
  // (이미지는 app/opengraph-image.png를 Next.js가 자동으로 연결)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
