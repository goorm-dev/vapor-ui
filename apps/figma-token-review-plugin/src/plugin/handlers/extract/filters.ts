/**
 * 노드 순회 시 무시/특수 취급할 대상 판별.
 */

const SKIP_PREFIXES = ['🟨', '🔶'] as const;

/** 이모지 접두 규칙에 의해 검사에서 제외되는 노드. 자식은 순회하되 자신은 건너뛴다. */
export function shouldSkipNode(name: string) {
    return SKIP_PREFIXES.some((p) => name.startsWith(p));
}

/**
 * 벡터(아이콘) 원시 노드는 크기가 도형 자체의 기하학적 속성이므로
 * dimension 토큰 검사에서 제외한다. 아이콘을 감싸는 프레임 크기는 검사 대상.
 * fill 도 fg-role 스코프로 취급.
 */
const VECTOR_LIKE_TYPES: ReadonlySet<string> = new Set([
    'VECTOR',
    'BOOLEAN_OPERATION',
    'LINE',
    'ELLIPSE',
    'POLYGON',
    'STAR',
]);

export function isVectorLike(node: SceneNode) {
    return VECTOR_LIKE_TYPES.has(node.type);
}
