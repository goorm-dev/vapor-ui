import { describe, expect, it } from 'vitest';

import { loadLegacyColorSchema, suggestLegacyReplacement } from '~/ui/lib/loaders/legacy-color';

describe('legacy-color loader', () => {
    it('레거시 oldName → v1_0_0 매핑을 구축한다', () => {
        const schema = loadLegacyColorSchema();
        expect(schema.byOldName.get('primary')).toBe('color-background-primary-200');
        expect(schema.byOldName.get('text-primary')).toBe('color-foreground-primary-100');
        expect(schema.byOldName.get('border-normal')).toBe('color-border-normal');
    });

    it('v1_0_0 이 "-" 로 시작하는 항목은 제외', () => {
        const schema = loadLegacyColorSchema();
        // primary-transparent-8 → "-(hex code로 사용)" 이므로 매핑 없음
        expect(schema.byOldName.has('primary-transparent-8')).toBe(false);
    });

    it('rgb → hex 인덱스 조회', () => {
        const schema = loadLegacyColorSchema();
        // rgb(42, 114, 229) → #2a72e5
        const candidates = schema.byHex.get('#2a72e5');
        expect(candidates).toBeTruthy();
        expect(candidates?.some((c) => c.token === 'color-background-primary-200')).toBe(true);
    });
});

describe('suggestLegacyReplacement', () => {
    it('oldName 이 매치하면 신규 토큰 반환', () => {
        expect(
            suggestLegacyReplacement({ token: 'text-primary', hex: null, property: 'fill-on-text' }),
        ).toBe('color-foreground-primary-100');
    });

    it('hex + property role 이 매치되는 후보 우선', () => {
        // rgb(93,93,93) → hint / text-hint 둘 다 후보. fill 은 background 우선.
        expect(suggestLegacyReplacement({ token: null, hex: '#5d5d5d', property: 'fill' })).toBe(
            'color-background-hint-200',
        );
        expect(
            suggestLegacyReplacement({
                token: null,
                hex: '#5d5d5d',
                property: 'fill-on-text',
            }),
        ).toBe('color-foreground-hint-100');
    });

    it('매핑 없으면 null', () => {
        expect(
            suggestLegacyReplacement({ token: 'not-a-legacy-name', hex: '#123456', property: 'fill' }),
        ).toBeNull();
    });

    it('레거시 oldName 이라도 v1_0_0 이 "-" 로 시작하면 null', () => {
        expect(
            suggestLegacyReplacement({
                token: 'primary-hover',
                hex: null,
                property: 'fill',
            }),
        ).toBeNull();
    });
});
