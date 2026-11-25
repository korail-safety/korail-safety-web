import { notFound } from "next/navigation";

// 어느 화면에도 해당하지 않는 주소를 (main) 레이아웃의 not-found로 보낸다.
// (app/not-found.tsx는 루트 레이아웃만 써서 사이드바가 없음)
export default function CatchAll() {
  notFound();
}
