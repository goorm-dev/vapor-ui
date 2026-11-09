import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import type { FigmaTree } from './expected';
import { expectedSet } from './expected';
import { FIGMA_KEY } from './figma-mock';
import type { Library, Tables, TemplateFn } from './library';

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
    templates: Record<string, { name: string; run: TemplateFn }>,
    tables: Partial<Tables> = {},
): Library {
    return {
        entries: Object.fromEntries(
            Object.entries(templates).map(([key, { name }]) => [
                key,
                { name, template: key, batch: null },
            ]),
        ),
        tables: { internalIcons: {}, internalParts: {}, presets: {}, defaults: {}, ...tables },
        runTemplate: (entry) => templates[entry.template].run,
    };
}

const sorted = (lines: string[]) => [...lines].sort();

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

        expect(lines).toEqual(['<Pagination.Root aria-label="*" title="*" size="md" />']);
    });

    it('finds an older published copy by name only when the name is unique in entries', () => {
        const library = fakeLibrary({
            'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') },
            'K-TAG-A': { name: '💙Tag', run: fixed('tag-a', '<Tag />') },
            'K-TAG-B': { name: '💙Tag', run: fixed('tag-b', '<Tag />') },
        });

        const { lines, unmapped } = expectedSet(fixture('older-copy'), library);

        expect(lines).toEqual(['<Badge />']);
        expect(unmapped).toEqual(['💙Tag']);
    });

    it('records a template that throws in errors and keeps grading the rest', () => {
        const library = fakeLibrary({
            'K-CHIP': {
                name: '💙Chip',
                run: () => {
                    throw new Error('boom');
                },
            },
            'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') },
        });

        const { lines, errors } = expectedSet(fixture('template-error'), library);

        expect(errors).toEqual(['Broken (2:1): boom']);
        expect(lines).toEqual(['<Badge />']);
    });
});
