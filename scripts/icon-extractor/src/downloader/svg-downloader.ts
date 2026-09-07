import { getFileNodes, getImage } from '~/api/figma-client';
import type { IconNode, IconNodeWithUrl } from '~/api/types';
import { FIGMA_NODE_TYPES } from '~/api/types';
import { assertSvg } from '~/verifier/svg-validator';

/**
 * Every COMPONENT directly under the given frames, tagged with its frame id.
 *
 * Frame order and Figma's child order are preserved: the generated entry `index.ts` lists icons
 * in this order, so a different order would churn that file on every run.
 */
const fetchIconNodes = async ({
    fileKey,
    frameIds,
}: {
    fileKey: string;
    frameIds: string[];
}): Promise<IconNode[]> => {
    const { nodes } = await getFileNodes({ fileKey, nodeIds: frameIds, depth: 1 });

    return frameIds.flatMap((frameId) => {
        const frame = nodes[frameId];
        if (!frame) {
            throw new Error(`Figma node not found: ${frameId}`);
        }
        return (frame.document.children ?? [])
            .filter((child) => child.type === FIGMA_NODE_TYPES.Component)
            .map((child) => ({ ...child, parentId: frameId }));
    });
};

/**
 * Resolve one SVG export URL per node in a single images request.
 */
const resolveSvgUrls = async ({
    nodes,
    fileKey,
}: {
    nodes: IconNode[];
    fileKey: string;
}): Promise<IconNodeWithUrl[]> => {
    const { images } = await getImage({ fileKey, nodeIds: nodes.map((node) => node.id) });

    return nodes.map((node) => {
        const url = images[node.id];
        if (!url) {
            throw new Error(`Figma image URL missing for node: ${node.id} (${node.name})`);
        }
        return { ...node, url };
    });
};

/**
 * Download the SVG text behind an export URL.
 */
const downloadSvg = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
    }
    const svg = await response.text();
    assertSvg(svg, url);
    return svg;
};

export { downloadSvg, fetchIconNodes, resolveSvgUrls };
