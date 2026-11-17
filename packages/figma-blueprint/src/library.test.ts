import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { StoredEntry } from '~/entries';

import { checkLibrary, libraryItems, readExceptions } from './library';

const entry = (name: string) => ({ name, url: '', template: '', batch: null }) as StoredEntry;
const set = (key: string, name: string) => ({ key, name, node_id: key });
const variant = (key: string) => ({
    key,
    name: 'Size=Md',
    node_id: key,
    containing_frame: { containingComponentSet: { name: 'S', nodeId: '1:1' } },
});
const core = ({ name }: { name: string }) => name.includes('💙');

describe('checkLibrary', () => {
    const items = libraryItems(
        [set('linked', '💙Button'), set('missing', '💙Chip'), set('plain', 'Guide')],
        [variant('v1'), { key: 'solo', name: '💙Solo', node_id: 'solo' }],
    );

    it('reports a target that has no entry and no exception', () => {
        const { unconnected } = checkLibrary(
            items,
            { linked: entry('Button') },
            { figma: {} },
            core,
        );

        expect(unconnected.map((i) => i.key)).toEqual(['missing', 'solo']);
    });

    it('accepts a target that has a written reason, and ignores variants and non-target items', () => {
        const lists = checkLibrary(
            items,
            { linked: entry('Button') },
            { figma: { missing: 'x', solo: 'y' } },
            core,
        );

        expect(lists).toEqual({ gone: [], unconnected: [], stale: [] });
    });

    it('reports an entry whose component is no longer published', () => {
        const { gone } = checkLibrary(items, { deleted: entry('Old') }, { figma: {} }, () => false);

        expect(gone).toEqual(['deleted']);
    });

    it('reports an exception that is now linked or no longer published', () => {
        const { stale } = checkLibrary(
            items,
            { linked: entry('Button') },
            { figma: { linked: 'x', deleted: 'y', missing: 'z' } },
            core,
        );

        expect(stale).toEqual(['linked', 'deleted']);
    });
});

describe('readExceptions', () => {
    it('rejects an exception whose reason is blank', () => {
        const dir = mkdtempSync(join(tmpdir(), 'figma-exceptions-'));
        writeFileSync(join(dir, 'figma-exceptions.json'), JSON.stringify({ figma: { k: ' ' } }));

        expect(() => readExceptions(dir)).toThrow('k needs a non-empty reason');
    });
});
