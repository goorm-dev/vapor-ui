/** Minimal Figma REST client. */

const API = 'https://api.figma.com/v1';

export function normalizeNodeId(id) {
    return id.replace('-', ':');
}

async function requestJson(url, token) {
    const res = await fetch(url, { headers: { 'X-FIGMA-TOKEN': token } });
    if (!res.ok) {
        throw new Error(`Figma REST ${res.status}: ${res.statusText} — ${url}`);
    }
    return res.json();
}

/**
 * Fetch the given nodes' subtrees. Missing ids raise. Returns { <id>: FigmaNode }.
 */
export async function fetchNodes(fileKey, nodeIds, token) {
    const ids = nodeIds.map(normalizeNodeId).join(',');
    const url = `${API}/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`;
    const json = await requestJson(url, token);

    const out = {};
    for (const [id, entry] of Object.entries(json.nodes ?? {})) {
        if (entry == null) {
            throw new Error(`Figma node ${id} not found in file ${fileKey}`);
        }
        out[id] = entry.document;
    }
    return out;
}

/**
 * Fetch the file's page (CANVAS) list along with each page's direct top-level children.
 * Uses depth=2 so we can walk pages → direct FRAME children without a second round trip.
 */
export async function fetchPagesWithDirectChildren(fileKey, token) {
    const url = `${API}/files/${fileKey}?depth=2`;
    const json = await requestJson(url, token);
    return json.document?.children ?? [];
}

/**
 * Parse a Figma design URL like
 *   https://www.figma.com/design/<fileKey>/<name>?node-id=<page-or-frame-id>&m=dev
 * into { fileKey, nodeId }. Throws on unrecognized shape.
 *
 * Only /design/ URLs are accepted — /file/ (legacy) is also passed through since it
 * shares the same segment layout, but /make/ /slides/ /board/ URLs are rejected because
 * this skill targets Figma design files.
 */
export function parseDesignUrl(url) {
    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error(`Not a valid URL: ${url}`);
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'design' && parts[0] !== 'file') {
        throw new Error(
            `Only Figma design URLs (/design/…) are supported, got: ${parsed.pathname}`,
        );
    }
    const fileKey = parts[1];
    if (!fileKey) throw new Error(`URL missing file key: ${url}`);

    const nodeIdParam = parsed.searchParams.get('node-id');
    const nodeId = nodeIdParam ? normalizeNodeId(nodeIdParam) : null;

    return { fileKey, nodeId };
}
