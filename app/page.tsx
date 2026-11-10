import { redirect } from "next/navigation";

import { ROUTES } from "@/shared/config";

// 홈 화면 없이 바로 보고서 업로드로 이동한다.
// TODO: 로그인 여부 확인 후 미로그인 시 /login 으로 보내기
export default function RootPage() {
  redirect(ROUTES.videoCreate);
}
