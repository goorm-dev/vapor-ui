/**
 * The extraction policy (README "Extraction Policy"): which props a component
 * documents, how their types read, and in what order they appear.
 *
 * Pure: it takes what read/ found in the source and returns the JSON shape, so
 * every rule can be tested with plain data.
 */
import type {
    ComponentDoc,
    ParsedComponent,
    ParsedProp,
    ParsedTypeMember,
    PropDoc,
    PropSource,
} from '#model';

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
// Types: how a type reads
// ──────────────────────────────────────────────────────────────

/** `"sm"` reads `sm`, a function reads `function`, `undefined` is left out. */
function summarizeType(members: ParsedTypeMember[]): string[] {
    return members.flatMap((member) => {
        switch (member.kind) {
            case 'undefined':
                return [];
            case 'function':
                return ['function'];
            case 'string-literal':
                return [member.text.slice(1, -1)];
            default:
                return [member.text];
        }
    });
}

function detailType(members: ParsedTypeMember[]): string {
    if (members.length === 1) return members[0].text;

    return members
        .map((member) => (member.kind === 'function' ? `(${member.text})` : member.text))
        .join(' | ');
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
        type: summarizeType(prop.typeMembers),
        detailedType: detailType(prop.typeMembers),
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
