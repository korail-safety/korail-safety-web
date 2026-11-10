// 스토리보드 화면용 가짜 데이터

const BUILD_MS = 5000;

interface StoryboardState {
  startedAt: number;
  willFail: boolean;
  revision: number;
}

const states = new Map<string, StoryboardState>();

/** 4칸짜리 예시 스토리보드 이미지 (SVG data URI) */
function placeholderImage(revision: number) {
  const titles = ["사고 현장 소개", "사고 발생", "사고 원인", "재발 방지 대책"];
  const panels = titles
    .map((title, i) => {
      const x = 40 + (i % 2) * 470;
      const y = 40 + Math.floor(i / 2) * 290;
      return `<rect x="${x}" y="${y}" width="440" height="250" rx="12" fill="#ffffff" stroke="#c9d3df"/>
<text x="${x + 20}" y="${y + 36}" font-size="20" font-weight="700" fill="#17365d">#${i + 1} ${title}</text>
<rect x="${x + 20}" y="${y + 56}" width="400" height="140" rx="8" fill="#e0e6ed"/>
<text x="${x + 220}" y="${y + 132}" font-size="16" fill="#687688" text-anchor="middle">장면 이미지 (예시)</text>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="980" height="620" viewBox="0 0 980 620" font-family="sans-serif">
<rect width="980" height="620" fill="#f4f6f9"/>${panels}
<text x="940" y="606" font-size="14" fill="#687688" text-anchor="end">버전 ${revision}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function startMockStoryboard(videoId: string, prompt?: string) {
  const prev = states.get(videoId);
  states.set(videoId, {
    startedAt: Date.now(),
    // 수정 프롬프트에 "fail" 이 있거나, 주소에 "storyboard-fail" 이 들어간 작업의 첫 생성이면 실패
    willFail:
      !!prompt?.includes("fail") ||
      (!prev && videoId.includes("storyboard-fail")),
    revision: (prev?.revision ?? 0) + 1,
  });
}

export function getMockStoryboard(videoId: string) {
  if (!states.has(videoId)) startMockStoryboard(videoId);
  const state = states.get(videoId)!;
  if (Date.now() - state.startedAt < BUILD_MS) return { status: "IN_PROGRESS" };
  if (state.willFail) return { status: "FAILED", errorCode: "E-201" };
  return { status: "COMPLETED", imageUrl: placeholderImage(state.revision) };
}

/** 스토리보드 단계까지 간 작업인지 (임시저장 단계 판단용) */
export function hasMockStoryboard(videoId: string) {
  return states.has(videoId);
}
