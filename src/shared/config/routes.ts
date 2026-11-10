export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  findAccount: "/find-account",
  videoCreate: "/videos/new",
  library: "/library",
  libraryVideo: (videoId: string) => `/library/${videoId}`,
  drafts: "/drafts",
  videoAnalysis: (videoId: string) => `/videos/${videoId}/analysis`,
  videoAnalysisResult: (videoId: string) =>
    `/videos/${videoId}/analysis/result`,
  videoStoryboard: (videoId: string) => `/videos/${videoId}/storyboard`,
  videoGeneration: (videoId: string) => `/videos/${videoId}/generation`,
  videoComplete: (videoId: string) => `/videos/${videoId}/complete`,
} as const;
