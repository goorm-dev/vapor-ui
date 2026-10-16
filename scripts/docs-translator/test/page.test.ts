/**
 * translatePage() tests, against a real temp api/ folder and a fake translator.
 */
import { lockEntryFor } from '@vapor-ui/docs-extractor/translation';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { type Translate, translatePage } from '../src/page';

const GLOSSARY = [{ en: 'value', ko: '값' }];
const GUIDE = { version: 1 };

const EN = {
    name: 'MeterRoot',
    description: 'Displays a measurement.',
    props: [
        {
            name: 'value',
            type: ['number'],
            detailedType: 'number',
            required: true,
            description: 'The current `value`.',
        },
        {
            name: 'max',
            type: ['number'],
            detailedType: 'number',
            required: false,
            description: 'The maximum.',
        },
    ],
};

let apiDir: string;

beforeEach(() => {
    apiDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-translator-'));
    write('en/meter-root.json', EN);
});

afterEach(() => {
    fs.rmSync(apiDir, { recursive: true, force: true });
});

function write(name: string, data: unknown) {
    fs.mkdirSync(path.dirname(path.join(apiDir, name)), { recursive: true });
    fs.writeFileSync(path.join(apiDir, name), JSON.stringify(data));
}

const read = (name: string) => JSON.parse(fs.readFileSync(path.join(apiDir, name), 'utf8'));

/** Answers every item with `KO(<text>)`, keeping code spans, and records what it was sent. */
function fakeTranslate() {
    const calls: Parameters<Translate>[] = [];
    const translate: Translate = async (items, terms) => {
        calls.push([items, terms]);
        return Object.fromEntries(items.map(({ id, text }) => [id, `KO(${text})`]));
    };
    return { translate, calls };
}

describe('translatePage', () => {
    it('누락 번역을 한 번에 보내고 ko/ 파일과 lock을 쓴다', async () => {
        const { translate, calls } = fakeTranslate();

        const { translated } = await translatePage(apiDir, GUIDE, GLOSSARY, translate);

        expect(translated).toBe(3);
        expect(calls).toHaveLength(1);
        expect(calls[0][1]).toEqual(GLOSSARY);
        expect(read('ko/meter-root.json').props[0].description).toBe('KO(The current `value`.)');
        expect(read('ko.lock.json')).toEqual({
            'meter-root': {
                description: lockEntryFor('Displays a measurement.', 1, GLOSSARY),
                'props.max': lockEntryFor('The maximum.', 1, GLOSSARY),
                'props.value': lockEntryFor('The current `value`.', 1, GLOSSARY),
            },
        });
    });

    it('다시 돌리면 아무것도 보내지 않고 번역도 바꾸지 않는다', async () => {
        await translatePage(apiDir, GUIDE, GLOSSARY, fakeTranslate().translate);
        const before = read('ko/meter-root.json');
        const { translate, calls } = fakeTranslate();

        const { translated, written } = await translatePage(apiDir, GUIDE, GLOSSARY, translate);

        expect([translated, written, calls]).toEqual([0, [], []]);
        expect(read('ko/meter-root.json')).toEqual(before);
    });

    it('원문이 바뀐 항목만 다시 번역한다', async () => {
        await translatePage(apiDir, GUIDE, GLOSSARY, fakeTranslate().translate);
        write('en/meter-root.json', { ...EN, description: 'Shows a measurement.' });
        const { translate, calls } = fakeTranslate();

        await translatePage(apiDir, GUIDE, GLOSSARY, translate);

        expect(calls[0][0]).toEqual([
            { id: 'meter-root#description', text: 'Shows a measurement.' },
        ]);
        expect(read('ko/meter-root.json').props[1].description).toBe('KO(The maximum.)');
    });

    it('lock이 맞아도 ko/에 영어가 남아 있는 항목은 다시 번역한다', async () => {
        await translatePage(apiDir, GUIDE, GLOSSARY, fakeTranslate().translate);
        write('ko/meter-root.json', EN);
        const { translate, calls } = fakeTranslate();

        await translatePage(apiDir, GUIDE, GLOSSARY, translate);

        expect(calls[0][0]).toHaveLength(3);
    });

    it('en/에 없는 파일과 항목의 lock은 지운다', async () => {
        write('ko.lock.json', {
            'meter-root': { 'props.removed': lockEntryFor('x', 1, []) },
            'gone-part': { description: lockEntryFor('y', 1, []) },
        });

        await translatePage(apiDir, GUIDE, GLOSSARY, fakeTranslate().translate);

        expect(Object.keys(read('ko.lock.json'))).toEqual(['meter-root']);
        expect(Object.keys(read('ko.lock.json')['meter-root'])).not.toContain('props.removed');
    });

    it('코드를 바꾼 번역이나 빠진 항목이 있으면 아무것도 쓰지 않고 에러를 낸다', async () => {
        const translate: Translate = async () => ({
            'meter-root#description': '측정값을 표시합니다.',
            'meter-root#props.value': '현재 `값`.',
        });

        await expect(translatePage(apiDir, GUIDE, GLOSSARY, translate)).rejects.toThrow(
            /props\.value[\s\S]*props\.max/,
        );
        expect(fs.existsSync(path.join(apiDir, 'ko.lock.json'))).toBe(false);
    });
});
