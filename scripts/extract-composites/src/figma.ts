import type { FigmaNode } from './types.ts';

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
        return entry.document;
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

    async getCodeConnect(nodeId: string): Promise<CodeConnectEntry[]> {
        try {
            const data = await this.request<{ code_connected_nodes?: CodeConnectEntry[] }>(
                `/code_connect?node_id=${encodeURIComponent(nodeId)}`,
            );
            return data.code_connected_nodes ?? [];
        } catch {
            return [];
        }
    }
}

export interface CodeConnectEntry {
    label: string;
    language: string;
    source_location?: { file: string; line: number };
    source?: string;
    template_data?: { template?: string };
}
