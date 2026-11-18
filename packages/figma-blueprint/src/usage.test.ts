import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildPackage } from '~/catalog/catalog';
import type { FigmaTree } from '~/figma';
import { PACKAGES } from '~/packages';

import { version } from '../package.json';
import { main } from './cli';

const ME = 'https://api.figma.com/v1/me';
const ENDPOINT = 'https://vapor-ui.goorm.io/api/figma-blueprint/usage';
const URL_WITH_NODE = 'https://www.figma.com/design/FILE/Name?node-id=0-1';
const repo = fileURLToPath(new URL('./__fixtures__/repo', import.meta.url));

const apps: string[] = [];
function install() {
    const app = mkdtempSync(join(tmpdir(), 'figma-blueprint-usage-'));
    apps.push(app);
    for (const pkg of PACKAGES) {
        const dir = join(app, 'node_modules/@vapor-ui', pkg);
        buildPackage(join(repo, 'packages', pkg), join(dir, 'figma-blueprint'));
        writeFileSync(
            join(dir, 'package.json'),
            JSON.stringify({
                name: `@vapor-ui/${pkg}`,
                exports: { './figma-blueprint/*': './figma-blueprint/*' },
            }),
        );
    }
    return app;
}

const app = install();
const home = process.cwd();
afterAll(() => {
    for (const dir of apps) rmSync(dir, { recursive: true, force: true });
});

const iconButton = {
    id: '2:1',
    name: 'IconButton',
    type: 'INSTANCE',
    componentId: '1:1',
    componentProperties: { Size: { value: 'Lg' } },
};
const chip = { id: '2:4', name: 'Chip', type: 'INSTANCE', componentId: '1:3' };
const frame = (...children: FigmaTree['document'][]): FigmaTree => ({
    document: { id: '0:1', name: 'Screen', type: 'FRAME', children },
    components: {
        '1:1': { key: 'K-ICON-BUTTON', name: '💙IconButton' },
        '1:3': { key: 'K-CHIP', name: '💙Chip' },
    },
});
const GRADED = '<IconButton size="lg" />  2:1\ntexts: 0';

type Handler = (init?: RequestInit) => Response | Promise<Response>;
const hang: Handler = (init) =>
    new Promise((_, reject) =>
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason)),
    );
const after =
    (ms: number, response: Response): Handler =>
    () =>
        new Promise((resolve) => setTimeout(() => resolve(response), ms));
const goorm = () => Response.json({ email: 'dev@goorm.io' });

function stubFigma(handlers: { me?: Handler; nodes?: Handler; post?: Handler } = {}) {
    const defaults = {
        me: goorm,
        nodes: () => Response.json({ nodes: { '0:1': frame(iconButton) } }),
        post: () => new Response(null, { status: 204 }),
    };
    const request = vi.fn((url: string, init?: RequestInit) => {
        const role = url === ME ? 'me' : url === ENDPOINT ? 'post' : 'nodes';
        return (handlers[role] ?? defaults[role])(init);
    });
    vi.stubGlobal('fetch', request);
    const calls = (to: string) => request.mock.calls.filter(([url]) => url === to);
    return {
        request,
        calls,
        posted: () => calls(ENDPOINT).map(([, init]) => JSON.parse(init?.body as string)),
    };
}

async function go(...args: string[]) {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const code = await main(args);
    return {
        code,
        stdout: log.mock.calls.map((c) => c.join(' ')).join('\n'),
        stderr: error.mock.calls.map((c) => c.join(' ')).join('\n'),
    };
}

