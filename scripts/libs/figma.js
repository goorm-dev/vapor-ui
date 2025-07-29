const axios = require('axios');

const { getFileNodes, getImage } = require('../apis/figma');
const {
    svgToIconComponent,
    remakeMaskStyle,
    makeFlexibleColorIcon,
} = require('../utils/figma');

/**
 * Figma에서 가져온 Document를 특정 Node Type으로 필터링한다.
 */
const filterDocumentByNodeType = async ({
    nodeType,
    fileKey,
    nodeIds,
    depth,
}) => {
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
 * Figma에서 받아온 node들의 id를 통해, 이미지 URL을 가져온다.
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
 * Figma에서 가져온 svg 파일을 React 컴포넌트로 변환한다.
 */
const getIconJsx = async ({ url, isColorIcon }) => {
    const { data: svgDom } = await axios.get(url);
    const IconComponent = svgToIconComponent(svgDom);
    const NewIconComponent = remakeMaskStyle(IconComponent);

    if (isColorIcon) {
        return NewIconComponent;
    } else {
        return makeFlexibleColorIcon(NewIconComponent);
    }
};

module.exports = {
    filterDocumentByNodeType,
    getNodesWithUrl,
    getIconJsx,
};
