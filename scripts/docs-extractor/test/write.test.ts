/**
 * writeDocs() tests
 *
 * writeDocs() is the only code that touches the pages directory, including the
 * page lookup and the stale-file removal, so it is tested against a real temp directory.
 */
import { ExtractorError } from '#errors';
import type { ComponentDoc } from '#model';
import { hashText } from '#translation';
import { findApiDir, writeDocs } from '#write';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const AVATAR_ROOT: ComponentDoc = {
    name: 'AvatarRoot',
    description: 'Avatar component.',
    props: [
        {
            name: 'size',
            type: ['sm', 'md'],
            detailedType: '"sm" | "md" | undefined',
            required: false,
            defaultValue: 'md',
        },
    ],
};

let pagesDir: string;

beforeEach(() => {
    pagesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-extractor-write-'));
    for (const page of ['avatar', 'radio', 'toast']) addPage(path.join('(components)', page));
});

afterEach(() => {
    fs.rmSync(pagesDir, { recursive: true, force: true });
});

/** `page` is relative to pagesDir, e.g. `(components)/avatar`. */
function addPage(page: string) {
    fs.mkdirSync(path.join(pagesDir, page), { recursive: true });
    fs.writeFileSync(path.join(pagesDir, page, 'index.mdx'), '# page');
}

/** The `api/` folder of a page set up in beforeEach. */
const apiDir = (page: string) => path.join(pagesDir, '(components)', page, 'api');

/** A source file path the way the extractor reports it. */
const source = (folder: string) => `/repo/packages/core/src/components/${folder}/${folder}.tsx`;

const AVATAR = { doc: AVATAR_ROOT, sourceFile: source('avatar') };

function writeJson(page: string, name: string, data: unknown): string {
    const filePath = path.join(apiDir(page), name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data));
    return filePath;
}

describe('findApiDir', () => {
    it('컴포넌트 폴더와 같은 이름의 페이지 폴더 안 api/를 route group 안에서 고른다', () => {
        expect(findApiDir(source('avatar'), pagesDir)).toBe(apiDir('avatar'));
    });

    it('route group 밖에 바로 있는 페이지도 고른다', () => {
        addPage('button');

        expect(findApiDir(source('button'), pagesDir)).toBe(path.join(pagesDir, 'button', 'api'));
    });

    it('일반 폴더 아래 같은 이름의 페이지는 고르지 않는다', () => {
        addPage('patterns/form');

        expect(() => findApiDir(source('form'), pagesDir)).toThrow(ExtractorError);
    });

    it('다른 이름의 페이지에서 문서화되는 폴더는 매핑을 따른다', () => {
        expect(findApiDir(source('radio-group'), pagesDir)).toBe(apiDir('radio'));
    });

    it('페이지가 없다고 매핑된 폴더는 null이다', () => {
        expect(findApiDir(source('alert-dialog'), pagesDir)).toBeNull();
    });

    it('페이지가 없으면 에러를 낸다', () => {
        expect(() => findApiDir(source('button'), pagesDir)).toThrow(ExtractorError);
    });

    it('components/<folder>/ 밖의 파일이면 에러를 낸다', () => {
        expect(() => findApiDir('/repo/packages/core/src/utils/x.tsx', pagesDir)).toThrow(
            ExtractorError,
        );
    });
});

