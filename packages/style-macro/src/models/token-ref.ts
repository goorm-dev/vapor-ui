/**
 * CSS 값 문자열 안의 `$token` 참조 찾기.
 *
 * CSS 문법에서 `$` 는 문자열(`"…"`, `'…'`)과 `url(…)` 밖에서는 값이 될 수 없는 글자다. 그래서
 * 그 밖의 `$name` 만 토큰 참조로 보고, 문자열·url 안의 `$` 는 사용자 텍스트로 그대로 둔다
 * (Stitches 의 `$token` 도 값 component 단위다).
 *
 * 토큰은 값 component 하나여야 한다 — 앞뒤가 값의 끝, 공백, `(` `)` `,` `/` 중 하나. `-$x`,
 * `$xpx` 처럼 다른 글자에 붙으면 `glued` 로 알린다 (CSS 로 풀 방법이 정해져 있지 않다).
 */

export interface TokenRef {
    /** `$` 위치. */
    start: number;
    /** 이름 끝(exclusive). */
    end: number;
    /** `$` 뒤 이름. */
    name: string;
    /** 앞뒤가 component 경계가 아님. */
    glued: boolean;
}

// 음수 키(`-space-100`)를 위해 `-` 하나 + 영문자로도 시작할 수 있다.
const NAME_START = /^-?[a-zA-Z]/;
const NAME_CHAR = /[a-zA-Z0-9_-]/;
const BOUNDARY = /[\s(),/]/;

const isBoundary = (c: string | undefined) => c === undefined || BOUNDARY.test(c);

export function findTokenRefs(value: string): TokenRef[] {
    const refs: TokenRef[] = [];
    let i = 0;
    while (i < value.length) {
        const c = value[i]!;
        if (c === '\\') {
            i += 2;
            continue;
        }
        if (c === '"' || c === "'") {
            i = skipString(value, i);
            continue;
        }
        if (/^url\(/i.test(value.slice(i, i + 4)) && !NAME_CHAR.test(value[i - 1] ?? '')) {
            i = skipUrl(value, i + 4);
            continue;
        }
        if (c === '$' && NAME_START.test(value.slice(i + 1, i + 3))) {
            let end = value[i + 1] === '-' ? i + 3 : i + 2;
            while (end < value.length && NAME_CHAR.test(value[end]!)) end++;
            refs.push({
                start: i,
                end,
                name: value.slice(i + 1, end),
                glued: !isBoundary(value[i - 1]) || !isBoundary(value[end]),
            });
            i = end;
            continue;
        }
        i++;
    }
    return refs;
}

/** 여는 따옴표 위치에서 시작해 닫는 따옴표 다음 위치. 닫히지 않으면 끝. */
function skipString(s: string, open: number): number {
    const q = s[open];
    for (let i = open + 1; i < s.length; i++) {
        if (s[i] === '\\') i++;
        else if (s[i] === q) return i + 1;
    }
    return s.length;
}

/** `url(` 다음 위치에서 시작해 짝이 맞는 `)` 다음 위치. 안의 따옴표 문자열은 건너뛴다. */
function skipUrl(s: string, from: number): number {
    for (let i = from; i < s.length; i++) {
        const c = s[i];
        if (c === '\\') i++;
        else if (c === '"' || c === "'") i = skipString(s, i) - 1;
        else if (c === ')') return i + 1;
    }
    return s.length;
}
