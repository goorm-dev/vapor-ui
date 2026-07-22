/* eslint-disable @typescript-eslint/no-explicit-any -- Figma paint shape lookups are intentionally loose. */
import type { ColorBackground } from '~/common/schemas';

/** Figma RGB{0..1} → CSS hex '#rrggbb'. Alpha 는 무시 (별도 판단). */
export function rgbaToHex(c: any): string | null {
    if (!c) return null;

    const f = (n: number) => {
        return Math.round(n * 255)
            .toString(16)
            .padStart(2, '0');
    };

    return '#' + f(c.r) + f(c.g) + f(c.b);
}

/** Figma RGBA → CSS `rgba(r,g,b,a)`. shadow → box-shadow 변환용. */
export function rgbaToString(c: any): string {
    if (!c) return 'rgba(0,0,0,1)';

    const r = Math.round(c.r * 255);
    const g = Math.round(c.g * 255);
    const b = Math.round(c.b * 255);
    const a = typeof c.a === 'number' ? c.a : 1;

    return `rgba(${r},${g},${b},${a})`;
}

/** Figma DROP_SHADOW / INNER_SHADOW → CSS box-shadow 문자열. */
export function shadowToCss(eff: any): string {
    const inset = eff.type === 'INNER_SHADOW' ? 'inset ' : '';
    const x = Math.round(eff.offset?.x ?? 0);
    const y = Math.round(eff.offset?.y ?? 0);
    const blur = Math.round(eff.radius ?? 0);
    const spread = Math.round(eff.spread ?? 0);
    const color = rgbaToString(eff.color);

    return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

export function isVisiblePaint(p: any): boolean {
    return !!p && p.visible !== false;
}

/**
 * 대상 노드의 부모 체인을 타고 올라가며 effective 배경 hex 를 판정.
 * - SOLID 아닌 fill(그라디언트/이미지) 또는 반투명 스택 → `ambiguous`
 * - SOLID + opaque → `white` (`#ffffff`) 또는 `other`
 * - fill 없이 PAGE 도달 → `transparent`
 */
export function classifyBackground(node: SceneNode): ColorBackground {
    let cur: any = node.parent;

    while (cur && cur.type !== 'PAGE') {
        const nodeOpaque = ('opacity' in cur ? cur.opacity : 1) === 1;
        const fills = 'fills' in cur && Array.isArray(cur.fills) ? cur.fills : [];
        const visible = fills.find(isVisiblePaint);

        if (!visible) {
            cur = cur.parent;
            continue;
        }

        if (visible.type !== 'SOLID') return { kind: 'ambiguous', hex: null };

        const fillOpaque = (visible.opacity ?? 1) === 1;
        if (!nodeOpaque || !fillOpaque) {
            return { kind: 'ambiguous', hex: rgbaToHex(visible.color) };
        }

        const hex = rgbaToHex(visible.color);

        return { kind: hex === '#ffffff' ? 'white' : 'other', hex };
    }

    return { kind: 'transparent', hex: null };
}
