import { createHash } from 'node:crypto';

import type { ConditionKey, Tuple } from './types';

export type ClassNameMode = 'readable' | 'hashed';

function conditionPrefix(c: ConditionKey): string {
    switch (c.kind) {
        case 'default':
            return '';
        case 'named-bp':
            return c.name;
        case 'pseudo':
            return c.name.slice(1);
        case 'raw-media':
            return `mq${c.hash.slice(0, 6)}`;
    }
}

function conditionKey(c: ConditionKey): string {
    switch (c.kind) {
        case 'default':
            return 'd';
        case 'named-bp':
            return `b:${c.name}`;
        case 'pseudo':
            return `p:${c.name}`;
        case 'raw-media':
            return `r:${c.hash}`;
    }
}

function hashedClassName(t: Tuple): string {
    const key = `${conditionKey(t.condition)}|${t.property}|${t.cssValue}`;
    const digest = createHash('sha1').update(key).digest('hex');
    const slug = parseInt(digest.slice(0, 12), 16).toString(36).padStart(8, '0').slice(-8);
    return `_${slug}`;
}

export function buildClassName(t: Tuple, mode: ClassNameMode = 'readable'): string {
    if (mode === 'hashed') return hashedClassName(t);
    const prefix = conditionPrefix(t.condition);
    const head = prefix ? `_${prefix}-` : '_';
    return `${head}${t.propertyShort}-${t.valueShort}`;
}
