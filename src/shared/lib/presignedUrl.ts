/**
 * S3 임시 주소(presigned URL) 도우미.
 * 서버는 조회할 때마다 서명(? 뒤)만 다른 새 주소를 주기 때문에,
 * 그대로 쓰면 같은 이미지를 매번 새로 받고 다시 그리게 된다.
 */

/** 만료까지 이 시간보다 적게 남았으면 새 주소로 바꾼다 */
const RENEW_BEFORE_MS = 5 * 60 * 1000;

/** 주소에서 ? 뒤(서명)를 뗀 경로. 같은 파일인지 비교하거나 key로 쓴다 */
export function stripUrlQuery(url: string): string {
  const queryStart = url.indexOf("?");
  return queryStart === -1 ? url : url.slice(0, queryStart);
}

/** 서명에 들어 있는 만료 시각(ms). 알 수 없으면 null */
function getExpiresAt(url: string): number | null {
  try {
    const params = new URL(url).searchParams;
    const date = params.get("X-Amz-Date"); // 예: 20261126T093000Z
    const expires = Number(params.get("X-Amz-Expires"));
    if (!date || !expires) return null;
    const signedAt = Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(4, 6)) - 1,
      Number(date.slice(6, 8)),
      Number(date.slice(9, 11)),
      Number(date.slice(11, 13)),
      Number(date.slice(13, 15)),
    );
    return signedAt + expires * 1000;
  } catch {
    return null;
  }
}

/**
 * 같은 파일이고 이전 주소가 아직 충분히 유효하면 이전 주소를 그대로 쓴다.
 * 파일이 바뀌었거나 곧 만료되면 새 주소를 쓴다.
 */
export function keepPresignedUrl(
  prev: string | null | undefined,
  next: string | null,
): string | null {
  if (!prev || !next) return next;
  if (stripUrlQuery(prev) !== stripUrlQuery(next)) return next;
  const expiresAt = getExpiresAt(prev);
  if (expiresAt !== null && expiresAt - Date.now() < RENEW_BEFORE_MS) {
    return next;
  }
  return prev;
}
