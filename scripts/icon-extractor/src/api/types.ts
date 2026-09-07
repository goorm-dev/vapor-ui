/**
 * @link https://www.figma.com/developers/api#node-types
 */
const FIGMA_NODE_TYPES = {
    Document: 'DOCUMENT',
    Canvas: 'CANVAS',
    Frame: 'FRAME',
    Component: 'COMPONENT',
    ComponentSet: 'COMPONENT_SET',
} as const;

type FigmaNodeType = (typeof FIGMA_NODE_TYPES)[keyof typeof FIGMA_NODE_TYPES];

/** Only the slice of the Figma node shape this tool reads. */
type FigmaNode = {
    id: string;
    name: string;
    type: FigmaNodeType;
    children?: FigmaNode[];
};

type GetFileNodesResponse = {
    nodes: Record<string, { document: FigmaNode }>;
};

type GetImageResponse = {
    /** HTTP 200 does not mean every node rendered — `null` is a per-node failure. */
    images: Record<string, string | null>;
};

/** A COMPONENT node tagged with the frame it was found under. */
type IconNode = FigmaNode & { parentId: string };
type IconNodeWithUrl = IconNode & { url: string };

export type {
    FigmaNode,
    FigmaNodeType,
    GetFileNodesResponse,
    GetImageResponse,
    IconNode,
    IconNodeWithUrl,
};
export { FIGMA_NODE_TYPES };
