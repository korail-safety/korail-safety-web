import type { ReactNode } from "react";

import { QueryProvider } from "./QueryProvider";

export { AuthGuard } from "./AuthGuard";

export function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