function readJson(filePath: string): unknown {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const apiPath = (page: string, ...rest: string[]) => path.join(apiDir(page), ...rest);

describe('writeDocs', () => {
    it.each([
        ['AvatarRoot', 'avatar-root.json'],
        ['Button', 'button.json'],
        ['CollapsibleTrigger', 'collapsible-trigger.json'],
        ['DataTableHeader', 'data-table-header.json'],
        ['HStack', 'h-stack.json'],
        ['HTMLElement', 'html-element.json'],
    ])('%s → %s', (name, fileName) => {
        const { written } = writeDocs(pagesDir, [
            { doc: { name, props: [] }, sourceFile: source('avatar') },
        ]);

        expect(written).toEqual([
            apiPath('avatar', 'en', fileName),
            apiPath('avatar', 'ko', fileName),
        ]);
    });

    it('페이지가 없다고 매핑된 문서는 쓰지 않는다', () => {
        const { written } = writeDocs(pagesDir, [
            { doc: AVATAR_ROOT, sourceFile: source('alert-dialog') },
        ]);

        expect(written).toEqual([]);
    });

    it('없는 폴더를 만들고 원문을 en/에, lock이 없으면 같은 내용을 ko/에 쓴다', () => {
        writeDocs(pagesDir, [AVATAR]);

        expect(readJson(apiPath('avatar', 'en', 'avatar-root.json'))).toEqual(AVATAR_ROOT);
        expect(readJson(apiPath('avatar', 'ko', 'avatar-root.json'))).toEqual(AVATAR_ROOT);
    });

    it('ko.lock.json의 원문 해시가 맞는 번역은 유지한다', () => {
        const ko = { ...AVATAR_ROOT, description: '아바타 컴포넌트.' };
        writeJson('avatar', 'ko/avatar-root.json', ko);
        writeJson('avatar', 'ko.lock.json', {
            'avatar-root': {
                description: { source: hashText('Avatar component.'), guide: 1, terms: '' },
            },
        });

        writeDocs(pagesDir, [AVATAR]);

        expect(readJson(apiPath('avatar', 'ko', 'avatar-root.json'))).toEqual(ko);
    });

    it('ko.lock.json이 JSON이 아니면 번역을 덮어쓰지 않고 에러를 낸다', () => {
        fs.mkdirSync(apiPath('avatar'), { recursive: true });
        fs.writeFileSync(apiPath('avatar', 'ko.lock.json'), '{ not json');

        expect(() => writeDocs(pagesDir, [AVATAR])).toThrow(ExtractorError);
    });

    it('ko.lock.json이 객체가 아니면 에러를 낸다', () => {
        writeJson('avatar', 'ko.lock.json', null);

        expect(() => writeDocs(pagesDir, [AVATAR])).toThrow(ExtractorError);
    });

    it('기존 ko/ 파일이 JSON이 아니면 번역을 영어로 덮어쓰지 않고 에러를 낸다', () => {
        fs.mkdirSync(apiPath('avatar', 'ko'), { recursive: true });
        fs.writeFileSync(apiPath('avatar', 'ko', 'avatar-root.json'), '<<<<<<< HEAD');

        expect(() => writeDocs(pagesDir, [AVATAR])).toThrow(ExtractorError);
        expect(fs.readFileSync(apiPath('avatar', 'ko', 'avatar-root.json'), 'utf8')).toBe(
            '<<<<<<< HEAD',
        );
    });

    it('en/에 있는 손으로 쓴 파일도 ko/에 미러링한다', () => {
        const handWritten = { name: 'ToastObject', props: [] };
        writeJson('toast', 'en/toast-object.json', handWritten);

        writeDocs(pagesDir, [{ doc: AVATAR_ROOT, sourceFile: source('toast') }]);

        expect(readJson(apiPath('toast', 'ko', 'toast-object.json'))).toEqual(handWritten);
    });

    it('removeStale이면 이번에 쓰지 않은 추출 JSON을 en/·ko/에서 지우고 다른 JSON은 남긴다', () => {
        const staleEn = writeJson('radio', 'en/removed-part.json', {
            name: 'RemovedPart',
            props: [],
        });
        const staleKo = writeJson('radio', 'ko/removed-part.json', {
            name: 'RemovedPart',
            props: [],
        });
        writeJson('avatar', 'en/package.json', { name: 'not-extractor-output' });
        fs.writeFileSync(apiPath('avatar', 'en', 'broken.json'), '{ not json');

        const { removed } = writeDocs(pagesDir, [AVATAR], { removeStale: true });

        expect(removed.sort()).toEqual([staleEn, staleKo].sort());
        expect(fs.readdirSync(apiPath('avatar', 'en')).sort()).toEqual([
            'avatar-root.json',
            'broken.json',
            'package.json',
        ]);
    });

    it('removeStale이면 en/ 짝이 없는 ko/ 파일도 지운다', () => {
        const orphan = writeJson('radio', 'ko/old-part.json', { name: 'OldPart', props: [] });

        const { removed } = writeDocs(pagesDir, [AVATAR], { removeStale: true });

        expect(removed).toEqual([orphan]);
    });

    it('removeStale이어도 손으로 쓴 toast-object.json은 남긴다', () => {
        const handWritten = writeJson('toast', 'en/toast-object.json', {
            name: 'ToastObject',
            props: [],
        });

        const { removed } = writeDocs(pagesDir, [AVATAR], { removeStale: true });

        expect(removed).toEqual([]);
        expect(fs.existsSync(handWritten)).toBe(true);
    });

    it('removeStale이 없으면 기존 파일을 지우지 않는다', () => {
        const stale = writeJson('radio', 'en/removed-part.json', {
            name: 'RemovedPart',
            props: [],
        });

        const { removed } = writeDocs(pagesDir, [AVATAR]);

        expect(removed).toEqual([]);
        expect(fs.existsSync(stale)).toBe(true);
    });
});
