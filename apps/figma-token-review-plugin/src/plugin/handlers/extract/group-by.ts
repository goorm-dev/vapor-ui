type Grouped<T> = T & { nodeIds: string[]; count: number };

/**
 * 동일 특성을 가진 사용처를 하나로 묶는다.
 * key 는 caller 가 결정 (JSON stringify 등).
 * 결과 항목은 nodeIds/count 를 갖는다.
 */
export function groupBy<T extends { nodeId: string }>(
    items: T[],
    keyOf: (item: T) => string,
): Grouped<T>[] {
    const map = new Map<string, Grouped<T>>();

    for (const it of items) {
        const key = keyOf(it);
        const g = map.get(key);

        if (g) {
            g.nodeIds.push(it.nodeId);
            g.count++;
        } else {
            map.set(key, { ...it, nodeIds: [it.nodeId], count: 1 });
        }
    }

    return [...map.values()];
}
