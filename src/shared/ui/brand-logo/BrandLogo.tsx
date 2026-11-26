import Image from "next/image";

import { cn } from "@/shared/lib";

interface BrandLogoProps {
  /** white: 남색 등 어두운 배경용 흰색 로고 / color: 밝은 배경용 원본 색 로고 */
  variant?: "white" | "color";
  /** 높이는 꼭 className으로 정한다 (예: h-6). 너비는 비율대로 자동. cn은 클래스 병합을 안 해서 기본 높이를 두지 않음 */
  className?: string;
  priority?: boolean;
}

// 원본 로고 크기 (비율 유지용)
const LOGO_WIDTH = 1041;
const LOGO_HEIGHT = 254;

/** 코레일 로고 */
export function BrandLogo({
  variant = "white",
  className,
  priority,
}: BrandLogoProps) {
  return (
    <Image
      src={variant === "white" ? "/korail-logo-white.png" : "/korail-logo.png"}
      alt="KORAIL"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={cn("w-auto", className)}
    />
  );
}
