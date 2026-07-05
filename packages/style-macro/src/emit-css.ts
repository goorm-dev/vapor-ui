import { type ClassNameMode, buildClassName } from './class-name';
import type { ConditionKey, PseudoName, Tuple } from './types';

const PSEUDO_ORDER: PseudoName[] = [
    '_before',
    '_after',
    '_focus',
    '_focusVisible',
    '_focusWithin',
    '_hover',
    '_active',
];

const PSEUDO_SELECTOR: Record<PseudoName, string> = {
    _before: '::before',
    _after: '::after',
    _hover: ':hover',
    _focus: ':focus',
    _focusVisible: ':focus-visible',
    _focusWithin: ':focus-within',
    _active: ':active',
};

function bucket(c: ConditionKey): 'default' | 'sm' | 'md' | 'lg' | 'raw' | 'pseudo' {
    switch (c.kind) {
        case 'default':
            return 'default';
        case 'named-bp':
            return c.name;
        case 'raw-media':
            return 'raw';
        case 'pseudo':
            return 'pseudo';
    }
}

function dedupe(tuples: Tuple[], mode: ClassNameMode): Tuple[] {
    const seen = new Map<string, Tuple>();
    for (const t of tuples) {
        const key = buildClassName(t, mode);
        if (!seen.has(key)) seen.set(key, t);
    }
    return [...seen.values()];
}

function ruleLine(t: Tuple, mode: ClassNameMode): string {
    const cls = buildClassName(t, mode);
    const sel = t.condition.kind === 'pseudo' ? `${cls}${PSEUDO_SELECTOR[t.condition.name]}` : cls;
    return `    .${sel} { ${kebab(t.property)}: ${t.cssValue}; }`;
}

function kebab(p: string): string {
    return p.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function emitCss(tuples: Tuple[], mode: ClassNameMode = 'readable'): string {
    const unique = dedupe(tuples, mode);
    const groups = {
        default: [] as Tuple[],
        sm: [] as Tuple[],
        md: [] as Tuple[],
        lg: [] as Tuple[],
        raw: [] as Tuple[],
        pseudo: [] as Tuple[],
    };
    for (const t of unique) groups[bucket(t.condition)].push(t);

    // raw-media: sort by query string
    groups.raw.sort((a, b) => {
        if (a.condition.kind !== 'raw-media' || b.condition.kind !== 'raw-media') return 0;
        return a.condition.query.localeCompare(b.condition.query);
    });

    // pseudo: enforce PSEUDO_ORDER
    groups.pseudo.sort((a, b) => {
        if (a.condition.kind !== 'pseudo' || b.condition.kind !== 'pseudo') return 0;
        return PSEUDO_ORDER.indexOf(a.condition.name) - PSEUDO_ORDER.indexOf(b.condition.name);
    });

    // default / sm / md / lg buckets: preserve source order.
    // `dedupe()` uses a Map keyed by className, whose iteration order is
    // first-occurrence — so `unique` already reflects the order the user
    // wrote each property in `$style({...})` (and across multiple calls in
    // the same file). CSS cascade for equal-specificity classes = declaration
    // order in the stylesheet, so honoring source order gives the user direct
    // control (e.g. `all: 'unset'` before individual properties).
    // Raw media and pseudo keep their explicit ordering above.

    const lines: string[] = ['@layer vapor-utilities {'];
    for (const t of groups.default) lines.push(ruleLine(t, mode));
    const namedBpBlock = (name: 'sm' | 'md' | 'lg', arr: Tuple[]) => {
        if (!arr.length) return;
        lines.push(`    @media (--vapor-${name}) {`);
        for (const t of arr) lines.push('    ' + ruleLine(t, mode));
        lines.push('    }');
    };
    namedBpBlock('sm', groups.sm);
    namedBpBlock('md', groups.md);
    namedBpBlock('lg', groups.lg);
    for (const t of groups.raw) {
        if (t.condition.kind !== 'raw-media') continue;
        lines.push(`    @media ${t.condition.query} {`);
        lines.push('    ' + ruleLine(t, mode));
        lines.push('    }');
    }
    for (const t of groups.pseudo) lines.push(ruleLine(t, mode));
    lines.push('}');
    return lines.join('\n') + '\n';
}
