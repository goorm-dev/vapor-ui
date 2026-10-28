import { kebabCase } from 'es-toolkit';

import { HEADER_INSTANCE_NAME, TEXT_NAMES } from '../../shared/constants.ts';
import { findTextByName } from '../../shared/traverse.ts';
import { type FigmaNode, SECTION_SLUG, type SectionTitle } from '../../shared/types.ts';
import { discoverSections } from './discover-sections.ts';
import { findComponentHeader } from './find-component-header.ts';
import { findItems } from './find-items.ts';

export interface AnalyzedSection {
    title: SectionTitle;
    slug: string;
    frame: FigmaNode;
    itemNodes: FigmaNode[];
}

export interface AnalyzedDoc {
    slug: string;
    docTitle: string;
    docDescription: string;
    sections: AnalyzedSection[];
}

export interface AnalyzeOptions {
    only?: Set<SectionTitle>;
    slugOverride?: string;
    warnings: string[];
}

export function analyze(canvas: FigmaNode, opts: AnalyzeOptions): AnalyzedDoc {
    const canvasName = canvas.name.trim();
    const slug = opts.slugOverride ?? kebabCase(canvasName);
    const { title: docTitle, description: docDescription } = resolveComponentMeta(
        canvas,
        canvasName,
        opts.warnings,
    );
    const discovered = discoverSections(canvas, opts.warnings, opts.only);
    const sections: AnalyzedSection[] = discovered.map(({ title, frame }) => ({
        title,
        slug: SECTION_SLUG[title],
        frame,
        itemNodes: findItems(frame),
    }));
    return { slug, docTitle, docDescription, sections };
}

function resolveComponentMeta(
    canvas: FigmaNode,
    canvasName: string,
    warnings: string[],
): { title: string; description: string } {
    const header = findComponentHeader(canvas);
    if (!header) {
        warnings.push(
            `${HEADER_INSTANCE_NAME} INSTANCE (type=component) missing — frontmatter falls back to canvas name`,
        );
        return { title: canvasName, description: '' };
    }
    const title = findTextByName(header, TEXT_NAMES.componentName) ?? canvasName;
    const description = findTextByName(header, TEXT_NAMES.componentDescription) ?? '';
    if (!description) {
        warnings.push(`${HEADER_INSTANCE_NAME}: "${TEXT_NAMES.componentDescription}" TEXT missing`);
    }
    return { title, description };
}
