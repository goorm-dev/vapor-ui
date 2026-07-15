import type { QaItem } from '~/utils/data/session-store';

/**
 * 같은 imageRef(=같은 뷰포트) 항목을 한 그룹으로 묶는다.
 * imageRef 없는 항목은 단독 그룹으로 분리(방어적 — 현재는 사실상 안 생김).
 * 그룹 순서 = 각 그룹 첫 항목의 원본 등장 순서. 그룹 내부 = index 오름차순.
 */
export const groupByImage = (items: QaItem[]): QaItem[][] => {
    const groups = new Map<string, QaItem[]>();

    for (const item of items) {
        const key = item.imageRef ?? `__solo:${item.id}`;
        let group = groups.get(key);
        if (!group) {
            group = [];
            groups.set(key, group);
        }
        group.push(item);
    }

    return [...groups.values()].map((group) =>
        [...group].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
    );
};
