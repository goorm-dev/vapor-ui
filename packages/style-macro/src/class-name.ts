import type { ConditionKey, Tuple } from './types';

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

export function buildClassName(t: Tuple): string {
    const prefix = conditionPrefix(t.condition);
    const head = prefix ? `_${prefix}-` : '_';
    return `${head}${t.propertyShort}-${t.valueShort}`;
}
