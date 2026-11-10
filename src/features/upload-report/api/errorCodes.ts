/** 보고서 업로드 API 에러 코드 (서버 API 명세 문서와 맞출 것) */
export const UPLOAD_ERROR_CODE = {
  unsupportedFileType: "UNSUPPORTED_FILE_TYPE",
  encryptedFile: "ENCRYPTED_FILE",
  fileTooLarge: "FILE_TOO_LARGE",
} as const;
