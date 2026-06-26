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

const JPEG_WIDTHS = [1600, 1200, 900, 720, 540, 360];
const JPEG_QUALITY = 0.72;

export const blobToDataUrlUnderLimit = async (
    blob: Blob,
    maxLength: number,
): Promise<string | null> => {
    if (maxLength <= 0) return null;

    const original = await blobToDataUrl(blob);
    if (original.length <= maxLength) return original;

    if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') {
        return null;
    }

    const url = URL.createObjectURL(blob);
    try {
        const img = await loadImage(url);
        const widths = JPEG_WIDTHS.filter((width) => width <= img.naturalWidth);
        if (!widths.length) widths.push(img.naturalWidth);

        for (const width of widths) {
            const dataUrl = await resizeToJpegDataUrl(img, width);
            if (dataUrl.length <= maxLength) return dataUrl;
        }
        return null;
    } catch {
        return null;
    } finally {
        URL.revokeObjectURL(url);
    }
};

const resizeToJpegDataUrl = async (img: HTMLImageElement, targetWidth: number): Promise<string> => {
    const scale = Math.min(1, targetWidth / img.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas context unavailable');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const jpeg = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );
    if (!jpeg) throw new Error('image compression failed');
    return blobToDataUrl(jpeg);
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('image load failed'));
        img.src = src;
    });
