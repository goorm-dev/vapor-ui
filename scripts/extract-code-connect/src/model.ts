export type PropType = 'TEXT' | 'BOOLEAN' | 'VARIANT' | 'SLOT' | 'INSTANCE_SWAP';

export interface Prop {
    name: string;
    type: PropType;
    variantOptions?: string[];
}

export interface TreeNode {
    kind: 'ROOT' | 'INSTANCE';
    name: string;
    props: Prop[];
    children: TreeNode[];
}

export interface ComponentTree {
    name: string;
    tree: TreeNode;
}

export type Spec =
    | { kind: 'string' | 'boolean' | 'slot' | 'instance'; name: string }
    | { kind: 'enum'; name: string; options: string[] };

export interface Block {
    varName: string;
    instanceName: string;
    entries: Record<string, Spec>;
    todos: string[];
}
