// 분석 결과 확인 화면용 가짜 데이터
// - 사고 개요(p.3): 근거 좌표가 단어마다 끊겨서 옴 → 화면에서 줄 단위로 이어서 표시
// - 사고 원인(p.5, p.8): 근거 2개. p.5는 박스 2줄, p.8은 좌표 없음 → "AI가 참고한 문장"
// - 조치 사항(p.8): 예전 형식(근거 1개, sources 없음), 좌표 없음 → "AI가 참고한 문장" 상자
// - 재발 방지 대책: 근거 없음(null) → "원문 근거 없음"
// - 23페이지: 이미지 없음 → "원문 이미지를 불러올 수 없습니다"
// - 24페이지: 글자를 뽑을 수 없는 페이지(스캔본) → 이미지는 보이고 하이라이트만 없음

export const MOCK_TOTAL_PAGES = 24;

interface MockRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 가짜 페이지 이미지(SVG) 크기와 근거 문장 위치
const PAGE_W = 600;
const PAGE_H = 848;
const LEFT = 50;
const FONT = 15;
const LINE_GAP = 26;
const SENTENCE_TOP = 330;

/** 페이지별로 원문에 실제로 들어 있는 근거 문장 (줄 단위) */
const PAGE_SENTENCES: Record<number, string[]> = {
  3: ["○○역 구내 2번 선로에서 입환 중이던 열차가 정차 중인 화차와 접촉"],
  // PDF 레이아웃 때문에 문장 중간에서 줄이 바뀐 경우
  5: ["입환 신호 확인 절차가", "충분히 이루어지지 않았으며"],
  // AI가 준 문장(sourceText)과 표현이 다른 경우
  8: ["해당 선로의 운행을 즉시 중지하고 차량 점검을 실시하였다"],
};

function lineWidth(line: string) {
  return Math.min(PAGE_W - LEFT * 2, [...line].length * FONT * 0.92);
}

/** 서버(pdfium)처럼 한 줄 사각형을 단어 조각 여러 개로 나눈다 (사이에 띄어쓰기 간격) */
function splitIntoWords(rect: MockRect, count = 5): MockRect[] {
  const gap = 0.006;
  const width = (rect.width - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_, index) => ({
    ...rect,
    x: rect.x + index * (width + gap),
    width,
  }));
}

/** 서버가 내려줄 좌표와 같은 형식 (페이지 크기에 대한 비율, 왼쪽 위 기준) */
function sentenceRects(page: number): MockRect[] {
  return (PAGE_SENTENCES[page] ?? []).map((line, index) => {
    const baseline = SENTENCE_TOP + index * LINE_GAP;
    return {
      x: LEFT / PAGE_W,
      y: (baseline - FONT) / PAGE_H,
      width: lineWidth(line) / PAGE_W,
      height: (FONT + 5) / PAGE_H,
    };
  });
}

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
    sourceRects: sentenceRects(3).flatMap((rect) => splitIntoWords(rect)),
    sources: [
      {
        page: 3,
        text: "○○역 구내 2번 선로에서 입환 중이던 열차가 정차 중인 화차와 접촉",
        rects: sentenceRects(3).flatMap((rect) => splitIntoWords(rect)),
      },
    ],
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
    sourceRects: sentenceRects(5),
    sources: [
      {
        page: 5,
        text: "입환 신호 확인 절차가 충분히 이루어지지 않았으며",
        rects: sentenceRects(5),
      },
      {
        page: 8,
        text: "무선 교신 중 위치 정보가 정확히 전달되지 않았다",
        rects: null,
      },
    ],
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
    sourceRects: null,
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
    sourceRects: null,
    editedAt: null,
  },
] as {
  fieldKey: string;
  content: string;
  aiContent: string;
  sourcePage: number | null;
  sourceText: string | null;
  sourceRects: MockRect[] | null;
  sources?: { page: number; text: string; rects: MockRect[] | null }[];
  editedAt: string | null;
}[];

const FILLER =
  "본 보고서는 ○○역 구내에서 발생한 철도 안전사고에 대한 조사 결과를 정리한 것이다. 조사는 현장 확인, 관계자 면담, 기록 분석의 순서로 진행되었다. ";

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** 서버가 S3에 저장할 페이지 이미지 대신 쓰는 가짜 페이지 (회색 줄 = 본문) */
function mockPageImage(page: number, scanned: boolean) {
  const sentences = PAGE_SENTENCES[page] ?? [];
  const bars: string[] = [];
  for (let row = 0; row < 26; row += 1) {
    const y = 120 + row * LINE_GAP;
    // 근거 문장이 들어갈 자리는 비운다
    if (
      sentences.length > 0 &&
      y > SENTENCE_TOP - LINE_GAP &&
      y < SENTENCE_TOP + LINE_GAP * 2
    )
      continue;
    const width = 380 + ((page * 37 + row * 53) % 120);
    bars.push(
      `<rect x="${LEFT}" y="${y - 9}" width="${width}" height="8" rx="4" fill="${scanned ? "#b9b4aa" : "#d9dde3"}"/>`,
    );
  }
  const lines = sentences.map(
    (line, index) =>
      `<text x="${LEFT}" y="${SENTENCE_TOP + index * LINE_GAP}" font-size="${FONT}" textLength="${lineWidth(line)}" lengthAdjust="spacingAndGlyphs" font-family="sans-serif" fill="#1f2937">${escapeXml(line)}</text>`,
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}" height="${PAGE_H}" viewBox="0 0 ${PAGE_W} ${PAGE_H}">
<rect width="100%" height="100%" fill="${scanned ? "#f3efe6" : "#ffffff"}"/>
<text x="${LEFT}" y="72" font-size="18" font-weight="bold" font-family="sans-serif" fill="#111827">${page}쪽 · 사고 조사 보고서 (예시)</text>
${bars.join("\n")}
${lines.join("\n")}
<text x="${PAGE_W / 2}" y="${PAGE_H - 30}" font-size="12" text-anchor="middle" font-family="sans-serif" fill="#6b7280">- ${page} -</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getMockReportPage(page: number) {
  const scanned = page === MOCK_TOTAL_PAGES;
  if (scanned) {
    return { pageNo: page, text: "", imageUrl: mockPageImage(page, true) };
  }
  const sentence = PAGE_SENTENCES[page]?.join("\n");
  const paragraphs = [
    `[${page}쪽]`,
    FILLER.repeat(3),
    sentence
      ? `조사 결과 ${sentence}한 것으로 확인되었다. 이에 대한 세부 내용은 다음과 같다.`
      : "이 페이지에는 사고 경위에 대한 부가 설명이 포함되어 있다.",
    FILLER.repeat(4),
  ];
  return {
    pageNo: page,
    text: paragraphs.join("\n\n"),
    // 이미지 없이 텍스트만 있는 페이지 (이미지 저장 전에 분석한 예전 데이터)
    imageUrl: page === MOCK_TOTAL_PAGES - 1 ? null : mockPageImage(page, false),
  };
}
