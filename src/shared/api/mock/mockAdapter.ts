import {
  AxiosError,
  type AxiosAdapter,
  type AxiosProgressEvent,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  getMockReportPage,
  MOCK_TOTAL_PAGES,
  mockExtractedItems,
} from "./analysisResultData";
import {
  getMockStoryboard,
  hasMockStoryboard,
  startMockStoryboard,
} from "./storyboardData";

/*
 * 백엔드 없이 화면을 확인하기 위한 가짜 API (개발용)
 * .env.local 에 NEXT_PUBLIC_API_MOCK=true 일 때만 동작한다.
 *
 * 테스트용 규칙
 * - 로그인: 비밀번호가 "wrong" 이면 실패
 * - 로그아웃하면 다시 로그인할 때까지 /auth/me 가 401 (그 전에는 로그인된 상태로 봄)
 * - 아이디 중복 확인: "admin" 은 이미 있는 아이디
 * - 회원가입: 관리자 코드가 "KORAIL" 이 아니면 실패
 * - 보고서 업로드: 파일 이름에
 *     "encrypted" → 암호 파일 에러 / "upload-fail" → 업로드 실패
 *     "analysis-fail" → 업로드는 성공, 분석 단계에서 실패 (다시 시도하면 성공)
 *   파일을 바꾸면 같은 작업의 보고서만 교체 (PUT /videos/{id}/report)
 * - 보고서 분석: 4초마다 다음 단계로 진행, 8초 뒤 완료
 * - 분석 결과 수정: 내용에 "fail" 이 들어가면 저장 실패
 * - 스토리보드: 5초 뒤 완성. 수정 프롬프트에 "fail" 이 들어가면 실패
 *   /videos/storyboard-fail/storyboard 로 들어가면 처음부터 실패 (다시 만들기 누르면 성공)
 * - 영상 저장: 파일명에 "fail" 이 들어가면 저장 실패
 * - 사고 유형: "새 유형 만들기"를 고르면 바로 목록에 추가됨 (새로고침 전까지 유지)
 *   이름 수정·삭제 가능. 라이브러리에 그 유형 영상이 있으면 삭제 불가(409)
 * - 임시저장: 4개로 시작. 분석 결과·스토리보드 화면에서 임시저장하면 추가/갱신
 *   "오류 발생" 카드는 /videos/storyboard-fail-draft/storyboard 로 이어짐 (실패 화면)
 * - 라이브러리: 영상 5개로 시작. 저장한 영상은 맨 앞에 추가됨
 *   이름에 "fail" 을 넣어 수정하면 실패. /library/not-found 는 없는 영상(404)
 * - 영상 생성: 4초마다 다음 단계, 12초 뒤 완료. 장면 만들기 단계에서는 진행률(progress)도 내려줌
 *   /videos/generation-fail/generation 은 4초쯤 실패 (다시 시도하면 성공)
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ok<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return { data, status, statusText: "OK", headers: {}, config };
}

function fail(
  config: InternalAxiosRequestConfig,
  status: number,
  code: string,
  message = code,
): never {
  const response = ok(config, { code, message }, status);
  throw new AxiosError(message, String(status), config, null, response);
}

function parseBody(config: InternalAxiosRequestConfig) {
  if (typeof config.data !== "string") return {};
  try {
    return JSON.parse(config.data) as Record<string, string>;
  } catch {
    return {};
  }
}

// 분석 시작 시각 (videoId → ms)
const analysisStartedAt = new Map<string, number>();
// 보고서를 "analysis-fail" 파일로 교체한 작업
const analysisFailIds = new Set<string>();
// 다시 시도한 작업 (재시도하면 성공하도록)
const retriedVideoIds = new Set<string>();
const STEP_MS = 4000;
const STEPS = ["READ_FILE", "EXTRACT_KEY_INFO"] as const;

function getAnalysisStatus(videoId: string) {
  if (!analysisStartedAt.has(videoId))
    analysisStartedAt.set(videoId, Date.now());
  const elapsed = Date.now() - analysisStartedAt.get(videoId)!;
  const stepIndex = Math.min(Math.floor(elapsed / STEP_MS), STEPS.length);

  if (
    (videoId.startsWith("fail-") || analysisFailIds.has(videoId)) &&
    !retriedVideoIds.has(videoId) &&
    stepIndex >= 1
  ) {
    return { status: "FAILED", step: "EXTRACT_KEY_INFO", errorCode: "E-102" };
  }
  if (stepIndex >= STEPS.length) {
    return { status: "COMPLETED", step: "EXTRACT_KEY_INFO" };
  }
  const remainingMinutes = Math.max(
    1,
    Math.ceil((STEPS.length * STEP_MS - elapsed) / 60000),
  );
  return {
    status: "IN_PROGRESS",
    step: STEPS[stepIndex],
    estimatedMinutes: remainingMinutes,
  };
}

// 영상 생성 시작 시각 (videoId → ms)
const generationStartedAt = new Map<string, number>();
const retriedGenerationIds = new Set<string>();
const GENERATION_STEPS = [
  "GENERATE_SCENES",
  "ADD_NARRATION",
  "MERGE_VIDEO",
] as const;

function getGenerationStatus(videoId: string) {
  if (!generationStartedAt.has(videoId))
    generationStartedAt.set(videoId, Date.now());
  const elapsed = Date.now() - generationStartedAt.get(videoId)!;
  const stepIndex = Math.min(
    Math.floor(elapsed / STEP_MS),
    GENERATION_STEPS.length,
  );

  if (
    videoId.includes("generation-fail") &&
    !retriedGenerationIds.has(videoId) &&
    stepIndex >= 1
  ) {
    return { status: "FAILED", step: "ADD_NARRATION", errorCode: "E-301" };
  }
  if (stepIndex >= GENERATION_STEPS.length) {
    return { status: "COMPLETED", step: "MERGE_VIDEO" };
  }
  // 장면 만들기는 장면 6개 중 몇 개 끝났는지로 진행률을 셀 수 있다고 가정
  const scenesDone = Math.floor((elapsed / STEP_MS) * 6);
  return {
    status: "IN_PROGRESS",
    step: GENERATION_STEPS[stepIndex],
    ...(stepIndex === 0 && {
      progress: Math.round((scenesDone / 6) * (100 / GENERATION_STEPS.length)),
    }),
    estimatedMinutes: Math.max(
      1,
      Math.ceil((GENERATION_STEPS.length * STEP_MS - elapsed) / 60000),
    ),
  };
}

async function simulateUpload(config: InternalAxiosRequestConfig, file: File) {
  const total = file.size || 1;
  for (let i = 1; i <= 10; i += 1) {
    await delay(150);
    config.onUploadProgress?.({
      loaded: (total * i) / 10,
      total,
      bytes: total / 10,
      lengthComputable: true,
    } as AxiosProgressEvent);
  }
}

let mockId = 0;

let mockTypeSeq = 3;
const mockAccidentTypes = [
  { id: "type-1", name: "철도사고" },
  { id: "type-2", name: "철도장애" },
  { id: "type-3", name: "산업재해" },
];

/** 이름으로 유형을 찾고, 없으면 만든다 (영상 저장·수정 시 서버 동작) */
function findOrCreateType(name: string) {
  const found = mockAccidentTypes.find((type) => type.name === name);
  if (found) return found;
  mockTypeSeq += 1;
  const created = { id: `type-${mockTypeSeq}`, name };
  mockAccidentTypes.push(created);
  return created;
}

