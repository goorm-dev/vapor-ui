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
