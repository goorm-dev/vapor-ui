import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface QaImageDb extends DBSchema {
    images: { key: string; value: Blob };
}

let dbPromise: Promise<IDBPDatabase<QaImageDb>> | undefined;

const getDb = () => {
    dbPromise ??= openDB<QaImageDb>('vapor-qa', 1, {
        upgrade(db) {
            db.createObjectStore('images');
        },
    });
    return dbPromise;
};

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl);
    return response.blob();
};

/** Blob을 IndexedDB에 저장하고 참조 키(uuid)를 돌려준다. */
export const putImage = async (blob: Blob): Promise<string> => {
    const ref = crypto.randomUUID();
    const db = await getDb();
    await db.put('images', blob, ref);
    return ref;
};

export const getImage = async (ref: string): Promise<Blob | undefined> => {
    const db = await getDb();
    return db.get('images', ref);
};

export const clearImages = async (): Promise<void> => {
    const db = await getDb();
    await db.clear('images');
};

/** Blob을 dataURL로 변환한다. content script(다른 origin)로 이미지를 넘길 때 사용. */
export const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
