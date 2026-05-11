import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CliError } from '~/cli/input';
import { resolveRunContext } from '~/cli/context';
import { findComponentFiles, findFileByComponentName } from '~/stages/scan';

vi.mock('~/config/defaults', () => ({
    defaultExtractorConfig: {
        inputPath: '.',
        tsconfig: './package.json',
        outputDir: './dist',
        include: ['className', 'style'],
        verbose: false,
    },
    resolvePackagePaths: vi.fn((_packageName: string) => ({
        inputPath: '.',
        tsconfig: './package.json',
    })),
}));

vi.mock('~/stages/scan', () => ({
    findComponentFiles: vi.fn(),
    findFileByComponentName: vi.fn(),
}));

const mockedFindComponentFiles = vi.mocked(findComponentFiles);
const mockedFindFileByComponentName = vi.mocked(findFileByComponentName);

describe('resolveRunContext', () => {
    beforeEach(() => {
        mockedFindComponentFiles.mockReset();
        mockedFindFileByComponentName.mockReset();

        mockedFindComponentFiles.mockResolvedValue(['/abs/Button.tsx']);
        mockedFindFileByComponentName.mockReturnValue('/abs/Button.tsx');
    });

    describe('flag overrides', () => {
        it('--verbose 플래그가 있으면 config.verbose를 true로 변경한다', async () => {
            const resolved = await resolveRunContext({ verbose: true });
            expect(resolved.config.verbose).toBe(true);
        });

        it('defaultExtractorConfig 원본 객체를 mutate하지 않는다', async () => {
            const { defaultExtractorConfig } = await import('~/config/defaults');
            const originalVerbose = defaultExtractorConfig.verbose;

            await resolveRunContext({ verbose: true });

            expect(defaultExtractorConfig.verbose).toBe(originalVerbose);
        });
    });

    describe('--package flag', () => {
        it('--package가 없으면 defaultExtractorConfig의 inputPath를 사용한다', async () => {
            const resolved = await resolveRunContext({});
            expect(resolved.config.inputPath).toBe('.');
        });

        it('--package hooks이면 resolvePackagePaths가 호출된다', async () => {
            const { resolvePackagePaths } = await import('~/config/defaults');
            await resolveRunContext({ package: 'hooks' });
            expect(vi.mocked(resolvePackagePaths)).toHaveBeenCalledWith('hooks');
        });
    });

    describe('run context resolution', () => {
        it('component 인자가 없으면 모든 파일을 targetFiles로 반환한다', async () => {
            mockedFindComponentFiles.mockResolvedValue(['/abs/A.tsx', '/abs/B.tsx']);

            const resolved = await resolveRunContext({});

            expect(resolved.targetFiles).toEqual(['/abs/A.tsx', '/abs/B.tsx']);
        });

        it('component 인자가 있으면 해당 컴포넌트 파일만 반환한다', async () => {
            mockedFindComponentFiles.mockResolvedValue(['/abs/A.tsx', '/abs/B.tsx']);
            mockedFindFileByComponentName.mockReturnValue('/abs/B.tsx');

            const resolved = await resolveRunContext({ component: 'B' });

            expect(resolved.targetFiles).toEqual(['/abs/B.tsx']);
        });

        it('component 인자에 매칭되는 파일이 없으면 CliError를 던진다', async () => {
            mockedFindComponentFiles.mockResolvedValue(['/abs/A.tsx']);
            mockedFindFileByComponentName.mockReturnValue(null);

            await expect(resolveRunContext({ component: 'Missing' })).rejects.toThrowError(
                CliError,
            );
        });

        it('스캔 결과가 비어있으면 CliError를 던진다', async () => {
            mockedFindComponentFiles.mockResolvedValue([]);

            await expect(resolveRunContext({})).rejects.toThrowError(CliError);
        });

        it('tsconfig 파일이 존재하지 않으면 CliError를 던진다', async () => {
            const { resolvePackagePaths } = await import('~/config/defaults');
            vi.mocked(resolvePackagePaths).mockReturnValueOnce({
                inputPath: '.',
                tsconfig: './does-not-exist.json',
            });

            await expect(resolveRunContext({ package: 'fake' })).rejects.toThrowError(/tsconfig/i);
        });
    });
});
