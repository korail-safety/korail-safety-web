// 분석 결과 확인 화면용 가짜 데이터
// - 사고 개요: 근거 문장이 원문에 그대로 있음 → 하이라이트
// - 사고 원인: 원문은 줄바꿈으로 끊겨 있음 → 띄어쓰기·줄바꿈 무시하고 하이라이트
// - 조치 사항: AI가 표현을 바꿈 → 하이라이트 없이 "AI가 참고한 문장"으로 표시
// - 재발 방지 대책: 근거 없음(null) → "원문 근거 없음"
// - 마지막 페이지: 텍스트를 뽑을 수 없는 페이지(스캔본)

export const MOCK_TOTAL_PAGES = 24;

export const mockExtractedItems = [
  {
    fieldKey: "ACCIDENT_OVERVIEW",
    content:
      "2026년 3월 12일 14시 20분경 ○○역 구내 2번 선로에서 입환 중이던 열차가 정차 중인 화차와 접촉한 사고 (예시)",
    aiContent:
      "2026년 3월 12일 14시 20분경 ○○역 구내 2번 선로에서 입환 중이던 열차가 정차 중인 화차와 접촉한 사고 (예시)",
    sourcePage: 3,
    sourceText:
      "○○역 구내 2번 선로에서 입환 중이던 열차가 정차 중인 화차와 접촉",
    editedAt: null,
  },
  {
    fieldKey: "ACCIDENT_CAUSE",
    content:
      "작업자 부주의 및 입환 신호 확인 절차 미흡, 무선 교신 중 위치 정보 전달 누락 (예시)",
    aiContent:
      "작업자 부주의 및 입환 신호 확인 절차 미흡, 무선 교신 중 위치 정보 전달 누락 (예시)",
    sourcePage: 5,
    sourceText: "입환 신호 확인 절차가 충분히 이루어지지 않았으며",
    editedAt: null,
  },
  {
    fieldKey: "ACTION_TAKEN",
    content:
      "사고 직후 해당 선로 운행 중지, 차량 점검 및 관계자 안전 교육 시행 (예시)",
    aiContent:
      "사고 직후 해당 선로 운행 중지, 차량 점검 및 관계자 안전 교육 시행 (예시)",
    sourcePage: 8,
    sourceText: "해당 선로 운행을 바로 멈추고 차량을 점검함",
    editedAt: null,
  },
  {
    fieldKey: "PREVENTION",
    content:
      "입환 작업 절차 개선, 무선 교신 표준 문구 도입 및 정기 모니터링 강화 (예시)",
    aiContent:
      "입환 작업 절차 개선, 무선 교신 표준 문구 도입 및 정기 모니터링 강화 (예시)",
    sourcePage: null,
    sourceText: null,
    editedAt: null,
  },
] as {
  fieldKey: string;
  content: string;
  aiContent: string;
  sourcePage: number | null;
  sourceText: string | null;
  editedAt: string | null;
}[];

const FILLER =
  "본 보고서는 ○○역 구내에서 발생한 철도 안전사고에 대한 조사 결과를 정리한 것이다. 조사는 현장 확인, 관계자 면담, 기록 분석의 순서로 진행되었다. ";

/** 페이지별로 원문에 실제로 들어 있는 근거 문장 */
const PAGE_SENTENCES: Record<number, string> = {
  3: "○○역 구내 2번 선로에서 입환 중이던 열차가 정차 중인 화차와 접촉",
  // PDF 레이아웃 때문에 문장 중간에서 줄이 바뀐 경우
  5: "입환 신호 확인 절차가\n충분히 이루어지지 않았으며",
  // AI가 준 문장(sourceText)과 표현이 다른 경우
  8: "해당 선로의 운행을 즉시 중지하고 차량 점검을 실시하였다",
};

export function getMockReportPage(page: number) {
  if (page === MOCK_TOTAL_PAGES) return { pageNo: page, text: "" };
  const sentence = PAGE_SENTENCES[page];
  const paragraphs = [
    `[${page}쪽]`,
    FILLER.repeat(3),
    sentence
      ? `조사 결과 ${sentence}한 것으로 확인되었다. 이에 대한 세부 내용은 다음과 같다.`
      : "이 페이지에는 사고 경위에 대한 부가 설명이 포함되어 있다.",
    FILLER.repeat(4),
  ];
  return { pageNo: page, text: paragraphs.join("\n\n") };
}
