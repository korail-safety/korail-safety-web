// 서버와 주고받는 enum 값 (서버 API 명세 문서 "Enum 값"과 맞출 것)

export const VIDEO_STATUS = {
  PENDING: "대기 중",
  ANALYSIS: "보고서 분석",
  ERROR: "오류 발생",
  COMPLETED: "완료",
} as const;
export type VideoStatus = keyof typeof VIDEO_STATUS;

/** 임시저장한 작업이 멈춘 단계 (이어서 작업할 화면을 정한다) */
export const DRAFT_STEP = {
  ANALYSIS: "보고서 분석",
  STORYBOARD: "스토리보드",
} as const;
export type DraftStep = keyof typeof DRAFT_STEP;

export const GENERATION_STATUS = {
  IN_PROGRESS: "생성 중",
  COMPLETED: "생성 완료",
  FAILED: "생성 실패",
} as const;
export type GenerationStatus = keyof typeof GENERATION_STATUS;

export const SORT_ORDER = {
  LATEST: "최근순",
  OLDEST: "오래된순",
} as const;
export type SortOrder = keyof typeof SORT_ORDER;

export const ANALYSIS_STATUS = {
  IN_PROGRESS: "분석 중",
  COMPLETED: "분석 완료",
  FAILED: "분석 실패",
} as const;
export type AnalysisStatus = keyof typeof ANALYSIS_STATUS;

/** 보고서 분석 세부 단계 (진행 순서대로) */
export const ANALYSIS_STEP = {
  READ_FILE: {
    label: "파일 읽기",
    progressLabel: "파일 읽는 중",
    description: "보고서의 글과 표를 읽고 있어요.",
  },
  EXTRACT_KEY_INFO: {
    label: "핵심정보 추출",
    progressLabel: "핵심정보 추출 중",
    description: "사고 일시·장소·원인 같은 핵심 정보를 찾고 있어요.",
  },
} as const;
export type AnalysisStep = keyof typeof ANALYSIS_STEP;
export const ANALYSIS_STEP_ORDER = Object.keys(ANALYSIS_STEP) as AnalysisStep[];

/** AI가 보고서에서 추출하는 항목 (화면 표시 순서대로) */
export const EXTRACTED_FIELD = {
  ACCIDENT_OVERVIEW: "사고 개요",
  ACCIDENT_CAUSE: "사고 원인",
  ACTION_TAKEN: "조치 사항",
  PREVENTION: "재발 방지 대책",
} as const;
export type ExtractedFieldKey = keyof typeof EXTRACTED_FIELD;
export const EXTRACTED_FIELD_ORDER = Object.keys(
  EXTRACTED_FIELD,
) as ExtractedFieldKey[];

/** 영상 생성 세부 단계 (진행 순서대로) — 서버와 확정 필요 */
export const GENERATION_STEP = {
  GENERATE_SCENES: {
    label: "장면 영상 만들기",
    progressLabel: "장면 영상 만드는 중",
    description: "스토리보드의 장면을 하나씩 영상으로 만들고 있어요.",
  },
  ADD_NARRATION: {
    label: "나레이션·자막 입히기",
    progressLabel: "나레이션·자막 입히는 중",
    description: "장면에 맞는 나레이션과 자막을 넣고 있어요.",
  },
  MERGE_VIDEO: {
    label: "영상 합치기",
    progressLabel: "영상 합치는 중",
    description: "장면들을 이어 붙여 한 편의 영상으로 만들고 있어요.",
  },
} as const;
export type GenerationStep = keyof typeof GENERATION_STEP;
export const GENERATION_STEP_ORDER = Object.keys(
  GENERATION_STEP,
) as GenerationStep[];
