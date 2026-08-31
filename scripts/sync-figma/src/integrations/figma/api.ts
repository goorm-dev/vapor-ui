import process from 'node:process';

import type { FigmaNodeType } from '~/icons/constants';

const headers = {
    'X-FIGMA-TOKEN': process.env.FIGMA_TOKEN ?? '',
};

/** Only the slice of the Figma node shape this script actually reads. */
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
    images: Record<string, string>;
};

/**
 * GET file nodes
 *
 * @link https://www.figma.com/developers/api#get-file-nodes-endpoint
 */
const getFileNodes = async ({
    fileKey,
    nodeIds,
    depth = 1,
}: {
    fileKey: string;
    nodeIds: string;
    depth?: number;
}): Promise<GetFileNodesResponse> => {
    const result = await fetch(
        `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeIds}&depth=${depth}`,
        { headers },
    );
    if (!result.ok) {
        throw new Error(`Figma API error: ${result.status} ${result.statusText}`);
    }
    return result.json() as Promise<GetFileNodesResponse>;
};

/**
 * GET image
 *
 * @link https://www.figma.com/developers/api#get-images-endpoint
 */
const getImage = async ({
    fileKey,
    nodeIds,
    format = 'svg',
}: {
    fileKey: string;
    nodeIds: string;
    format?: string;
}): Promise<GetImageResponse> => {
    const result = await fetch(
        `https://api.figma.com/v1/images/${fileKey}?ids=${nodeIds}&format=${format}&svg_include_id=false`,
        {
            headers,
        },
    );
    if (!result.ok) {
        throw new Error(`Figma API error: ${result.status} ${result.statusText}`);
    }
    return result.json() as Promise<GetImageResponse>;
};

export type { FigmaNode };

export { getFileNodes, getImage };
