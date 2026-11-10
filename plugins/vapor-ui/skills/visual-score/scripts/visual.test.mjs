import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { designFromBlueprint, scoreVisual } from './visual.mjs';

const VISUAL = join(dirname(fileURLToPath(import.meta.url)), 'visual.mjs');

const box = (x, y, w, h) => ({ x, y, w, h });
const node = (tag, b, children = []) => ({
    id: tag,
    tag,
    props: [],
    pkg: 'core',
    children,
    ...(b && { box: b }),
});
const blueprint = (extra = {}) => ({
    version: 3,
    size: { w: 400, h: 300 },
    nodes: [],
    excluded: [],
    unscorable: [],
    frames: [],
    texts: [],
    styles: 'ok',
    ...extra,
});

describe('designFromBlueprint', () => {
    test('takes the frame size and the text lines as they are', () => {
        const d = designFromBlueprint(
            blueprint({
                texts: [
                    { id: '1:2', text: 'First', box: box(10, 10, 100, 20) },
                    { id: '1:2#1', text: 'Second', box: box(10, 30, 100, 20) },
                ],
            }),
        );
        assert.equal(d.width, 400);
        assert.equal(d.height, 300);
        assert.deepEqual(d.blocks, [
            { text: 'First', x: 10, y: 10, w: 100, h: 20 },
            { text: 'Second', x: 10, y: 30, w: 100, h: 20 },
        ]);
    });

    test('types every node at any depth by its tag and skips tags with no DOM counterpart', () => {
        const d = designFromBlueprint(
            blueprint({
                nodes: [
                    node('Dialog.Root', box(0, 0, 400, 300), [
                        node('Dialog.Popup', box(0, 0, 400, 300), [
                            node('Button', box(20, 60, 100, 40), [
                                node('PlusIcon', box(24, 64, 16, 16)),
                            ]),
                            node('IconButton', box(300, 10, 32, 32)),
                            node('Checkbox.Root', box(50, 62, 16, 16)),
                            node('Table.Root', box(0, 200, 400, 96), [
                                node('Table.Cell', box(0, 200, 200, 48)),
                                node('Table.Heading', box(200, 200, 200, 48)),
                            ]),
                            node('ProgressBar', box(0, 290, 400, 4)),
                            node('Badge'),
                        ]),
                    ]),
                ],
            }),
        );
        assert.deepEqual(d.comps, [
            { type: 'Button', x: 20, y: 60, w: 100, h: 40 },
            { type: 'Icon', x: 24, y: 64, w: 16, h: 16 },
            { type: 'IconButton', x: 300, y: 10, w: 32, h: 32 },
            { type: 'Checkbox', x: 50, y: 62, w: 16, h: 16 },
            { type: 'TableCell', x: 0, y: 200, w: 200, h: 48 },
            { type: 'TableCell', x: 200, y: 200, w: 200, h: 48 },
            { type: 'Progress', x: 0, y: 290, w: 400, h: 4 },
        ]);
    });

    test('counts excluded and unscorable instances by their Figma name, since the code still draws them', () => {
        const d = designFromBlueprint(
            blueprint({
                excluded: [
                    {
                        node: '3:1',
                        name: '❤️ ChevronDownOutlineIcon',
                        reason: 'part-draws-icon',
                        box: box(100, 10, 16, 16),
                    },
                    {
                        node: '3:2',
                        name: '💙 IconButton',
                        reason: 'part-draws-itself',
                        box: box(300, 10, 32, 32),
                    },
                ],
                unscorable: [
                    {
                        node: '4:1',
                        name: '💙 Switch',
                        cause: 'no-template',
                        box: box(10, 100, 30, 20),
                    },
                    { node: '4:2', name: '❤️ HeartIcon', cause: 'no-template' },
                    {
                        node: '4:3',
                        name: '💙Toolbar',
                        cause: 'no-template',
                        box: box(0, 0, 40, 40),
                    },
                ],
            }),
        );
        assert.deepEqual(d.comps, [
            { type: 'Icon', x: 100, y: 10, w: 16, h: 16 },
            { type: 'IconButton', x: 300, y: 10, w: 32, h: 32 },
            { type: 'Switch', x: 10, y: 100, w: 30, h: 20 },
        ]);
    });

    test('refuses a blueprint it cannot place boxes in', () => {
        assert.throws(
            () => designFromBlueprint(blueprint({ version: 2 })),
            /Upgrade @vapor-ui\/figma-blueprint/,
        );
        assert.throws(
            () => designFromBlueprint({ nodes: [] }),
            /Upgrade @vapor-ui\/figma-blueprint/,
        );
        assert.throws(() => designFromBlueprint(blueprint({ version: 4 })), /vapor-ui plugin/);
        assert.throws(() => designFromBlueprint(blueprint({ size: undefined })), /no size/);
    });
});

