import type { ComponentTree, Prop, PropType, TreeNode } from '../model';
import { stripPropId } from '../naming';

/** Figma REST `/v1/files/:key/nodes` 응답에서 쓰는 필드만. */
export interface RestComponentProperty {
    type: PropType;
    value?: unknown;
}

export interface RestComponentSetDoc {
    componentPropertyDefinitions?: Record<string, { type: string; variantOptions?: string[] }>;
}

/** COMPONENT_SET document 는 componentPropertyDefinitions 를 함께 가진다. */
export interface RestNode extends RestComponentSetDoc {
    id: string;
    type: string;
    name: string;
    componentId?: string;
    componentProperties?: Record<string, RestComponentProperty>;
    children?: RestNode[];
}

export interface RestNodeEntry {
    document?: RestNode;
    components?: Record<string, { componentSetId?: string }>;
}

export interface RestNodesResponse {
    nodes?: Record<string, RestNodeEntry | undefined>;
}

/** 응답에서 INSTANCE 가 참조하는 component set id 를 모은다. */
export function collectComponentSetIds(nodesJson: RestNodesResponse, nodeId: string): string[] {
    const entry = getEntry(nodesJson, nodeId);
    const ids = new Set<string>();
    walk(entry.document, (n) => {
        const setId = n.componentId ? entry.components?.[n.componentId]?.componentSetId : undefined;
        if (setId) ids.add(setId);
    });
    return [...ids];
}

/**
 * Figma REST nodes 응답 → ComponentTree.
 * `setDocs[setId]` 는 `nodes?ids=<setId>&depth=1` 응답의 `nodes[setId].document`.
 */
export function fromRest(
    nodesJson: RestNodesResponse,
    nodeId: string,
    setDocs: Record<string, RestComponentSetDoc>,
): ComponentTree {
    const entry = getEntry(nodesJson, nodeId);
    const doc = entry.document;

    const toNode = (n: RestNode): TreeNode => ({
        kind: 'INSTANCE',
        name: n.name,
        props: toProps(n, entry.components, setDocs),
        children: instanceChildren(n).map(toNode),
    });

    return {
        name: doc.name,
        tree: {
            kind: 'ROOT',
            name: doc.name,
            props: [],
            children: instanceChildren(doc).map(toNode),
        },
    };
}

function getEntry(
    nodesJson: RestNodesResponse,
    nodeId: string,
): RestNodeEntry & { document: RestNode } {
    const entry = nodesJson.nodes?.[nodeId];
    if (!entry?.document) throw new Error(`Node '${nodeId}' not found in REST response`);
    return { ...entry, document: entry.document };
}

function instanceChildren(n: RestNode): RestNode[] {
    return (n.children ?? []).filter((c) => c.type === 'INSTANCE');
}

function walk(node: RestNode, visit: (n: RestNode) => void): void {
    if (node.type === 'INSTANCE') visit(node);
    for (const c of node.children ?? []) walk(c, visit);
}

function toProps(
    instance: RestNode,
    components: RestNodeEntry['components'],
    setDocs: Record<string, RestComponentSetDoc>,
): Prop[] {
    const setId = instance.componentId
        ? components?.[instance.componentId]?.componentSetId
        : undefined;
    const defs = (setId && setDocs[setId]?.componentPropertyDefinitions) || {};

    return Object.entries(instance.componentProperties ?? {}).map(([rawName, p]) => {
        const name = stripPropId(rawName);
        const prop: Prop = { name, type: p.type };
        if (p.type === 'VARIANT') {
            prop.variantOptions = defs[rawName]?.variantOptions ??
                defs[name]?.variantOptions ?? [String(p.value)];
        }
        return prop;
    });
}
