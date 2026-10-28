import type { FigmaNode } from '../model.ts';

const BASE = 'https://api.figma.com/v1';

export class FigmaClient {
    constructor(private readonly token: string) {}

    private async request<T>(path: string): Promise<T> {
        const res = await fetch(`${BASE}${path}`, {
            headers: { 'X-Figma-Token': this.token },
        });
        if (!res.ok) {
            throw new Error(`Figma ${path} failed: ${res.status} ${await res.text()}`);
        }
        return (await res.json()) as T;
    }

    async getNode(fileKey: string, nodeId: string): Promise<FigmaNode> {
        const data = await this.request<{ nodes: Record<string, { document: FigmaNode }> }>(
            `/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}&geometry=paths`,
        );
        const entry = data.nodes[nodeId];
        if (!entry) throw new Error(`Node ${nodeId} not found in file ${fileKey}`);
        return pruneInvisible(entry.document);
    }

    async getImageUrls(
        fileKey: string,
        nodeIds: string[],
        scale = 2,
        format: 'png' | 'svg' = 'png',
    ): Promise<Record<string, string>> {
        if (nodeIds.length === 0) return {};
        const chunks: string[][] = [];
        for (let i = 0; i < nodeIds.length; i += 25) chunks.push(nodeIds.slice(i, i + 25));
        const out: Record<string, string> = {};
        for (const chunk of chunks) {
            const data = await this.request<{ images: Record<string, string> }>(
                `/images/${fileKey}?ids=${chunk.map(encodeURIComponent).join(',')}&format=${format}&scale=${scale}`,
            );
            Object.assign(out, data.images);
        }
        return out;
    }
}

/** Figma REST는 명시적으로 숨긴 layer에만 `visible: false`를 내려주고, 필드 자체가 없으면
 *  보이는 layer다. 여기서 한 번 쳐내면 downstream traversal이 모두 pruned tree만 본다. */
function pruneInvisible(node: FigmaNode): FigmaNode {
    const children = (node.children ?? []).filter((c) => c.visible !== false).map(pruneInvisible);
    return node.children ? { ...node, children } : node;
}
