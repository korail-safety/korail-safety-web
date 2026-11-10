// 분석 결과 확인 화면용 가짜 데이터

export const MOCK_TOTAL_PAGES = 24;

export const mockExtractedItems = [
  {
    key: "ACCIDENT_OVERVIEW",
    content:
      "2026년 3월 12일 14시 20분경 ○○역 구내 2번 선로에서 입환 중이던 열차가 정차 중인 화차와 접촉한 사고 (예시)",
    sourcePage: 3,
    sourceText:
      "○○역 구내 2번 선로에서 입환 중이던 열차가 정차 중인 화차와 접촉",
  },
  {
    key: "ACCIDENT_CAUSE",
    content:
      "작업자 부주의 및 입환 신호 확인 절차 미흡, 무선 교신 중 위치 정보 전달 누락 (예시)",
    sourcePage: 5,
    sourceText: "입환 신호 확인 절차가 충분히 이루어지지 않았으며",
  },
  {
    key: "ACTION_TAKEN",
    content:
      "사고 직후 해당 선로 운행 중지, 차량 점검 및 관계자 안전 교육 시행 (예시)",
    sourcePage: 8,
    sourceText: "해당 선로의 운행을 즉시 중지하고 차량 점검을 실시하였다",
  },
  {
    key: "PREVENTION",
    content:
      "입환 작업 절차 개선, 무선 교신 표준 문구 도입 및 정기 모니터링 강화 (예시)",
    sourcePage: 12,
    sourceText: "무선 교신 표준 문구를 도입하고 정기적인 모니터링을 강화",
  },
];

const FILLER =
  "본 보고서는 ○○역 구내에서 발생한 철도 안전사고에 대한 조사 결과를 정리한 것이다. 조사는 현장 확인, 관계자 면담, 기록 분석의 순서로 진행되었다. ";

export function getMockReportPage(page: number) {
  const source = mockExtractedItems.find((item) => item.sourcePage === page);
  const paragraphs = [
    `[${page}쪽]`,
    FILLER.repeat(3),
    source
      ? `조사 결과 ${source.sourceText}한 것으로 확인되었다. 이에 대한 세부 내용은 다음과 같다.`
      : "이 페이지에는 사고 경위에 대한 부가 설명이 포함되어 있다.",
    FILLER.repeat(4),
  ];
  return {
    page,
    totalPages: MOCK_TOTAL_PAGES,
    text: paragraphs.join("\n\n"),
  };
}
