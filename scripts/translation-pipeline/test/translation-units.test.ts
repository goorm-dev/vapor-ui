import { describe, expect, it } from 'vitest';

import {
    applyTranslationOutcomes,
    buildComponentReports,
    collectTranslationUnits,
} from '~/translation-units';
import type { TranslatableDoc } from '~/types';
import type { TranslationOutcome } from '~/types';

const props: TranslatableDoc[] = [
    {
        name: 'Button',
        description: 'A button component.',
        props: [{ name: 'size', description: 'Controls the size.' }, { name: 'disabled' }],
    },
];

describe('collectTranslationUnits', () => {
    it('creates stable path ids for component and prop descriptions only', () => {
        expect(collectTranslationUnits(props)).toEqual([
            {
                id: 'component.description',
                kind: 'component.description',
                ownerName: 'Button',
                source: 'A button component.',
                componentIndex: 0,
            },
            {
                id: 'props[0].size.description',
                kind: 'prop.description',
                ownerName: 'size',
                source: 'Controls the size.',
                componentIndex: 0,
                propIndex: 0,
            },
        ]);
    });
});

describe('applyTranslationOutcomes', () => {
    it('applies translated descriptions without mutating the source props JSON', () => {
        const units = collectTranslationUnits(props);
        const outcomes = new Map<string, TranslationOutcome>([
            [
                'component.description',
                {
                    id: 'component.description',
                    source: 'A button component.',
                    translated: 'Button 컴포넌트입니다.',
                    assurance: 'verified',
                    reportable: false,
                    reason: 'initial_quality_gate_passed',
                    events: [],
                },
            ],
            [
                'props[0].size.description',
                {
                    id: 'props[0].size.description',
                    source: 'Controls the size.',
                    translated: '크기를 지정합니다.',
                    assurance: 'verified',
                    reportable: false,
                    reason: 'initial_quality_gate_passed',
                    events: [],
                },
            ],
        ]);

        const translated = applyTranslationOutcomes(props, units, outcomes);

        expect(translated[0].description).toBe('Button 컴포넌트입니다.');
        expect(translated[0].props[0].description).toBe('크기를 지정합니다.');
        expect(props[0].description).toBe('A button component.');
        expect(props[0].props[0].description).toBe('Controls the size.');
    });
});

describe('buildComponentReports', () => {
    it('summarizes verified, unverified, and cached outcomes per component', () => {
        const units = collectTranslationUnits(props);
        const outcomes = new Map<string, TranslationOutcome>([
            [
                'component.description',
                {
                    id: 'component.description',
                    source: 'A button component.',
                    translated: '캐시된 번역',
                    assurance: 'verified',
                    reportable: false,
                    reason: 'cache_hit',
                    events: [],
                },
            ],
            [
                'props[0].size.description',
                {
                    id: 'props[0].size.description',
                    source: 'Controls the size.',
                    translated: '크기를 지정합니다.',
                    assurance: 'unverified',
                    reportable: false,
                    reason: 'initial_quality_gate_unavailable',
                    events: [],
                },
            ],
        ]);

        expect(buildComponentReports(props, units, outcomes)).toEqual([
            {
                name: 'Button',
                totalTexts: 2,
                verified: 1,
                unverified: 1,
                cached: 1,
                unverifiedOutcomes: [],
            },
        ]);
    });
});
