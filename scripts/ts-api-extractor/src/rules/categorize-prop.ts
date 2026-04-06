import type { PropCategory } from '~/models/internal';

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

type SourceKind = 'base-ui' | 'custom' | 'variants';

function getSourceFromPath(filePath?: string): SourceKind {
    if (!filePath) return 'custom';
    if (filePath.includes('@base-ui')) return 'base-ui';
    if (filePath.endsWith('.css.ts')) return 'variants';
    return 'custom';
}

function isStateProp(name: string): boolean {
    return STATE_PROP_PATTERNS.some((pattern) => pattern.test(name));
}

function isCompositionProp(name: string): boolean {
    return COMPOSITION_PROPS.has(name);
}

export function categorizeProp(
    name: string,
    required: boolean,
    declarationFilePath?: string,
): PropCategory {
    const source = getSourceFromPath(declarationFilePath);

    if (required) return 'required';
    if (isCompositionProp(name)) return 'composition';
    if (source === 'variants') return 'variants';
    if (isStateProp(name)) return 'state';
    if (source === 'base-ui') return 'base-ui';
    return 'custom';
}
