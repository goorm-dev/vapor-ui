import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import type { ExpectedLine, FigmaTree } from './expected';
import { expectedSet } from './expected';
import { FIGMA_KEY } from './figma-mock';
import type { Library, Pkg, Tables, TemplateFn } from './library';

interface Handle {
    findInstance(
        name: string,
        opts?: { traverseInstances?: boolean },
    ): {
        executeTemplate(): { example: unknown };
    };
    findText(name: string): { textContent: string };
}

const figma = Reflect.get(globalThis, FIGMA_KEY) as {
    code(strings: TemplateStringsArray, ...values: unknown[]): unknown;
    selectedInstance: Handle;
};

const fixture = (name: string) =>
    JSON.parse(
        readFileSync(new URL(`./__fixtures__/${name}.json`, import.meta.url), 'utf8'),
    ) as FigmaTree;

const template =
    (id: string, example: (h: Handle) => unknown): TemplateFn =>
    () => ({ id, example: example(figma.selectedInstance) });

const fixed = (id: string, code: string) => template(id, () => figma.code`${code}`);

function fakeLibrary(
    templates: Record<string, { name: string; run: TemplateFn; pkg?: Pkg }>,
    tables: Partial<Tables> = {},
): Library {
    return {
        entries: Object.fromEntries(
            Object.entries(templates).map(([key, { name, pkg = 'core' }]) => [
                key,
                { name, pkg, template: key, batch: null },
            ]),
        ),
        tables: { internalIcons: {}, internalParts: {}, presets: {}, defaults: {}, ...tables },
        runTemplate: (entry) => templates[entry.template].run,
    };
}

const text = (lines: ExpectedLine[]) => lines.map((l) => l.line);
const sorted = (lines: ExpectedLine[]) => text(lines).sort();

