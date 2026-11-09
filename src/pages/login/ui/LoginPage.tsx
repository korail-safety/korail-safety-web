import { LoginForm } from "@/features/login";
import { AuthBrandPanel } from "@/widgets/auth-brand-panel";

export function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel />
      <main className="flex flex-1 items-center bg-page px-[117px] py-16">
        <LoginForm />
      </main>
    </div>
  );
}
