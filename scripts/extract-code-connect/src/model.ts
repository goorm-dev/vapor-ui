export type PropType = 'TEXT' | 'BOOLEAN' | 'VARIANT' | 'SLOT' | 'INSTANCE_SWAP';

/** Figma 컴포넌트 속성. `name` 은 `#id` 접미가 제거된 상태. */
export interface Prop {
    name: string;
    type: PropType;
    variantOptions?: string[];
    /**
     * 이 prop 의 렌더 여부를 게이팅하는 BOOLEAN 컴포넌트 속성의 이름 (stripPropId 처리 후).
     * Figma 에서 텍스트 레이어의 `visible` 이 다른 BOOLEAN prop 에 bind 된 경우 채워진다.
     * runtime 에서 이 BOOLEAN 이 false 이면 attribute 를 emit 하지 않는다.
     */
    visibleWhen?: string;
}

/** 어댑터가 만드는 정규화 트리. INSTANCE 만 children 에 남긴다. */
export interface TreeNode {
    kind: 'ROOT' | 'INSTANCE';
    name: string;
    props: Prop[];
    children: TreeNode[];
    /**
     * 이 INSTANCE 의 렌더 여부를 게이팅하는 부모의 BOOLEAN 속성 이름 (stripPropId 처리 후).
     * Figma 에서 이 INSTANCE 자체의 `visible` 이 부모의 BOOLEAN prop 에 bind 된 경우 채워진다.
     */
    visibleWhen?: string;
}

/** 어댑터 출력. `name` 은 Figma 컴포넌트 노드 이름. */
export interface ComponentTree {
    name: string;
    tree: TreeNode;
}

/** 소비 패키지 `figma-utils.ts` 의 PropSpec 과 1:1. import 하지 않는다(패키지 경계). */
export type Spec =
    | { kind: 'string' | 'boolean' | 'slot' | 'instance'; name: string; visibleWhen?: string }
    | { kind: 'enum'; name: string; options: string[]; visibleWhen?: string };

/**
 * `const <varName> = getProperties(instance, '<instanceName>', entries)` 한 덩어리.
 * `todos` 는 지원하지 않는 INSTANCE_SWAP 속성 이름.
 */
export interface Block {
    varName: string;
    instanceName: string;
    entries: Record<string, Spec>;
    todos: string[];
}
