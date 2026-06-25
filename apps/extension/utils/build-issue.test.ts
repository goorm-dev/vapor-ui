import { describe, expect, it } from 'vitest';

import { buildTitle } from './build-issue';
import type { QaItem } from './session-store';

let counter = 0;
const item = (over: Partial<QaItem> = {}): QaItem => ({
    id: `id-${counter++}`,
    selector: 'div',
    rect: { top: 0, left: 0, width: 10, height: 10 },
    memo: '',
    createdAt: 0,
    ...over,
});

describe('buildTitle', () => {
    it('uses tab title and item count', () => {
        expect(buildTitle([item(), item()], { title: '대시보드', url: 'https://x.io/a' })).toBe(
            '[QA] 대시보드 — 2건',
        );
    });

    it('falls back to host when title is missing', () => {
        expect(buildTitle([item()], { url: 'https://example.com/path' })).toBe(
            '[QA] example.com — 1건',
        );
    });

    it('falls back to a default label when nothing is available', () => {
        expect(buildTitle([item()], {})).toBe('[QA] 웹페이지 — 1건');
    });
});
