/**
 * className 조각을 이어붙인다. falsy 는 버리고, 같은 class 는 처음 위치 하나만 남긴다.
 * `css()` 결과는 호출 단위 class 라 속성 단위 병합은 하지 않는다 — 같은 속성을 가진
 * 두 class 의 승패는 CSS 로드 순서를 따른다.
 */
export function _cx(parts: ReadonlyArray<string | false | null | undefined>): string {
    const seen = new Set<string>();
    for (const part of parts) {
        if (!part) continue;
        for (const cls of part.split(/\s+/)) if (cls) seen.add(cls);
    }
    return Array.from(seen).join(' ');
}
