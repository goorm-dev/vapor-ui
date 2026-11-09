import { describe, expect, it } from 'vitest';

import { compare } from './compare';
import type { Tables } from './library';

const noTables: Tables = { internalIcons: {}, internalParts: {}, presets: {}, defaults: {} };

const run = (lines: string[], source: string[], tables: Partial<Tables> = {}) =>
    compare({ lines, errors: [], unmapped: [] }, [{ path: 'App.tsx', text: source.join('\n') }], {
        ...noTables,
        ...tables,
    }).rows;

describe('compare', () => {
    it('matches a composites preset wrapper as the core element it renders', () => {
        const rows = run(
            ['<Button size="lg" colorPalette="primary" />'],
            [
                "import { Dialog } from '@vapor-ui/composites';",
                'export const App = () => <Dialog.Action>Save</Dialog.Action>;',
            ],
            {
                presets: {
                    'Dialog.Action': {
                        tag: 'Button',
                        props: { size: 'lg', colorPalette: 'primary' },
                    },
                },
            },
        );

        expect(rows).toEqual([
            { line: '<Button size="lg" colorPalette="primary" />', status: 'ok', at: 'App.tsx:2' },
        ]);
    });

    it("matches an omitted prop against the part's variant default", () => {
        const rows = run(
            ['<Button variant="fill" />'],
            [
                "import { Button } from '@vapor-ui/core';",
                'export const App = () => <Button>Go</Button>;',
            ],
            { defaults: { Button: { variant: 'fill' } } },
        );

        expect(rows).toEqual([
            { line: '<Button variant="fill" />', status: 'ok', at: 'App.tsx:2' },
        ]);
    });

    it("never offers an element another line matched as a miss's closest candidate", () => {
        const rows = run(
            ['<Button variant="fill" />', '<Button variant="outline" size="lg" />'],
            [
                "import { Button } from '@vapor-ui/core';",
                'export const App = () => (',
                '    <>',
                '        <Button variant="fill" size="lg" />',
                '        <Button variant="ghost" />',
                '    </>',
                ');',
            ],
        );

        expect(rows).toEqual([
            { line: '<Button variant="fill" />', status: 'ok', at: 'App.tsx:4' },
            {
                line: '<Button variant="outline" size="lg" />',
                status: 'mismatch',
                closest: 'App.tsx:5',
                diff: ['variant: "outline" → "ghost"', 'size: "lg" → null'],
            },
        ]);
    });

    it('inlines a local component at its call site, rendering JSX props where its body reads them', () => {
        const rows = run(
            ['<IconButton aria-label="*" />', '<MemoIcon data-in="IconButton" />'],
            [
                "import { IconButton } from '@vapor-ui/core';",
                "import { MemoIcon } from '@vapor-ui/icons';",
                'const SideToolTab = ({ icon }) => <IconButton aria-label="memo">{icon}</IconButton>;',
                'export const App = () => <SideToolTab icon={<MemoIcon />} />;',
            ],
        );

        expect(rows).toEqual([
            { line: '<IconButton aria-label="*" />', status: 'ok', at: 'App.tsx:3' },
            { line: '<MemoIcon data-in="IconButton" />', status: 'ok', at: 'App.tsx:4' },
        ]);
    });

    it('puts the children of an element with render={<Toggle />} inside a Toggle', () => {
        const rows = run(
            [
                '<Toolbar.Button />',
                '<Toggle data-in="Toolbar.Button" />',
                '<BoldIcon data-in="Toggle" />',
            ],
            [
                "import { Toggle, Toolbar } from '@vapor-ui/core';",
                "import { BoldIcon } from '@vapor-ui/icons';",
                'export const App = () => (',
                '    <Toolbar.Button render={<Toggle />}>',
                '        <BoldIcon />',
                '    </Toolbar.Button>',
                ');',
            ],
        );

        expect(rows).toEqual([
            { line: '<Toolbar.Button />', status: 'ok', at: 'App.tsx:4' },
            { line: '<Toggle data-in="Toolbar.Button" />', status: 'ok', at: 'App.tsx:4' },
            { line: '<BoldIcon data-in="Toggle" />', status: 'ok', at: 'App.tsx:5' },
        ]);
    });

    it("resolves a prop's identifier to the nearest enclosing block's const before a top-level one", () => {
        const rows = run(
            ['<Badge colorPalette="success" />', '<Badge colorPalette="danger" />'],
            [
                "import { Badge } from '@vapor-ui/core';",
                "const color = 'danger';",
                'export const List = ({ items }) =>',
                '    items.map((item) => {',
                "        const color = 'success';",
                '        return <Badge key={item} colorPalette={color} />;',
                '    });',
            ],
        );

        expect(rows).toEqual([
            { line: '<Badge colorPalette="success" />', status: 'ok', at: 'App.tsx:6' },
            { line: '<Badge colorPalette="danger" />', status: 'missing' },
        ]);
    });
});
