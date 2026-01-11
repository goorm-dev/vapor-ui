import fs from 'fs';
import path from 'path';

// import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    findFileWithExtensions,
    isFile,
    isSupportedExtension,
    probeExtensions,
    resolveFile,
} from './tracker.mjs';

vi.mock('fs');

describe('tracker.mjs', () => {
    describe('Helper Functions', () => {
        describe('isFile', () => {
            it('should return true if file exists and is a file', () => {
                vi.mocked(fs.existsSync).mockReturnValue(true);
                vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true });
                expect(isFile('/path/to/file.ts')).toBe(true);
            });

            it('should return false if file does not exist', () => {
                vi.mocked(fs.existsSync).mockReturnValue(false);
                expect(isFile('/path/to/file.ts')).toBe(false);
            });

            it('should return false if path exists but is not a file', () => {
                vi.mocked(fs.existsSync).mockReturnValue(true);
                vi.mocked(fs.statSync).mockReturnValue({ isFile: () => false });
                expect(isFile('/path/to/dir')).toBe(false);
            });
        });

        describe('isSupportedExtension', () => {
            it('should return true for supported extensions', () => {
                expect(isSupportedExtension('file.ts')).toBe(true);
                expect(isSupportedExtension('file.tsx')).toBe(true);
                expect(isSupportedExtension('file.js')).toBe(true);
                expect(isSupportedExtension('file.jsx')).toBe(true);
            });

            it('should return false for unsupported extensions', () => {
                expect(isSupportedExtension('file.css')).toBe(false);
                expect(isSupportedExtension('file.json')).toBe(false);
            });
        });
    });

    describe('findFileWithExtensions', () => {
        beforeEach(() => {
            vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true });
        });

        it('should find file with .tsx extension', () => {
            vi.mocked(fs.existsSync).mockImplementation((p) => p.endsWith('.tsx'));
            expect(findFileWithExtensions('/path/to/component')).toBe('/path/to/component.tsx');
        });

        it('should find file with .ts extension', () => {
            vi.mocked(fs.existsSync).mockImplementation((p) => p.endsWith('.ts'));
            expect(findFileWithExtensions('/path/to/util')).toBe('/path/to/util.ts');
        });

        it('should return null if no file found', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            expect(findFileWithExtensions('/path/to/nothing')).toBe(null);
        });
    });

    describe('probeExtensions', () => {
        beforeEach(() => {
            vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true });
        });

        it('should return filePath if it exists and has supported extension', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            expect(probeExtensions('/path/to/file.ts')).toBe('/path/to/file.ts');
        });

        it('should append extension if direct file missing', () => {
            // /path/to/file missing
            // /path/to/file.tsx exists
            vi.mocked(fs.existsSync).mockImplementation((p) => p === '/path/to/file.tsx');
            expect(probeExtensions('/path/to/file')).toBe('/path/to/file.tsx');
        });

        it('should look for index file if file missing', () => {
            // /path/to/dir missing (as file)
            // /path/to/dir.tsx missing
            // /path/to/dir/index.ts exists
            vi.mocked(fs.existsSync).mockImplementation((p) => p === '/path/to/dir/index.ts');
            expect(probeExtensions('/path/to/dir')).toBe('/path/to/dir/index.ts'); // path.join handles separators
        });

        it('should return null if nothing matches', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            expect(probeExtensions('/path/to/unknown')).toBe(null);
        });
    });

    describe('resolveFile', () => {
        beforeEach(() => {
            vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true });
        });

        it('should resolve relative paths', () => {
            // Mock probeExtensions logic implicitly via fs mocks
            vi.mocked(fs.existsSync).mockImplementation(
                (p) => p === path.resolve('/base', './child.ts'),
            );

            const result = resolveFile('/base', './child.ts');
            expect(result).toBe(path.resolve('/base', 'child.ts'));
        });

        it('should resolve alias paths using matcher', () => {
            const matcher = vi.fn().mockReturnValue(['/alias/target/file.ts']);
            vi.mocked(fs.existsSync).mockImplementation((p) => p === '/alias/target/file.ts');

            const result = resolveFile('/base', '@alias/file', matcher);

            expect(matcher).toHaveBeenCalledWith('@alias/file');
            expect(result).toBe('/alias/target/file.ts');
        });

        it('should try multiple candidates from matcher', () => {
            const matcher = vi.fn().mockReturnValue(['/alias/bad/path', '/alias/good/path.ts']);
            vi.mocked(fs.existsSync).mockImplementation((p) => p === '/alias/good/path.ts');

            const result = resolveFile('/base', '@alias/file', matcher);
            expect(result).toBe('/alias/good/path.ts');
        });
    });
});
