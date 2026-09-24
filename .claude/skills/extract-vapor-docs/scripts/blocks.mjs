/**
 * Deterministic block extractor for Component Guide frames.
 *
 * Rules:
 *
 * 1. Walk each frame subtree in document order. Content is grouped by the nearest
 *    "meaningful" named ancestor FRAME (Anatomy / Properties / Do + Don't / …). Generic
 *    layout frames (Container / Wrapper / Sample / etc.) never become groups.
 *
 * 2. A block is any `Component Guide/Content block` INSTANCE.
 *    - `componentProperties.type.value === 'columns'` is a Do/Don't variant: it exposes
 *      two Sample slots (Sample1, Sample2) and two `Component guide/do+don't description`
 *      instances carrying the per-side prose. It gets `samples[]` of length 2 with
 *      `label: 'Do' | "Don't"` and `description` filled from those INSTANCE TEXTs.
 *    - All other variants get `samples[]` of length 1 pulled from the single `Sample`
 *      slot; block-level `title/subtitle/description` come from TEXT nodes named
 *      `section title` / `section subtitle` / `body`.
 *
 * 3. `characters === name` (component-default placeholders like "Title" / "body") are
 *    treated as empty — that's how Figma exposes an unbound instance property.
 *
 * 4. `groupAliases` in the config merges Figma sibling frames under one label. For
 *    example `{ "Size": "Properties" }` collapses the standalone Size frame into the
 *    Properties group so the two aren't reported separately.
 */

const HEADER_INSTANCE = 'Component Guide/Header';
const CONTENT_BLOCK_INSTANCE = 'Component Guide/Content block';
const DO_DONT_DESCRIPTION = "Component guide/do+don't description";

const GENERIC_FRAME_NAMES = new Set([
    'Container',
    'Wrapper',
    'Content',
    'Sample',
    'Body',
    'Slot icon',
    'Slot',
    'Anatomy name',
    'description',
    'Related component',
]);
const GENERIC_FRAME_PATTERNS = [/^Frame \d+$/];

const TEXT_ROLE_BY_NAME = {
    'section title': 'sectionTitle',
    'section subtitle': 'sectionSubtitle',
    'section subtitle - reading': 'sectionSubtitleReading',
    body: 'body',
};

function isGenericFrame(name) {
    if (GENERIC_FRAME_NAMES.has(name)) return true;
    return GENERIC_FRAME_PATTERNS.some((rx) => rx.test(name));
}

function isPlaceholder(text) {
    if (!text) return true;
    if (text.name && text.characters === text.name) return true;
    return false;
}

function* walkTextNodes(node) {
    for (const child of node.children ?? []) {
        if (child.type === 'TEXT') yield child;
        yield* walkTextNodes(child);
    }
}

function findFirstDescendant(node, predicate) {
    for (const child of node.children ?? []) {
        if (predicate(child)) return child;
        const nested = findFirstDescendant(child, predicate);
        if (nested) return nested;
    }
    return null;
}

function findDirectChildren(node, predicate) {
    return (node.children ?? []).filter(predicate);
}

function findFirstText(node, predicate) {
    for (const t of walkTextNodes(node)) if (predicate(t)) return t;
    return null;
}

/** Extract labelled samples for a columns (Do/Don't) content block. */
function parseColumnsSamples(instance) {
    const wrapper = findFirstDescendant(
        instance,
        (n) => n.type === 'FRAME' && n.name === 'Wrapper',
    );
    if (!wrapper) return [];

    const columns = findDirectChildren(
        wrapper,
        (n) => n.type === 'FRAME' && (n.name === 'Do' || n.name === "Don't"),
    );

    return columns.map((column) => {
        const sampleSlot = findFirstDescendant(
            column,
            (n) => typeof n.name === 'string' && /^Sample\d*$/.test(n.name),
        );
        const sampleInstance = sampleSlot
            ? findFirstDescendant(sampleSlot, (n) => n.type === 'INSTANCE')
            : null;

        const descriptionInstance = findFirstDescendant(
            column,
            (n) => n.type === 'INSTANCE' && n.name === DO_DONT_DESCRIPTION,
        );
        const descriptionText = descriptionInstance
            ? findFirstText(descriptionInstance, (t) => !isPlaceholder(t))
            : null;

        return {
            label: column.name,
            nodeId: sampleInstance?.id ?? null,
            type: sampleInstance?.name ?? null,
            description: descriptionText?.characters ?? null,
            code: null,
        };
    });
}

/** Extract the single sample of a non-columns content block. */
function parseSingleSample(instance) {
    const sampleSlot = findFirstDescendant(instance, (n) => n.name === 'Sample');
    const sampleInstance = sampleSlot
        ? findFirstDescendant(sampleSlot, (n) => n.type === 'INSTANCE')
        : null;

    return [
        {
            label: null,
            nodeId: sampleInstance?.id ?? null,
            type: sampleInstance?.name ?? null,
            description: null,
            code: null,
        },
    ];
}

function parseBlock(instance, group) {
    const variant = instance.componentProperties?.type?.value ?? null;

    const raw = {
        sectionTitle: null,
        sectionSubtitle: null,
        sectionSubtitleReading: null,
        body: null,
    };

    for (const text of walkTextNodes(instance)) {
        if (isPlaceholder(text)) continue;
        const role = text.name && TEXT_ROLE_BY_NAME[text.name];
        if (role && raw[role] === null) raw[role] = text.characters ?? null;
    }

    const title = raw.sectionTitle;
    const subtitle = raw.sectionSubtitle ?? raw.sectionSubtitleReading;

    const samples =
        variant === 'columns' ? parseColumnsSamples(instance) : parseSingleSample(instance);

    return {
        id: instance.id,
        group,
        variant,
        title,
        subtitle,
        description: raw.body,
        raw,
        samples,
    };
}

function resolveGroup(name, aliases) {
    return aliases[name] ?? name;
}

function walk(node, groupStack, out, aliases) {
    for (const child of node.children ?? []) {
        if (child.type === 'INSTANCE' && child.name === CONTENT_BLOCK_INSTANCE) {
            const group = groupStack.length ? groupStack[groupStack.length - 1] : null;
            out.push(parseBlock(child, group));
            continue;
        }
        if (child.type === 'INSTANCE' && child.name === HEADER_INSTANCE) continue;

        if (child.type === 'FRAME' && !isGenericFrame(child.name)) {
            groupStack.push(resolveGroup(child.name, aliases));
            walk(child, groupStack, out, aliases);
            groupStack.pop();
        } else {
            walk(child, groupStack, out, aliases);
        }
    }
}

const SECTION_TITLES = {
    overview: 'Overview',
    bestPractices: 'Best practices',
    examples: 'Examples',
    related: 'Related components',
};

export function extractSection(slug, section, frameNodeId, frameNode, aliases = {}) {
    const blocks = [];
    walk(frameNode, [], blocks, aliases);

    return {
        slug,
        section,
        frameNodeId,
        sectionTitle: SECTION_TITLES[section] ?? section,
        blocks,
    };
}
