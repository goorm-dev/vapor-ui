import type { ComponentTree, Prop, PropType, TreeNode } from '../model';
import { stripPropId } from '../naming';

/** `get_context_for_code_connect` 응답에서 쓰는 필드만. */
interface McpProperty {
    name: string;
    type: PropType;
    variantOptions?: string[];
}

interface McpReferences {
    /** 이 레이어의 표시 텍스트가 bind 된 컴포넌트 속성 키 (예: `description#2328:2`). */
    characters?: string;
    /** 이 레이어의 표시 여부가 bind 된 BOOLEAN 컴포넌트 속성 키 (예: `(has description)#2328:1`). */
    visible?: string;
}

interface McpNode {
    name: string;
    type?: string;
    properties?: Record<string, McpProperty>;
    descendants?: Record<string, McpNode>;
    references?: McpReferences;
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
        tree: buildNode(root, 'ROOT'),
    };
}

function isMcpNode(v: unknown): v is McpNode {
    return (
        typeof v === 'object' && v !== null && typeof (v as { name?: unknown }).name === 'string'
    );
}

function buildNode(node: McpNode, kind: 'ROOT' | 'INSTANCE'): TreeNode {
    const visibilityByPropKey = collectTextVisibility(node.descendants ?? {});
    return {
        kind,
        name: node.name,
        props: toProps(node.properties, visibilityByPropKey),
        children: toChildren(node.descendants),
    };
}

/**
 * 컴포넌트 자기 자신의 컴포넌트 속성 키(`description#2328:2` 등) → 이 속성을 참조하는
 * TEXT 레이어의 visibility bind (`(has description)#2328:1`) 매핑.
 * INSTANCE descendant 서브트리는 자기 스코프이므로 걸어도 outer prop key 와
 * id 가 다르지만, 안전하게 스킵한다.
 */
function collectTextVisibility(descendants: Record<string, McpNode>): Map<string, string> {
    const map = new Map<string, string>();
    const walk = (n: McpNode): void => {
        if (n.type === 'INSTANCE') return;
        const ref = n.references;
        if (n.type === 'TEXT' && ref?.characters && ref.visible) {
            map.set(ref.characters, ref.visible);
        }
        for (const child of Object.values(n.descendants ?? {})) walk(child);
    };
    for (const d of Object.values(descendants)) walk(d);
    return map;
}

function toProps(
    properties: Record<string, McpProperty> = {},
    visibility: Map<string, string> = new Map(),
): Prop[] {
    return Object.entries(properties).map(([key, p]) => {
        const prop: Prop = { name: p.name, type: p.type };
        if (p.type === 'VARIANT') prop.variantOptions = p.variantOptions ?? [];
        const visRef = visibility.get(key);
        if (visRef) prop.visibleWhen = stripPropId(visRef);
        return prop;
    });
}

function toChildren(descendants: Record<string, McpNode> = {}): TreeNode[] {
    return Object.values(descendants)
        .filter((d) => d.type === 'INSTANCE')
        .map((d) => {
            const child = buildNode(d, 'INSTANCE');
            if (d.references?.visible) child.visibleWhen = stripPropId(d.references.visible);
            return child;
        });
}
