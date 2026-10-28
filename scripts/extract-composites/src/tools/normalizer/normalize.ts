import { SECTION_WHITELIST, type Section } from '../../shared/types.ts';
import type { ExtractedDoc } from '../extractor/index.ts';

export interface NormalizedDoc extends Omit<ExtractedDoc, 'sections'> {
    sections: Section[];
}

export function normalize(doc: ExtractedDoc): NormalizedDoc {
    const sections: Section[] = doc.sections.map((s) => ({
        title: s.title,
        slug: s.slug,
        items: s.items.map((i) => ({ blocks: i.blocks })),
    }));
    return { ...doc, sections: sortByPolicy(sections) };
}

function sortByPolicy(sections: Section[]): Section[] {
    const map = new Map(sections.map((s) => [s.title, s]));
    const out: Section[] = [];
    for (const title of SECTION_WHITELIST) {
        const s = map.get(title);
        if (s) out.push(s);
    }
    return out;
}
