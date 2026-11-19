// Base62 class-name encoding ported from adobe/react-spectrum s2 style-macro (Apache-2.0):
// https://github.com/adobe/react-spectrum/blob/main/packages/%40react-spectrum/s2/style/style-macro.ts
//
// Hash algorithm: murmur2 32-bit — matches StyleX, Compiled, and Panda CSS.
// djb2 (Adobe S2 default) is natural-collision-prone on hex-shaped values
// (`#1E1E1E` ↔ `#0f0f0f`, `#2B2B2B` ↔ `#1c1c1c`), which is safe for Adobe's
// bounded design-token set but not for user-supplied CSS values.
export type ClassNameMode = 'readable' | 'hashed';

// murmur2 32-bit (little-endian), seed 0, over the UTF-8 bytes of `v`. Reference:
// https://github.com/aappleby/smhasher/blob/master/src/MurmurHash2.cpp
// UTF-8 로 바꿔 읽는다 — code unit 의 하위 바이트만 읽으면 한글·기호 값끼리 충돌한다.
// ASCII 는 UTF-8 바이트 == code unit 이라 기존 hash 가 그대로다.
const utf8 = new TextEncoder();

function murmur2(v: string): number {
    const M = 0x5bd1e995;
    const R = 24;
    const b = utf8.encode(v);
    let len = b.length;
    let h = len >>> 0;
    let i = 0;
    while (len >= 4) {
        let k = b[i]! | (b[i + 1]! << 8) | (b[i + 2]! << 16) | (b[i + 3]! << 24);
        k = Math.imul(k, M) >>> 0;
        k = (k ^ (k >>> R)) >>> 0;
        k = Math.imul(k, M) >>> 0;
        h = Math.imul(h, M) >>> 0;
        h = (h ^ k) >>> 0;
        i += 4;
        len -= 4;
    }
    if (len >= 3) h = (h ^ (b[i + 2]! << 16)) >>> 0;
    if (len >= 2) h = (h ^ (b[i + 1]! << 8)) >>> 0;
    if (len >= 1) {
        h = (h ^ b[i]!) >>> 0;
        h = Math.imul(h, M) >>> 0;
    }
    h = (h ^ (h >>> 13)) >>> 0;
    h = Math.imul(h, M) >>> 0;
    h = (h ^ (h >>> 15)) >>> 0;
    return h >>> 0;
}

// [a-z][A-Z][0-9]. index >= 62 이면 '_' 접두 재귀.
function generateName(index: number, atStart = false): string {
    if (index < 26) return String.fromCharCode(index + 97);
    if (index < 52) return String.fromCharCode(index - 26 + 65);
    if (index < 62 && !atStart) return String.fromCharCode(index - 52 + 48);
    return '_' + generateName(index - (atStart ? 52 : 62));
}

function toBase62(value: number): string {
    if (value === 0) return generateName(value);
    let res = '';
    while (value) {
        const remainder = value % 62;
        res += generateName(remainder);
        value = Math.floor((value - remainder) / 62);
    }
    return res;
}

export function generateArbitraryValueSelector(v: string, atStart = false): string {
    let c = toBase62(murmur2(v));
    if (atStart && /^[0-9]/.test(c)) c = `_${c}`;
    return c;
}

/** debugId 를 class ident 로: 영숫자·`-`·`_` 외는 `_`, 숫자 시작이면 `_` 접두. */
function sanitizeDebugId(input: string): string {
    const s = input.replace(/[^A-Za-z0-9_-]+/g, '_');
    return /^[0-9-]/.test(s) ? `_${s}` : s;
}

export interface BlockClassNameInput {
    /** 파일 식별자 (root 기준 상대 경로). 같은 선언이라도 파일이 다르면 다른 class. */
    scope: string;
    /** 블록 선언을 순서대로 직렬화한 문자열. 선언 순서도 정체성에 포함된다. */
    signature: string;
    mode: ClassNameMode;
    /** readable 모드에서 class 앞에 붙는 사람이 읽을 이름 (변수·컴포넌트 이름). */
    debugId?: string;
}

/**
 * `css()` 호출 1개 = class 1개. hash 는 `scope` + `signature` 의 murmur2 base62.
 * hashed: `v<hash>`, readable: `<debugId>_<hash>` (debugId 없으면 `css`).
 */
export function buildBlockClassName({
    scope,
    signature,
    mode,
    debugId,
}: BlockClassNameInput): string {
    const hash = toBase62(murmur2(`${scope}\0${signature}`));
    if (mode === 'hashed') return `v${hash}`;
    return `${sanitizeDebugId(debugId || 'css')}_${hash}`;
}

/** dynamic slot 용 CSS var 이름. mode 별 접두: prod=`--_`, dev=`--vapor-_`. */
export function dynamicVarName(slotId: string, mode: 'dev' | 'prod'): string {
    const prefix = mode === 'prod' ? '--_' : '--vapor-_';
    return `${prefix}${slotId}`;
}
