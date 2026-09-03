import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { main, relativeImport, resolvePackageImportPath } from './cli';

const fixture = fileURLToPath(new URL('./fixtures/dialog.mcp.json', import.meta.url));
const url = 'https://www.figma.com/design/he4tiAGOKGPl0Fm56ZpJsy/X?node-id=2337-38499&m=dev';

let cwd: string;
const io = () => ({ cwd, log: vi.fn(), warn: vi.fn(), error: vi.fn(), env: {} });

/** 소비 패키지 루트 흉내: package.json + figma.config.json + dialog/index.parts.ts + .prettierrc */
function scaffoldConsumer(opts: { figmaConfig?: boolean } = { figmaConfig: true }) {
    writeFileSync(
        path.join(cwd, '.prettierrc'),
        JSON.stringify({ singleQuote: true, tabWidth: 4, printWidth: 100 }),
    );
    writeFileSync(path.join(cwd, 'package.json'), JSON.stringify({ name: '@scope/pkg' }));
    if (opts.figmaConfig) {
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

describe('main', () => {
    it('--from-json 으로 기본 경로에 파일을 만든다', async () => {
        scaffoldConsumer();
        const o = io();
        const code = await main([url, '--from-json', fixture], o);

        expect(code).toBe(0);
        const out = path.join(cwd, 'src/components/dialog/dialog.figma.ts');
        expect(existsSync(out)).toBe(true);
        const text = readFileSync(out, 'utf8');
        expect(text).toContain("import { getProperties } from '../../utils/figma-utils';");
        expect(text).toContain("getProperties(instance, '(Popup)'");
        expect(text).toContain('<Dialog.Root');
        expect(text).toContain('import { Dialog } from "@vapor-ui/composites"');
        expect(o.log).toHaveBeenCalledWith(expect.stringContaining('dialog.figma.ts'));
    });

    it('--out 깊이가 다르면 utils 상대 경로가 바뀌고, 디렉터리는 자동 생성된다', async () => {
        scaffoldConsumer();
        const code = await main(
            [url, '--from-json', fixture, '--out', 'src/deep/er/x.figma.ts'],
            io(),
        );
        expect(code).toBe(0);
        const text = readFileSync(path.join(cwd, 'src/deep/er/x.figma.ts'), 'utf8');
        expect(text).toContain("from '../../utils/figma-utils';");
    });

    it('--utils 로 유틸 위치를 바꿀 수 있다', async () => {
        scaffoldConsumer();
        const code = await main(
            [url, '--from-json', fixture, '--utils', 'src/figma/helpers'],
            io(),
        );
        expect(code).toBe(0);
        const text = readFileSync(path.join(cwd, 'src/components/dialog/dialog.figma.ts'), 'utf8');
        expect(text).toContain("from '../../figma/helpers';");
    });

    it('--out 이 cwd 밖이면 utils import 는 기본 출력 위치 기준이고 Prettier 설정은 cwd 에서 읽는다', async () => {
        scaffoldConsumer();
        const outside = mkdtempSync(path.join(os.tmpdir(), 'extract-code-connect-out-'));
        try {
            const o = io();
            const out = path.join(outside, 'x.figma.ts');
            expect(await main([url, '--from-json', fixture, '--out', out], o)).toBe(0);
            const text = readFileSync(out, 'utf8');
            expect(text).toContain("import { getProperties } from '../../utils/figma-utils';");
            expect(o.warn).toHaveBeenCalledWith(expect.stringContaining('outside'));
        } finally {
            rmSync(outside, { recursive: true, force: true });
        }
    });

    it('figma.config.json 이 없으면 package.json name 을 imports 에 쓴다', async () => {
        scaffoldConsumer({ figmaConfig: false });
        await main([url, '--from-json', fixture], io());
        const text = readFileSync(path.join(cwd, 'src/components/dialog/dialog.figma.ts'), 'utf8');
        expect(text).toContain('import { Dialog } from "@scope/pkg"');
    });

    it('기존 파일은 --force 없이 덮어쓰지 않는다', async () => {
        scaffoldConsumer();
        const out = path.join(cwd, 'src/components/dialog/dialog.figma.ts');
        writeFileSync(out, 'KEEP');
        const o = io();

        expect(await main([url, '--from-json', fixture], o)).toBe(1);
        expect(readFileSync(out, 'utf8')).toBe('KEEP');
        expect(o.error).toHaveBeenCalledWith(expect.stringContaining('--force'));

        expect(await main([url, '--from-json', fixture, '--force'], io())).toBe(0);
        expect(readFileSync(out, 'utf8')).not.toBe('KEEP');
    });

    it('인자 없음 → usage + 1, --help → usage + 0', async () => {
        const a = io();
        expect(await main([], a)).toBe(1);
        expect(a.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));

        const b = io();
        expect(await main(['--help'], b)).toBe(0);
        expect(b.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
    });

    it('REST 경로인데 FIGMA_TOKEN 이 없으면 error + 1', async () => {
        scaffoldConsumer();
        const o = io();
        expect(await main([url], o)).toBe(1);
        expect(o.error).toHaveBeenCalledWith(expect.stringContaining('FIGMA_TOKEN'));
    });

    it('.env 의 FIGMA_TOKEN 을 읽는다 (fetch 는 실패하도록 스텁)', async () => {
        scaffoldConsumer();
        writeFileSync(path.join(cwd, '.env'), 'FIGMA_TOKEN=test-token\n');
        const fetchSpy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValue(new Response('nope', { status: 403, statusText: 'Forbidden' }));
        const o = io();

        expect(await main([url], o)).toBe(1);
        expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('/v1/files/he4tiAGOKGPl0Fm56ZpJsy/nodes?ids=2337%3A38499'),
            expect.objectContaining({ headers: { 'X-FIGMA-TOKEN': 'test-token' } }),
        );
        expect(o.error).toHaveBeenCalledWith(expect.stringContaining('403'));
        fetchSpy.mockRestore();
    });
});