describe('expectedSet', () => {
    it('drops an instance outside any slot inside a part its template writes self-closing', () => {
        const library = fakeLibrary({
            'K-ITEMS': {
                name: '💙Pagination.Items',
                run: fixed('items', '<Pagination.Items />'),
            },
            'K-ELLIPSIS': {
                name: '💙Breadcrumb.Ellipsis',
                run: fixed('ellipsis', '<Breadcrumb.Ellipsis />'),
            },
            'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') },
        });

        const { lines } = expectedSet(fixture('self-closing-part'), library);

        expect(sorted(lines)).toEqual(['<Badge />', '<Pagination.Items />']);
    });

    it('drops an icon the nearest part draws itself', () => {
        const library = fakeLibrary(
            {
                'K-TRIGGER': {
                    name: '💙Select.Trigger',
                    run: fixed('trigger', '<Select.Trigger>\n<Select.Value />\n</Select.Trigger>'),
                },
                'K-SEARCH': {
                    name: '💙SearchOutlineIcon',
                    run: fixed('search', '<SearchOutlineIcon />'),
                },
                'K-CHEVRON': {
                    name: '💙ChevronDownOutlineIcon',
                    run: fixed('chevron', '<ChevronDownOutlineIcon />'),
                },
            },
            { internalIcons: { 'Select.Trigger': ['ChevronDownOutlineIcon'] } },
        );

        const { lines } = expectedSet(fixture('internal-icon'), library);

        expect(sorted(lines)).toEqual([
            '<SearchOutlineIcon data-in="Select.Trigger" />',
            '<Select.Trigger />',
        ]);
    });

    const dialogWithClose = (internalParts: Tables['internalParts'], pkg: Pkg = 'composites') =>
        expectedSet(
            fixture('internal-part'),
            fakeLibrary(
                {
                    'K-DIALOG': {
                        name: '💙Dialog',
                        pkg,
                        run: fixed('dialog', '<Dialog.Root>{children}</Dialog.Root>'),
                    },
                    'K-ICON': {
                        name: '💙IconButton',
                        run: fixed('icon', '<IconButton aria-label="Close" />'),
                    },
                },
                { internalParts },
            ),
        ).lines.map((l) => l.line);

    it('drops a core instance the composite part always draws itself', () => {
        expect(dialogWithClose({ 'Dialog.Root': ['IconButton'] })).toEqual(['<Dialog.Root />']);
    });

    it('keeps a core instance under a core owner that shares the composite part name', () => {
        expect([...dialogWithClose({ 'Dialog.Root': ['IconButton'] }, 'core')].sort()).toEqual([
            '<Dialog.Root />',
            '<IconButton aria-label="*" data-in="Dialog.Root" />',
        ]);
    });

    it('expects a core instance the part draws only under a condition, when the design draws it', () => {
        expect([...dialogWithClose({})].sort()).toEqual([
            '<Dialog.Root />',
            '<IconButton aria-label="*" data-in="Dialog.Root" />',
        ]);
    });

    it('gives an instance an outer template renders that outer tag as parent, through inner owners', () => {
        const library = fakeLibrary({
            'K-TABLE': {
                name: '💙Table',
                run: template(
                    'table',
                    (h) =>
                        figma.code`<Table.Root><Table.ColumnGroup>${
                            h.findInstance('Column', { traverseInstances: true }).executeTemplate()
                                .example
                        }</Table.ColumnGroup></Table.Root>`,
                ),
            },
            'K-BODY': {
                name: '💙Table.Body',
                run: fixed('body', '<Table.Body>\n<Table.Row />\n</Table.Body>'),
            },
            'K-COLUMN': { name: '💙Table.Column', run: fixed('column', '<Table.Column />') },
        });

        const { lines } = expectedSet(fixture('outer-render'), library);

        expect(sorted(lines)).toEqual([
            '<Table.Body data-in="Table.Root" />',
            '<Table.Column data-in="Table.ColumnGroup" />',
            '<Table.ColumnGroup data-in="Table.Root" />',
            '<Table.Root />',
        ]);
    });

    it('drops a <X>...</X> usage hint, and an owner whose output is all dropped passes its parent down', () => {
        const library = fakeLibrary({
            'K-DIALOG': {
                name: '💙Dialog',
                run: fixed(
                    'dialog',
                    '<Dialog.Root trigger={<Button>...</Button>}>{children}</Dialog.Root>',
                ),
            },
            'K-ACTION': {
                name: 'Dialog Action',
                run: fixed('action', '<Dialog.Action>{children}</Dialog.Action>'),
            },
            'K-BUTTON': {
                name: '💙Button',
                run: fixed('button', '<Button colorPalette="primary" />'),
            },
        });

        const { lines } = expectedSet(fixture('usage-hint'), library);

        expect(sorted(lines)).toEqual([
            '<Button colorPalette="primary" data-in="Dialog.Root" />',
            '<Dialog.Root />',
        ]);
    });

    it('writes aria-label and Figma text values as "*" and drops numeric props', () => {
        const library = fakeLibrary({
            'K-PAGINATION': {
                name: '💙Pagination',
                run: template(
                    'pagination',
                    (h) =>
                        figma.code`<Pagination.Root aria-label="Pages" title="${h.findText('Title').textContent}" totalPages={10} size="md" />`,
                ),
            },
        });

        const { lines } = expectedSet(fixture('literal-props'), library);

        expect(text(lines)).toEqual(['<Pagination.Root aria-label="*" title="*" size="md" />']);
    });

    it('finds an older published copy by name only when the name is unique in entries', () => {
        const library = fakeLibrary({
            'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') },
            'K-TAG-A': { name: '💙Tag', run: fixed('tag-a', '<Tag />') },
            'K-TAG-B': { name: '💙Tag', run: fixed('tag-b', '<Tag />') },
        });

        const { lines, unscorable } = expectedSet(fixture('older-copy'), library);

        expect(text(lines)).toEqual(['<Badge />']);
        expect(unscorable).toEqual([
            { node: expect.any(String), name: '💙Tag', cause: 'no-template' },
        ]);
    });

    it('records a template that throws as unscorable and keeps grading the rest', () => {
        const library = fakeLibrary({
            'K-CHIP': {
                name: '💙Chip',
                run: () => {
                    throw new Error('boom');
                },
            },
            'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') },
        });

        const { lines, unscorable } = expectedSet(fixture('template-error'), library);

        expect(unscorable).toEqual([
            { node: '2:1', name: '💙Chip', cause: 'template-error', message: 'boom' },
        ]);
        expect(text(lines)).toEqual(['<Badge />']);
    });

    it('expects a connected instance whatever its name, and records why it drops one', () => {
        const tree: FigmaTree = {
            document: {
                id: '0:1',
                name: 'Screen',
                type: 'FRAME',
                children: [
                    {
                        id: '2:1',
                        name: 'Login',
                        type: 'INSTANCE',
                        componentId: '1:1',
                        children: [
                            { id: '2:2', name: 'GoogleIcon', type: 'INSTANCE', componentId: '1:2' },
                        ],
                    },
                ],
            },
            components: {
                '1:1': { key: 'K-BUTTON', name: '💙Button' },
                '1:2': { key: 'K-GOOGLE', name: 'GoogleIcon' },
            },
        };
        const library = fakeLibrary({
            'K-BUTTON': {
                name: '💙Button',
                run: template(
                    'button',
                    (h) =>
                        figma.code`<Button>${h.findInstance('GoogleIcon').executeTemplate().example}</Button>`,
                ),
            },
            'K-GOOGLE': {
                name: 'GoogleIcon',
                pkg: 'icons',
                run: fixed('google', '<GoogleIcon />'),
            },
        });

        expect(expectedSet(tree, library).lines).toEqual([
            { line: '<Button />', pkg: 'core' },
            { line: '<GoogleIcon data-in="Button" />', pkg: 'icons' },
        ]);
        expect(
            expectedSet(fixture('internal-part'), {
                ...fakeLibrary(
                    {
                        'K-DIALOG': {
                            name: '💙Dialog',
                            pkg: 'composites',
                            run: fixed('d', '<Dialog.Root />'),
                        },
                        'K-ICON': { name: '💙IconButton', run: fixed('i', '<IconButton />') },
                    },
                    { internalParts: { 'Dialog.Root': ['IconButton'] } },
                ),
            }).excluded,
        ).toEqual([{ node: '2:2', name: '💙IconButton', reason: 'part-draws-itself' }]);
    });

    it('cannot grade a composites part no installed package connects', () => {
        const tree: FigmaTree = {
            document: {
                id: '0:1',
                name: 'Screen',
                type: 'FRAME',
                children: [
                    {
                        id: '2:1',
                        name: 'Dialog',
                        type: 'INSTANCE',
                        componentId: '1:1',
                        children: [
                            {
                                id: '2:2',
                                name: 'Dialog/🩵Action',
                                type: 'INSTANCE',
                                componentId: '1:2',
                            },
                        ],
                    },
                ],
            },
            components: {
                '1:1': { key: 'K-DIALOG', name: 'Dialog' },
                '1:2': { key: 'K-ACTION', name: 'Action' },
            },
        };

        expect(expectedSet(tree, fakeLibrary({})).unscorable).toEqual([
            { node: '2:2', name: 'Action', cause: 'no-template' },
        ]);
    });
});
