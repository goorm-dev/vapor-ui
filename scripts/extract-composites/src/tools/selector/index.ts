import type { FigmaNode } from '../../shared/types.ts';
import type { AnalyzedDoc, AnalyzedSection } from '../analyzer/index.ts';

import { findItems } from './find-items.ts';

export interface SelectedSection extends AnalyzedSection {
    itemNodes: FigmaNode[];
}

export interface SelectedDoc extends Omit<AnalyzedDoc, 'sections'> {
    sections: SelectedSection[];
}

export function select(doc: AnalyzedDoc): SelectedDoc {
    const sections: SelectedSection[] = doc.sections.map((section) => ({
        ...section,
        itemNodes: findItems(section.frame),
    }));
    return { ...doc, sections };
}
