/**
 * Config unit tests
 */
import { buildExtractOptions, config, getComponentExtractOptions } from '~/config';

describe('config', () => {
    it('기본 설정값 확인', () => {
        expect(config.filterExternal).toBe(true);
        expect(config.filterHtml).toBe(true);
        expect(config.filterSprinkles).toBe(true);
        expect(config.languages).toContain('en');
    });
});

describe('buildExtractOptions', () => {
    it('all: false → 모든 필터 활성화', () => {
        const result = buildExtractOptions(false);

        expect(result.filterExternal).toBe(true);
        expect(result.filterHtml).toBe(true);
        expect(result.filterSprinkles).toBe(true);
    });

    it('all: true → 모든 필터 비활성화', () => {
        const result = buildExtractOptions(true);

        expect(result.filterExternal).toBe(false);
        expect(result.filterHtml).toBe(false);
        expect(result.filterSprinkles).toBe(false);
    });

    it('includeHtmlWhitelist 설정', () => {
        const result = buildExtractOptions(false);

        expect(result.includeHtmlWhitelist).toBeDefined();
        expect(result.includeHtmlWhitelist?.has('className')).toBe(true);
        expect(result.includeHtmlWhitelist?.has('style')).toBe(false);
    });
});

describe('getComponentExtractOptions', () => {
    it('매칭되는 컴포넌트 설정 없으면 baseOptions 그대로 반환', () => {
        const baseOptions = { filterExternal: true };

        const result = getComponentExtractOptions(baseOptions, '/some/path/button.tsx');

        expect(result).toEqual(baseOptions);
    });

    it('backslash를 slash로 정규화', () => {
        const baseOptions = { filterExternal: true };

        // Windows 스타일 경로
        const result = getComponentExtractOptions(baseOptions, '\\some\\path\\button.tsx');

        expect(result).toEqual(baseOptions);
    });

    it('빈 컴포넌트 설정', () => {
        const baseOptions = { filterExternal: true, include: ['size'] };

        const result = getComponentExtractOptions(baseOptions, '/path/to/file.tsx');

        expect(result).toEqual(baseOptions);
    });
});
