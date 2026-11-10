import { SignupForm } from "@/features/signup";
import { AuthBrandPanel } from "@/widgets/auth-brand-panel";

export function SignupPage() {
  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel />
      <main className="flex flex-1 items-center justify-center bg-page px-5 py-12 sm:px-10 xl:px-16 xl:py-16">
        <div className="w-full max-w-[560px] 2xl:max-w-[640px] min-[1800px]:max-w-[720px]">
          {/* 작은 화면에서는 브랜드 패널 대신 로고만 표시 */}
          <p className="mb-8 text-xl font-bold text-navy xl:hidden">KORAIL</p>
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
