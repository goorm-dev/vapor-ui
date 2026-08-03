export function chunkArray<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
}

export function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/**
 * LLM이 echo한 id 목록을 기대 id 집합과 대조한다. 하나라도 어긋나면 던진다 —
 * 조용한 오매핑보다 배치 실패가 낫다.
 */
export function reconcileById<T extends { id: string }>(
    expectedIds: string[],
    items: T[],
): Map<string, T> {
    const expected = new Set(expectedIds);
    const result = new Map<string, T>();

    for (const item of items) {
        if (!expected.has(item.id)) throw new Error(`Unknown response id: ${item.id}`);
        if (result.has(item.id)) throw new Error(`Duplicate response id: ${item.id}`);
        result.set(item.id, item);
    }
    for (const id of expected) {
        if (!result.has(id)) throw new Error(`Missing response id: ${id}`);
    }
    return result;
}
