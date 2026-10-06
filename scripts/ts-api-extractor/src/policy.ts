/**
 * The extraction policy (README "Extraction Policy"): which props a component
 * documents, how their types read, and in what order they appear.
 *
 * Pure: it takes what read/ found in the source and returns the JSON shape, so
 * every rule can be tested with plain data.
 */
import type { ComponentDoc, ParsedComponent, ParsedProp, PropDoc, PropSource } from '#model';

// ──────────────────────────────────────────────────────────────
// Props: which ones are documented
// ──────────────────────────────────────────────────────────────

/** HTML attributes that are documented even though they come from React/DOM types. */
const DOCUMENTED_HTML_PROPS = new Set(['className', 'style']);

const DEPRECATED_CSS_PROPS = new Set([
    '$css',
    'position',
    'display',
    'alignItems',
    'justifyContent',
    'flexDirection',
    'gap',
    'alignContent',
    'padding',
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingX',
    'paddingY',
    'margin',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'marginX',
    'marginY',
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    'border',
    'borderColor',
    'borderRadius',
    'backgroundColor',
    'color',
    'opacity',
    'pointerEvents',
    'overflow',
    'textAlign',
]);

function isDocumented(prop: ParsedProp): boolean {
    const { name, source } = prop;

    if (DOCUMENTED_HTML_PROPS.has(name)) return true;
    if (source === 'react' || source === 'dom' || source === 'external') return false;
    if (name.startsWith('data-') || name.startsWith('aria-')) return false;
    if (source === 'sprinkles' || DEPRECATED_CSS_PROPS.has(name)) return false;
    return true;
}

// ──────────────────────────────────────────────────────────────
// Types: how a printed type reads
// ──────────────────────────────────────────────────────────────

/**
 * Split top-level union only. Ignores | inside parentheses/braces.
 */
function splitTopLevelUnion(type: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < type.length; i++) {
        const char = type[i];
        const prevChar = i > 0 ? type[i - 1] : '';

        if (char === '(' || char === '{' || char === '[') {
            depth++;
            current += char;
        } else if (char === '<') {
            depth++;
            current += char;
        } else if (char === ')' || char === '}' || char === ']') {
            depth--;
            current += char;
        } else if (char === '>') {
            // The '>' of an arrow function is not a closing angle bracket.
            if (prevChar !== '=') {
                depth--;
            }
            current += char;
        } else if (char === '|' && depth === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    if (current.trim()) {
        parts.push(current.trim());
    }

    return parts;
}

function removeEmptyUnion(type: string): string {
    return splitTopLevelUnion(type).filter(Boolean).join(' | ');
}

function removeDuplicateTypes(type: string): string {
    const parts = splitTopLevelUnion(type);
    const unique = [...new Set(parts)];
    return unique.join(' | ');
}

function isStringLiteral(part: string): boolean {
    const trimmed = part.trim();
    return trimmed.startsWith('"') && trimmed.endsWith('"');
}

function removeUndefined(type: string): string {
    return splitTopLevelUnion(type)
        .filter((p) => p !== 'undefined')
        .join(' | ');
}

/**
 * `"sm" | "md"` becomes `sm | md` — a union of string literals documents as its
 * bare values. Any other union is left exactly as it is.
 */
function unquoteStringLiteralUnion(type: string): string {
    const parts = splitTopLevelUnion(type);

    if (parts.length === 0 || !parts.every(isStringLiteral)) return type;

    return parts.map((part) => part.slice(1, -1)).join(' | ');
}

function cleanType(type: string): string {
    const noEmpty = removeEmptyUnion(type);
    const cleaned = removeDuplicateTypes(noEmpty);

    return unquoteStringLiteralUnion(removeUndefined(cleaned));
}

function isSimpleType(part: string): boolean {
    if (/^["'].*["']$/.test(part)) return true;
    if (/^\d+$/.test(part)) return true;
    if (/^[\w$-]+$/.test(part)) return true;
    return false;
}

function normalizeTypeStrings(typeString: string): string[] {
    if (typeString.includes('|')) {
        const parts = typeString.split(/\s*\|\s*/).map((s) => s.trim());
        if (parts.every(isSimpleType)) {
            return parts;
        }
    }

    return [typeString];
}

// ──────────────────────────────────────────────────────────────
// Order: which props come first
// ──────────────────────────────────────────────────────────────

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

function isStateProp(name: string): boolean {
    return STATE_PROP_PATTERNS.some((pattern) => pattern.test(name));
}

function isCompositionProp(name: string): boolean {
    return COMPOSITION_PROPS.has(name);
}

function categorizeProp(name: string, required: boolean, source: PropSource): PropCategory {
    if (required) return 'required';
    if (isCompositionProp(name)) return 'composition';
    if (source === 'variants') return 'variants';
    if (isStateProp(name)) return 'state';
    if (source === 'base-ui') return 'base-ui';
    return 'custom';
}

// ──────────────────────────────────────────────────────────────
// policy()
// ──────────────────────────────────────────────────────────────

function toPropDoc(prop: ParsedProp): PropDoc {
    return {
        name: prop.name,
        type: normalizeTypeStrings(cleanType(prop.typeString)),
        required: !prop.isOptional,
        ...(prop.description !== undefined && { description: prop.description }),
        ...(prop.defaultValue !== undefined && { defaultValue: prop.defaultValue }),
    };
}

function categoryOrder(prop: ParsedProp): number {
    return CATEGORY_ORDER[categorizeProp(prop.name, !prop.isOptional, prop.source)];
}

export function policy(components: ParsedComponent[]): ComponentDoc[] {
    return components.map((component) => ({
        name: component.name,
        ...(component.description !== undefined && { description: component.description }),
        props: component.props
            .filter(isDocumented)
            .sort((a, b) => categoryOrder(a) - categoryOrder(b) || a.name.localeCompare(b.name))
            .map(toPropDoc),
    }));
}
