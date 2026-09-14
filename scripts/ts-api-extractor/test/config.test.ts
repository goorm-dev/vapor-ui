/**
 * Config unit tests
 */
import { defaultExtractorConfig as config } from '~/domain/config/defaults';
import { resolveComponentInclude } from '~/domain/config/resolve';

describe('config', () => {
    it('기본 설정값 확인', () => {
        expect(config.filterExternal).toBe(true);
        expect(config.filterHtml).toBe(true);
        expect(config.filterSprinkles).toBe(true);
    });
});

describe('resolveComponentInclude', () => {
    it('매칭되는 컴포넌트 설정 없으면 undefined 반환', () => {
        const result = resolveComponentInclude('/some/path/button.tsx', {});

        expect(result).toBeUndefined();
    });

    it('패턴 매칭 시 include 반환', () => {
        const result = resolveComponentInclude('/some/path/button.tsx', {
            'button.tsx': { include: ['size', 'variant'] },
        });

        expect(result).toEqual(['size', 'variant']);
    });

    it('backslash를 slash로 정규화', () => {
        const result = resolveComponentInclude('\\some\\path\\button.tsx', {});

        expect(result).toBeUndefined();
    });

    it('부분 문자열 매칭은 경로 경계에서만 허용', () => {
        // 'notbutton.tsx' 는 매칭되면 안 됨
        const result = resolveComponentInclude('/some/path/notbutton.tsx', {
            'button.tsx': { include: ['size'] },
        });

        expect(result).toBeUndefined();
    });
});