interface MockDraft {
  id: string;
  title: string;
  updatedAt: string;
  step: "ANALYSIS" | "STORYBOARD";
  failed: boolean;
}

const mockDrafts: MockDraft[] = [
  {
    id: "draft-1",
    title: "○○역 승강장 추락 사고 보고서",
    updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
    step: "ANALYSIS",
    failed: false,
  },
  {
    id: "draft-2",
    title: "구내 입환 작업 중 충돌 사고",
    updatedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    step: "STORYBOARD",
    failed: false,
  },
  {
    id: "storyboard-fail-draft",
    title: "선로 전환기 고장 장애 보고서",
    updatedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    step: "STORYBOARD",
    failed: true,
  },
  {
    id: "draft-4",
    title: "역사 내 에스컬레이터 안전사고",
    updatedAt: new Date(Date.now() - 12 * 86_400_000).toISOString(),
    step: "ANALYSIS",
    failed: false,
  },
];

interface MockLibraryVideo {
  id: string;
  title: string;
  updatedAt: string;
  accidentTypeId: string | null;
  durationSec: number;
}

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

const mockLibraryVideos: MockLibraryVideo[] = [
  {
    id: "lib-1",
    title: "○○역 열차 접촉 사고 안전교육",
    updatedAt: daysAgo(1),
    accidentTypeId: "type-1",
    durationSec: 102,
  },
  {
    id: "lib-2",
    title: "선로 작업자 보호 조치 미흡 사례",
    updatedAt: daysAgo(4),
    accidentTypeId: "type-3",
    durationSec: 95,
  },
  {
    id: "lib-3",
    title: "신호장치 고장으로 인한 열차 지연",
    updatedAt: daysAgo(9),
    accidentTypeId: "type-2",
    durationSec: 88,
  },
  {
    id: "lib-4",
    title: "건널목 차량 충돌 사고 대응",
    updatedAt: daysAgo(15),
    accidentTypeId: "type-1",
    durationSec: 110,
  },
  {
    id: "lib-5",
    title: "전차선 단전 장애 조치 절차",
    updatedAt: daysAgo(30),
    accidentTypeId: "type-2",
    durationSec: 76,
  },
];

