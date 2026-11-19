import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { type VaporRolldownOptions, vaporRolldownPlugin } from './rolldown';

// rolldown 은 tsdown 을 통해 설치돼 있다 (이 패키지의 직접 의존성이 아니다).
const fromTsdown = createRequire(createRequire(import.meta.url).resolve('tsdown/package.json'));

interface OutputItem {
    type: string;
    fileName: string;
    code?: string;
    source?: string | Uint8Array;
}

/** 실제 rolldown 으로 라이브러리를 빌드하고 출력 파일을 돌려준다. */
async function buildLib(
    files: Record<string, string>,
    opts: VaporRolldownOptions,
    output: { format: 'esm' | 'cjs'; minify?: boolean },
) {
    const { rolldown } = (await import(fromTsdown.resolve('rolldown'))) as {
        rolldown: (o: object) => Promise<{
            generate: (o: object) => Promise<{ output: OutputItem[] }>;
        }>;
    };
    const root = realpathSync(mkdtempSync(join(tmpdir(), 'vapor-rd-')));
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@acme/ui' }));
    for (const [p, s] of Object.entries(files)) {
        mkdirSync(dirname(join(root, p)), { recursive: true });
        writeFileSync(join(root, p), s);
    }
    const bundle = await rolldown({
        input: { index: join(root, 'src/index.ts') },
        cwd: root,
        external: [/^@vapor-ui\//],
        plugins: [vaporRolldownPlugin({ root, hash: true, ...opts })],
    });
    const { output: out } = await bundle.generate({
        ...output,
        preserveModules: true,
        preserveModulesRoot: join(root, 'src'),
    });
    return {
        js: out.filter((o) => o.type === 'chunk').map((o) => o.code!),
        css: out.filter((o) => o.fileName.endsWith('.css')).map((o) => String(o.source)),
    };
}

const files = {
    'src/a.ts': `import { css } from '@vapor-ui/style-macro';\nexport const a = css({ gap: '1px' });\n`,
    'src/index.ts': `import { css } from '@vapor-ui/style-macro';\nimport { a } from './a';\nexport const b = css({ gap: '2px' }) + a;\n`,
};

describe('rolldown extract — no per-module CSS reference is left in the output', () => {
    it.each([
        ['esm', false],
        ['esm', true],
        ['cjs', false],
        ['cjs', true],
    ] as const)('%s, minify=%s', async (format, minify) => {
        const { js, css } = await buildLib(files, { extract: true }, { format, minify });
        expect(js.join('\n')).not.toMatch(/vapor\.css/);
        expect(css).toHaveLength(1);
        expect(css[0]).toMatch(/gap: 1px[\s\S]*gap: 2px/);
    });

    it('without extract, each module still imports its own CSS (minified too)', async () => {
        const { js } = await buildLib(files, {}, { format: 'esm', minify: true });
        expect(js.join('\n')).toMatch(/\.vapor[^"']*\.css/);
    });
});
