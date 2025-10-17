import process from 'node:process';

const headers = {
    'X-FIGMA-TOKEN': process.env.FIGMA_TOKEN,
};

/**
 * GET file nodes
 *
 * @link https://www.figma.com/developers/api#get-file-nodes-endpoint
 */
const getFileNodes = async ({ fileKey, nodeIds, depth = 1 }) => {
    const result = await fetch(
        `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeIds}&depth=${depth}`,
        { headers },
    );
    return result.json();
};

/**
 * GET image
 *
 * @link https://www.figma.com/developers/api#get-images-endpoint
 */
const getImage = async ({ fileKey, nodeIds, format = 'svg' }) => {
    const result = await fetch(
        `https://api.figma.com/v1/images/${fileKey}?ids=${nodeIds}&format=${format}&svg_include_id=false`,
        {
            headers,
        },
    );

    return result.json();
};

export { getFileNodes, getImage };