function toLibraryVideo(video: MockLibraryVideo) {
  const type = mockAccidentTypes.find((t) => t.id === video.accidentTypeId);
  return {
    id: video.id,
    title: video.title,
    updatedAt: video.updatedAt,
    accidentType: type ?? null,
  };
}

const countVideos = (typeId: string) =>
  mockLibraryVideos.filter((video) => video.accidentTypeId === typeId).length;

// 로그아웃 여부 (새로고침해도 유지되도록 sessionStorage 사용)
const LOGGED_OUT_KEY = "mock-logged-out";
function setLoggedOut(value: boolean) {
  try {
    if (value) sessionStorage.setItem(LOGGED_OUT_KEY, "1");
    else sessionStorage.removeItem(LOGGED_OUT_KEY);
  } catch {
    // 저장소 접근 불가 시 무시
  }
}
function isLoggedOut() {
  try {
    return sessionStorage.getItem(LOGGED_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay(400);
  const method = (config.method ?? "get").toUpperCase();
  const url = config.url ?? "";

  // 인증
  if (method === "POST" && url === "/auth/login") {
    const { password } = parseBody(config);
    if (password === "wrong") return fail(config, 401, "INVALID_CREDENTIALS");
    setLoggedOut(false);
    return ok(config, { accessToken: "mock-token" });
  }
  if (method === "POST" && url === "/auth/logout") {
    setLoggedOut(true);
    return ok(config, null);
  }
  if (method === "GET" && url === "/auth/me") {
    if (isLoggedOut()) return fail(config, 401, "UNAUTHORIZED");
    return ok(config, { id: "korail_2026", name: "홍길동" });
  }
  if (method === "GET" && url === "/auth/check-id") {
    return ok(config, { available: config.params?.id !== "admin" });
  }
  if (method === "POST" && url === "/auth/signup") {
    const { adminCode, id } = parseBody(config);
    if (adminCode !== "KORAIL") return fail(config, 400, "INVALID_ADMIN_CODE");
    if (id === "admin") return fail(config, 409, "ID_DUPLICATED");
    return ok(config, null, 201);
  }

  // 보고서 업로드
  if (method === "POST" && url === "/videos/reports") {
    const file = (config.data as FormData).get("file") as File;
    const name = file.name.toLowerCase();
    if (name.includes("encrypted")) return fail(config, 400, "ENCRYPTED_FILE");
    await simulateUpload(config, file);
    if (name.includes("upload-fail"))
      return fail(config, 500, "INTERNAL_ERROR");
    mockId += 1;
    const prefix = name.includes("analysis-fail") ? "fail" : "mock";
    return ok(config, { videoId: `${prefix}-${mockId}` }, 201);
  }

  const reportMatch = url.match(/^\/videos\/([^/]+)\/report$/);
  if (method === "PUT" && reportMatch) {
    const videoId = reportMatch[1];
    if (analysisStartedAt.has(videoId)) {
      return fail(config, 409, "ANALYSIS_ALREADY_STARTED");
    }
    const file = (config.data as FormData).get("file") as File;
    const name = file.name.toLowerCase();
    if (name.includes("encrypted")) return fail(config, 400, "ENCRYPTED_FILE");
    await simulateUpload(config, file);
    if (name.includes("upload-fail"))
      return fail(config, 500, "INTERNAL_ERROR");
    if (name.includes("analysis-fail")) analysisFailIds.add(videoId);
    else analysisFailIds.delete(videoId);
    return ok(config, { videoId });
  }

  // 보고서 분석
  const analysisMatch = url.match(/^\/videos\/([^/]+)\/analysis$/);
  if (analysisMatch) {
    const videoId = analysisMatch[1];
    if (method === "POST") {
      if (analysisStartedAt.has(videoId)) retriedVideoIds.add(videoId);
      analysisStartedAt.set(videoId, Date.now());
      return ok(config, null, 202);
    }
    return ok(config, getAnalysisStatus(videoId));
  }

  // 분석 결과 확인
  if (method === "GET" && /^\/videos\/[^/]+\/analysis\/result$/.test(url)) {
    return ok(config, {
      totalPages: MOCK_TOTAL_PAGES,
      items: mockExtractedItems,
    });
  }
  const pageMatch = url.match(/^\/videos\/[^/]+\/report\/pages\/(\d+)$/);
  if (method === "GET" && pageMatch) {
    return ok(config, getMockReportPage(Number(pageMatch[1])));
  }
  const itemMatch = url.match(
    /^\/videos\/[^/]+\/analysis\/result\/items\/([A-Z_]+)$/,
  );
  if (method === "PATCH" && itemMatch) {
    const { content } = parseBody(config);
    if (!content?.trim()) return fail(config, 400, "INVALID_INPUT");
    if (content.includes("fail")) return fail(config, 500, "INTERNAL_ERROR");
    const item = mockExtractedItems.find((i) => i.key === itemMatch[1]);
    if (!item) return fail(config, 404, "NOT_FOUND");
    item.content = content;
    return ok(config, item);
  }
  const draftSaveMatch = url.match(/^\/videos\/([^/]+)\/draft$/);
  if (method === "POST" && draftSaveMatch) {
    const videoId = draftSaveMatch[1];
    const draft = {
      id: videoId,
      title: "○○역 열차 접촉 사고 보고서",
      updatedAt: new Date().toISOString(),
      step: hasMockStoryboard(videoId)
        ? ("STORYBOARD" as const)
        : ("ANALYSIS" as const),
      failed: false,
    };
    const index = mockDrafts.findIndex((d) => d.id === videoId);
    if (index >= 0) mockDrafts.splice(index, 1);
    mockDrafts.unshift(draft);
    return ok(config, null);
  }

  // 임시저장 목록
  if (method === "GET" && url === "/drafts") {
    const { keyword, sort } = (config.params ?? {}) as {
      keyword?: string;
      sort?: string;
    };
    const items = mockDrafts
      .filter((d) => !keyword?.trim() || d.title.includes(keyword.trim()))
      .sort((a, b) =>
        sort === "OLDEST"
          ? a.updatedAt.localeCompare(b.updatedAt)
          : b.updatedAt.localeCompare(a.updatedAt),
      );
    return ok(config, { items });
  }
  const draftMatch = url.match(/^\/drafts\/([^/]+)$/);
  if (method === "DELETE" && draftMatch) {
    const index = mockDrafts.findIndex((d) => d.id === draftMatch[1]);
    if (index < 0) return fail(config, 404, "VIDEO_NOT_FOUND");
    mockDrafts.splice(index, 1);
    return ok(config, null, 204);
  }
  const generationMatch = url.match(/^\/videos\/([^/]+)\/generation$/);
  if (generationMatch) {
    const videoId = generationMatch[1];
    if (method === "POST") {
      if (generationStartedAt.has(videoId)) retriedGenerationIds.add(videoId);
      generationStartedAt.set(videoId, Date.now());
      return ok(config, null, 202);
    }
    return ok(config, getGenerationStatus(videoId));
  }

  // 스토리보드
  const storyboardMatch = url.match(/^\/videos\/([^/]+)\/storyboard$/);
  if (storyboardMatch) {
    const videoId = storyboardMatch[1];
    if (method === "POST") {
      startMockStoryboard(videoId);
      return ok(config, null, 202);
    }
    return ok(config, getMockStoryboard(videoId));
  }
  const revisionMatch = url.match(/^\/videos\/([^/]+)\/storyboard\/revisions$/);
  if (method === "POST" && revisionMatch) {
    const { prompt } = parseBody(config);
    if (!prompt?.trim()) return fail(config, 400, "INVALID_INPUT");
    startMockStoryboard(revisionMatch[1], prompt);
    return ok(config, null, 202);
  }

  // 완성 영상 · 저장
  if (method === "GET" && /^\/videos\/[^/]+\/result$/.test(url)) {
    return ok(config, {
      durationSec: 102,
      suggestedFileName: "○○역 열차 접촉 사고 안전교육",
    });
  }
  if (method === "POST" && url === "/accident-types") {
    const name = parseBody(config).name?.trim();
    if (!name) return fail(config, 400, "INVALID_INPUT");
    if (mockAccidentTypes.some((type) => type.name === name)) {
      return fail(config, 409, "ACCIDENT_TYPE_DUPLICATED");
    }
    return ok(config, findOrCreateType(name), 201);
  }
  const typeMatch = url.match(/^\/accident-types\/([^/]+)$/);
  if (typeMatch && (method === "PATCH" || method === "DELETE")) {
    const index = mockAccidentTypes.findIndex((t) => t.id === typeMatch[1]);
    if (index < 0) return fail(config, 404, "NOT_FOUND");
    if (method === "DELETE") {
      if (countVideos(mockAccidentTypes[index].id) > 0) {
        return fail(config, 409, "ACCIDENT_TYPE_IN_USE");
      }
      mockAccidentTypes.splice(index, 1);
      return ok(config, null, 204);
    }
    const name = parseBody(config).name?.trim();
    if (!name) return fail(config, 400, "INVALID_INPUT");
    if (mockAccidentTypes.some((t, i) => t.name === name && i !== index)) {
      return fail(config, 409, "ACCIDENT_TYPE_DUPLICATED");
    }
    mockAccidentTypes[index] = { ...mockAccidentTypes[index], name };
    return ok(config, mockAccidentTypes[index]);
  }
  if (method === "GET" && url === "/accident-types") {
    return ok(config, {
      items: mockAccidentTypes.map((type) => ({
        ...type,
        videoCount: countVideos(type.id),
      })),
    });
  }
  if (method === "POST" && /^\/videos\/[^/]+\/save$/.test(url)) {
    const { fileName, accidentTypeName } = parseBody(config);
    if (!fileName?.trim() || !accidentTypeName?.trim()) {
      return fail(config, 400, "INVALID_INPUT");
    }
    if (fileName.includes("fail")) return fail(config, 500, "INTERNAL_ERROR");
    const type = findOrCreateType(accidentTypeName.trim());
    const savedId = url.split("/")[2];
    const draftIndex = mockDrafts.findIndex((d) => d.id === savedId);
    if (draftIndex >= 0) mockDrafts.splice(draftIndex, 1);
    mockId += 1;
    mockLibraryVideos.unshift({
      id: `lib-saved-${mockId}`,
      title: fileName.trim(),
      updatedAt: new Date().toISOString(),
      accidentTypeId: type.id,
      durationSec: 102,
    });
    return ok(config, null);
  }

  // 라이브러리
  if (method === "GET" && url === "/library/videos") {
    const { keyword, accidentTypeId, sort } = (config.params ?? {}) as {
      keyword?: string;
      accidentTypeId?: string;
      sort?: string;
    };
    const items = mockLibraryVideos
      .filter(
        (video) => !accidentTypeId || video.accidentTypeId === accidentTypeId,
      )
      .filter(
        (video) => !keyword?.trim() || video.title.includes(keyword.trim()),
      )
      .sort((a, b) =>
        sort === "OLDEST"
          ? a.updatedAt.localeCompare(b.updatedAt)
          : b.updatedAt.localeCompare(a.updatedAt),
      )
      .map(toLibraryVideo);
    return ok(config, { items, totalCount: mockLibraryVideos.length });
  }
  const libraryMatch = url.match(/^\/library\/videos\/([^/]+)$/);
  if (libraryMatch) {
    const index = mockLibraryVideos.findIndex((v) => v.id === libraryMatch[1]);
    if (index < 0) return fail(config, 404, "VIDEO_NOT_FOUND");
    const video = mockLibraryVideos[index];
    if (method === "GET") {
      return ok(config, {
        ...toLibraryVideo(video),
        durationSec: video.durationSec,
      });
    }
    if (method === "DELETE") {
      mockLibraryVideos.splice(index, 1);
      return ok(config, null, 204);
    }
    if (method === "PATCH") {
      const { fileName, accidentTypeName } = parseBody(config);
      if (!fileName?.trim() || !accidentTypeName?.trim()) {
        return fail(config, 400, "INVALID_INPUT");
      }
      if (fileName.includes("fail")) return fail(config, 500, "INTERNAL_ERROR");
      video.title = fileName.trim();
      video.accidentTypeId = findOrCreateType(accidentTypeName.trim()).id;
      video.updatedAt = new Date().toISOString();
      return ok(config, toLibraryVideo(video));
    }
  }

  return fail(config, 404, "NOT_FOUND", `mock 없음: ${method} ${url}`);
};
