import type { Section } from '../../shared/types.ts';
import type { ExtractedDoc } from '../extractor/index.ts';

import { sortByPolicy } from './build-blocks.ts';

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
