import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { chromium } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { FigmaTree } from './expected';
import type { FigmaNode } from './figma-mock';
import type { CompBox, DesignBoxes, TextBox } from './visual';
import { designBoxes, scoreVisual, visualScore } from './visual';

let id = 0;
const node = (
    type: string,
    name: string,
    box: [number, number, number, number] | null,
    extra: Partial<FigmaNode> = {},
): FigmaNode => ({
    id: `${++id}`,
    type,
    name,
    ...(box && {
        absoluteBoundingBox: { x: box[0], y: box[1], width: box[2], height: box[3] },
    }),
    ...extra,
});
const text = (characters: string, box: [number, number, number, number], extra = {}) =>
    node('TEXT', characters, box, { characters, ...extra });
const frame = (box: [number, number, number, number], children: FigmaNode[]): FigmaTree => ({
    document: node('FRAME', 'Screen', box, { children }),
});

describe('designBoxes', () => {
    const tree = frame(
        [100, 200, 400, 300],
        [
            text('Title', [110, 210, 80, 30], {
                absoluteRenderBounds: { x: 112, y: 214, width: 70, height: 20 },
            }),
            text('   ', [110, 250, 80, 30]),
            node('FRAME', 'Hidden', [100, 200, 50, 50], {
                visible: false,
                children: [
                    text('Secret', [100, 200, 50, 20]),
                    node('INSTANCE', '💙 Badge', [100, 200, 20, 20]),
                ],
            }),
            node('INSTANCE', '💙 Button', [120, 260, 100, 40], {
                children: [
                    text('Save', [130, 270, 40, 20]),
                    node('INSTANCE', '💙 Badge', [180, 265, 20, 20]),
                    node('SLOT', 'Slot', null, {
                        children: [node('INSTANCE', '💙 Badge', [190, 262, 10, 10])],
                    }),
                    node('INSTANCE', '🟨 slot', [120, 260, 100, 40], {
                        children: [node('INSTANCE', '💙 Avatar', [122, 262, 20, 20])],
                    }),
                    node('INSTANCE', 'LocalRow', [120, 260, 100, 40], {
                        children: [node('INSTANCE', '💙 Checkbox.Root', [150, 262, 16, 16])],
                    }),
                ],
            }),
            node('INSTANCE', 'ArrowRightIcon', [300, 210, 16, 16]),
            node('INSTANCE', '💙 Table.Cell', [100, 400, 200, 48]),
            node('INSTANCE', '💙 Unknown', [100, 450, 50, 50], {
                children: [
                    node('SLOT', 'Slot', null, {
                        children: [node('INSTANCE', '💙 Switch', [110, 460, 30, 20])],
                    }),
                ],
            }),
        ],
    );
    const boxes = designBoxes(tree);

    it('measures the frame and places text relative to it, preferring render bounds', () => {
        expect(boxes.width).toBe(400);
        expect(boxes.height).toBe(300);
        expect(boxes.blocks).toEqual([
            { text: 'Title', x: 12, y: 14, w: 70, h: 20 },
            { text: 'Save', x: 30, y: 70, w: 40, h: 20 },
        ]);
    });

    it('stops at a library instance but keeps going inside slots and swapped-in local components', () => {
        expect(boxes.comps).toEqual([
            { type: 'Button', x: 20, y: 60, w: 100, h: 40 },
            { type: 'Badge', x: 90, y: 62, w: 10, h: 10 },
            { type: 'Avatar', x: 22, y: 62, w: 20, h: 20 },
            { type: 'Checkbox', x: 50, y: 62, w: 16, h: 16 },
            { type: 'Icon', x: 200, y: 10, w: 16, h: 16 },
            { type: 'TableCell', x: 0, y: 200, w: 200, h: 48 },
            { type: 'Switch', x: 10, y: 260, w: 30, h: 20 },
        ]);
    });
});

const design = (blocks: TextBox[], comps: CompBox[] = []): DesignBoxes => ({
    width: 200,
    height: 100,
    blocks,
    comps,
});

