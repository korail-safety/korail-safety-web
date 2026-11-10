/** 영상 제작 단계 (상단 바에 표시) */
export const VIDEO_CREATION_STEPS = [
  "① 업로드",
  "② 보고서 분석",
  "③ 스토리보드",
  "④ 영상 생성",
] as const;

export const VIDEO_CREATION_STEP = {
  upload: 0,
  analysis: 1,
  storyboard: 2,
  generate: 3,
} as const;
