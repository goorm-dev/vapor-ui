import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generate, relativeImport, resolvePackageImportPath } from './generate';
import type { GenerateOptions } from './generate';

const fixture = fileURLToPath(new URL('./fixtures/dialog.mcp.json', import.meta.url));
const url = 'https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/X?node-id=2337-38499&m=dev';

let cwd: string;
const ctx = () => ({ cwd, log: vi.fn(), warn: vi.fn(), error: vi.fn(), env: {} });
const opts = (o: Partial<GenerateOptions> = {}): GenerateOptions => ({
    url,
    fromJson: fixture,
    utils: 'src/utils/figma-utils',
    force: false,
    ...o,
});

/** 소비 패키지 루트 흉내: package.json + figma.config.json + dialog/index.parts.ts + .prettierrc */
function scaffoldConsumer(o: { figmaConfig?: boolean } = { figmaConfig: true }) {
    writeFileSync(
        path.join(cwd, '.prettierrc'),
        JSON.stringify({ singleQuote: true, tabWidth: 4, printWidth: 100 }),
    );
    writeFileSync(path.join(cwd, 'package.json'), JSON.stringify({ name: '@scope/pkg' }));
    if (o.figmaConfig) {
        writeFileSync(
            path.join(cwd, 'figma.config.json'),
            JSON.stringify({ codeConnect: {}, packageImportPath: '@vapor-ui/composites' }),
        );
    }
    mkdirSync(path.join(cwd, 'src/components/dialog'), { recursive: true });
    writeFileSync(path.join(cwd, 'src/components/dialog/index.parts.ts'), '');
}

beforeEach(() => {
    cwd = mkdtempSync(path.join(os.tmpdir(), 'extract-code-connect-'));
});
afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
});

describe('relativeImport', () => {
    it('출력 파일 기준 상대 경로, 확장자 없음, ./ 또는 ../ 접두', () => {
        expect(
            relativeImport('/p/src/components/dialog/dialog.figma.ts', '/p/src/utils/figma-utils'),
        ).toBe('../../utils/figma-utils');
        expect(relativeImport('/p/src/a.figma.ts', '/p/src/figma-utils')).toBe('./figma-utils');
        expect(relativeImport('/p/src/a.figma.ts', '/p/src/utils/figma-utils.ts')).toBe(
            './utils/figma-utils',
        );
    });
});

describe('resolvePackageImportPath', () => {
    it('figma.config.json 의 packageImportPath 를 우선한다', () => {
        scaffoldConsumer();
        expect(resolvePackageImportPath(cwd)).toBe('@vapor-ui/composites');
    });

    it('figma.config.json 이 없으면 package.json name', () => {
        scaffoldConsumer({ figmaConfig: false });
        expect(resolvePackageImportPath(cwd)).toBe('@scope/pkg');
    });

    it('둘 다 없으면 에러', () => {
        expect(() => resolvePackageImportPath(cwd)).toThrow(/package name/i);
    });
});

describe('generate', () => {
    it('--from-json 으로 기본 경로에 파일을 만든다', async () => {
        scaffoldConsumer();
        const c = ctx();
        await generate(opts(), c);

        const out = path.join(cwd, 'src/components/dialog/dialog.figma.ts');
        expect(existsSync(out)).toBe(true);
        const text = readFileSync(out, 'utf8');
        expect(text).toContain("import { getProperties } from '../../utils/figma-utils';");
        expect(text).toContain("getProperties(instance, '(Popup)'");
        expect(text).toContain('<Dialog.Root');
        expect(text).toContain('import { Dialog } from "@vapor-ui/composites"');
        expect(c.log).toHaveBeenCalledWith(expect.stringContaining('dialog.figma.ts'));
    });

    it('--out 깊이가 다르면 utils 상대 경로가 바뀌고, 디렉터리는 자동 생성된다', async () => {
        scaffoldConsumer();
        await generate(opts({ out: 'src/deep/er/x.figma.ts' }), ctx());
        const text = readFileSync(path.join(cwd, 'src/deep/er/x.figma.ts'), 'utf8');
        expect(text).toContain("from '../../utils/figma-utils';");
    });

    it('--utils 로 유틸 위치를 바꿀 수 있다', async () => {
        scaffoldConsumer();
        await generate(opts({ utils: 'src/figma/helpers' }), ctx());
        const text = readFileSync(path.join(cwd, 'src/components/dialog/dialog.figma.ts'), 'utf8');
        expect(text).toContain("from '../../figma/helpers';");
    });

    it('--out 이 cwd 밖이면 utils import 는 기본 출력 위치 기준이고 Prettier 설정은 cwd 에서 읽는다', async () => {
        scaffoldConsumer();
        const outside = mkdtempSync(path.join(os.tmpdir(), 'extract-code-connect-out-'));
        try {
            const c = ctx();
            const out = path.join(outside, 'x.figma.ts');
            await generate(opts({ out }), c);
            const text = readFileSync(out, 'utf8');
            expect(text).toContain("import { getProperties } from '../../utils/figma-utils';");
            expect(c.warn).toHaveBeenCalledWith(expect.stringContaining('outside'));
        } finally {
            rmSync(outside, { recursive: true, force: true });
        }
    });

    it('figma.config.json 이 없으면 package.json name 을 imports 에 쓴다', async () => {
        scaffoldConsumer({ figmaConfig: false });
        await generate(opts(), ctx());
        const text = readFileSync(path.join(cwd, 'src/components/dialog/dialog.figma.ts'), 'utf8');
        expect(text).toContain('import { Dialog } from "@scope/pkg"');
    });

    it('기존 파일은 --force 없이 덮어쓰지 않는다', async () => {
        scaffoldConsumer();
        const out = path.join(cwd, 'src/components/dialog/dialog.figma.ts');
        writeFileSync(out, 'KEEP');

        await expect(generate(opts(), ctx())).rejects.toThrow(/--force/);
        expect(readFileSync(out, 'utf8')).toBe('KEEP');

        await generate(opts({ force: true }), ctx());
        expect(readFileSync(out, 'utf8')).not.toBe('KEEP');
    });

    it('REST 경로인데 FIGMA_TOKEN 이 없으면 에러', async () => {
        scaffoldConsumer();
        await expect(generate(opts({ fromJson: undefined }), ctx())).rejects.toThrow(/FIGMA_TOKEN/);
    });

    it('.env 의 FIGMA_TOKEN 을 읽는다 (fetch 는 실패하도록 스텁)', async () => {
        scaffoldConsumer();
        writeFileSync(path.join(cwd, '.env'), 'FIGMA_TOKEN=test-token\n');
        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValue(new Response('nope', { status: 403, statusText: 'Forbidden' }));

        await expect(generate(opts({ fromJson: undefined }), ctx())).rejects.toThrow(/403/);
        expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('/v1/files/he4tiAGOKGPl0Fm56ZpJsy/nodes?ids=2337%3A38499'),
            expect.objectContaining({ headers: { 'X-FIGMA-TOKEN': 'test-token' } }),
        );
        fetchSpy.mockRestore();
    });
});
