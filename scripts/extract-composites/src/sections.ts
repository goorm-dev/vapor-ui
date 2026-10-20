import { type FigmaNode, SECTION_WHITELIST, type SectionTitle } from './types.ts';

export const BLUE_PREFIX = '🟦';

export interface DiscoveredSection {
    title: SectionTitle;
    frame: FigmaNode;
}

const WHITELIST_SET = new Set<string>(SECTION_WHITELIST);

/** Strip the leading 🟦 and surrounding whitespace from a node name. */
function stripBluePrefix(name: string): string | null {
    const trimmed = name.trim();
    if (!trimmed.startsWith(BLUE_PREFIX)) return null;
    return trimmed.slice(BLUE_PREFIX.length).trim();
}

/** DFS the canvas and collect `🟦<Title>` FRAME/INSTANCE whose stripped title is in the
 *  whitelist. First match wins per title; later duplicates are ignored with a warning.
 *  Results are returned in whitelist order, filtered by `only` when provided. */
export function discoverSections(
    canvas: FigmaNode,
    warnings: string[],
    only?: Set<SectionTitle>,
): DiscoveredSection[] {
    const found = new Map<SectionTitle, FigmaNode>();

    const walk = (n: FigmaNode): void => {
        for (const child of n.children ?? []) {
            if (child.type === 'FRAME' || child.type === 'INSTANCE') {
                const title = stripBluePrefix(child.name);
                if (title && WHITELIST_SET.has(title)) {
                    const key = title as SectionTitle;
                    if (found.has(key)) {
                        warnings.push(
                            `Duplicate section ignored: "${child.name}" (first match kept)`,
                        );
                    } else {
                        found.set(key, child);
                    }
                    // Do not recurse into a matched section: inner 🟦 titles are not promoted.
                    continue;
                }
            }
            walk(child);
        }
    };
    walk(canvas);

    const out: DiscoveredSection[] = [];
    for (const title of SECTION_WHITELIST) {
        if (only && !only.has(title)) continue;
        const frame = found.get(title);
        if (frame) out.push({ title, frame });
    }
    return out;
}
