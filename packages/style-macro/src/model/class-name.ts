// Hash algorithm ported from adobe/react-spectrum s2 style-macro (Apache-2.0):
// https://github.com/adobe/react-spectrum/blob/main/packages/%40react-spectrum/s2/style/style-macro.ts
// css-utils 방식 djb2 + base62 조합. SHA1/base36 방식보다 짧고 URL-safe.

import type { Tuple } from './types';

export type ClassNameMode = 'readable' | 'hashed';

// djb2. http://www.cse.yorku.ca/~oz/hash.html
function djb2(v: string): number {
    let h = 5381;
    for (let i = 0; i < v.length; i++) {
        h = ((h << 5) + h + v.charCodeAt(i)) >>> 0;
    }
    return h;
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
    let c = toBase62(djb2(v));
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
    const propHash = generateArbitraryValueSelector(`${t.property}|${t.selectorContext}`);
    const valueHash = generateArbitraryValueSelector(t.value);

    if (mode === 'hashed') {
        return `_${propHash}${valueHash}`;
    }

    const propSlug = slug(t.property);
    const valueSlug = slug(stripTokenPrefix(t.rawValue ?? t.value));
    const tail = generateArbitraryValueSelector(
        `${t.property}|${t.selectorContext}|${t.value}`,
    );
    return `vapor_${propSlug}_${valueSlug}_${tail}`;
}

/** dynamic slot 용 CSS var 이름. mode 별 접두: prod=`--_`, dev=`--vapor-_`. */
export function dynamicVarName(slotId: string, mode: 'dev' | 'prod'): string {
    const prefix = mode === 'prod' ? '--_' : '--vapor-_';
    return `${prefix}${slotId}`;
}
