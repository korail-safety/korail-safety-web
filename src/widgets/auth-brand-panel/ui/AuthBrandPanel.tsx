// 1280px 이상에서만 보이는 왼쪽 브랜드 패널. 너비를 고정해 문구가 줄바꿈되지 않게 한다.
export function AuthBrandPanel() {
  return (
    <aside className="relative hidden w-[583px] shrink-0 flex-col justify-center bg-navy px-16 pb-[68px] whitespace-nowrap text-white xl:flex">
      <p className="absolute top-[58px] left-16 text-[22px] font-bold">
        KORAIL
      </p>
      <h1 className="text-[34px] font-bold">안전이 만드는 더 나은 내일</h1>
      <p className="mt-3 text-base text-on-navy-muted">
        한국철도공사 안전교육 영상 제작 시스템
      </p>
      <span
        aria-hidden="true"
        className="mt-6 h-1 w-14 rounded-[2px] bg-primary"
      />
    </aside>
  );
}
