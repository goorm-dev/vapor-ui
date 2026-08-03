import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { readInputDocs } from '~/input';

describe('readInputDocs', () => {
    let inputDir: string;

    beforeEach(() => {
        inputDir = mkdtempSync(join(tmpdir(), 'input-test-'));
        mkdirSync(inputDir, { recursive: true });
    });

    afterEach(() => {
        rmSync(inputDir, { recursive: true, force: true });
    });

    function writeDoc(fileName: string, content: object): void {
        writeFileSync(join(inputDir, fileName), JSON.stringify(content), 'utf-8');
    }

    it('displayName이 있으면 그것을 컴포넌트 정체로 쓴다', () => {
        writeDoc('select-root.json', { name: 'Root', displayName: 'Select.Root', props: [] });

        const [entry] = readInputDocs(inputDir);

        expect(entry.doc.displayName).toBe('Select.Root');
    });

    it('displayName이 없으면 name으로 대체한다', () => {
        writeDoc('spinner.json', { name: 'Spinner', props: [] });

        const [entry] = readInputDocs(inputDir);

        expect(entry.doc.displayName).toBe('Spinner');
    });
});
