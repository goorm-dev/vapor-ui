/**
 * writeDocs() tests
 *
 * writeDocs() is the only code that touches the pages directory, including the
 * page lookup and the stale-file removal, so it is tested against a real temp directory.
 */
import { ExtractorError } from '#errors';
import type { ComponentDoc } from '#model';
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
    for (const page of ['avatar', 'radio', 'toast']) addPage(page);
});

afterEach(() => {
    fs.rmSync(pagesDir, { recursive: true, force: true });
});

function addPage(page: string) {
    fs.mkdirSync(path.join(pagesDir, page), { recursive: true });
    fs.writeFileSync(path.join(pagesDir, page, 'index.mdx'), '# page');
}

/** A source file path the way the extractor reports it. */
const source = (folder: string) => `/repo/packages/core/src/components/${folder}/${folder}.tsx`;

const AVATAR = { doc: AVATAR_ROOT, sourceFile: source('avatar') };

function writeJson(page: string, name: string, data: unknown): string {
    const filePath = path.join(pagesDir, page, 'api', name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data));
    return filePath;
}

describe('findApiDir', () => {
    it('컴포넌트 폴더와 같은 이름의 페이지 폴더 안 api/를 고른다', () => {
        expect(findApiDir(source('avatar'), pagesDir)).toBe(path.join(pagesDir, 'avatar', 'api'));
    });

    it('다른 이름의 페이지에서 문서화되는 폴더는 매핑을 따른다', () => {
        expect(findApiDir(source('radio-group'), pagesDir)).toBe(
            path.join(pagesDir, 'radio', 'api'),
        );
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

        expect(written).toEqual([path.join(pagesDir, 'avatar', 'api', fileName)]);
    });

    it('페이지가 없다고 매핑된 문서는 쓰지 않는다', () => {
        const { written } = writeDocs(pagesDir, [
            { doc: AVATAR_ROOT, sourceFile: source('alert-dialog') },
        ]);

        expect(written).toEqual([]);
    });

    it('없는 api 폴더를 만들고 문서를 JSON으로 쓴다', () => {
        const { written } = writeDocs(pagesDir, [AVATAR]);

        expect(JSON.parse(fs.readFileSync(written[0], 'utf8'))).toEqual(AVATAR_ROOT);
    });

    it('removeStale이면 어느 페이지든 이번에 쓰지 않은 추출 JSON을 지우고 다른 JSON은 남긴다', () => {
        const stale = writeJson('radio', 'removed-part.json', { name: 'RemovedPart', props: [] });
        writeJson('avatar', 'package.json', { name: 'not-extractor-output' });
        fs.writeFileSync(path.join(pagesDir, 'avatar', 'api', 'broken.json'), '{ not json');

        const { removed } = writeDocs(pagesDir, [AVATAR], { removeStale: true });

        expect(removed).toEqual([stale]);
        expect(fs.readdirSync(path.join(pagesDir, 'avatar', 'api')).sort()).toEqual([
            'avatar-root.json',
            'broken.json',
            'package.json',
        ]);
    });

    it('removeStale이어도 손으로 쓴 toast-object.json은 남긴다', () => {
        const handWritten = writeJson('toast', 'toast-object.json', {
            name: 'ToastObject',
            props: [],
        });

        const { removed } = writeDocs(pagesDir, [AVATAR], { removeStale: true });

        expect(removed).toEqual([]);
        expect(fs.existsSync(handWritten)).toBe(true);
    });

    it('removeStale이 없으면 기존 파일을 지우지 않는다', () => {
        const stale = writeJson('radio', 'removed-part.json', { name: 'RemovedPart', props: [] });

        const { removed } = writeDocs(pagesDir, [AVATAR]);

        expect(removed).toEqual([]);
        expect(fs.existsSync(stale)).toBe(true);
    });
});
