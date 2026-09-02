export interface FigmaRef {
    fileKey: string;
    nodeId: string;
}

export function parseFigmaUrl(url: string): FigmaRef {
    const u = new URL(url);
    // ['design', fileKey, ('branch', branchKey,) name]
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => p === 'design' || p === 'file');
    if (idx === -1 || !parts[idx + 1]) throw new Error(`Not a Figma file URL: ${url}`);

    let fileKey = parts[idx + 1];
    if (parts[idx + 2] === 'branch' && parts[idx + 3]) fileKey = parts[idx + 3];

    const rawNode = u.searchParams.get('node-id');
    if (!rawNode) throw new Error('Figma URL must include a node-id query parameter');

    return { fileKey, nodeId: rawNode.replace('-', ':') };
}
