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
    /**
     * 이 레이어의 특정 속성이 소속 컴포넌트 property 에 bind 된 관계.
     * 대표 키: `characters`, `visible`. 값은 대상 컴포넌트 property 의 raw key (`#id` 포함).
     */
    componentPropertyReferences?: Record<string, string>;
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

    const toNode = (n: RestNode): TreeNode => {
        const visibility = collectTextVisibility(n);
        const node: TreeNode = {
            kind: 'INSTANCE',
            name: n.name,
            props: toProps(n, entry.components, setDocs, visibility),
            children: instanceChildren(n).map((child) => {
                const built = toNode(child);
                const visRef = child.componentPropertyReferences?.visible;
                if (visRef) built.visibleWhen = stripPropId(visRef);
                return built;
            }),
        };
        return node;
    };

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

/**
 * 이 INSTANCE 안 TEXT 레이어들의 `componentPropertyReferences` 를 걸어
 * (characters key → visible key) 매핑을 만든다. 중첩 INSTANCE 서브트리는 스코프가 다르므로 스킵.
 */
function collectTextVisibility(instance: RestNode): Map<string, string> {
    const map = new Map<string, string>();
    const walkChildren = (n: RestNode): void => {
        for (const child of n.children ?? []) {
            if (child.type === 'INSTANCE') continue;
            if (child.type === 'TEXT') {
                const chars = child.componentPropertyReferences?.characters;
                const vis = child.componentPropertyReferences?.visible;
                if (chars && vis) map.set(chars, vis);
            }
            walkChildren(child);
        }
    };
    walkChildren(instance);
    return map;
}

function toProps(
    instance: RestNode,
    components: RestNodeEntry['components'],
    setDocs: Record<string, RestComponentSetDoc>,
    visibility: Map<string, string>,
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
        const visRef = visibility.get(rawName);
        if (visRef) prop.visibleWhen = stripPropId(visRef);
        return prop;
    });
}
