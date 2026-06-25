// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { extractStyle } from './style-extract';

describe('extractStyle', () => {
    it('returns the fixed set of CSS keys for an element', () => {
        const el = document.createElement('div');
        el.style.color = 'rgb(255, 0, 0)';
        el.style.fontSize = '14px';
        document.body.append(el);

        const style = extractStyle(el);

        expect(style).toHaveProperty('color');
        expect(style).toHaveProperty('font-size');
        expect(style).toHaveProperty('padding-top');
        expect(style).toHaveProperty('display');
        // 추출 키 개수 고정 (19개)
        expect(Object.keys(style)).toHaveLength(19);
    });
});
