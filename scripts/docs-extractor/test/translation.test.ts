/**
 * mirrorDoc() tests
 *
 * The extractor owns structure only: it keeps a Korean text when the lock says it
 * was made from the current source text, and otherwise puts the English in its place.
 */
import type { ComponentDoc } from '#model';
import {
    type LockEntry,
    applicableTerms,
    hashText,
    lockEntryFor,
    mirrorDoc,
    missingUnits,
    translationUnits,
} from '#translation';

const EN: ComponentDoc = {
    name: 'MeterRoot',
    description: 'Displays a measurement.',
    props: [
        {
            name: 'value',
            type: ['number'],
            detailedType: 'number',
            required: true,
            description: 'The current value.',
        },
        {
            name: 'max',
            type: ['number'],
            detailedType: 'number | undefined',
            required: false,
            description: 'The maximum value.',
            defaultValue: '100',
        },
        { name: 'children', type: ['ReactNode'], detailedType: 'ReactNode', required: false },
    ],
};

const KO: ComponentDoc = {
    ...EN,
    description: '측정값을 표시합니다.',
    props: [
        { ...EN.props[0], description: '현재 값.' },
        { ...EN.props[1], description: '최대값.' },
        EN.props[2],
    ],
};

const entry = (text: string): LockEntry => ({ source: hashText(text), guide: 1, terms: '' });

describe('translationUnits', () => {
    it('컴포넌트 설명과 설명이 있는 prop마다 키를 하나씩 낸다', () => {
        expect(translationUnits(EN)).toEqual([
            { key: 'description', text: 'Displays a measurement.' },
            { key: 'props.value', text: 'The current value.' },
            { key: 'props.max', text: 'The maximum value.' },
        ]);
    });
});

describe('mirrorDoc', () => {
    it('lock의 원문 해시가 현재 원문과 같으면 한국어를 유지한다', () => {
        const lock = {
            description: entry('Displays a measurement.'),
            'props.value': entry('The current value.'),
            'props.max': entry('The maximum value.'),
        };

        expect(mirrorDoc(EN, KO, lock)).toEqual(KO);
    });

    it('원문 해시가 다르거나 lock에 없으면 그 항목만 영어를 넣는다', () => {
        const lock = {
            description: entry('Displays a value.'),
            'props.value': entry('The current value.'),
        };

        const ko = mirrorDoc(EN, KO, lock);

        expect(ko.description).toBe('Displays a measurement.');
        expect(ko.props.map((p) => p.description)).toEqual([
            '현재 값.',
            'The maximum value.',
            undefined,
        ]);
    });

    it('구조는 항상 영어를 따른다: 새 prop은 영어로, 사라진 prop은 버린다', () => {
        const en: ComponentDoc = {
            ...EN,
            props: [{ ...EN.props[1], defaultValue: '10' }, EN.props[0]],
        };
        const ko: ComponentDoc = { ...KO, props: [KO.props[0]] };
        const lock = { 'props.value': entry('The current value.') };

        expect(mirrorDoc(en, ko, lock).props).toEqual([
            { ...EN.props[1], defaultValue: '10' },
            { ...EN.props[0], description: '현재 값.' },
        ]);
    });

    it('한국어 파일이 없으면 영어를 그대로 복사한다', () => {
        expect(mirrorDoc(EN, undefined, {})).toEqual(EN);
    });
});

describe('applicableTerms', () => {
    const glossary = [
        { en: 'element', ko: '요소' },
        { en: 'item', ko: '항목' },
        { en: 'assistive technolog', ko: '보조기술' },
    ];

    it('대소문자를 무시하고 단어 경계에서 앞부분이 일치하는 용어를 고른다', () => {
        expect(
            applicableTerms('Renders an Element. Hidden from assistive technologies.', glossary),
        ).toEqual([glossary[0], glossary[2]]);
    });

    it('단어 중간에서 일치하는 용어는 고르지 않는다', () => {
        expect(applicableTerms('A lineitem and a subelement.', glossary)).toEqual([]);
    });
});

describe('missingUnits', () => {
    const glossary = [{ en: 'value', ko: '값' }];
    const fresh = (text: string) => lockEntryFor(text, 1, glossary);
    const lock = {
        description: fresh('Displays a measurement.'),
        'props.value': fresh('The current value.'),
        'props.max': fresh('The maximum value.'),
    };

    it('원문·가이드 version·용어가 lock과 모두 같으면 누락이 없다', () => {
        expect(missingUnits(EN, lock, 1, glossary)).toEqual([]);
    });

    it('lock에 없는 항목은 누락이다', () => {
        expect(missingUnits(EN, { description: lock.description }, 1, glossary)).toEqual([
            { key: 'props.value', text: 'The current value.' },
            { key: 'props.max', text: 'The maximum value.' },
        ]);
    });

    it('가이드 version이 다르면 전부 누락이다', () => {
        expect(missingUnits(EN, lock, 2, glossary)).toHaveLength(3);
    });

    it('적용되는 용어의 번역이 바뀌면 그 용어가 들어간 항목만 누락이다', () => {
        expect(missingUnits(EN, lock, 1, [{ en: 'value', ko: '밸류' }])).toEqual([
            { key: 'props.value', text: 'The current value.' },
            { key: 'props.max', text: 'The maximum value.' },
        ]);
    });
});
