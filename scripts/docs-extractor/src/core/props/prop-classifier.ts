/**
 * Prop classification module
 *
 * Classifies prop sources (base-ui, variants, custom),
 * assigns categories (required, variants, state, etc.), and sorts props for output.
 */
import type { Symbol } from 'ts-morph';

import type { Property } from '~/types/props';

import { getSymbolSourcePath } from '../shared/declaration-source';

export type PropSource = 'base-ui' | 'custom' | 'variants';

type PropCategory = 'required' | 'variants' | 'state' | 'custom' | 'base-ui' | 'composition';

const CATEGORY_ORDER: Record<PropCategory, number> = {
    required: 0,
    variants: 1,
    state: 2,
    custom: 3,
    'base-ui': 4,
    composition: 5,
};

const STATE_PROP_PATTERNS = [
    /^value$/,
    /^defaultValue$/,
    /^onChange$/,
    /^on[A-Z].*Change$/,
    /^(open|checked|selected|expanded|pressed|active)$/,
    /^default(Open|Checked|Selected|Expanded|Pressed|Active)$/,
];

const COMPOSITION_PROPS = new Set(['asChild', 'render']);

export interface InternalProperty {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
    _source: PropSource;
    _category: PropCategory;
}

export function getPropSource(symbol: Symbol): PropSource {
    const filePath = getSymbolSourcePath(symbol);
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

export function getPropCategory(name: string, required: boolean, source: PropSource): PropCategory {
    if (required) return 'required';
    if (isCompositionProp(name)) return 'composition';
    if (source === 'variants') return 'variants';
    if (isStateProp(name)) return 'state';
    if (source === 'base-ui') return 'base-ui';
    return 'custom';
}

export function sortProps(props: InternalProperty[]): Property[] {
    return props
        .sort((a, b) => {
            const categoryOrder = CATEGORY_ORDER[a._category] - CATEGORY_ORDER[b._category];
            if (categoryOrder !== 0) return categoryOrder;
            return a.name.localeCompare(b.name);
        })
        .map(({ _source: _, _category: __, ...rest }) => rest);
}

export function toTypeArray(typeResult: { type: string; values?: string[] }): string[] {
    // Use values if available, otherwise wrap type in an array
    if (typeResult.values && typeResult.values.length > 0) {
        return typeResult.values;
    }
    return [typeResult.type];
}
