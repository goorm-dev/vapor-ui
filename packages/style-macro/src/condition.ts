import { createHash } from 'node:crypto';

import type { ConditionKey, PseudoName } from './types';

const NAMED_BP = new Set(['sm', 'md', 'lg'] as const);
const PSEUDO = new Set<PseudoName>([
    '_before',
    '_after',
    '_hover',
    '_focus',
    '_focusVisible',
    '_focusWithin',
    '_active',
]);

export function hashMediaQuery(query: string): string {
    const normalized = query.replace(/\s+/g, '').toLowerCase();
    return createHash('sha1').update(normalized).digest('hex').slice(0, 8);
}

export function classifyCondition(key: string): ConditionKey | { error: 'unknown-condition' } {
    if (key === 'default') return { kind: 'default' };
    if ((NAMED_BP as Set<string>).has(key)) {
        return { kind: 'named-bp', name: key as 'sm' | 'md' | 'lg' };
    }
    if ((PSEUDO as Set<string>).has(key)) {
        return { kind: 'pseudo', name: key as PseudoName };
    }
    if (key.startsWith('@media ')) {
        const query = key.slice('@media '.length).trim();
        return { kind: 'raw-media', query, hash: hashMediaQuery(query) };
    }
    return { error: 'unknown-condition' };
}
