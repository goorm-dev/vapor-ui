export type SelectorKind = 'pseudo' | 'pseudo-element' | 'at-rule' | 'attr' | 'self-ref';

export interface ParsedSelector {
    kind: SelectorKind;
    raw: string;
}

/**
 * Nested key 검증. `:`, `::`, `@`, `[`, `&` 로 시작해야 함.
 * bare selector (예: `div span`) 는 scope 오염 방지 위해 금지.
 */
export function parseSelector(key: string): ParsedSelector {
    // `::` 는 `:` 보다 먼저 체크.
    if (key.startsWith('::')) return { kind: 'pseudo-element', raw: key };
    if (key.startsWith(':')) return { kind: 'pseudo', raw: key };
    if (key.startsWith('@')) return { kind: 'at-rule', raw: key };
    if (key.startsWith('[')) return { kind: 'attr', raw: key };
    if (key.startsWith('&')) return { kind: 'self-ref', raw: key };

    throw new Error(
        `invalid selector: ${JSON.stringify(key)}. ` +
            `Nested keys must start with ':', '::', '@', '[', or '&'.`,
    );
}

export function composeSelector(className: string, key: string): string {
    const parsed = parseSelector(key);
    switch (parsed.kind) {
        case 'pseudo':
        case 'pseudo-element':
        case 'attr':
            return `${className}${key}`;
        case 'self-ref':
            return key.replace(/&/g, className);
        case 'at-rule':
            return className;
    }
}

function normalizeWhitespace(s: string): string {
    return s.replace(/\s+/g, '');
}

export function composeContext(parent: string, key: string): string {
    const parsed = parseSelector(key);
    const norm = parsed.kind === 'at-rule' ? normalizeWhitespace(key) : key;
    if (parent === 'base') return norm;
    return `${parent}${norm}`;
}
