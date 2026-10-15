import { camelCase } from 'es-toolkit';

import type { FigmaNode } from './types.ts';

const DEFAULT_SKIP = new Set([
    'Properties',
    'Specifications',
    '작성예정',
    'Related components',
    'Related Components',
    'Component', // cover frame — carries component name/description, not a section
]);

export const COVER_FRAME_NAME = 'Component';

export interface DiscoveredSection {
    key: string;
    frame: FigmaNode;
    rawName: string;
}

/** Flatten top-level + 2nd-level section frames, applying skip list and cover exclusion. */
export function discoverSections(canvas: FigmaNode, extraSkip: string[] = []): DiscoveredSection[] {
    const skip = new Set([...DEFAULT_SKIP, ...extraSkip]);
    const sections: DiscoveredSection[] = [];
    const seen = new Set<string>();
    const UNWRAP_NAMES = new Set(['Overview', 'Best practices']);

    for (const topLevel of canvas.children ?? []) {
        if (topLevel.type !== 'FRAME') continue;
        if (skip.has(topLevel.name)) continue;
        if (UNWRAP_NAMES.has(topLevel.name)) {
            // dive into Container children
            const container = (topLevel.children ?? []).find((c) => c.name === 'Container');
            const inner = container?.children ?? topLevel.children ?? [];
            for (const sub of inner) {
                if (sub.type !== 'FRAME') continue;
                if (skip.has(sub.name)) continue;
                addSection(sections, seen, sub);
            }
        } else {
            addSection(sections, seen, topLevel);
        }
    }
    return sections;
}

function addSection(sections: DiscoveredSection[], seen: Set<string>, frame: FigmaNode): void {
    const key = toSectionKey(frame.name);
    if (seen.has(key)) return;
    seen.add(key);
    sections.push({ key, frame, rawName: frame.name });
}

const SECTION_NAME_MAP: Record<string, string> = {
    "Do + Don't": 'doDont',
    'Do and Don’t': 'doDont',
    'Do + Don’t': 'doDont',
    Pattern: 'pattern',
    Examples: 'examples',
    Anatomy: 'anatomy',
};

export function toSectionKey(rawName: string): string {
    if (SECTION_NAME_MAP[rawName]) return SECTION_NAME_MAP[rawName]!;
    // Fallback: strip punctuation, camelCase
    const cleaned = rawName.replace(/[+'’]/g, ' ').replace(/\s+/g, ' ').trim();
    return camelCase(cleaned);
}

export function findCoverFrame(canvas: FigmaNode): FigmaNode | undefined {
    return (canvas.children ?? []).find((c) => c.type === 'FRAME' && c.name === COVER_FRAME_NAME);
}