describe('scoreVisual', () => {
    const title = { text: 'Order summary', x: 10, y: 10, w: 100, h: 20 };
    const total = { text: 'Total 12,000', x: 10, y: 50, w: 80, h: 20 };
    const button: CompBox = { type: 'Button', x: 120, y: 60, w: 60, h: 32 };
    const icon: CompBox = { type: 'Icon', x: 120, y: 8, w: 16, h: 16 };

    it('scores an identical render 1 on all three', () => {
        const s = scoreVisual(design([title, total], [button, icon]), {
            blocks: [title, total],
            comps: [button, icon],
        });
        expect(s).toEqual({
            blockMatch: 1,
            position: 1,
            layout: 1,
            layoutByType: { Button: '1.00 (1→1)', Icon: '1.00 (1→1)' },
            matched: '2/2 ref, 2 gen',
            unmatchedRef: [],
        });
    });

    it('lowers position by the larger normalized center offset of a moved block', () => {
        const s = scoreVisual(design([title, total]), {
            blocks: [title, { ...total, x: total.x + 50 }],
            comps: [],
        });
        expect(s.blockMatch).toBe(1);
        expect(s.position).toBe((1 + (1 - 50 / 200)) / 2);
    });

    it('weights each component type by its area, so a missing type lowers layout', () => {
        const big: CompBox = { type: 'Icon', x: 120, y: 8, w: 60, h: 32 };
        const s = scoreVisual(design([], [button, big]), { blocks: [], comps: [button] });
        expect(s.layout).toBe(0.5);
        expect(s.layoutByType).toEqual({ Button: '1.00 (1→1)', Icon: '0.00 (1→0)' });
    });

    it('has no layout score when the design draws no component box', () => {
        expect(scoreVisual(design([title]), { blocks: [title], comps: [button] }).layout).toBe(
            null,
        );
    });

    it('matches a design line to the wrapped DOM line that contains it, nearest first', () => {
        const words = 'Shipping fee is charged once for every order you place';
        const s = scoreVisual(design([{ text: 'Shipping fee', x: 10, y: 10, w: 180, h: 20 }]), {
            blocks: [
                { text: `${words}#0`, x: 10, y: 10, w: 180, h: 20 },
                { text: `${words}#1`, x: 10, y: 30, w: 120, h: 20 },
            ],
            comps: [],
        });
        expect(s.matched).toBe('1/1 ref, 2 gen');
        expect(s.position).toBe(1);
        expect(s.unmatchedRef).toEqual([]);
    });

    it('splits a multi-line Figma text into lines and skips empty paragraphs', () => {
        const s = scoreVisual(
            design([{ text: 'First\n\u200b\nSecond', x: 0, y: 0, w: 100, h: 40 }]),
            {
                blocks: [{ text: 'First', x: 0, y: 0, w: 100, h: 20 }],
                comps: [],
            },
        );
        expect(s.matched).toBe('1/2 ref, 1 gen');
        expect(s.unmatchedRef).toEqual(['Second']);
        expect(s.position).toBe(1);
    });
});

const canLaunch = await chromium.launch().then(
    (b) => b.close().then(() => true),
    () => false,
);

describe.skipIf(!canLaunch)('visualScore', () => {
    // A 200×120 frame drawn at (1000, 2000): one text input and one Button. The page draws the same thing inside
    // #screen, which sits 40px right and 60px down of the viewport origin.
    const tree = frame(
        [1000, 2000, 200, 120],
        [text('Hello', [1008, 2008, 100, 32]), node('INSTANCE', '💙 Button', [1120, 2008, 64, 32])],
    );
    const html = `<!doctype html><body style="margin:0">
<div id="screen" style="position:absolute;left:40px;top:60px;width:200px;height:120px">
<input value="Hello" style="position:absolute;left:8px;top:8px;width:100px;height:32px;box-sizing:border-box;border:0;padding:0">
<button class="button-ab12c" style="position:absolute;left:120px;top:8px;width:64px;height:32px;border:0;padding:0"></button>
</div><script>throw new Error('boom')</script></body>`;
    const server = createServer((req, res) => {
        res.writeHead(req.url === '/' ? 200 : 404, { 'content-type': 'text/html' });
        res.end(req.url === '/' ? html : 'not found');
    });
    let base = '';
    beforeAll(async () => {
        await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
        base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });
    afterAll(() => new Promise<void>((r) => server.close(() => r())));

    it('measures from the selected element, so a frame placed anywhere on the page scores 1', async () => {
        const r = await visualScore(tree, `${base}/`, { selector: '#screen' });
        expect(r).toMatchObject({
            version: 1,
            result: 'scored',
            blockMatch: 1,
            position: 1,
            layout: 1,
            matched: '1/1 ref, 1 gen',
        });
        expect(r.result === 'scored' && r.errors).toEqual([expect.stringContaining('boom')]);
    });

    it('measures from the viewport origin without a selector', async () => {
        const r = await visualScore(tree, `${base}/`);
        expect(r.result === 'scored' && r.position).toBeCloseTo(1 - Math.max(40 / 200, 60 / 120));
    });

    it('fails to render when the selector matches nothing or the page answers non-OK', async () => {
        expect(await visualScore(tree, `${base}/`, { selector: '#nope' })).toEqual({
            version: 1,
            result: 'render-failed',
            error: expect.stringContaining('#nope'),
        });
        expect(await visualScore(tree, `${base}/missing`)).toMatchObject({
            result: 'render-failed',
        });
    });
});
