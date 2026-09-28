import type { Properties as CSSProperties } from 'csstype';

export function _mergeStyle(a?: CSSProperties, b?: CSSProperties): CSSProperties | undefined {
    if (!a && !b) return undefined;
    if (!a) return b;
    if (!b) return a;
    return { ...a, ...b };
}
