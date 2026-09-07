import process from 'node:process';

import type { GetFileNodesResponse, GetImageResponse } from './types';

const BASE_URL = 'https://api.figma.com/v1';

const request = async <T>(url: string): Promise<T> => {
    const result = await fetch(url, {
        headers: { 'X-FIGMA-TOKEN': process.env.FIGMA_TOKEN ?? '' },
    });
    if (!result.ok) {
        throw new Error(`Figma API error: ${result.status} ${result.statusText}`);
    }
    return result.json() as Promise<T>;
};

// Node ids go into the query raw (`1:2,3:4`): Figma accepts the colon, and percent-encoding
// pushed an 814-node request past 8KB into HTTP 414 (measured).
const idList = (nodeIds: string[]) => nodeIds.join(',');

/**
 * GET file nodes
 *
 * @link https://www.figma.com/developers/api#get-file-nodes-endpoint
 */
const getFileNodes = ({
    fileKey,
    nodeIds,
    depth = 1,
}: {
    fileKey: string;
    nodeIds: string[];
    depth?: number;
}) =>
    request<GetFileNodesResponse>(
        `${BASE_URL}/files/${fileKey}/nodes?ids=${idList(nodeIds)}&depth=${depth}`,
    );

/**
 * GET image
 *
 * @link https://www.figma.com/developers/api#get-images-endpoint
 */
const getImage = ({
    fileKey,
    nodeIds,
    format = 'svg',
    scale,
}: {
    fileKey: string;
    nodeIds: string[];
    format?: string;
    /** Raster scale, 0.01 ~ 4. Ignored by Figma for `format=svg`. */
    scale?: number;
}) =>
    request<GetImageResponse>(
        `${BASE_URL}/images/${fileKey}?ids=${idList(nodeIds)}&format=${format}&svg_include_id=false${
            scale ? `&scale=${scale}` : ''
        }`,
    );

export { getFileNodes, getImage };
