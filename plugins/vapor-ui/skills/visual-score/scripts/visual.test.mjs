import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { designFromBlueprint, scoreVisual, visualScore } from './visual.mjs';

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
    version: 4,
    size: { w: 400, h: 300 },
    nodes: [],
    excluded: [],
    unscorable: [],
    texts: [],
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
        assert.throws(() => designFromBlueprint(blueprint({ version: 5 })), /vapor-ui plugin/);
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

// Playwright from the folder node --test runs in, as visual.mjs finds it. The plugin itself has none.
async function findChromium() {
    try {
        const path = createRequire(join(process.cwd(), 'package.json')).resolve('playwright');
        const pw = await import(pathToFileURL(path).href);
        return pw.chromium ?? pw.default.chromium;
    } catch {
        return null;
    }
}

const chromium = await findChromium();

describe('visualScore', { skip: !chromium && 'playwright is not installed in the cwd' }, () => {
    // An app shell whose sidebar repeats a design line and draws an icon, around the graded screen.
    const page = `data:text/html,${encodeURIComponent(`<body style="margin:0">
        <nav style="position:absolute;left:0;top:0;width:100px;height:100px">
            <span>Second line</span><svg width="16" height="16"></svg>
        </nav>
        <main id="screen" style="position:absolute;left:100px;top:0;width:200px;height:100px">
            <p style="position:absolute;left:0;top:0;margin:0">First line</p>
        </main>
    </body>`)}`;
    const shell = {
        width: 300,
        height: 100,
        blocks: [
            { text: 'First line', x: 0, y: 0, w: 60, h: 20 },
            { text: 'Second line', x: 0, y: 20, w: 60, h: 20 },
        ],
        comps: [{ type: 'Icon', x: 0, y: 40, w: 16, h: 16 }],
    };

    test('with a selector, measures only text and components inside that element', async () => {
        const r = await visualScore(shell, page, chromium, { selector: '#screen' });
        assert.equal(r.result, 'scored');
        assert.deepEqual(r.unmatchedRef, ['Second line']);
        assert.equal(r.layoutByType.Icon, '0.00 (1→0)');
    });

    test('without a selector, measures the whole page', async () => {
        const r = await visualScore(shell, page, chromium);
        assert.deepEqual(r.unmatchedRef, []);
        assert.match(r.layoutByType.Icon, /\(1→1\)$/);
    });
});

describe('cli', () => {
    // A folder with no node_modules above it that holds playwright.
    const cwd = mkdtempSync(join(tmpdir(), 'visual-'));
    // An npm global prefix of our own, so a playwright installed globally on this machine is not found.
    const prefix = mkdtempSync(join(tmpdir(), 'visual-prefix-'));
    const env = { ...process.env, npm_config_prefix: prefix };
    const run = (...args) =>
        spawnSync(process.execPath, [VISUAL, ...args], { cwd, env, encoding: 'utf8' });
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

    test('exits 1 on a blueprint older than version 4, before looking for playwright', () => {
        const r = run(file('old.json', blueprint({ version: 3 })), 'http://localhost:3000');
        assert.equal(r.status, 1);
        assert.match(r.stderr, /Upgrade @vapor-ui\/figma-blueprint/);
    });

    test('exits 1 with install guidance when the project has no playwright', () => {
        const r = run(file('ok.json', blueprint()), 'http://localhost:3000');
        assert.equal(r.status, 1);
        assert.match(r.stderr, /playwright is not installed.*npx playwright install chromium/);
    });

    test('uses a playwright installed in the npm global root', () => {
        const globalPrefix = mkdtempSync(join(tmpdir(), 'visual-global-'));
        const globalEnv = { ...process.env, npm_config_prefix: globalPrefix };
        const root = spawnSync('npm', ['root', '-g'], {
            env: globalEnv,
            encoding: 'utf8',
        }).stdout.trim();
        const pkg = join(root, 'playwright');
        mkdirSync(pkg, { recursive: true });
        writeFileSync(
            join(pkg, 'package.json'),
            JSON.stringify({ name: 'playwright', main: 'index.js' }),
        );
        writeFileSync(
            join(pkg, 'index.js'),
            "exports.chromium = { launch: async () => { throw new Error('stub chromium'); } };",
        );
        const r = spawnSync(
            process.execPath,
            [VISUAL, file('ok.json', blueprint()), 'http://localhost:3000'],
            { cwd, env: globalEnv, encoding: 'utf8' },
        );
        assert.equal(r.status, 1);
        assert.match(r.stderr, /chromium did not launch: stub chromium/);
        assert.doesNotMatch(r.stderr, /not installed/);
    });
});
