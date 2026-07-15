// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { annotationScale } from './annotate-image';

describe('annotationScale', () => {
    it('returns naturalWidth / capturedWidth when width is known', () => {
        // 2400px 원본, 1200px CSS 뷰포트 → DPR 2배로 캡처됨
        expect(annotationScale(2400, 1200)).toBe(2);
        expect(annotationScale(1200, 1200)).toBe(1);
    });

    it('falls back to devicePixelRatio when capturedWidth is missing or zero', () => {
        const dpr = window.devicePixelRatio;
        expect(annotationScale(2400, undefined)).toBe(dpr);
        expect(annotationScale(2400, 0)).toBe(dpr);
    });
});
