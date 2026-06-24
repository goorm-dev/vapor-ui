import type { QaItem } from './session-store';

/**
 * 같은 스크롤 좌표(=같은 뷰포트)에서 이미 캡처한 이미지가 있으면 그 ref와 다음 index를 돌려준다.
 * 없으면 null — 새로 캡처해야 한다는 뜻.
 */
export const findSharedImage = (
    items: QaItem[],
    scrollX: number,
    scrollY: number,
): { imageRef: string; nextIndex: number } | null => {
    const sameViewport = items.filter(
        (item) => item.scrollX === scrollX && item.scrollY === scrollY && item.imageRef != null,
    );
    if (sameViewport.length === 0) return null;

    const imageRef = sameViewport[0].imageRef!;
    const nextIndex = Math.max(...sameViewport.map((item) => item.index ?? 0)) + 1;
    return { imageRef, nextIndex };
};
