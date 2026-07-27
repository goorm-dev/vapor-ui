/** scan 대상 검증: FRAME/INSTANCE 만 유효. */
export async function getScanTarget(frameId: string): Promise<FrameNode | InstanceNode | null> {
    const node = await figma.getNodeByIdAsync(frameId);
    if (!node || (node.type !== 'FRAME' && node.type !== 'INSTANCE')) return null;
    return node;
}

/**
 * nodeIds → SceneNode 해석. isCancelled 가 true 를 반환하면 즉시 null —
 * 최신 요청만 유효한 focus 흐름의 "루프 중 stale 체크"를 보존하기 위한 콜백.
 */
export async function resolveSceneNodes(
    nodeIds: string[],
    isCancelled: () => boolean,
): Promise<{ resolved: SceneNode[]; missing: string[] } | null> {
    const resolved: SceneNode[] = [];
    const missing: string[] = [];

    for (const nodeId of nodeIds) {
        const n = await figma.getNodeByIdAsync(nodeId);
        if (isCancelled()) return null;

        if (n && n.type !== 'DOCUMENT' && n.type !== 'PAGE' && 'visible' in n) {
            resolved.push(n as SceneNode);
        } else {
            missing.push(nodeId);
        }
    }

    return { resolved, missing };
}
