import type { TokenStatus } from '~/common/schemas';

export type PaddingField = 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft';

export type PaddingDir = {
    field: PaddingField;
    value: number;
    token: string | null;
    status: TokenStatus;
};

export type PaddingEmitProperty =
    | 'padding'
    | 'paddingVertical'
    | 'paddingHorizontal'
    | PaddingField;

export type PaddingEmission = { property: PaddingEmitProperty; source: PaddingDir };

function samePadding(a: PaddingDir, b: PaddingDir): boolean {
    return a.value === b.value && a.token === b.token && a.status === b.status;
}

/**
 * 4방향 padding 을 최소 표현으로 축약.
 * - 4방향 존재 & 전부 동일    → 1건 (padding)
 * - 4방향 존재 & 상하/좌우 동일 → 2건 (paddingVertical + paddingHorizontal)
 * - 그 외 (부분/불균등)         → 방향별 개별 emit
 */
export function derivePaddingEmissions(dirs: PaddingDir[]): PaddingEmission[] {
    if (dirs.length === 0) return [];

    const byField = {} as Partial<Record<PaddingField, PaddingDir>>;

    for (const d of dirs) {
        byField[d.field] = d;
    }

    const top = byField.paddingTop;
    const bot = byField.paddingBottom;
    const left = byField.paddingLeft;
    const right = byField.paddingRight;
    const allFour = dirs.length === 4 && top && bot && left && right;

    const isVertSame = allFour && samePadding(top, bot);
    const isHorzSame = allFour && samePadding(left, right);

    if (isVertSame && isHorzSame && samePadding(top, left)) {
        return [{ property: 'padding', source: top }];
    }

    if (isVertSame && isHorzSame) {
        return [
            { property: 'paddingVertical', source: top },
            { property: 'paddingHorizontal', source: left },
        ];
    }

    return dirs.map((d) => ({ property: d.field, source: d }));
}
