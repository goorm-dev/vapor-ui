import { storage } from 'wxt/utils/storage';

export interface CapturedRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface QaItem {
    id: string;
    selector: string;
    rect: CapturedRect;
    memo: string;
    createdAt: number;
    styleJSON?: Record<string, string>;
    components?: string[];
    tabId?: number;
    pageUrl?: string;
    pageTitle?: string;
    // 캡처 이미지 공유: 같은 탭/페이지/scrollX/scrollY/width면 imageRef를 공유한다.
    imageRef?: string;
    index?: number;
    scrollX?: number;
    scrollY?: number;
    width?: number;
}

const itemsStore = storage.defineItem<QaItem[]>('local:qaItems', { fallback: [] });

export const getItems = () => itemsStore.getValue();

// ponytail: non-atomic read-modify-write. The only save path is one pinned
// element → one memo → one save click, so two addItem() calls never overlap in
// practice and the lost-update race can't surface. Promote to a serialized
// queue (or storage.lock) only if a code path ever saves items concurrently.
export const addItem = async (item: Omit<QaItem, 'id' | 'createdAt'>): Promise<QaItem> => {
    const entry: QaItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
    };

    const current = await itemsStore.getValue();
    await itemsStore.setValue([...current, entry]);
    return entry;
};

export const watchItems = (callback: (items: QaItem[]) => void) => itemsStore.watch(callback);

export const clearItems = () => itemsStore.setValue([]);
