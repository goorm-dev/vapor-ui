import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { blueprint } from '~/blueprint/blueprint';
import type { BlueprintNode, FigmaTree } from '~/blueprint/blueprint';
import type { Pkg } from '~/entries/entries-file';
import { buildPackage } from '~/ship/ship';
import { extractTables } from '~/ship/tables';

import { fromInstalled } from './catalog';

const root = fileURLToPath(new URL('../__fixtures__/repo', import.meta.url));

const apps: string[] = [];
afterAll(() => {
    for (const app of apps) rmSync(app, { recursive: true, force: true });
});

// An app with the fixture packages installed the way a consumer gets them: figma-blueprint/ from
// `figma-blueprint ship`, next to a package.json that exports it.
function install(pkgs: Pkg[]) {
    const app = mkdtempSync(join(tmpdir(), 'figma-blueprint-app-'));
    apps.push(app);
    for (const pkg of pkgs) {
        const dir = join(app, 'node_modules/@vapor-ui', pkg);
        buildPackage(join(root, 'packages', pkg), join(dir, 'figma-blueprint'));
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

const shipped = (app: string, pkg: Pkg, file: string) =>
    readFileSync(join(app, 'node_modules/@vapor-ui', pkg, 'figma-blueprint', file), 'utf8');

const tree: FigmaTree = {
    document: {
        id: '0:1',
        name: 'Screen',
        type: 'FRAME',
        children: [
            {
                id: '2:1',
                name: 'IconButton',
                type: 'INSTANCE',
                componentId: '1:1',
                componentProperties: { Size: { value: 'Lg' } },
            },
            { id: '2:2', name: 'HeartIcon', type: 'INSTANCE', componentId: '1:2' },
        ],
    },
    components: {
        '1:1': { key: 'K-ICON-BUTTON', name: '💙IconButton' },
        '1:2': { key: 'K-HEART', name: '❤️HeartIcon' },
    },
};

const treeNodes: BlueprintNode[] = [
    { id: '2:1', tag: 'IconButton', props: ['size="lg"'], pkg: 'core', children: [] },
    { id: '2:2', tag: 'HeartIcon', props: [], pkg: 'icons', children: [] },
];

describe('figma-blueprint ship', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('compiles templates and their helpers to JS that reads the figma mock, not a figma module', async () => {
        const app = install(['core', 'composites', 'icons']);
        const template = shipped(
            app,
            'core',
            'templates/src/components/icon-button/icon-button.figma.mjs',
        );
        const helper = shipped(app, 'core', 'templates/src/utils/figma.mjs');

        for (const js of [template, helper]) expect(js).not.toMatch(/from\s+['"]figma['"]/);
        expect(template).toContain(`from '../../utils/figma.mjs'`);
        expect(blueprint(tree, await fromInstalled(app)).nodes).toEqual(treeNodes);
    });

    it("ships each package's own share of the tables, which together are what fromRepo extracts", () => {
        const app = install(['core', 'composites', 'icons']);
        const tables = (pkg: Pkg) => JSON.parse(shipped(app, pkg, 'tables.json'));

        expect(Object.keys(tables('core')).sort()).toEqual([
            'defaults',
            'entries',
            'internalIcons',
        ]);
        expect(Object.keys(tables('composites')).sort()).toEqual([
            'entries',
            'internalParts',
            'presets',
        ]);
        expect(Object.keys(tables('icons'))).toEqual(['entries']);
        expect(tables('icons').entries['K-HEART'].template).toBe('src/icon.figma.batch.ts');

        const { entries: _core, ...core } = tables('core');
        const { entries: _composites, ...composites } = tables('composites');
        expect({ ...core, ...composites }).toEqual(extractTables(root));
    });

    it('rewrites figma-blueprint/ from scratch, to the same bytes', () => {
        const app = install(['core']);
        const out = join(app, 'node_modules/@vapor-ui/core/figma-blueprint');
        const files = () =>
            readdirSync(out, { recursive: true, encoding: 'utf8' })
                .filter((f) => /\.(mjs|json)$/.test(f))
                .sort()
                .map((f) => [f, readFileSync(join(out, f), 'utf8')]);
        const before = files();
        writeFileSync(join(out, 'templates/stale.mjs'), '');

        buildPackage(join(root, 'packages/core'), out);

        expect(files()).toEqual(before);
    });

    it('reads the packages a directory relative to the working directory resolves', async () => {
        const app = install(['core', 'composites', 'icons']);

        const catalog = await fromInstalled(relative(process.cwd(), app));

        expect(blueprint(tree, catalog).nodes).toEqual(treeNodes);
    });

    it('leaves out a package that is not installed and names it on stderr', async () => {
        const app = install(['core', 'icons']);
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        const catalog = await fromInstalled(app);

        expect(error).toHaveBeenCalledWith(
            '@vapor-ui/composites is not installed, its components are left out',
        );
        expect(catalog.tables.internalParts).toEqual({});
        expect(blueprint(tree, catalog).nodes).toEqual(treeNodes);
    });
});
