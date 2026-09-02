/**
 * @typedef {'TEXT' | 'BOOLEAN' | 'VARIANT' | 'SLOT' | 'INSTANCE_SWAP'} PropType
 */

/**
 * Figma 컴포넌트 속성. `name` 은 `#id` 접미가 제거된 상태.
 * @typedef {{ name: string, type: PropType, variantOptions?: string[] }} Prop
 */

/**
 * 어댑터가 만드는 정규화 트리. INSTANCE 만 children 에 남긴다.
 * @typedef {{ kind: 'ROOT' | 'INSTANCE', name: string, props: Prop[], children: Node[] }} Node
 */

/**
 * `getProperties` 의 PropSpec 과 1:1.
 * @typedef {{ kind: 'string' | 'boolean' | 'slot' | 'instance', name: string }
 *         | { kind: 'enum', name: string, options: string[] }} Spec
 */

/**
 * `const <varName> = getProperties(instance, '<instanceName>', entries)` 한 덩어리.
 * `todos` 는 지원하지 않는 INSTANCE_SWAP 속성 이름.
 * @typedef {{ varName: string, instanceName: string, entries: Record<string, Spec>, todos: string[] }} Block
 */

export {};
