export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    /** Figma REST only emits this when the layer is hidden; absent means visible. */
    visible?: boolean;
    characters?: string;
    children?: FigmaNode[];
    componentId?: string;
    componentProperties?: Record<string, { value: string | boolean; type: string }>;
    absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
    style?: { fontWeight?: number; fontSize?: number };
}

export const SECTION_WHITELIST = [
    'Anatomy',
    'Examples',
    'Best practices',
    'Patterns',
    'Related components',
    'Guidelines',
] as const;

export type SectionTitle = (typeof SECTION_WHITELIST)[number];

export const SECTION_SLUG: Record<SectionTitle, string> = {
    Anatomy: 'anatomy',
    Examples: 'examples',
    'Best practices': 'best-practices',
    Patterns: 'patterns',
    'Related components': 'related-components',
    Guidelines: 'guidelines',
};

export type ItemBlock =
    | { kind: 'subtitle'; text: string }
    | { kind: 'body'; text: string }
    | { kind: 'docsImage'; webpRel: string; alt: string }
    | { kind: 'doCase'; webpRel: string; alt: string; caption: string }
    | { kind: 'dontCase'; webpRel: string; alt: string; caption: string }
    | { kind: 'demo'; file: string; placeholder: boolean; nodeId: string }
    | { kind: 'table'; markdown: string };

export interface Item {
    blocks: ItemBlock[];
}

export interface Section {
    title: SectionTitle;
    slug: string;
    items: Item[];
}
