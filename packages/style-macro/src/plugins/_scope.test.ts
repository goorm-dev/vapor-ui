import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { scopeOf } from './_options';

function workspace() {
    const root = mkdtempSync(join(tmpdir(), 'vapor-scope-'));
    const pkg = join(root, 'packages', 'ui');
    mkdirSync(join(pkg, 'src', 'button'), { recursive: true });
    writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: '@acme/ui' }));
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'repo-root' }));
    mkdirSync(join(root, 'loose'), { recursive: true });
    return { root, pkg };
}

describe('scopeOf', () => {
    it('uses the nearest package name + path relative to that package', () => {
        const { root, pkg } = workspace();
        expect(scopeOf(root, join(pkg, 'src', 'button', 'button.tsx'))).toBe(
            '@acme/ui/src/button/button.tsx',
        );
    });

    it('is independent of the bundler root', () => {
        const { root, pkg } = workspace();
        const file = join(pkg, 'src', 'button', 'button.tsx');
        expect(scopeOf(root, file)).toBe(scopeOf(join(root, 'apps', 'web'), file));
    });

    it('strips a query string', () => {
        const { root, pkg } = workspace();
        expect(scopeOf(root, `${join(pkg, 'src', 'a.tsx')}?vapor-css`)).toBe('@acme/ui/src/a.tsx');
    });

    it('falls back to a root-relative path when no package.json has a name', () => {
        const root = mkdtempSync(join(tmpdir(), 'vapor-scope-noname-'));
        writeFileSync(join(root, 'package.json'), JSON.stringify({ private: true }));
        expect(scopeOf(root, join(root, 'src', 'a.tsx'))).toBe('src/a.tsx');
    });
});