const design = (blocks, comps = []) => ({ width: 200, height: 100, blocks, comps });

describe('scoreVisual', () => {
    const title = { text: 'Order summary', x: 10, y: 10, w: 100, h: 20 };
    const total = { text: 'Total 12,000', x: 10, y: 50, w: 80, h: 20 };
    const button = { type: 'Button', x: 120, y: 60, w: 60, h: 32 };
    const icon = { type: 'Icon', x: 120, y: 8, w: 16, h: 16 };

    test('scores an identical render 1 on all three', () => {
        const s = scoreVisual(design([title, total], [button, icon]), {
            blocks: [title, total],
            comps: [button, icon],
        });
        assert.deepEqual(s, {
            blockMatch: 1,
            position: 1,
            layout: 1,
            layoutByType: { Button: '1.00 (1→1)', Icon: '1.00 (1→1)' },
            matched: '2/2 ref, 2 gen',
            unmatchedRef: [],
        });
    });

    test('lowers position by the larger normalized center offset of a moved block', () => {
        const s = scoreVisual(design([title, total]), {
            blocks: [title, { ...total, x: total.x + 50 }],
            comps: [],
        });
        assert.equal(s.blockMatch, 1);
        assert.equal(s.position, (1 + (1 - 50 / 200)) / 2);
    });

    test('weights each component type by its area, so a missing type lowers layout', () => {
        const big = { type: 'Icon', x: 120, y: 8, w: 60, h: 32 };
        const s = scoreVisual(design([], [button, big]), { blocks: [], comps: [button] });
        assert.equal(s.layout, 0.5);
        assert.deepEqual(s.layoutByType, { Button: '1.00 (1→1)', Icon: '0.00 (1→0)' });
    });

    test('has no layout score when the design draws no component box', () => {
        assert.equal(
            scoreVisual(design([title]), { blocks: [title], comps: [button] }).layout,
            null,
        );
    });

    test('matches a design line to the wrapped DOM line that contains it, nearest first', () => {
        const words = 'Shipping fee is charged once for every order you place';
        const s = scoreVisual(design([{ text: 'Shipping fee', x: 10, y: 10, w: 180, h: 20 }]), {
            blocks: [
                { text: `${words}#0`, x: 10, y: 10, w: 180, h: 20 },
                { text: `${words}#1`, x: 10, y: 30, w: 120, h: 20 },
            ],
            comps: [],
        });
        assert.equal(s.matched, '1/1 ref, 2 gen');
        assert.equal(s.position, 1);
        assert.deepEqual(s.unmatchedRef, []);
    });

    test('lists the design lines that did not render', () => {
        const d = designFromBlueprint(
            blueprint({
                size: { w: 100, h: 40 },
                texts: [
                    { id: '1:2', text: 'First', box: box(0, 0, 100, 20) },
                    { id: '1:2#1', text: 'Second', box: box(0, 20, 100, 20) },
                ],
            }),
        );
        const s = scoreVisual(d, {
            blocks: [{ text: 'First', x: 0, y: 0, w: 100, h: 20 }],
            comps: [],
        });
        assert.equal(s.matched, '1/2 ref, 1 gen');
        assert.deepEqual(s.unmatchedRef, ['Second']);
        assert.equal(s.position, 1);
    });
});

describe('cli', () => {
    // A folder with no node_modules above it that holds playwright.
    const cwd = mkdtempSync(join(tmpdir(), 'visual-'));
    const run = (...args) =>
        spawnSync(process.execPath, [VISUAL, ...args], { cwd, encoding: 'utf8' });
    const file = (name, json) => {
        const p = join(cwd, name);
        writeFileSync(p, JSON.stringify(json));
        return p;
    };

    test('exits 1 with usage when the app URL is missing', () => {
        const r = run(file('ok.json', blueprint()));
        assert.equal(r.status, 1);
        assert.match(r.stderr, /usage: node visual\.mjs/);
    });

    test('exits 1 on a blueprint older than version 3, before looking for playwright', () => {
        const r = run(file('old.json', blueprint({ version: 2 })), 'http://localhost:3000');
        assert.equal(r.status, 1);
        assert.match(r.stderr, /Upgrade @vapor-ui\/figma-blueprint/);
    });

    test('exits 1 with install guidance when the project has no playwright', () => {
        const r = run(file('ok.json', blueprint()), 'http://localhost:3000');
        assert.equal(r.status, 1);
        assert.match(r.stderr, /playwright is not installed.*npx playwright install chromium/);
    });
});
