// Base62 class-name encoding ported from adobe/react-spectrum s2 style-macro (Apache-2.0):
// https://github.com/adobe/react-spectrum/blob/main/packages/%40react-spectrum/s2/style/style-macro.ts
//
// Hash algorithm: murmur2 32-bit — matches StyleX, Compiled, and Panda CSS.
// djb2 (Adobe S2 default) is natural-collision-prone on hex-shaped values
// (`#1E1E1E` ↔ `#0f0f0f`, `#2B2B2B` ↔ `#1c1c1c`), which is safe for Adobe's
// bounded design-token set but not for user-supplied CSS values.
import type { Tuple } from './types';

export type ClassNameMode = 'readable' | 'hashed';

// murmur2 32-bit (little-endian), seed 0. Reference:
// https://github.com/aappleby/smhasher/blob/master/src/MurmurHash2.cpp
function murmur2(v: string): number {
    const M = 0x5bd1e995;
    const R = 24;
    let len = v.length;
    let h = len >>> 0;
    let i = 0;
    while (len >= 4) {
        let k =
            (v.charCodeAt(i) & 0xff) |
            ((v.charCodeAt(i + 1) & 0xff) << 8) |
            ((v.charCodeAt(i + 2) & 0xff) << 16) |
            ((v.charCodeAt(i + 3) & 0xff) << 24);
        k = Math.imul(k, M) >>> 0;
        k = (k ^ (k >>> R)) >>> 0;
        k = Math.imul(k, M) >>> 0;
        h = Math.imul(h, M) >>> 0;
        h = (h ^ k) >>> 0;
        i += 4;
        len -= 4;
    }
    if (len >= 3) h = (h ^ ((v.charCodeAt(i + 2) & 0xff) << 16)) >>> 0;
    if (len >= 2) h = (h ^ ((v.charCodeAt(i + 1) & 0xff) << 8)) >>> 0;
    if (len >= 1) {
        h = (h ^ (v.charCodeAt(i) & 0xff)) >>> 0;
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

const ESCAPE_MAP: Record<string, string> = {
    '#': 'x',
    '.': 'd',
    '(': 'l',
    ')': 'r',
    ',': 'c',
    ' ': '_',
};
const SLUG_INVALID_RE = /[^a-z0-9-]/gi;

function slug(input: string): string {
    return input
        .replace(/[#.(),\s]/g, (ch) => ESCAPE_MAP[ch] ?? '_')
        .replace(SLUG_INVALID_RE, '_')
        .replace(/_+/g, '_')
        .replace(/^[_-]|[_-]$/g, '');
}

function stripTokenPrefix(input: string): string {
    return input.startsWith('$') ? input.slice(1) : input;
}

export function buildClassName(t: Tuple, mode: ClassNameMode = 'readable'): string {
    // StyleX / Compiled / Panda 패턴: (property, selectorContext, value) 전체를
    // 한 번에 해시한다. 분리 해시(propHash + valueHash) 는 각 공간이 32-bit 로
    // 좁아져 hex 값끼리 자연 충돌한다.
    const hash = generateArbitraryValueSelector(
        `${t.property}|${t.selectorContext}|${t.value}`,
    );

    if (mode === 'hashed') {
        return `_${hash}`;
    }

    const propSlug = slug(t.property);
    const valueSlug = slug(stripTokenPrefix(t.rawValue ?? t.value));
    return `vapor_${propSlug}_${valueSlug}_${hash}`;
}

/** dynamic slot 용 CSS var 이름. mode 별 접두: prod=`--_`, dev=`--vapor-_`. */
export function dynamicVarName(slotId: string, mode: 'dev' | 'prod'): string {
    const prefix = mode === 'prod' ? '--_' : '--vapor-_';
    return `${prefix}${slotId}`;
}
