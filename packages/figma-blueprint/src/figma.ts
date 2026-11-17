// Figma's REST API, and the only module that knows it: the node tree and library listings this package reads, design
// and library URLs, and FIGMA_ACCESS_TOKEN. The walk reads the types here and never makes a request.

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

// One node's entry in a `files/:key/nodes` response.
export interface FigmaTree {
    document: FigmaNode;
    // remote: false for a component defined in the design file itself, not a library.
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

// A Figma design URL's file (its branch, on a branch URL) and node: node-id=I529-7899%3B2847-43442 is I529:7899;2847:43442.
export const parseFigmaUrl = (url: string) => {
    const u = new URL(url);
    const path = u.pathname.split('/');
    return {
        fileKey: path[3] === 'branch' ? path[4] : path[2],
        nodeId: (u.searchParams.get('node-id') ?? '').replaceAll('-', ':'),
    };
};

// A GET on the REST API; a failure names the path. A new request goes through here.
async function request<T>(path: string, token: string): Promise<T> {
    const r = await fetch(`https://api.figma.com/v1/${path}`, {
        headers: { 'X-Figma-Token': token },
    });
    if (!r.ok) throw new Error(`GET ${path}: ${r.status} ${await r.text()}`);
    return (await r.json()) as T;
}

// The frame a design URL points to, as one `files/:key/nodes` request. The URL is checked before the token is read.
// Its failure message has no path, unlike request()'s: it is printed on stderr, which callers parse.
export async function fetchFrame(url: string): Promise<FigmaTree> {
    const { fileKey, nodeId } = parseFigmaUrl(url);
    if (!nodeId) throw new Error(`the URL has no node-id, so there is no frame to read: ${url}`);
    const token = figmaToken('the design file the URL points to');
    const r = await fetch(
        `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
        { headers: { 'X-Figma-Token': token } },
    );
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const tree = ((await r.json()) as { nodes?: Record<string, FigmaTree | null> }).nodes?.[nodeId];
    if (!tree)
        throw new Error(`node ${nodeId} is not in file ${fileKey}; it may have been deleted`);
    return tree;
}

// Every published component set and component of one library file; variants are components inside a set.
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