describe('the usage record of figma-blueprint <figma URL>', () => {
    beforeEach(() => {
        vi.stubEnv('FIGMA_ACCESS_TOKEN', 'TOKEN');
        vi.stubEnv('DO_NOT_TRACK', '');
        process.chdir(app);
    });
    afterEach(() => {
        process.chdir(home);
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it('sends the design and the version after a run that grades cleanly', async () => {
        const figma = stubFigma();

        const run = await go(URL_WITH_NODE);

        expect(run).toEqual({ code: 0, stdout: GRADED, stderr: '' });
        expect(figma.posted()).toEqual([
            { fileKey: 'FILE', nodeId: '0:1', version, outcome: 'ok' },
        ]);
        expect(figma.calls(ME)).toEqual([
            [ME, expect.objectContaining({ headers: { 'X-Figma-Token': 'TOKEN' } })],
        ]);
        expect(figma.calls(ENDPOINT)[0][1]).toMatchObject({
            method: 'POST',
            headers: { 'content-type': 'application/json' },
        });
    });

    it('sends "unscorable" when the run exits 2', async () => {
        const figma = stubFigma({
            nodes: () => Response.json({ nodes: { '0:1': frame(iconButton, chip) } }),
        });

        const { code } = await go(URL_WITH_NODE);

        expect(code).toBe(2);
        expect(figma.posted()).toEqual([
            { fileKey: 'FILE', nodeId: '0:1', version, outcome: 'unscorable' },
        ]);
    });

    it('sends the stage and the Figma HTTP status when reading the frame fails', async () => {
        const figma = stubFigma({ nodes: () => new Response('Not found', { status: 404 }) });

        const { code, stderr } = await go(URL_WITH_NODE);

        expect(code).toBe(1);
        expect(stderr).toBe('figma-blueprint: GET files/FILE/nodes?ids=0%3A1: 404 Not found');
        expect(figma.posted()).toEqual([
            {
                fileKey: 'FILE',
                nodeId: '0:1',
                version,
                outcome: 'error',
                stage: 'fetch',
                status: 404,
            },
        ]);
    });

    it('sends an empty nodeId and no status for a URL without node-id', async () => {
        const figma = stubFigma();

        const { code } = await go('https://www.figma.com/design/FILE/Name');

        expect(code).toBe(1);
        expect(figma.posted()).toEqual([
            { fileKey: 'FILE', nodeId: '', version, outcome: 'error', stage: 'fetch' },
        ]);
        expect(Object.keys(figma.posted()[0])).not.toContain('status');
    });

    it('sends stage "catalog" when an installed package cannot be read', async () => {
        const broken = install();
        writeFileSync(
            join(broken, 'node_modules/@vapor-ui/core/figma-blueprint/tables.json'),
            'not json',
        );
        process.chdir(broken);
        const figma = stubFigma();

        const { code } = await go(URL_WITH_NODE);

        expect(code).toBe(1);
        expect(figma.posted()).toEqual([
            { fileKey: 'FILE', nodeId: '0:1', version, outcome: 'error', stage: 'catalog' },
        ]);
    });

    it('sends for an uppercase @GOORM.IO email', async () => {
        const figma = stubFigma({ me: () => Response.json({ email: 'Dev@GOORM.IO' }) });

        await go(URL_WITH_NODE);

        expect(figma.posted()).toHaveLength(1);
    });

    it.each([
        ['another domain', () => Response.json({ email: 'dev@example.com' })],
        ['a domain that only ends in goorm.io', () => Response.json({ email: 'dev@notgoorm.io' })],
        ['a subdomain of goorm.io', () => Response.json({ email: 'dev@goorm.io.example.com' })],
        ['no email in the answer', () => Response.json({})],
        ['a 403 for a token without current_user:read', () => new Response('{}', { status: 403 })],
        ['an answer that is not JSON', () => new Response('<html>')],
    ])('sends nothing for %s, and the run is the same', async (_, me) => {
        const figma = stubFigma({ me });

        expect(await go(URL_WITH_NODE)).toEqual({ code: 0, stdout: GRADED, stderr: '' });
        expect(figma.calls(ENDPOINT)).toEqual([]);
    });

    it.each(['1', 'true', 'TRUE'])(
        'sends nothing, and asks Figma nothing about the account, with DO_NOT_TRACK=%s',
        async (value) => {
            vi.stubEnv('DO_NOT_TRACK', value);
            const figma = stubFigma();

            expect(await go(URL_WITH_NODE)).toEqual({ code: 0, stdout: GRADED, stderr: '' });
            expect(figma.calls(ME)).toEqual([]);
            expect(figma.calls(ENDPOINT)).toEqual([]);
        },
    );

    it('sends nothing without a token, and exits 1 as before', async () => {
        vi.stubEnv('FIGMA_ACCESS_TOKEN', '');
        const figma = stubFigma();

        const { code, stderr } = await go(URL_WITH_NODE);

        expect(code).toBe(1);
        expect(stderr).toMatch(/FIGMA_ACCESS_TOKEN is not set/);
        expect(figma.request).not.toHaveBeenCalled();
    });

    it('sends nothing for a URL that has no file key', async () => {
        const figma = stubFigma();

        const { code } = await go('https://www.figma.com/');

        expect(code).toBe(1);
        expect(figma.calls(ME)).toEqual([]);
        expect(figma.calls(ENDPOINT)).toEqual([]);
    });

    it('sends nothing with --repo', async () => {
        const figma = stubFigma();

        expect(await go(URL_WITH_NODE, '--repo', repo)).toMatchObject({ code: 0 });
        expect(figma.calls(ME)).toEqual([]);
        expect(figma.calls(ENDPOINT)).toEqual([]);
    });

    it('sends nothing for a tree.json', async () => {
        const figma = stubFigma();
        const file = join(app, 'tree.json');
        writeFileSync(file, JSON.stringify(frame(iconButton)));

        expect(await go(file)).toEqual({ code: 0, stdout: GRADED, stderr: '' });
        expect(figma.request).not.toHaveBeenCalled();
    });

    it('leaves no request in flight when main resolves', async () => {
        const figma = stubFigma();

        await go(URL_WITH_NODE);

        const signals = [ME, ENDPOINT].flatMap((to) =>
            figma.calls(to).map(([, init]) => init?.signal),
        );
        expect(signals).toHaveLength(2);
        expect(signals.every((signal) => signal?.aborted)).toBe(true);
    });

    describe('when Figma or the endpoint does not answer', () => {
        it.each([
            ['the POST hangs', { post: hang }],
            ['/v1/me hangs', { me: hang }],
        ])(
            'resolves within the deadline with the same code and output when %s',
            async (_, handlers) => {
                stubFigma(handlers);
                const started = performance.now();

                const run = await go(URL_WITH_NODE);

                expect(run).toEqual({ code: 0, stdout: GRADED, stderr: '' });
                expect(performance.now() - started).toBeLessThan(2500);
            },
        );

        it('shares one deadline between /v1/me and the POST', async () => {
            const figma = stubFigma({ me: after(1200, goorm()), post: hang });
            const started = performance.now();

            await go(URL_WITH_NODE);

            expect(figma.calls(ENDPOINT)).toHaveLength(1);
            expect(performance.now() - started).toBeLessThan(2200);
        });

        it('resolves with the same code and output when the POST is refused', async () => {
            stubFigma({ post: () => Response.json({}, { status: 400 }) });

            expect(await go(URL_WITH_NODE)).toEqual({ code: 0, stdout: GRADED, stderr: '' });
        });

        it('resolves with the same code and output when the POST cannot connect', async () => {
            stubFigma({ post: () => Promise.reject(new TypeError('fetch failed')) });

            expect(await go(URL_WITH_NODE)).toEqual({ code: 0, stdout: GRADED, stderr: '' });
        });
    });
});
