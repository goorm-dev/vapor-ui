import { getFileNodes, getImage } from '../apis/figma.js';
import { makeFlexibleColorIcon, remakeMaskStyle, svgToIconComponent } from '../utils/figma.js';

/**
 * Filter documents from Figma by specific Node Type.
 */
const filterDocumentByNodeType = async ({ nodeType, fileKey, nodeIds, depth }) => {
    const { nodes } = await getFileNodes({
        fileKey,
        nodeIds,
        depth,
    });
    const childrenNodes = [];

    for (const key in nodes) {
        if (nodes.hasOwnProperty(key)) {
            const parent = nodes[key].document;
            const parentId = parent.id;

            parent.children.forEach((child) => {
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
const getNodesWithUrl = async ({ nodes, fileKey }) => {
    const nodeIds = nodes.map((node) => node.id).join(',');
    const { images } = await getImage({
        fileKey,
        nodeIds,
    });
    const nodesWithUrl = nodes.map((item) => ({
        ...item,
        url: images[item.id],
    }));

    return nodesWithUrl;
};

/**
 * Convert svg files from Figma to React components.
 */
const getIconJsx = async ({ url, isColorIcon }) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
    }
    const svgDom = await response.text();
    const IconComponent = svgToIconComponent(svgDom);
    const NewIconComponent = remakeMaskStyle(IconComponent);

    if (isColorIcon) {
        return NewIconComponent;
    } else {
        return makeFlexibleColorIcon(NewIconComponent);
    }
};

export { filterDocumentByNodeType, getNodesWithUrl, getIconJsx };
