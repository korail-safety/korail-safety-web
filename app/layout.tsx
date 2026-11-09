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

export const metadata: Metadata = {
  title: "코레일 안전교육 영상 자동화",
  description: "생성형 AI 기반 철도 안전교육 영상 자동화 서비스",
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
