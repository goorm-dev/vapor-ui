type Expansion = (value: string) => Array<{ property: string; value: string }>;

const TABLE: Record<string, Expansion> = {
    padding: (v) => [
        { property: 'padding-top', value: v },
        { property: 'padding-right', value: v },
        { property: 'padding-bottom', value: v },
        { property: 'padding-left', value: v },
    ],
    margin: (v) => [
        { property: 'margin-top', value: v },
        { property: 'margin-right', value: v },
        { property: 'margin-bottom', value: v },
        { property: 'margin-left', value: v },
    ],
    'padding-inline': (v) => [
        { property: 'padding-inline-start', value: v },
        { property: 'padding-inline-end', value: v },
    ],
    'padding-block': (v) => [
        { property: 'padding-block-start', value: v },
        { property: 'padding-block-end', value: v },
    ],
    'margin-inline': (v) => [
        { property: 'margin-inline-start', value: v },
        { property: 'margin-inline-end', value: v },
    ],
    'margin-block': (v) => [
        { property: 'margin-block-start', value: v },
        { property: 'margin-block-end', value: v },
    ],
    inset: (v) => [
        { property: 'top', value: v },
        { property: 'right', value: v },
        { property: 'bottom', value: v },
        { property: 'left', value: v },
    ],
    'inset-inline': (v) => [
        { property: 'inset-inline-start', value: v },
        { property: 'inset-inline-end', value: v },
    ],
    'inset-block': (v) => [
        { property: 'inset-block-start', value: v },
        { property: 'inset-block-end', value: v },
    ],
    'border-radius': (v) => [
        { property: 'border-top-left-radius', value: v },
        { property: 'border-top-right-radius', value: v },
        { property: 'border-bottom-right-radius', value: v },
        { property: 'border-bottom-left-radius', value: v },
    ],
};

export function expandShorthand(
    property: string,
    value: string,
): Array<{ property: string; value: string }> {
    const fn = TABLE[property];
    if (fn) return fn(value);
    return [{ property, value }];
}
