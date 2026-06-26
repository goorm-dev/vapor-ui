import type { QaItem } from '~/utils/data/session-store';

/**
 * 같은 탭·페이지·뷰포트에서 이미 캡처한 이미지가 있으면
 * 그 ref와 다음 index를 돌려준다. 없으면 null — 새로 캡처해야 한다는 뜻.
 */
export const findSharedImage = (
    items: QaItem[],
    tabId: number,
    pageUrl: string,
    scrollX: number,
    scrollY: number,
    width: number,
): { imageRef: string; nextIndex: number } | null => {
    const sameViewport = items.filter(
        (item) =>
            item.tabId === tabId &&
            item.pageUrl === pageUrl &&
            item.scrollX === scrollX &&
            item.scrollY === scrollY &&
            item.width === width &&
            item.imageRef != null,
    );
    if (sameViewport.length === 0) return null;

    // Invariant: one viewport key (tabId+pageUrl+scrollX+scrollY+width) always maps
    // to a single imageRef. The first save for a viewport captures and fixes the ref;
    // every later save with the same key reuses it via this function. So sameViewport
    // can never hold two distinct refs, and taking [0] with a max-index bump is safe.
    const imageRef = sameViewport[0].imageRef!;
    const nextIndex = Math.max(...sameViewport.map((item) => item.index ?? 0)) + 1;
    return { imageRef, nextIndex };
};
