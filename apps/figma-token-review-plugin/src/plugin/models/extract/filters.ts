/**
 * 노드 순회 시 무시/특수 취급할 대상 판별.
 */

/** DS(vapor) 라이브러리 컴포넌트를 표시하는 이모지 프리픽스. */
export const DS_PREFIX = '💙';

/**
 * 🔶InteractionLayer/{variant} — hover/active/focus 상태를 투명 오버레이로 표현하는 컴포넌트.
 * 실제 배경색이 아니므로 배경 판정·스크린샷·픽셀 샘플링 모두에서 제외 대상.
 */
export const INTERACTION_LAYER_PREFIX = '🔶InteractionLayer';

/** 자기 자신은 스캔하지 않되 자식은 계속 순회하는 대상. */
const SKIP_PREFIXES = ['🟨', '🔶'] as const;

/** 이모지 접두 규칙에 의해 검사에서 제외되는 노드. 자식은 순회하되 자신은 건너뛴다. */
export function shouldSkipNode(name: string) {
    return SKIP_PREFIXES.some((p) => name.startsWith(p));
}

/**
 * 💙 프리픽스가 붙었고 실제 DS 라이브러리 원본을 참조하는 인스턴스.
 * detach 후 로컬로 재컴포넌트화된 인스턴스(remote=false) 는 제외한다.
 */
export async function isDsInstance(node: SceneNode): Promise<boolean> {
    if (node.type !== 'INSTANCE' || !node.name.startsWith(DS_PREFIX)) return false;
    const main = await (node as InstanceNode).getMainComponentAsync();
    return main?.remote === true;
}

/**
 * 원래 💙 DS 컴포넌트였으나 detach된 노드 후보.
 * - detach된 frame/group/component (type ≠ INSTANCE, 이름은 Figma가 보존)
 * - detach 후 로컬 컴포넌트로 재컴포넌트화된 인스턴스 (remote=false)
 * 감사 스코프는 일반 노드와 동일(전체 감사), 리포트 뱃지 노출용 태그.
 */
export async function wasDsComponent(node: SceneNode): Promise<boolean> {
    if (!node.name.startsWith(DS_PREFIX)) return false;
    if (node.type !== 'INSTANCE') return true;
    const main = await (node as InstanceNode).getMainComponentAsync();
    return main?.remote === false;
}

/**
 * 🔶InteractionLayer/ 프리픽스를 가진 노드 여부.
 * 이 레이어는 hover/focus/active 상태를 투명하게 겹쳐 표현하므로
 * 배경 판정과 스크린샷·픽셀 샘플링에서 시각적으로 제거해야 한다.
 */
export function isInteractionLayer(node: Pick<SceneNode, 'name'>): boolean {
    return typeof node.name === 'string' && node.name.startsWith(INTERACTION_LAYER_PREFIX);
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
