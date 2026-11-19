export const FS_PREFIX = '/@fs/';
const VOLUME_RE = /^[A-Z]:/i;

/**
 * `/@fs/` URL → 파일 시스템 경로. Vite 의 `fsPathFromId` 와 같은 규칙: 접두를 떼고, 드라이브 문자
 * (`C:`)로 시작하면 그대로, 아니면 `/` 를 붙인다.
 */
export function fsPathFromFsUrl(url: string): string {
    const p = url.slice(FS_PREFIX.length);
    return p.startsWith('/') || VOLUME_RE.test(p) ? p : `/${p}`;
}
