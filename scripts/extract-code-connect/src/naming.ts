/** 'alert dialog' | 'alert-dialog' | 'AlertDialog' → 'AlertDialog' */
export function toPascal(name: string): string {
    return splitWords(name)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

/** 'AlertDialog' | 'Alert Dialog' | 'alert_dialog' → 'alert-dialog' */
export function toKebab(name: string): string {
    return splitWords(name)
        .map((w) => w.toLowerCase())
        .join('-');
}

export function lowerFirst(s: string): string {
    return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

export function isParen(s: string): boolean {
    return s.startsWith('(') && s.endsWith(')');
}

export function stripParens(s: string): string {
    return isParen(s) ? s.slice(1, -1) : s;
}

/** 인스턴스 이름이 영문자 또는 '(' 로 시작하면 true. 이모지 접두 core primitive 는 false. */
export function isNamedInstance(s: string): boolean {
    return /^[A-Za-z(]/.test(s);
}

/** 'title#2328:0' → 'title' */
export function stripPropId(s: string): string {
    return s.replace(/#\d+:\d+$/, '');
}

function splitWords(name: string): string[] {
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean);
}
