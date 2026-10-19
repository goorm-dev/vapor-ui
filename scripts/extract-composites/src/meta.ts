import { findDescendants, nearestAncestor } from './traverse.ts';
import type { FigmaNode, Item } from './types.ts';

const TEXT_INSTANCE_NAME = 'Component guide/Text';
const SHORT_TEXT_INSTANCE_NAME = 'Text';
const CONTENT_BLOCK_NAME = 'Component guide/Content block';
const HEADER_INSTANCE_NAME = 'Component guide/Header';
export const ITEM_INSTANCE_NAME = 'Item';

/** Placeholder content that designers leave untouched in Figma. Treat as empty. */
const PLACEHOLDER_VALUES = new Set(['body', 'section title', 'section subtitle', '작성예정']);

function isTextInstance(n: FigmaNode): boolean {
    if (n.type !== 'INSTANCE') return false;
    return n.name === TEXT_INSTANCE_NAME || n.name === SHORT_TEXT_INSTANCE_NAME;
}

/** Collect all guide text instances inside subtree (both legacy `Component guide/Text`
 *  and the newer short `Text` instance name). Nested instances are included because each
 *  carries its own variant and direct TEXT child, so nesting is semantic. */
export function collectAllTextInstances(subtree: FigmaNode): FigmaNode[] {
    return findDescendants(subtree, isTextInstance);
}

/** Extract text content from first direct TEXT child; skip nested guide text instances. */
export function readText(node: FigmaNode): string | undefined {
    const direct = (node.children ?? []).find((c) => c.type === 'TEXT');
    if (direct?.characters) return direct.characters.trim();
    const stack: FigmaNode[] = [...(node.children ?? [])];
    while (stack.length) {
        const cur = stack.pop()!;
        if (cur.type === 'TEXT' && cur.characters) return cur.characters.trim();
        if (!isTextInstance(cur)) {
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

/** Legacy: map Content block guide text instances to subtitle/description. Kept for callers
 *  still working against the old Content-block layout; new code should use readItemMeta. */
export function mapMetaFromAncestry(
    _target: FigmaNode,
    ancestors: FigmaNode[],
): Partial<Pick<Item, 'subtitle' | 'description'>> {
    const contentBlock = nearestAncestor(
        ancestors,
        (n) => n.type === 'INSTANCE' && n.name === CONTENT_BLOCK_NAME,
    );
    if (!contentBlock) return {};
    return readItemMeta(contentBlock);
}

/** Map a container's guide text TEXT leaves to subtitle/description.
 *
 *  Classification uses the TEXT node name (which Figma keeps in sync with the design-system
 *  variant), so both layouts work without a variant lookup:
 *    - name `section title`                → h3 subtitle. Takes priority when present.
 *    - name `section subtitle`             → h3 subtitle when no `section title` is set.
 *    - name `section subtitle - *`         → extra sub-sub-section heading, folded into body.
 *    - name `body`                         → body paragraph.
 *  Document order is preserved for the body so paired `section subtitle - *` + `body` pairs
 *  stay adjacent. */
export function readItemMeta(
    container: FigmaNode,
): Partial<Pick<Item, 'subtitle' | 'description'>> {
    let titleText: string | undefined;
    let subtitleText: string | undefined;
    const descriptionLines: string[] = [];
    const texts = collectTextsInOrder(container);
    for (const t of texts) {
        const name = (t.name ?? '').toLowerCase().trim();
        const value = t.characters?.trim();
        if (!value || isPlaceholder(value)) continue;
        if (name === 'section title') {
            if (!titleText) titleText = value;
            continue;
        }
        if (name === 'section subtitle') {
            if (!subtitleText) subtitleText = value;
            continue;
        }
        if (name.startsWith('section subtitle')) {
            descriptionLines.push(value);
            continue;
        }
        if (name === 'body') {
            descriptionLines.push(value);
        }
    }
    const subtitle = titleText ?? subtitleText;
    if (titleText && subtitleText) descriptionLines.unshift(subtitleText);
    const out: Partial<Pick<Item, 'subtitle' | 'description'>> = {};
    if (subtitle) out.subtitle = subtitle;
    const description = descriptionLines.join('\n\n').trim();
    if (description) out.description = description;
    return out;
}

/** Depth-first, document-order traversal collecting TEXT descendants. Keeps caption and
 *  heading pairs adjacent so paragraph joins read in authored order. */
function collectTextsInOrder(root: FigmaNode): FigmaNode[] {
    const out: FigmaNode[] = [];
    const visit = (n: FigmaNode): void => {
        if (n !== root && n.type === 'TEXT' && typeof n.characters === 'string') {
            out.push(n);
        }
        for (const child of n.children ?? []) visit(child);
    };
    visit(root);
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

/** Extract section title (h2). Supports two layouts:
 *    - Legacy: a `Component guide/Header` instance child whose `section title` TEXT holds it.
 *    - New:    a guide text instance child whose variant is `section title` holds it directly. */
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
    const titleInstance = (sectionFrame.children ?? []).find(
        (c) => isTextInstance(c) && readVariant(c).includes('section title'),
    );
    if (titleInstance) {
        const value = readText(titleInstance);
        if (value && !isPlaceholder(value)) return value;
    }
    return sectionFrame.name;
}

/** Extract do/dont caption from the description instance. The name is matched by suffix so
 *  both the legacy `Component guide/do+don't description` and the new `do+don't description`
 *  work without a code change. */
export function readDoDontCaption(doOrDontFrame: FigmaNode): string | undefined {
    const desc = findDescendants(
        doOrDontFrame,
        (n) => n.type === 'INSTANCE' && n.name.endsWith("do+don't description"),
    )[0];
    if (!desc) return undefined;
    const text = findDescendants(desc, (n) => n.type === 'TEXT')[0];
    return text?.characters?.trim();
}

export { CONTENT_BLOCK_NAME, HEADER_INSTANCE_NAME, TEXT_INSTANCE_NAME };
