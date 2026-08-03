import type { PropCategory, PropSource } from '~/models/pipeline';

export const CATEGORY_ORDER: Record<PropCategory, number> = {
    required: 0,
    variants: 1,
    state: 2,
    custom: 3,
    'base-ui': 4,
    composition: 5,
};

export const STATE_PROP_PATTERNS = [
    /^value$/,
    /^defaultValue$/,
    /^onChange$/,
    /^on[A-Z].*Change$/,
    /^(open|checked|selected|expanded|pressed|active)$/,
    /^default(Open|Checked|Selected|Expanded|Pressed|Active)$/,
];

export const COMPOSITION_PROPS = new Set(['asChild', 'render']);

export function categorizeProp(name: string, required: boolean, source: PropSource): PropCategory {
    if (required) return 'required';
    if (COMPOSITION_PROPS.has(name)) return 'composition';
    if (source === 'variants') return 'variants';
    if (STATE_PROP_PATTERNS.some((pattern) => pattern.test(name))) return 'state';
    if (source === 'base-ui') return 'base-ui';
    return 'custom';
}
