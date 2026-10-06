/**
 * writeDocs() tests
 *
 * writeDocs() is the only code that touches the output directory, including the
 * stale-file removal, so it is tested against a real temp directory.
 */
import type { ComponentDoc } from '#model';
import { writeDocs } from '#write';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const AVATAR_ROOT: ComponentDoc = {
    name: 'AvatarRoot',
    description: 'Avatar component.',
    props: [{ name: 'size', type: ['sm', 'md'], required: false, defaultValue: 'md' }],
};

let outputDir: string;

beforeEach(() => {
    outputDir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'docs-extractor-write-')), 'out');
});

afterEach(() => {
    fs.rmSync(path.dirname(outputDir), { recursive: true, force: true });
});

function writeJson(name: string, data: unknown): string {
    fs.mkdirSync(outputDir, { recursive: true });
    const filePath = path.join(outputDir, name);
    fs.writeFileSync(filePath, JSON.stringify(data));
    return filePath;
}

describe('writeDocs', () => {
    it.each([
        ['AvatarRoot', 'avatar-root.json'],
        ['Button', 'button.json'],
        ['CollapsibleTrigger', 'collapsible-trigger.json'],
        ['DataTableHeader', 'data-table-header.json'],
        ['HStack', 'h-stack.json'],
        ['HTMLElement', 'html-element.json'],
    ])('%s → %s', (name, fileName) => {
        const { written } = writeDocs(outputDir, [{ name, props: [] }]);

        expect(written).toEqual([path.join(outputDir, fileName)]);
    });

    it('없는 출력 폴더를 만들고 문서를 JSON으로 쓴다', () => {
        const { written } = writeDocs(outputDir, [AVATAR_ROOT]);

        expect(JSON.parse(fs.readFileSync(written[0], 'utf8'))).toEqual(AVATAR_ROOT);
    });

    it('removeStale이면 이번에 쓰지 않은 추출 JSON을 지우고 다른 JSON은 남긴다', () => {
        const stale = writeJson('removed-part.json', { name: 'RemovedPart', props: [] });
        writeJson('package.json', { name: 'not-extractor-output' });
        fs.writeFileSync(path.join(outputDir, 'broken.json'), '{ not json');

        const { removed } = writeDocs(outputDir, [AVATAR_ROOT], { removeStale: true });

        expect(removed).toEqual([stale]);
        expect(fs.readdirSync(outputDir).sort()).toEqual([
            'avatar-root.json',
            'broken.json',
            'package.json',
        ]);
    });

    it('removeStale이어도 손으로 쓴 toast-object.json은 남긴다', () => {
        const handWritten = writeJson('toast-object.json', { name: 'ToastObject', props: [] });

        const { removed } = writeDocs(outputDir, [AVATAR_ROOT], { removeStale: true });

        expect(removed).toEqual([]);
        expect(fs.existsSync(handWritten)).toBe(true);
    });

    it('removeStale이 없으면 기존 파일을 지우지 않는다', () => {
        const stale = writeJson('removed-part.json', { name: 'RemovedPart', props: [] });

        const { removed } = writeDocs(outputDir, [AVATAR_ROOT]);

        expect(removed).toEqual([]);
        expect(fs.existsSync(stale)).toBe(true);
    });
});
