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
    // 캡처 이미지 공유: 같은 scrollX/scrollY면 imageRef를 공유하고 index로 구분
    imageRef?: string;
    index?: number;
    scrollX?: number;
    scrollY?: number;
}

const itemsStore = storage.defineItem<QaItem[]>('local:qaItems', { fallback: [] });

export const getItems = () => itemsStore.getValue();

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
