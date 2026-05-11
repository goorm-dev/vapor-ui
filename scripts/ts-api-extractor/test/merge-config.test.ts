import { describe, expect, it } from 'vitest';

import { defaultExtractorConfig } from '~/config/defaults';
import { mergeConfig } from '~/config/schema';

describe('mergeConfig', () => {
    describe('array replace semantics', () => {
        it('include 배열은 patch 값으로 통째 교체된다 (merge 아님)', () => {
            const base = { ...defaultExtractorConfig, include: ['className', 'style'] };
            const merged = mergeConfig(base, { include: ['className'] });

            expect(merged.include).toEqual(['className']);
        });

        it('patch에 include가 없으면 base의 include가 보존된다', () => {
            const base = { ...defaultExtractorConfig, include: ['className', 'style'] };
            const merged = mergeConfig(base, {});

            expect(merged.include).toEqual(['className', 'style']);
        });
    });

    describe('top-level scalars', () => {
        it('verbose 같은 top-level 필드는 patch 값으로 교체된다', () => {
            const merged = mergeConfig(defaultExtractorConfig, { verbose: true });
            expect(merged.verbose).toBe(true);
        });

        it('patch에 없는 top-level 필드는 base 값이 유지된다', () => {
            const merged = mergeConfig(defaultExtractorConfig, { verbose: true });
            expect(merged.tsconfig).toBe(defaultExtractorConfig.tsconfig);
            expect(merged.outputDir).toBe(defaultExtractorConfig.outputDir);
        });
    });

    describe('immutability', () => {
        it('base 객체를 mutate하지 않는다', () => {
            const base = { ...defaultExtractorConfig };
            const snapshot = structuredClone(base);

            mergeConfig(base, { verbose: true });

            expect(base).toEqual(snapshot);
        });
    });
});
