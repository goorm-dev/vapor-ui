/**
 * mirrorDoc() tests
 *
 * The extractor owns structure only: it keeps a Korean text when the lock says it
 * was made from the current source text, and otherwise puts the English in its place.
 */
import type { ComponentDoc } from '#model';
import { type LockEntry, hashText, mirrorDoc, translationUnits } from '#translation';

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
