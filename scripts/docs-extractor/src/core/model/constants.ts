/**
 * Model Layer Constants
 */
import type { PropCategory } from './types';

/**
 * 카테고리 정렬 순서
 */
export const CATEGORY_ORDER: Record<PropCategory, number> = {
    required: 0,
    variants: 1,
    state: 2,
    custom: 3,
    'base-ui': 4,
    composition: 5,
};

/**
 * 상태 관련 prop 패턴
 */
export const STATE_PROP_PATTERNS = [
    /^value$/,
    /^defaultValue$/,
    /^onChange$/,
    /^on[A-Z].*Change$/,
    /^(open|checked|selected|expanded|pressed|active)$/,
    /^default(Open|Checked|Selected|Expanded|Pressed|Active)$/,
];

/**
 * Composition props (asChild, render)
 */
export const COMPOSITION_PROPS = new Set(['asChild', 'render']);
