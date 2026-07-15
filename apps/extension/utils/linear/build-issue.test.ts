import { afterEach, describe, expect, it, vi } from 'vitest';

import type { QaItem } from '~/utils/data/session-store';

import { buildDescription, buildTitle } from './build-issue';

const mocks = vi.hoisted(() => ({
    annotateImage: vi.fn(),
    blobToDataUrlUnderLimit: vi.fn(),
    getImage: vi.fn(),
    uploadImage: vi.fn(),
}));

vi.mock('~/utils/data/image-store', () => ({
    blobToDataUrlUnderLimit: mocks.blobToDataUrlUnderLimit,
    getImage: mocks.getImage,
}));
vi.mock('~/utils/dom/annotate-image', () => ({ annotateImage: mocks.annotateImage }));
vi.mock('./index', () => ({ uploadImage: mocks.uploadImage }));

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
    afterEach(() => {
        vi.resetAllMocks();
    });

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

    it('uses the stored page title instead of the currently active tab', () => {
        expect(
            buildTitle(
                [
                    item({
                        pageUrl: 'https://stored.example/path',
                        pageTitle: '저장된 페이지',
                    }),
                ],
                { title: '현재 탭', url: 'https://current.example' },
            ),
        ).toBe('[QA] 저장된 페이지 — 1건');
    });

    it('labels an issue that contains items from multiple pages', () => {
        expect(
            buildTitle(
                [
                    item({ pageUrl: 'https://example.com/a', pageTitle: 'A' }),
                    item({ pageUrl: 'https://example.com/b', pageTitle: 'B' }),
                ],
                {},
            ),
        ).toBe('[QA] 여러 페이지 — 2건');
    });

    it('adds the stored source URL for each page', async () => {
        const description = await buildDescription(
            [
                item({ pageUrl: 'https://example.com/a', memo: 'A' }),
                item({ pageUrl: 'https://example.com/b', memo: 'B' }),
            ],
            { url: 'https://current.example' },
        );

        expect(description).toContain('> 출처: https://example.com/a');
        expect(description).toContain('> 출처: https://example.com/b');
        expect(description).not.toContain('https://current.example');
    });

    it('embeds the annotated image directly without attempting a client upload', async () => {
        const annotated = new Blob(['annotated'], { type: 'image/png' });
        mocks.getImage.mockResolvedValue(new Blob(['source'], { type: 'image/png' }));
        mocks.annotateImage.mockResolvedValue(annotated);
        mocks.blobToDataUrlUnderLimit.mockResolvedValue('data:image/png;base64,annotated');
        mocks.uploadImage.mockResolvedValue('https://uploads.linear.app/image.png');

        const description = await buildDescription(
            [item({ imageRef: 'image-1', width: 1200 })],
            {},
        );

        expect(mocks.uploadImage).not.toHaveBeenCalled();
        expect(description).toContain('![screenshot](data:image/png;base64,annotated)');
    });

    it('keeps Linear descriptions under the maximum length when screenshots are large', async () => {
        mocks.getImage.mockResolvedValue(new Blob(['source'], { type: 'image/png' }));
        mocks.annotateImage.mockResolvedValue(new Blob(['annotated'], { type: 'image/png' }));
        mocks.blobToDataUrlUnderLimit.mockResolvedValue(
            `data:image/jpeg;base64,${'b'.repeat(1_000)}`,
        );

        const description = await buildDescription(
            [item({ imageRef: 'image-1', width: 1200, memo: 'large screenshot' })],
            {},
        );

        expect(description.length).toBeLessThanOrEqual(250_000);
        expect(description).toContain('![screenshot](data:image/jpeg;base64,');
    });
});
