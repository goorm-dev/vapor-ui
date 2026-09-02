/**
 * @param {string} url
 * @returns {{ fileKey: string, nodeId: string }}
 */
export function parseFigmaUrl(url) {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean); // ['design', fileKey, ('branch', branchKey,) name]
    const idx = parts.findIndex((p) => p === 'design' || p === 'file');
    if (idx === -1 || !parts[idx + 1]) throw new Error(`Not a Figma file URL: ${url}`);

    let fileKey = parts[idx + 1];
    if (parts[idx + 2] === 'branch' && parts[idx + 3]) fileKey = parts[idx + 3];

    const rawNode = u.searchParams.get('node-id');
    if (!rawNode) throw new Error('Figma URL must include a node-id query parameter');

    return { fileKey, nodeId: rawNode.replace('-', ':') };
}
