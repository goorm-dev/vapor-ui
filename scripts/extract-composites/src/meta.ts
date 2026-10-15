import { findDescendants, nearestAncestor } from './traverse.ts';
import type { FigmaNode, Item } from './types.ts';

const TEXT_INSTANCE_NAME = 'Component guide/Text';
const CONTENT_BLOCK_NAME = 'Component guide/Content block';
const HEADER_INSTANCE_NAME = 'Component guide/Header';

/** Placeholder content that designers leave untouched in Figma. Treat as empty. */
const PLACEHOLDER_VALUES = new Set([
    'body',
    'section title',
    'section subtitle',
    '작성예정',
]);

/** Collect all Component guide/Text instances inside subtree (including nested ones).
 *  Each instance has its own variant and direct TEXT child, so nesting is semantic. */
export function collectAllTextInstances(subtree: FigmaNode): FigmaNode[] {
    return findDescendants(
        subtree,
        (n) => n.type === 'INSTANCE' && n.name === TEXT_INSTANCE_NAME,
    );
}

/** Extract text content from first direct TEXT child; skip nested Component guide/Text. */
export function readText(node: FigmaNode): string | undefined {
    const direct = (node.children ?? []).find((c) => c.type === 'TEXT');
    if (direct?.characters) return direct.characters.trim();
    const stack: FigmaNode[] = [...(node.children ?? [])];
    while (stack.length) {
        const cur = stack.pop()!;
        if (cur.type === 'TEXT' && cur.characters) return cur.characters.trim();
        if (cur.type !== 'INSTANCE' || cur.name !== TEXT_INSTANCE_NAME) {
            for (const c of cur.children ?? []) stack.push(c);
        }
    }
    return undefined;
}

function isPlaceholder(v: string | undefined): boolean {
    if (!v) return true;
    return PLACEHOLDER_VALUES.has(v.toLowerCase().trim());
}

function readVariant(node: FigmaNode): string {
    const v = node.componentProperties?.type?.value;
    return typeof v === 'string' ? v.toLowerCase() : '';
}

/** Map Content block Component guide/Text instances to subtitle/description by variant. */
export function mapMetaFromAncestry(
    _target: FigmaNode,
    ancestors: FigmaNode[],
): Partial<Pick<Item, 'subtitle' | 'description'>> {
    const contentBlock = nearestAncestor(
        ancestors,
        (n) => n.type === 'INSTANCE' && n.name === CONTENT_BLOCK_NAME,
    );
    if (!contentBlock) return {};
    const texts = collectAllTextInstances(contentBlock);
    const out: Partial<Pick<Item, 'subtitle' | 'description'>> = {};
    for (const t of texts) {
        const variant = readVariant(t);
        const value = readText(t);
        if (!value || isPlaceholder(value)) continue;
        if (
            !out.subtitle &&
            (variant.includes('section title') || variant.includes('section subtitle'))
        ) {
            out.subtitle = value;
        } else if (!out.description && variant.includes('body')) {
            out.description = value;
        }
    }
    return out;
}

/** Extract {name, description} from the cover frame's Component guide/Header. */
export function readComponentMeta(coverFrame: FigmaNode): {
    name: string;
    description?: string;
} {
    const header = findDescendants(
        coverFrame,
        (n) => n.type === 'INSTANCE' && n.name === HEADER_INSTANCE_NAME,
    )[0];
    const nameNode = header
        ? findDescendants(header, (n) => n.type === 'TEXT' && n.name === 'component name')[0]
        : undefined;
    const descNode = header
        ? findDescendants(header, (n) => n.type === 'TEXT' && n.name === 'component description')[0]
        : undefined;
    const name = nameNode?.characters?.trim() ?? coverFrame.name;
    const description = descNode?.characters?.trim();
    return { name, description };
}

export { COVER_FRAME_NAME } from './sections.ts';

/** Extract section title from the section-frame-level Component guide/Header. */
export function readSectionTitle(sectionFrame: FigmaNode): string {
    const header = (sectionFrame.children ?? []).find(
        (c) => c.type === 'INSTANCE' && c.name === HEADER_INSTANCE_NAME,
    );
    if (header) {
        const titleNode = findDescendants(
            header,
            (n) => n.type === 'TEXT' && n.name === 'section title',
        )[0];
        if (titleNode?.characters) return titleNode.characters.trim();
    }
    return sectionFrame.name;
}

/** Extract do/dont caption from Component guide/do+don't description instance. */
export function readDoDontCaption(doOrDontFrame: FigmaNode): string | undefined {
    const desc = findDescendants(
        doOrDontFrame,
        (n) => n.type === 'INSTANCE' && n.name === "Component guide/do+don't description",
    )[0];
    if (!desc) return undefined;
    const text = findDescendants(desc, (n) => n.type === 'TEXT')[0];
    return text?.characters?.trim();
}

export { CONTENT_BLOCK_NAME, HEADER_INSTANCE_NAME, TEXT_INSTANCE_NAME };
