// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { blobToDataUrlUnderLimit, dataUrlToBlob } from './image-store';

// 1x1 투명 PNG
const PNG_DATA_URL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC';

describe('image-store', () => {
    // putImage/getImage는 idb 위임 래퍼라 IndexedDB 왕복은 실제 브라우저 육안 확인(§9.6).
    // happy-dom엔 IndexedDB가 없어 여기선 순수 변환만 검증한다.
    it('converts a data URL into a Blob', async () => {
        const blob = await dataUrlToBlob(PNG_DATA_URL);
        expect(blob.type).toBe('image/png');
        expect(blob.size).toBeGreaterThan(0);
    });

    it('keeps a Blob data URL when it already fits the limit', async () => {
        await expect(
            blobToDataUrlUnderLimit(new Blob(['ok'], { type: 'text/plain' }), 100),
        ).resolves.toBe('data:text/plain;base64,b2s=');
    });
});
