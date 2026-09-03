import type { FigmaNodeType } from '~/icons/constants';

import type { FigmaNode } from './api';
import { getFileNodes, getImage } from './api';
import { svgToIconComponent } from './svgr';

type IconNode = FigmaNode & { parentId: string };
type IconNodeWithUrl = IconNode & { url: string };

/**
 * Filter documents from Figma by specific Node Type.
 */
const filterDocumentByNodeType = async ({
    nodeType,
    fileKey,
    nodeIds,
    depth,
}: {
    nodeType: FigmaNodeType;
    fileKey: string;
    nodeIds: string;
    depth?: number;
}): Promise<IconNode[]> => {
    const { nodes } = await getFileNodes({
        fileKey,
        nodeIds,
        depth,
    });
    const childrenNodes: IconNode[] = [];

    for (const key in nodes) {
        if (Object.hasOwn(nodes, key)) {
            const node = nodes[key];
            if (!node) {
                throw new Error(`Figma node not found: ${key}`);
            }

            const parent = node.document;
            const parentId = parent.id;

            parent.children?.forEach((child) => {
                childrenNodes.push({
                    ...child,
                    parentId: parentId,
                });
            });
        }
    }
    const filteredNodes = childrenNodes.filter(({ type }) => type === nodeType);

    return filteredNodes;
};

/**
 * Get image URLs through the IDs of nodes received from Figma.
 */
const getNodesWithUrl = async ({
    nodes,
    fileKey,
}: {
    nodes: IconNode[];
    fileKey: string;
}): Promise<IconNodeWithUrl[]> => {
    const nodeIds = nodes.map((node) => node.id).join(',');
    const { images } = await getImage({
        fileKey,
        nodeIds,
    });
    const nodesWithUrl = nodes.map((item) => {
        const url = images[item.id];
        if (!url) {
            throw new Error(`Figma image URL missing for node: ${item.id} (${item.name})`);
        }

        return { ...item, url };
    });

    return nodesWithUrl;
};

/**
 * Convert an svg file from Figma into a React component.
 */
const getIconComponent = async ({
    url,
    iconName,
    isColorIcon,
}: {
    url: string;
    iconName: string;
    isColorIcon: boolean;
}): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
    }
    const svg = await response.text();

    return svgToIconComponent({ svg, iconName, isColorIcon });
};

export type { IconNode, IconNodeWithUrl };

export { filterDocumentByNodeType, getNodesWithUrl, getIconComponent };
