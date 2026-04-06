/**
 * Config unit tests
 */
import { config, resolveComponentInclude } from '~/config';

describe('config', () => {
    it('기본 설정값 확인', () => {
        expect(config.filterExternal).toBe(true);
        expect(config.filterHtml).toBe(true);
        expect(config.filterSprinkles).toBe(true);
    });
});

describe('resolveComponentInclude', () => {
    it('매칭되는 컴포넌트 설정 없으면 undefined 반환', () => {
        const result = resolveComponentInclude('/some/path/button.tsx');

        expect(result).toBeUndefined();
    });

    it('패턴 매칭 시 include 반환', () => {
        const testConfig = {
            ...config,
            components: { 'button.tsx': { include: ['size', 'variant'] } },
        };

        const result = resolveComponentInclude('/some/path/button.tsx', testConfig);

        expect(result).toEqual(['size', 'variant']);
    });

    it('backslash를 slash로 정규화', () => {
        const result = resolveComponentInclude('\\some\\path\\button.tsx');

        expect(result).toBeUndefined();
    });

    it('부분 문자열 매칭은 경로 경계에서만 허용', () => {
        const testConfig = {
            ...config,
            components: { 'button.tsx': { include: ['size'] } },
        };

        // 'notbutton.tsx' 는 매칭되면 안 됨
        const result = resolveComponentInclude('/some/path/notbutton.tsx', testConfig);

        expect(result).toBeUndefined();
    });
});
