import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import type { FigmaTree } from '~/blueprint/blueprint';

import { main } from './cli';

const repo = fileURLToPath(new URL('./__fixtures__/repo', import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'figma-blueprint-cli-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const components = {
    '1:1': { key: 'K-ICON-BUTTON', name: '💙IconButton' },
    '1:2': { key: 'K-HEART', name: '❤️HeartIcon' },
    '1:3': { key: 'K-CHIP', name: '💙Chip' },
};
const iconButton = {
    id: '2:1',
    name: 'IconButton',
    type: 'INSTANCE',
    componentId: '1:1',
    componentProperties: { Size: { value: 'Lg' } },
};

async function run(name: string, children: FigmaTree['document'][], ...flags: string[]) {
    const file = join(dir, `${name}.json`);
    const tree: FigmaTree = {
        document: { id: '0:1', name: 'Screen', type: 'FRAME', children },
        components,
    };
    writeFileSync(file, JSON.stringify(tree));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const code = await main([file, '--repo', repo, ...flags]);
    return { code, stdout: log.mock.calls.map((c) => c.join(' ')).join('\n') };
}

describe('figma-blueprint <tree>', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('prints the Blueprint object with --json and exits 0', async () => {
        const { code, stdout } = await run('json', [iconButton], '--json');

        expect(code).toBe(0);
        expect(JSON.parse(stdout)).toEqual({
            version: 4,
            nodes: [
                { id: '2:1', tag: 'IconButton', props: ['size="lg"'], pkg: 'core', children: [] },
            ],
            excluded: [],
            unscorable: [],
            texts: [],
        });
    });

    it('prints one node per line, nested by indent, and exits 2 when an instance is unscorable', async () => {
        const { code, stdout } = await run('text', [
            {
                ...iconButton,
                children: [
                    {
                        id: '2:2',
                        name: 'Slot',
                        type: 'SLOT',
                        children: [
                            { id: '2:3', name: 'Heart', type: 'INSTANCE', componentId: '1:2' },
                        ],
                    },
                ],
            },
            { id: '2:4', name: 'Chip', type: 'INSTANCE', componentId: '1:3' },
        ]);

        expect(code).toBe(2);
        expect(stdout).toBe(
            [
                '<IconButton size="lg" />  2:1',
                '  <HeartIcon />  2:3  (any parent)',
                'unscorable:',
                '  💙Chip (2:4): no-template',
                'texts: 0',
            ].join('\n'),
        );
    });

    it('reads a URL source with the one nodes request, no variables API', async () => {
        const tree: FigmaTree = {
            document: { id: '0:1', name: 'Screen', type: 'FRAME', children: [iconButton] },
            components,
        };
        const request = vi.fn(async () => Response.json({ nodes: { '0:1': tree } }));
        vi.stubGlobal('fetch', request);
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});

        const code = await main([
            'https://www.figma.com/design/FILE/Name?node-id=0-1',
            '--repo',
            repo,
            '--json',
        ]);

        expect(code).toBe(0);
        expect(request).toHaveBeenCalledTimes(1);
        expect(request).toHaveBeenCalledWith(
            'https://api.figma.com/v1/files/FILE/nodes?ids=0%3A1',
            expect.anything(),
        );
        expect(JSON.parse(log.mock.calls.map((c) => c.join(' ')).join('\n'))).toEqual({
            version: 4,
            nodes: [
                { id: '2:1', tag: 'IconButton', props: ['size="lg"'], pkg: 'core', children: [] },
            ],
            excluded: [],
            unscorable: [],
            texts: [],
        });
    });

    it('exits 1 with a message when the tree cannot be read', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(await main([join(dir, 'missing.json'), '--repo', repo])).toBe(1);
        expect(error).toHaveBeenCalledWith(expect.stringMatching(/^figma-blueprint: /));
    });
});
