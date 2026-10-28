export interface ParsedFigmaUrl {
    fileKey: string;
    nodeId: string;
}

export function parseFigmaUrl(input: string): ParsedFigmaUrl {
    const url = new URL(input);
    const parts = url.pathname.split('/').filter(Boolean);
    const keyIdx = parts.findIndex((p) => p === 'design' || p === 'file');
    if (keyIdx === -1 || !parts[keyIdx + 1]) {
        throw new Error(`Invalid Figma URL (no fileKey): ${input}`);
    }
    const fileKey = parts[keyIdx + 1]!;
    const nodeParam = url.searchParams.get('node-id');
    if (!nodeParam) {
        throw new Error(`Invalid Figma URL (no node-id): ${input}`);
    }
    const nodeId = nodeParam.replace('-', ':');
    return { fileKey, nodeId };
}
