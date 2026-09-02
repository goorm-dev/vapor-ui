import type { ComponentTree, Prop, PropType, TreeNode } from '../model';

/** `get_context_for_code_connect` 응답에서 쓰는 필드만. */
interface McpProperty {
    name: string;
    type: PropType;
    variantOptions?: string[];
}

interface McpNode {
    name: string;
    type?: string;
    properties?: Record<string, McpProperty>;
    descendants?: Record<string, McpNode>;
}

/**
 * Figma MCP `get_context_for_code_connect` 결과 → ComponentTree.
 * 배열이면 첫 항목을 쓴다.
 */
export function fromMcp(json: unknown): ComponentTree {
    const root = Array.isArray(json) ? json[0] : json;
    if (!isMcpNode(root)) {
        throw new Error('Invalid MCP JSON: expected object with `name` and `descendants`');
    }
    return {
        name: root.name,
        tree: {
            kind: 'ROOT',
            name: root.name,
            props: toProps(root.properties),
            children: toChildren(root.descendants),
        },
    };
}

function isMcpNode(v: unknown): v is McpNode {
    return typeof v === 'object' && v !== null && typeof (v as { name?: unknown }).name === 'string';
}

function toProps(properties: Record<string, McpProperty> = {}): Prop[] {
    return Object.values(properties).map((p) => {
        const prop: Prop = { name: p.name, type: p.type };
        if (p.type === 'VARIANT') prop.variantOptions = p.variantOptions ?? [];
        return prop;
    });
}

function toChildren(descendants: Record<string, McpNode> = {}): TreeNode[] {
    return Object.values(descendants)
        .filter((d) => d.type === 'INSTANCE')
        .map((d) => ({
            kind: 'INSTANCE',
            name: d.name,
            props: toProps(d.properties),
            children: toChildren(d.descendants),
        }));
}
