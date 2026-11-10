import type { ReactNode } from "react";

import { AuthGuard } from "@/app/entrypoint";
import { AppSidebar } from "@/widgets/app-sidebar";

// 로그인 후 화면 공통 레이아웃 (로그인 확인 + 사이드바)
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-page lg:h-screen lg:flex-row">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col lg:min-h-0">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
