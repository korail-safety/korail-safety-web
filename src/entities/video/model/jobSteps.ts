import {
  ANALYSIS_STEP,
  ANALYSIS_STEP_ORDER,
  GENERATION_STEP,
  GENERATION_STEP_ORDER,
} from "./enums";

/** 진행 카드에 넘길 단계 목록 (key + 문구) */
export const ANALYSIS_JOB_STEPS = ANALYSIS_STEP_ORDER.map((key) => ({
  key,
  ...ANALYSIS_STEP[key],
}));

export const GENERATION_JOB_STEPS = GENERATION_STEP_ORDER.map((key) => ({
  key,
  ...GENERATION_STEP[key],
}));
