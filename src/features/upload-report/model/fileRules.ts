// 서버 규칙과 맞출 것: PDF만, 최대 20MB (서버 .env MAX_REPORT_SIZE_MB)
export const ACCEPTED_EXTENSIONS = [".pdf"] as const;
export const ACCEPT_ATTRIBUTE = [
  ...ACCEPTED_EXTENSIONS,
  "application/pdf",
].join(",");
export const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function isAcceptedFile(file: File) {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
}

/** 서버에 보내기 전에 미리 크기를 확인해 큰 파일을 올리느라 기다리지 않게 한다 */
export function isWithinSizeLimit(file: File) {
  return file.size <= MAX_FILE_SIZE_BYTES;
}
