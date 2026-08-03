import { describe, expect, it } from 'vitest';

import { type TranslationUnit, getTranslationUnitKey } from '~/domain';

describe('getTranslationUnitKey', () => {
    it('prop 설명 유닛은 컴포넌트 정체와 prop 이름으로 키를 만든다', () => {
        const unit: TranslationUnit = {
            kind: 'prop.description',
            componentDisplayName: 'Select.Root',
            propName: 'size',
            source: 'The size.',
        };

        expect(getTranslationUnitKey(unit)).toBe('Select.Root:size');
    });

    it('컴포넌트 설명 유닛은 (description) 센티널을 쓴다', () => {
        const unit: TranslationUnit = {
            kind: 'component.description',
            componentDisplayName: 'Select.Root',
            source: 'A select root.',
        };

        expect(getTranslationUnitKey(unit)).toBe('Select.Root:(description)');
    });

    it('name이 겹치는 두 컴포넌트의 키가 갈린다', () => {
        const select: TranslationUnit = {
            kind: 'prop.description',
            componentDisplayName: 'Select.Root',
            propName: 'size',
            source: 'The size.',
        };
        const avatar: TranslationUnit = { ...select, componentDisplayName: 'Avatar.Root' };

        expect(getTranslationUnitKey(select)).not.toBe(getTranslationUnitKey(avatar));
    });
});
