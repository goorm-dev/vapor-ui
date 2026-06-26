import type { CapturedRect } from '~/utils/data/session-store';

export interface AnnotationBox {
    rect: CapturedRect;
    index?: number;
}

const BOX_COLOR = '#2a72e5';

/**
 * 캡처 당시 CSS 뷰포트폭(width) 대비 원본 이미지 물리폭(naturalWidth)의 비.
 * = 캡처 시점 DPR. 저장된 rect(CSS px)를 원본 해상도 좌표로 올리는 데 쓴다.
 * width가 없는 옛 항목은 현재 DPR로 폴백(lightbox.ts와 같은 절충).
 */
export const annotationScale = (naturalWidth: number, capturedWidth?: number): number => {
    if (capturedWidth && capturedWidth > 0) return naturalWidth / capturedWidth;
    return window.devicePixelRatio;
};

/**
 * blob 이미지 위에 box들을 원본 해상도로 합성해 새 PNG blob을 돌려준다.
 * sidepanel에서 보는 CapturedImage/lightbox와 같은 파랑 박스 + 번호 라벨.
 * 합성 실패(이미지 로드/canvas null/toBlob null) 시 원본 blob 그대로 반환.
 */
export const annotateImage = async (
    blob: Blob,
    boxes: AnnotationBox[],
    capturedWidth?: number,
): Promise<Blob> => {
    if (boxes.length === 0) return blob;

    const url = URL.createObjectURL(blob);
    try {
        const img = await loadImage(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return blob;

        ctx.drawImage(img, 0, 0);
        const scale = annotationScale(img.naturalWidth, capturedWidth);

        for (const { rect, index } of boxes) {
            const x = rect.left * scale;
            const y = rect.top * scale;
            const w = rect.width * scale;
            const h = rect.height * scale;

            ctx.lineWidth = Math.max(2, 2 * scale);
            ctx.strokeStyle = BOX_COLOR;
            ctx.strokeRect(x, y, w, h);

            if (index == null) continue;

            // 번호 라벨 배지 — 박스 좌상단. 화면 밖으로 안 나가게 y를 클램프.
            const label = String(index);
            ctx.font = `bold ${Math.round(11 * scale)}px sans-serif`;
            const pad = 4 * scale;
            const badgeW = ctx.measureText(label).width + pad * 2;
            const badgeH = Math.round(16 * scale);
            const bx = Math.max(0, x - ctx.lineWidth / 2);
            const by = Math.max(0, y - ctx.lineWidth / 2);

            ctx.fillStyle = BOX_COLOR;
            ctx.fillRect(bx, by, badgeW, badgeH);
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, bx + pad, by + badgeH / 2);
        }

        const out = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/png'),
        );
        return out ?? blob;
    } catch {
        return blob; // 합성 실패 시 원본 폴백
    } finally {
        URL.revokeObjectURL(url);
    }
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('image load failed'));
        img.src = src;
    });
