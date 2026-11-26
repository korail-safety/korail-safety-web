// 스토리보드 화면용 가짜 데이터 (장면별 생성·수정)
// - 처음 만들기: 3초 동안 장면 구성 → 장면 12개가 0.8초 간격으로 하나씩 완성
// - 주소에 "storyboard-fail"이 들어간 작업: 장면 구성부터 실패 (다시 만들기 누르면 성공)
// - 주소에 "scene-fail"이 들어간 작업: 5번 장면만 실패
// - 수정 요청: 그 장면만 3초 동안 다시 만들고 버전이 올라감. 요청에 "fail"이 있으면 실패

const SETUP_MS = 3000;
const SCENE_GAP_MS = 800;
const REVISE_MS = 3000;
const SCENE_COUNT = 12;

const DESCRIPTIONS = [
  "기관사가 운전실에서 출발 전 신호를 확인한다",
  "열차가 역 구내로 천천히 진입한다",
  "유도신호가 켜지고 기관사가 속도를 줄인다",
  "선로 앞쪽에 정차 중인 다른 열차가 보인다",
  "기관사가 앞 열차를 늦게 발견하고 제동을 건다",
  "두 열차가 부딪히며 뒤쪽 객차가 선로를 벗어난다",
  "관제사가 무전으로 상황을 확인한다",
  "역무원이 승객을 안전한 곳으로 안내한다",
  "조사관이 사고 원인을 기록한다",
  "기관사가 유도신호 구간에서는 앞을 살피며 천천히 운행한다",
  "운행 중 휴대전화를 사용하지 않는다",
  "안전수칙을 지키는 직원들의 모습으로 마무리한다",
];

interface SceneState {
  revision: number;
  startedAt: number;
  willFail: boolean;
}

interface StoryboardState {
  startedAt: number;
  setupFails: boolean;
  scenes: Map<number, SceneState>;
}

const states = new Map<string, StoryboardState>();

function sceneImage(index: number, revision: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" font-family="sans-serif">
<rect width="960" height="540" fill="#e8eef6"/>
<rect x="40" y="40" width="880" height="400" rx="16" fill="#ffffff" stroke="#c9d3df"/>
<text x="480" y="230" font-size="34" font-weight="700" fill="#17365d" text-anchor="middle">장면 ${index}</text>
<text x="480" y="280" font-size="20" fill="#687688" text-anchor="middle">스토리보드 이미지 (예시)</text>
<text x="920" y="500" font-size="18" fill="#687688" text-anchor="end">버전 ${revision}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** 처음 만들기. 이미 만든 스토리보드가 있으면 false (서버의 409) */
export function startMockStoryboard(videoId: string) {
  const prev = states.get(videoId);
  if (prev && !prev.setupFails) return false;
  states.set(videoId, {
    startedAt: Date.now(),
    // 첫 시도만 실패
    setupFails: !prev && videoId.includes("storyboard-fail"),
    scenes: new Map(),
  });
  return true;
}

/** 장면 하나 수정. 없는 장면이면 false */
export function reviseMockScene(
  videoId: string,
  sceneIndex: number,
  prompt: string,
) {
  const state = states.get(videoId);
  if (!state || sceneIndex < 1 || sceneIndex > SCENE_COUNT) return false;
  const prev = state.scenes.get(sceneIndex);
  state.scenes.set(sceneIndex, {
    revision: (prev?.revision ?? 1) + 1,
    startedAt: Date.now(),
    willFail: prompt.includes("fail"),
  });
  return true;
}

export function getMockStoryboard(videoId: string) {
  if (!states.has(videoId)) startMockStoryboard(videoId);
  const state = states.get(videoId)!;
  const now = Date.now();

  // 장면 구성 단계
  if (now - state.startedAt < SETUP_MS) {
    return { status: "IN_PROGRESS", errorCode: null, scenes: [] };
  }
  if (state.setupFails) {
    return { status: "FAILED", errorCode: "E-201", scenes: [] };
  }

  const scenes = Array.from({ length: SCENE_COUNT }, (_, i) => {
    const index = i + 1;
    const revised = state.scenes.get(index);
    const readyAt = revised
      ? revised.startedAt + REVISE_MS
      : state.startedAt + SETUP_MS + index * SCENE_GAP_MS;
    const revision = revised?.revision ?? 1;
    const failed = revised
      ? revised.willFail
      : index === 5 && videoId.includes("scene-fail");
    const status =
      now < readyAt ? "IN_PROGRESS" : failed ? "FAILED" : "COMPLETED";
    // 수정 중에는 이전 버전 이미지를 그대로 보여준다
    const shownRevision = status === "COMPLETED" ? revision : revision - 1;
    return {
      index,
      imageUrl: shownRevision >= 1 ? sceneImage(index, shownRevision) : null,
      description: DESCRIPTIONS[i],
      durationSec: 5 + (index % 3),
      status,
      errorCode: status === "FAILED" ? "E-201" : null,
    };
  });

  const status = scenes.some((scene) => scene.status === "IN_PROGRESS")
    ? "IN_PROGRESS"
    : scenes.some((scene) => scene.status === "FAILED")
      ? "FAILED"
      : "COMPLETED";
  const errorCode = status === "FAILED" ? "E-201" : null;
  return { status, errorCode, scenes };
}

/** 스토리보드 단계까지 간 작업인지 (임시저장 단계 판단용) */
export function hasMockStoryboard(videoId: string) {
  return states.has(videoId);
}
