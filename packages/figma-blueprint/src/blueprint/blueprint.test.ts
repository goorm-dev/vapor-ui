import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

import type { Catalog } from '~/catalog/catalog';
import type { Pkg } from '~/entries/entries-file';
import type { Tables } from '~/ship/tables';
import { FIGMA_KEY } from '~/ship/templates';
import type { TemplateFn } from '~/ship/templates';

import type { Blueprint, BlueprintNode, FigmaTree } from './blueprint';
import { blueprint } from './blueprint';

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
        readFileSync(new URL(`../__fixtures__/${name}.json`, import.meta.url), 'utf8'),
    ) as FigmaTree;

const template =
    (id: string, example: (h: Handle) => unknown): TemplateFn =>
    () => ({ id, example: example(figma.selectedInstance) });

const fixed = (id: string, code: string) => template(id, () => figma.code`${code}`);

function fakeCatalog(
    templates: Record<string, { name: string; run: TemplateFn; pkg?: Pkg }>,
    tables: Partial<Tables> = {},
): Catalog {
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

// Each node as one line: data-in is the tag of the node it sits under, left out at the top level and where its
// position must not be judged.
const lines = ({ nodes }: Blueprint) => {
    const out: string[] = [];
    const walk = (list: BlueprintNode[], parent?: string) => {
        for (const n of list) {
            const at = parent && !n.anyParent ? [`data-in="${parent}"`] : [];
            out.push(`<${[n.tag, ...n.props, ...at].join(' ')} />`);
            walk(n.children, n.tag);
        }
    };
    walk(nodes);
    return out;
};
const sorted = (result: Blueprint) => lines(result).sort();

describe('blueprint lines', () => {
    it('drops an instance outside any slot inside a part its template writes self-closing', () => {
        const catalog = fakeCatalog({
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

        const result = blueprint(fixture('self-closing-part'), catalog);

        expect(sorted(result)).toEqual(['<Badge />', '<Pagination.Items />']);
    });

    it('drops an icon the nearest part draws itself', () => {
        const catalog = fakeCatalog(
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

        const result = blueprint(fixture('internal-icon'), catalog);

        expect(sorted(result)).toEqual([
            '<SearchOutlineIcon data-in="Select.Trigger" />',
            '<Select.Trigger />',
        ]);
    });

    const dialogWithClose = (internalParts: Tables['internalParts'], pkg: Pkg = 'composites') =>
        lines(
            blueprint(
                fixture('internal-part'),
                fakeCatalog(
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
            ),
        );

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
        const catalog = fakeCatalog({
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

        const result = blueprint(fixture('outer-render'), catalog);

        expect(sorted(result)).toEqual([
            '<Table.Body data-in="Table.Root" />',
            '<Table.Column data-in="Table.ColumnGroup" />',
            '<Table.ColumnGroup data-in="Table.Root" />',
            '<Table.Root />',
        ]);
    });

    it('drops a <X>...</X> usage hint, and an owner whose output is all dropped passes its parent down', () => {
        const catalog = fakeCatalog({
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

        const result = blueprint(fixture('usage-hint'), catalog);

        expect(sorted(result)).toEqual([
            '<Button colorPalette="primary" data-in="Dialog.Root" />',
            '<Dialog.Root />',
        ]);
    });

    it('keeps an element whose children are Figma text that reads "..."', () => {
        const tree: FigmaTree = {
            document: {
                id: '0:1',
                name: 'Screen',
                type: 'FRAME',
                children: [
                    {
                        id: '2:1',
                        name: 'Button',
                        type: 'INSTANCE',
                        componentId: '1:1',
                        children: [{ id: '2:2', name: 'Label', type: 'TEXT', characters: '...' }],
                    },
                ],
            },
            components: { '1:1': { key: 'K-BUTTON', name: '💙Button' } },
        };
        const catalog = fakeCatalog({
            'K-BUTTON': {
                name: '💙Button',
                run: template(
                    'button',
                    (h) =>
                        figma.code`<Button size="md">${h.findText('Label').textContent}</Button>`,
                ),
            },
        });

        expect(lines(blueprint(tree, catalog))).toEqual(['<Button size="md" />']);
    });

    it('writes aria-label and Figma text values as "*" and drops numeric props', () => {
        const catalog = fakeCatalog({
            'K-PAGINATION': {
                name: '💙Pagination',
                run: template(
                    'pagination',
                    (h) =>
                        figma.code`<Pagination.Root aria-label="Pages" title="${h.findText('Title').textContent}" totalPages={10} size="md" />`,
                ),
            },
        });

        const result = blueprint(fixture('literal-props'), catalog);

        expect(lines(result)).toEqual(['<Pagination.Root aria-label="*" title="*" size="md" />']);
    });

    it('drops a "..." example value a template writes, but not aria-label or Figma text that reads "..."', () => {
        const tree: FigmaTree = {
            document: {
                id: '0:1',
                name: 'Screen',
                type: 'FRAME',
                children: [
                    { id: '2:1', name: 'Radio', type: 'INSTANCE', componentId: '1:1' },
                    {
                        id: '2:2',
                        name: 'Chip',
                        type: 'INSTANCE',
                        componentId: '1:2',
                        children: [{ id: '2:3', name: 'Label', type: 'TEXT', characters: '...' }],
                    },
                ],
            },
            components: {
                '1:1': { key: 'K-RADIO', name: '💙Radio' },
                '1:2': { key: 'K-CHIP', name: '💙Chip' },
            },
        };
        const catalog = fakeCatalog({
            'K-RADIO': {
                name: '💙Radio',
                run: fixed('radio', '<Radio.Root value="..." aria-label="..." size="md" />'),
            },
            'K-CHIP': {
                name: '💙Chip',
                run: template(
                    'chip',
                    (h) => figma.code`<Chip label="${h.findText('Label').textContent}" />`,
                ),
            },
        });

        expect(lines(blueprint(tree, catalog))).toEqual([
            '<Radio.Root aria-label="*" size="md" />',
            '<Chip label="*" />',
        ]);
    });

    it('finds an older published copy by name only when the name is unique in entries', () => {
        const catalog = fakeCatalog({
            'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') },
            'K-TAG-A': { name: '💙Tag', run: fixed('tag-a', '<Tag />') },
            'K-TAG-B': { name: '💙Tag', run: fixed('tag-b', '<Tag />') },
        });

        const result = blueprint(fixture('older-copy'), catalog);

        expect(lines(result)).toEqual(['<Badge />']);
        expect(result.unscorable).toEqual([
            { node: expect.any(String), name: '💙Tag', cause: 'no-template' },
        ]);
    });

    it('does not take a component local to the design file for an older copy of a library one', () => {
        const tree: FigmaTree = {
            document: {
                id: '0:1',
                name: 'Screen',
                type: 'FRAME',
                children: [
                    { id: '2:1', name: 'Dialog', type: 'INSTANCE', componentId: '1:1' },
                    { id: '2:2', name: 'Dialog', type: 'INSTANCE', componentId: '1:2' },
                ],
            },
            components: {
                '1:1': { key: 'K-DIALOG-OLD', name: 'Dialog', remote: true },
                '1:2': { key: 'K-PRODUCT-DIALOG', name: 'Dialog', remote: false },
            },
        };
        const catalog = fakeCatalog({
            'K-DIALOG': { name: 'Dialog', pkg: 'composites', run: fixed('d', '<Dialog.Root />') },
        });

        expect(blueprint(tree, catalog)).toEqual({
            version: 4,
            nodes: [{ id: '2:1', tag: 'Dialog.Root', props: [], pkg: 'composites', children: [] }],
            excluded: [],
            unscorable: [],
            texts: [],
        });
    });

    it('records a template that throws as unscorable and keeps grading the rest', () => {
        const catalog = fakeCatalog({
            'K-CHIP': {
                name: '💙Chip',
                run: () => {
                    throw new Error('boom');
                },
            },
            'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') },
        });

        const result = blueprint(fixture('template-error'), catalog);

        expect(result.unscorable).toEqual([
            { node: '2:1', name: '💙Chip', cause: 'template-error', message: 'boom' },
        ]);
        expect(lines(result)).toEqual(['<Badge />']);
    });

    it('excludes the library instances inside an excluded one for the same reason', () => {
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
                                name: 'Close',
                                type: 'INSTANCE',
                                componentId: '1:2',
                                children: [
                                    {
                                        id: '2:3',
                                        name: 'Icon',
                                        type: 'INSTANCE',
                                        componentId: '1:3',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            components: {
                '1:1': { key: 'K-DIALOG', name: '💙Dialog' },
                '1:2': { key: 'K-ICON', name: '💙IconButton' },
                '1:3': { key: 'K-CLOSE', name: '❤️CloseOutlineIcon' },
            },
        };
        const catalog = fakeCatalog(
            {
                'K-DIALOG': {
                    name: '💙Dialog',
                    pkg: 'composites',
                    run: fixed('d', '<Dialog.Root />'),
                },
                'K-ICON': { name: '💙IconButton', run: fixed('i', '<IconButton />') },
            },
            { internalParts: { 'Dialog.Root': ['IconButton'] } },
        );

        expect(blueprint(tree, catalog).excluded).toEqual([
            { node: '2:2', name: '💙IconButton', reason: 'part-draws-itself' },
            { node: '2:3', name: '❤️CloseOutlineIcon', reason: 'part-draws-itself' },
        ]);
    });

    it('excludes the library instances inside an unscorable one as inside-unscorable', () => {
        const tree: FigmaTree = {
            document: {
                id: '0:1',
                name: 'Screen',
                type: 'FRAME',
                children: [
                    {
                        id: '2:1',
                        name: 'Broken',
                        type: 'INSTANCE',
                        componentId: '1:1',
                        children: [
                            {
                                id: '2:2',
                                name: '🟨Chip/SlotLayer',
                                type: 'INSTANCE',
                                componentId: '1:9',
                                children: [
                                    {
                                        id: '2:3',
                                        name: 'Heart',
                                        type: 'INSTANCE',
                                        componentId: '1:2',
                                    },
                                ],
                            },
                            {
                                id: '2:4',
                                name: 'Layout',
                                type: 'FRAME',
                                children: [
                                    {
                                        id: '2:5',
                                        name: 'Badge',
                                        type: 'INSTANCE',
                                        componentId: '1:3',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            components: {
                '1:1': { key: 'K-CHIP', name: '💙Chip' },
                '1:2': { key: 'K-HEART', name: '❤️HeartIcon' },
                '1:3': { key: 'K-BADGE', name: '💙Badge' },
                '1:9': { key: 'K-SLOT', name: '🟨Chip/SlotLayer' },
            },
        };
        const catalog = fakeCatalog({
            'K-CHIP': {
                name: '💙Chip',
                run: () => {
                    throw new Error('boom');
                },
            },
            'K-HEART': { name: '❤️HeartIcon', pkg: 'icons', run: fixed('heart', '<HeartIcon />') },
            'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') },
        });

        expect(blueprint(tree, catalog)).toEqual({
            version: 4,
            nodes: [],
            excluded: [
                { node: '2:3', name: '❤️HeartIcon', reason: 'inside-unscorable' },
                { node: '2:5', name: '💙Badge', reason: 'inside-unscorable' },
            ],
            unscorable: [{ node: '2:1', name: '💙Chip', cause: 'template-error', message: 'boom' }],
            texts: [],
        });
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
        const catalog = fakeCatalog({
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

        expect(blueprint(tree, catalog).nodes).toEqual([
            {
                id: '2:1',
                tag: 'Button',
                props: [],
                pkg: 'core',
                children: [{ id: '2:2', tag: 'GoogleIcon', props: [], pkg: 'icons', children: [] }],
            },
        ]);
        expect(
            blueprint(fixture('internal-part'), {
                ...fakeCatalog(
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

        expect(blueprint(tree, fakeCatalog({})).unscorable).toEqual([
            { node: '2:2', name: 'Action', cause: 'no-template' },
        ]);
    });
});

describe('blueprint tree', () => {
    const badge = { 'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') } };

    it('ids every element a template writes by its instance, "#n" for the second on, and nests what it renders', () => {
        const tree: FigmaTree = {
            document: {
                id: '0:1',
                name: 'Screen',
                type: 'FRAME',
                children: [
                    {
                        id: '2:1',
                        name: 'Card',
                        type: 'INSTANCE',
                        componentId: '1:1',
                        children: [
                            { id: '2:2', name: 'First', type: 'INSTANCE', componentId: '1:2' },
                            {
                                id: '2:9',
                                name: 'Layout',
                                type: 'FRAME',
                                children: [
                                    {
                                        id: '2:3',
                                        name: 'Second',
                                        type: 'INSTANCE',
                                        componentId: '1:2',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            components: {
                '1:1': { key: 'K-CARD', name: '💙Card' },
                '1:2': { key: 'K-BADGE', name: '💙Badge' },
            },
        };
        const catalog = fakeCatalog({
            ...badge,
            'K-CARD': {
                name: '💙Card',
                run: template(
                    'card',
                    (h) =>
                        figma.code`<Card.Root><Card.Header>${h.findInstance('First').executeTemplate().example}</Card.Header><Card.Body>${h.findInstance('Second').executeTemplate().example}</Card.Body></Card.Root>`,
                ),
            },
        });

        expect(blueprint(tree, catalog).nodes).toEqual([
            {
                id: '2:1',
                tag: 'Card.Root',
                props: [],
                pkg: 'core',
                children: [
                    {
                        id: '2:1#1',
                        tag: 'Card.Header',
                        props: [],
                        pkg: 'core',
                        children: [
                            { id: '2:2', tag: 'Badge', props: [], pkg: 'core', children: [] },
                        ],
                    },
                    {
                        id: '2:1#2',
                        tag: 'Card.Body',
                        props: [],
                        pkg: 'core',
                        children: [
                            { id: '2:3', tag: 'Badge', props: [], pkg: 'core', children: [] },
                        ],
                    },
                ],
            },
        ]);
    });

    it('puts a node whose position is open under its owner root, marked anyParent', () => {
        const catalog = fakeCatalog({
            ...badge,
            'K-ITEMS': { name: '💙Pagination.Items', run: fixed('items', '<Pagination.Items />') },
            'K-ELLIPSIS': {
                name: '💙Breadcrumb.Ellipsis',
                run: fixed('ellipsis', '<Breadcrumb.Ellipsis />'),
            },
        });

        expect(blueprint(fixture('self-closing-part'), catalog).nodes).toEqual([
            {
                id: '2:1',
                tag: 'Pagination.Items',
                props: [],
                pkg: 'core',
                children: [
                    {
                        id: '2:4',
                        tag: 'Badge',
                        props: [],
                        pkg: 'core',
                        anyParent: true,
                        children: [],
                    },
                ],
            },
        ]);
    });

    it('lists an instance with no library ancestor at the top level, layout frames left out', () => {
        const tree: FigmaTree = {
            document: {
                id: '0:1',
                name: 'Screen',
                type: 'FRAME',
                children: [
                    {
                        id: '3:1',
                        name: 'Header',
                        type: 'FRAME',
                        children: [
                            { id: '2:1', name: 'Badge', type: 'INSTANCE', componentId: '1:1' },
                        ],
                    },
                    {
                        id: '3:2',
                        name: 'Body',
                        type: 'FRAME',
                        children: [
                            {
                                id: '3:3',
                                name: 'Row',
                                type: 'FRAME',
                                children: [
                                    {
                                        id: '2:2',
                                        name: 'Badge',
                                        type: 'INSTANCE',
                                        componentId: '1:1',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            components: { '1:1': { key: 'K-BADGE', name: '💙Badge' } },
        };

        expect(blueprint(tree, fakeCatalog(badge))).toEqual({
            version: 4,
            nodes: [
                { id: '2:1', tag: 'Badge', props: [], pkg: 'core', children: [] },
                { id: '2:2', tag: 'Badge', props: [], pkg: 'core', children: [] },
            ],
            excluded: [],
            unscorable: [],
            texts: [],
        });
    });
});

describe('blueprint with two copies of the package loaded', () => {
    it("runs templates bound to the first copy's figma under the second copy", async () => {
        const catalog = fakeCatalog({
            'K-PAGINATION': { name: '💙Pagination', run: fixed('p', '<Pagination.Root />') },
        });
        vi.resetModules();
        const second = await import('~/index');

        const result = second.blueprint(fixture('literal-props'), catalog);

        expect(result.unscorable).toEqual([]);
        expect(lines(result)).toEqual(['<Pagination.Root />']);
        expect(lines(blueprint(fixture('literal-props'), catalog))).toEqual([
            '<Pagination.Root />',
        ]);
    });
});

describe('blueprint boxes and texts', () => {
    const catalog = fakeCatalog({
        'K-BADGE': { name: '💙Badge', run: fixed('badge', '<Badge />') },
        'K-CARD': {
            name: '💙Card',
            run: template(
                'card',
                (h) =>
                    figma.code`<Card.Root><Card.Body>${h.findInstance('Badge').executeTemplate().example}</Card.Body></Card.Root>`,
            ),
        },
    });
    const result = blueprint(fixture('design-layers'), catalog);
    const box = (x: number, y: number, w: number, h: number) => ({ x, y, w, h });

    it('boxes each library instance relative to the graded frame, every element of one template on its instance box', () => {
        expect(result.size).toEqual({ w: 400, h: 300 });
        expect(result.unscorable).toEqual([
            { node: '5:1', name: '💙Chip', cause: 'no-template', box: box(0, 270, 60, 24) },
        ]);
        expect(result.nodes).toEqual([
            {
                id: '2:1',
                tag: 'Card.Root',
                props: [],
                pkg: 'core',
                box: box(20, 60, 200, 100),
                children: [
                    {
                        id: '2:1#1',
                        tag: 'Card.Body',
                        props: [],
                        pkg: 'core',
                        box: box(20, 60, 200, 100),
                        children: [
                            {
                                id: '2:3',
                                tag: 'Badge',
                                props: [],
                                pkg: 'core',
                                box: box(30, 135, 40, 20),
                                children: [],
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    it('takes every visible text line, library internals included, on render bounds when Figma has them', () => {
        expect(result.texts).toEqual([
            { id: '3:2', text: 'Title', box: box(12, 14, 70, 20) },
            { id: 'I2:1;2', text: 'Save', box: box(30, 70, 40, 20) },
            { id: '3:7', text: 'First', box: box(0, 200, 100, 20) },
            { id: '3:7#1', text: 'Second', box: box(0, 240, 100, 20) },
        ]);
    });

    it('keeps the height of a blank line, and leaves blank lines above and below the glyphs out of render bounds', () => {
        const frame = { x: 0, y: 0, width: 400, height: 200 };
        const text = (id: string, characters: string, y: number, height: number) => ({
            id,
            name: 'copy',
            type: 'TEXT',
            characters,
            absoluteBoundingBox: { x: 0, y, width: 200, height },
        });
        const tree: FigmaTree = {
            document: {
                id: '20:1',
                name: 'Frame',
                type: 'FRAME',
                absoluteBoundingBox: frame,
                children: [
                    text('20:2', '첫째 줄\n​\n셋째 줄', 0, 60),
                    {
                        ...text('20:3', '\nA\nB\n', 100, 80),
                        absoluteRenderBounds: { x: 0, y: 120, width: 200, height: 40 },
                    },
                ],
            },
        };

        expect(blueprint(tree, fakeCatalog({})).texts).toEqual([
            { id: '20:2', text: '첫째 줄', box: box(0, 0, 200, 20) },
            { id: '20:2#1', text: '셋째 줄', box: box(0, 40, 200, 20) },
            { id: '20:3', text: 'A', box: box(0, 120, 200, 20) },
            { id: '20:3#1', text: 'B', box: box(0, 140, 200, 20) },
        ]);
    });
});
