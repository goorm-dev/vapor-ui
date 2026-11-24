import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const NAME = '@vapor-ui/style-macro';

/** README "Entry points" 표의 subpath (`.`, `./vite`, …). */
function readmeSubpaths(): string[] {
    const readme = readFileSync(join(pkgRoot, 'README.md'), 'utf8');
    const section = readme.split(/^## Entry points\s*$/m)[1]!.split(/^## /m)[0]!;
    return [...section.matchAll(/^\|\s*`(@vapor-ui\/style-macro[^`]*)`\s*\|/gm)].map(([, spec]) =>
        spec === NAME ? '.' : `.${spec!.slice(NAME.length)}`,
    );
}

describe('public surface', () => {
    it('package.json exports = README entry points + module.vapor.css + package.json', () => {
        const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as {
            exports: Record<string, unknown>;
        };
        const subpaths = readmeSubpaths();
        expect(subpaths).toContain('.');
        expect(Object.keys(pkg.exports).sort()).toEqual(
            [...subpaths, './module.vapor.css', './package.json'].sort(),
        );
    });

    it.each([
        ['index', () => import('./index'), ['buildColorSchemeScript', 'css']],
        ['vite', () => import('./plugins/vite'), ['vaporVitePlugin']],
        ['webpack', () => import('./plugins/webpack'), ['vaporWebpackPlugin']],
        ['next', () => import('./plugins/next'), ['vaporNextPlugin']],
        ['rolldown', () => import('./plugins/rolldown'), ['vaporRolldownPlugin']],
        ['turbopack', () => import('./plugins/turbopack'), ['default']],
        ['css-loader', () => import('./plugins/css-loader'), ['default']],
    ] as const)('%s exports only its allowlist', async (_, load, allowed) => {
        expect(Object.keys(await load()).sort()).toEqual([...allowed].sort());
    });
});
