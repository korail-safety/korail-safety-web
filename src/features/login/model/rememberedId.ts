const STORAGE_KEY = "korail-safety:remembered-id";

export function getRememberedId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setRememberedId(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소 접근 불가(시크릿 모드 등) 시 무시
  }
}
