/**
 * 같은 레이어 교차 모듈 CSS 순서 회귀 테스트 (제안서 5.6.1 케이스 1~3).
 *
 * 라이브러리(`lib/header`)는 배포 형태대로 자기 CSS 를 import 하고, 앱은 `css()` 로 같은 속성을
 * override 한다. Vite production 빌드 결과에서 CSSOM 순서(`index.html` 의 `<link>` → 지연 청크
 * CSS)와 cascade layer 순서로 승자를 계산한다. 선택자 명시도는 모두 같다.
 *
 * - 케이스 1: 플러그인이 모듈 CSS import 를 마지막 import 뒤에 넣으므로 같은 레이어여도 앱이 이긴다.
 * - 케이스 2·3: import 그래프로는 순서를 보장할 수 없다(같은 레이어면 라이브러리가 이김).
 *   라이브러리를 앞선 레이어(`composites`)에 두고 앱 CSS 진입점이 레이어 순서를 먼저 선언하면
 *   로드 순서와 무관하게 앱이 이긴다.
 */
import {
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    realpathSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import postcss from 'postcss';
import { build } from 'vite';

import { vaporVitePlugin } from './vite';

const LAYER_ORDER =
    '@layer vapor-theme, vapor-reset, vapor-components, composites, vapor-utilities;\n';
const APP_GAP = '16px';
const LIB_GAP = '8px';

type Files = Record<string, string>;

function libFiles(layer: string): Files {
    return {
        'node_modules/lib/package.json': JSON.stringify({
            name: 'lib',
            type: 'module',
            sideEffects: ['**/*.css'],
            exports: { './*': './dist/*/index.js' },
        }),
        'node_modules/lib/dist/header/header.css': `@layer ${layer} { .Header_x7Kq2a { gap: ${LIB_GAP}; } }\n`,
        'node_modules/lib/dist/header/index.js': `import './header.css';\nexport const Header = (cls = '') => 'Header_x7Kq2a ' + cls;\n`,
    };
}

const OVERRIDES = `import { css } from '@vapor-ui/style-macro';\nexport const headerGap = css({ gap: '${APP_GAP}' });\n`;

const CASES: Record<string, Files> = {
    // 1. override 와 컴포넌트를 같은 모듈에서. css import 문을 lib import 보다 위에 둬도 된다.
    'same-module': {
        'page.tsx': `import { css } from '@vapor-ui/style-macro';\nimport { Header } from 'lib/header';\nexport const render = () => Header(css({ gap: '${APP_GAP}' }));\n`,
        'main.ts': `import './main.css';\nimport { render } from './page.tsx';\ndocument.body.className = render();\n`,
    },
    // 2. override 를 컴포넌트보다 먼저 import 되는 공용 styles 모듈에.
    'styles-module-first': {
        'overrides.tsx': OVERRIDES,
        'page.tsx': `import { headerGap } from './overrides.tsx';\nimport { Header } from 'lib/header';\nexport const render = () => Header(headerGap);\n`,
        'main.ts': `import './main.css';\nimport { render } from './page.tsx';\ndocument.body.className = render();\n`,
    },
    // 3. override 는 entry 청크, 라이브러리 컴포넌트는 지연 로딩 라우트에서만.
    'lazy-route': {
        'overrides.tsx': OVERRIDES,
        'layout.tsx': `import { headerGap } from './overrides.tsx';\nexport const layout = () => headerGap;\n`,
        'settings.tsx': `import { headerGap } from './overrides.tsx';\nimport { Header } from 'lib/header';\nexport const render = () => Header(headerGap);\n`,
        'main.ts': `import './main.css';\nimport { layout } from './layout.tsx';\ndocument.title = layout();\nimport('./settings.tsx').then((m) => { document.body.className = m.render(); });\n`,
    },
};

async function buildCase(files: Files): Promise<string[]> {
    const root = realpathSync(mkdtempSync(join(tmpdir(), 'vapor-order-')));
    const all: Files = {
        'package.json': JSON.stringify({ name: 'app', type: 'module' }),
        'index.html':
            '<!doctype html><html><head></head><body><script type="module" src="./main.ts"></script></body></html>',
        'main.css': LAYER_ORDER,
        ...files,
    };
    for (const [p, s] of Object.entries(all)) {
        mkdirSync(dirname(join(root, p)), { recursive: true });
        writeFileSync(join(root, p), s);
    }
    const outDir = join(root, 'dist');
    await build({
        root,
        configFile: false,
        logLevel: 'silent',
        plugins: [vaporVitePlugin({ hash: true, injectColorScheme: false })],
        build: { outDir, minify: false, modulePreload: { polyfill: false } },
    });

    // CSSOM 순서: index.html 의 <link> 가 먼저, 지연 청크 CSS 는 나중에 <head> 끝에 붙는다.
    const html = readFileSync(join(outDir, 'index.html'), 'utf8');
    const linked = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\/([^"]+)"/g)].map(
        (m) => m[1]!,
    );
    const lazy = readdirSync(join(outDir, 'assets'))
        .filter((f) => f.endsWith('.css'))
        .map((f) => `assets/${f}`)
        .filter((f) => !linked.includes(f));
    return [...linked, ...lazy].map((f) => readFileSync(join(outDir, f), 'utf8'));
}

/**
 * 같은 명시도의 `gap` 선언 중 이기는 값. 레이어 순서(첫 등장 순)가 먼저, 같은 레이어면 나중 선언.
 * 레이어 밖 선언은 모든 레이어를 이기지만 이 테스트에는 없다.
 */
function winningGap(sheets: string[]): string {
    const layers: string[] = [];
    const register = (name: string) => {
        if (!layers.includes(name)) layers.push(name);
    };
    const decls: Array<{ layer: string; value: string }> = [];
    for (const sheet of sheets) {
        postcss.parse(sheet).walk((node) => {
            if (node.type === 'atrule' && node.name === 'layer') {
                for (const name of node.params.split(',')) register(name.trim());
            }
            if (node.type === 'decl' && node.prop === 'gap') {
                const layer = node.parent?.parent;
                if (layer?.type !== 'atrule') throw new Error('unlayered gap declaration');
                decls.push({ layer: (layer as postcss.AtRule).params, value: node.value });
            }
        });
    }
    expect(decls).toHaveLength(2);
    const rank = (d: (typeof decls)[number]) => [layers.indexOf(d.layer), decls.indexOf(d)];
    return decls.reduce((win, d) => {
        const [lw, pw] = rank(win);
        const [ld, pd] = rank(d);
        return ld! > lw! || (ld === lw && pd! > pw!) ? d : win;
    }).value;
}

describe('vite adapter — cross-module CSS order (proposal 5.6.1)', () => {
    it('case 1: same layer, app override in the component module wins', async () => {
        const sheets = await buildCase({ ...libFiles('vapor-utilities'), ...CASES['same-module'] });
        expect(winningGap(sheets)).toBe(APP_GAP);
    });

    it.each(['styles-module-first', 'lazy-route'])(
        'case %s: same layer flips (import order contract), library layer fixes it',
        async (name) => {
            const sameLayer = await buildCase({ ...libFiles('vapor-utilities'), ...CASES[name] });
            expect(winningGap(sameLayer)).toBe(LIB_GAP);

            const layered = await buildCase({ ...libFiles('composites'), ...CASES[name] });
            expect(winningGap(layered)).toBe(APP_GAP);
        },
    );
});
