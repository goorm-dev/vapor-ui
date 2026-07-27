/**
 * 노드 순회 시 무시/특수 취급할 대상 판별.
 */

/** DS(vapor) 라이브러리 컴포넌트를 표시하는 이모지 프리픽스. */
export const DS_PREFIX = '💙';

/** 자기 자신은 스캔하지 않되 자식은 계속 순회하는 대상. */
const SKIP_PREFIXES = ['🟨', '🔶'] as const;

/** 이모지 접두 규칙에 의해 검사에서 제외되는 노드. 자식은 순회하되 자신은 건너뛴다. */
export function shouldSkipNode(name: string) {
    return SKIP_PREFIXES.some((p) => name.startsWith(p));
}

/** 💙 프리픽스가 붙은 DS 라이브러리 컴포넌트 인스턴스. */
export function isDsInstance(node: SceneNode): boolean {
    return node.type === 'INSTANCE' && node.name.startsWith(DS_PREFIX);
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
