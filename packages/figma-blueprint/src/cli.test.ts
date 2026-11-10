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
            version: 3,
            nodes: [
                { id: '2:1', tag: 'IconButton', props: ['size="lg"'], pkg: 'core', children: [] },
            ],
            excluded: [],
            unscorable: [],
            frames: [],
            texts: [],
            styles: 'no-variables-api',
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
                'styles: no-variables-api',
            ].join('\n'),
        );
    });

    const card = {
        id: '3:1',
        name: 'Card',
        type: 'FRAME',
        layoutPositioning: 'ABSOLUTE',
        boundVariables: { fills: [{ type: 'VARIABLE_ALIAS' as const, id: 'VariableID:k1/9:1' }] },
        children: [{ id: '3:2', name: 'Title', type: 'TEXT', characters: 'Hi' }],
    };

    it('names tokens from a saved variables response and prints the frames flat', async () => {
        const variables = join(dir, 'variables.json');
        writeFileSync(
            variables,
            JSON.stringify({
                status: 200,
                error: false,
                meta: {
                    variables: {
                        'VariableID:k1/9:1': { key: 'k1', name: 'background/canvas/canvas' },
                    },
                },
            }),
        );

        const { code, stdout } = await run('frames', [card], '--variables', variables);

        expect(code).toBe(0);
        expect(stdout).toBe(
            ['frames:', '  Card (3:1)  absolute  fills=background/canvas/canvas', 'texts: 0'].join(
                '\n',
            ),
        );
    });

    it('keeps variable ids and says so without a variables response, still exiting 0', async () => {
        const { code, stdout } = await run('raw', [card]);

        expect(code).toBe(0);
        expect(stdout).toBe(
            [
                'frames:',
                '  Card (3:1)  absolute  fills=VariableID:k1/9:1',
                'texts: 0',
                'styles: no-variables-api',
            ].join('\n'),
        );
    });

    it('falls back to variable ids when the variables API refuses a URL source', async () => {
        const nodes = { document: { id: '0:1', name: 'Screen', type: 'FRAME', children: [card] } };
        vi.stubGlobal(
            'fetch',
            vi.fn(async (url: string) =>
                url.endsWith('/variables/local')
                    ? new Response('{"status":403,"error":true}', { status: 403 })
                    : Response.json({ nodes: { '0:1': nodes } }),
            ),
        );
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});

        const code = await main([
            'https://www.figma.com/design/FILE/Name?node-id=0-1',
            '--repo',
            repo,
            '--json',
        ]);

        expect(code).toBe(0);
        expect(error).toHaveBeenCalledWith(expect.stringContaining('403'));
        const result = JSON.parse(log.mock.calls.map((c) => c.join(' ')).join('\n'));
        expect(result.styles).toBe('no-variables-api');
        expect(result.frames[0].tokens).toEqual({ fills: 'VariableID:k1/9:1' });
    });

    it('exits 1 with a message when the tree cannot be read', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(await main([join(dir, 'missing.json'), '--repo', repo])).toBe(1);
        expect(error).toHaveBeenCalledWith(expect.stringMatching(/^figma-blueprint: /));
    });
});
