import { describe, expect, it } from 'vitest';

import type { SourceFile } from './compare';
import { compare } from './compare';
import type { ExpectedLine } from './expected';
import type { Tables } from './library';

const noTables: Tables = { internalIcons: {}, internalParts: {}, presets: {}, defaults: {} };

const run = (
    lines: (string | ExpectedLine)[],
    source: string[] | SourceFile[],
    tables: Partial<Tables> = {},
) =>
    compare(
        {
            lines: lines.map((l) => (typeof l === 'string' ? { line: l, pkg: 'core' } : l)),
            excluded: [],
            unscorable: [],
        },
        typeof source[0] === 'string'
            ? [{ path: 'App.tsx', text: (source as string[]).join('\n') }]
            : (source as SourceFile[]),
        { ...noTables, ...tables },
    ).rows;

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
            [
                '<IconButton aria-label="*" />',
                { line: '<MemoIcon data-in="IconButton" />', pkg: 'icons' },
            ],
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
                { line: '<BoldIcon data-in="Toggle" />', pkg: 'icons' },
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

    it('needs a presence-only prop to be there', () => {
        const rows = run(
            ['<IconButton aria-label="*" />'],
            [
                "import { IconButton } from '@vapor-ui/core';",
                'export const App = () => <IconButton />;',
            ],
        );

        expect(rows).toEqual([
            {
                line: '<IconButton aria-label="*" />',
                status: 'mismatch',
                closest: 'App.tsx:2',
                diff: ['aria-label: "*" → null'],
            },
        ]);
    });

    it('lets one code element meet one line only', () => {
        const rows = run(
            ['<Button />', '<Button disabled />', '<Button disabled />'],
            [
                "import { Button } from '@vapor-ui/core';",
                'export const App = () => (',
                '    <>',
                '        <Button disabled />',
                '        <Button />',
                '    </>',
                ');',
            ],
        );

        expect(rows.map((r) => r.status)).toEqual(['ok', 'ok', 'missing']);
    });

    it("does not let core's Dialog.Root meet the composites one", () => {
        const rows = run(
            [{ line: '<Dialog.Root />', pkg: 'composites' }],
            [
                "import { Dialog } from '@vapor-ui/core';",
                'export const App = () => <Dialog.Root />;',
            ],
        );

        expect(rows).toEqual([{ line: '<Dialog.Root />', status: 'missing' }]);
    });

    it.each([
        [
            'an aliased import',
            "import { Button as VButton } from '@vapor-ui/core';",
            'VButton',
            'App.tsx',
        ],
        ['a namespace import', "import * as V from '@vapor-ui/core';", 'V.Button', 'App.tsx'],
        [
            'a subpath import',
            "import { Button } from '@vapor-ui/core/button';",
            'Button',
            'App.tsx',
        ],
        ['a .jsx file', "import { Button } from '@vapor-ui/core';", 'Button', 'App.jsx'],
    ])('reads %s', (_, imports, tag, path) => {
        const rows = run(
            ['<Button size="lg" />'],
            [{ path, text: `${imports}\nexport const App = () => <${tag} size="lg" />;` }],
        );

        expect(rows).toEqual([{ line: '<Button size="lg" />', status: 'ok', at: `${path}:2` }]);
    });

    it('applies a preset wrapper whatever subpath it is imported from, and a context-picked prop matches any branch', () => {
        const rows = run(
            ['<Button size="lg" colorPalette="danger" />'],
            [
                "import { AlertDialog } from '@vapor-ui/composites/alert-dialog';",
                'export const App = () => <AlertDialog.Action>Delete</AlertDialog.Action>;',
            ],
            {
                presets: {
                    'AlertDialog.Action': {
                        tag: 'Button',
                        props: { size: 'lg', colorPalette: ['danger', 'primary'] },
                    },
                },
            },
        );

        expect(rows.map((r) => r.status)).toEqual(['ok']);
    });

    it("reads a local component's props only where its body renders them, not at the call site too", () => {
        const rows = run(
            [
                '<Card.Root />',
                '<IconButton data-in="Card.Root" />',
                { line: '<MemoIcon data-in="Card.Root" />', pkg: 'icons' },
            ],
            [
                "import { Card, IconButton } from '@vapor-ui/core';",
                "import { MemoIcon } from '@vapor-ui/icons';",
                'const Tab = ({ icon }) => <IconButton>{icon}</IconButton>;',
                'export const App = () => (',
                '    <Card.Root>',
                '        <Tab icon={<MemoIcon />} />',
                '    </Card.Root>',
                ');',
            ],
        );

        expect(rows.map((r) => (r.status === 'mismatch' ? r.diff : r.status))).toEqual([
            'ok',
            'ok',
            ['data-in: Card.Root → IconButton'],
        ]);
    });

    it('skips a component nothing renders and nobody exports', () => {
        const rows = run(
            ['<Button />'],
            [
                "import { Button } from '@vapor-ui/core';",
                'const Unused = () => <Button />;',
                'export const App = () => null;',
            ],
        );

        expect(rows).toEqual([{ line: '<Button />', status: 'missing' }]);
    });

    it('reads a component from another file against that file’s imports', () => {
        const rows = run(
            ['<Card.Root />', '<Badge data-in="Card.Root" />'],
            [
                {
                    path: 'Status.tsx',
                    text: "import { Badge } from '@vapor-ui/core';\nexport const Status = () => <Badge />;",
                },
                {
                    path: 'App.tsx',
                    text: [
                        "import { Card } from '@vapor-ui/core';",
                        "import { Status } from './Status';",
                        'export const App = () => (',
                        '    <Card.Root>',
                        '        <Status />',
                        '    </Card.Root>',
                        ');',
                    ].join('\n'),
                },
            ],
        );

        expect(rows).toEqual([
            { line: '<Card.Root />', status: 'ok', at: 'App.tsx:4' },
            { line: '<Badge data-in="Card.Root" />', status: 'ok', at: 'Status.tsx:2' },
        ]);
    });

    it('lets an element inside .map() meet every line the design repeats it for', () => {
        const rows = run(
            [
                '<Table.Cell />',
                '<Table.Cell />',
                '<Table.Cell />',
                '<Button disabled />',
                '<Button disabled />',
            ],
            [
                "import { Button, Table } from '@vapor-ui/core';",
                'export const App = ({ rows }) => (',
                '    <>',
                '        {rows.map((r) => <Table.Cell key={r} />)}',
                '        <Button disabled />',
                '    </>',
                ');',
            ],
        );

        expect(rows.map((r) => r.status)).toEqual(['ok', 'ok', 'ok', 'ok', 'missing']);
    });

    it('counts an icon the code passes around as a value, once per mention', () => {
        const rows = run(
            [
                { line: '<DashboardOutlineIcon />', pkg: 'icons' },
                { line: '<LockOutlineIcon />', pkg: 'icons' },
                { line: '<LockOutlineIcon />', pkg: 'icons' },
            ],
            [
                "import { DashboardOutlineIcon, LockOutlineIcon } from '@vapor-ui/icons';",
                'const NAV = [{ icon: DashboardOutlineIcon }, { icon: LockOutlineIcon }];',
                'export const App = () => <nav>{NAV.map((n) => <n.icon key="x" />)}</nav>;',
            ],
        );

        expect(rows.map((r) => r.status)).toEqual(['ok', 'ok', 'missing']);
    });

    it('accepts an expression it cannot read for a flag or a value, but not one whose consts rule the value out', () => {
        const rows = run(
            [
                '<Button disabled />',
                '<Button colorPalette="primary" />',
                '<Badge colorPalette="danger" />',
            ],
            [
                "import { Badge, Button } from '@vapor-ui/core';",
                "const TONE = { a: 'success', b: 'hint' };",
                'export const App = ({ isPaused, tone, s }) => (',
                '    <>',
                '        <Button disabled={isPaused} />',
                '        <Button colorPalette={tone} />',
                '        <Badge colorPalette={TONE[s]} />',
                '    </>',
                ');',
            ],
        );

        expect(rows.map((r) => r.status)).toEqual(['ok', 'ok', 'mismatch']);
    });

    it('reports the result the exit code follows', () => {
        const result = (unscorable: number, source: string) =>
            compare(
                {
                    lines: [{ line: '<Button />', pkg: 'core' }],
                    excluded: [],
                    unscorable: Array.from({ length: unscorable }, () => ({
                        node: '1:1',
                        name: '💙Toolbar',
                        cause: 'no-template' as const,
                    })),
                },
                [{ path: 'App.tsx', text: `import { Button } from '@vapor-ui/core';\n${source}` }],
                noTables,
            ).result;

        expect(result(0, 'export const App = () => <Button />;')).toBe('pass');
        expect(result(0, 'export const App = () => null;')).toBe('fail');
        expect(result(1, 'export const App = () => <Button />;')).toBe('unscorable');
    });
});
