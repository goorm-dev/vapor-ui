export interface FigmaNode {
    id: string;
    name: string;
    type: string;
    visible?: boolean;
    children?: FigmaNode[];
    componentId?: string;
    componentProperties?: Record<string, { value: string | boolean }>;
    componentPropertyReferences?: Record<string, string>;
    characters?: string;
    absoluteBoundingBox?: Rect | null;
    absoluteRenderBounds?: Rect | null;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface FigmaTree {
    document: FigmaNode;
    components?: Record<
        string,
        { key: string; name: string; componentSetId?: string; remote?: boolean }
    >;
    componentSets?: Record<string, { key: string; name: string }>;
}

export interface Published {
    key: string;
    name: string;
    node_id: string;
    containing_frame?: {
        pageName?: string;
        containingComponentSet?: { name: string; nodeId: string };
    };
}

export function figmaToken(reads: string) {
    const token = process.env.FIGMA_ACCESS_TOKEN;
    if (!token) throw new Error(`FIGMA_ACCESS_TOKEN is not set. It needs read access to ${reads}.`);
    return token;
}

export const parseFigmaUrl = (url: string) => {
    const u = new URL(url);
    const path = u.pathname.split('/');
    return {
        fileKey: path[3] === 'branch' ? path[4] : path[2],
        nodeId: (u.searchParams.get('node-id') ?? '').replaceAll('-', ':'),
    };
};

export class FigmaHttpError extends Error {
    constructor(
        readonly status: number,
        message: string,
    ) {
        super(message);
    }
}

async function request<T>(path: string, token: string, signal?: AbortSignal): Promise<T> {
    const r = await fetch(`https://api.figma.com/v1/${path}`, {
        headers: { 'X-Figma-Token': token },
        signal,
    });
    if (!r.ok) throw new FigmaHttpError(r.status, `GET ${path}: ${r.status} ${await r.text()}`);
    return (await r.json()) as T;
}

export const fetchMe = (token: string, signal: AbortSignal) =>
    request<{ email?: string }>('me', token, signal);

export async function fetchFrame(url: string): Promise<FigmaTree> {
    const { fileKey, nodeId } = parseFigmaUrl(url);
    if (!nodeId) throw new Error(`the URL has no node-id, so there is no frame to read: ${url}`);
    const token = figmaToken('the design file the URL points to');
    const { nodes } = await request<{ nodes?: Record<string, FigmaTree | null> }>(
        `files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
        token,
    );
    const tree = nodes?.[nodeId];
    if (!tree)
        throw new Error(`node ${nodeId} is not in file ${fileKey}; it may have been deleted`);
    return tree;
}

export async function fetchLibraryFile(fileKey: string, token: string) {
    const [sets, comps] = await Promise.all([
        request<{ meta: { component_sets: Published[] } }>(
            `files/${fileKey}/component_sets`,
            token,
        ),
        request<{ meta: { components: Published[] } }>(`files/${fileKey}/components`, token),
    ]);
    return { sets: sets.meta.component_sets, comps: comps.meta.components };
}
