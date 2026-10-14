import figma from 'figma';

import { example, icon, lines } from '../../utils/figma';

const TABLE_PART_ID = {
    root: 'table-root',
    header: 'table-header',
    body: 'table-body',
    footer: 'table-footer',
    row: 'table-row',
    heading: 'table-heading',
    cell: 'table-cell',
    columnGroup: 'table-column-group',
    column: 'table-column',
} as const;

type TablePart = keyof typeof TABLE_PART_ID;

const instance = figma.selectedInstance;
const part: TablePart = figma.batch.part;
const { component } = figma.batch;

function child(name: TablePart) {
    return example(
        instance.findConnectedInstance(TABLE_PART_ID[name], { traverseInstances: true }),
    );
}

/** Renders the connected descendants of the given parts one per line, or a placeholder if none. */
function children(names: TablePart[]) {
    const ids: string[] = names.map((name) => TABLE_PART_ID[name]);
    const handles = instance.findConnectedInstances(
        (node) => ids.includes(node.codeConnectId() ?? ''),
        // Cells and columns sit inside unconnected wrapper instances (`🟨Table.cell/SlotLayer`).
        { traverseInstances: true },
    );
    if (handles.length === 0) return '{/* contents */}';

    return figma.code`${lines(handles.map(example))}
`;
}

/** Leading/trailing icons plus the optional checkbox and avatar of a heading or cell slot. */
function content(slotName: string, checkboxProp: string) {
    const slot = instance.findInstance(slotName);
    if (slot.type !== 'INSTANCE') return '{/* contents */}';

    const checkbox = slot.getBoolean(checkboxProp)
        ? example(slot.findConnectedInstance('checkbox'))
        : '';
    const avatar =
        part === 'cell' && slot.getBoolean('hasAvatar')
            ? example(slot.findConnectedInstance('avatar'))
            : '';

    return figma.code`${checkbox}${icon(slot, 'hasLeadingIcon', 'LeadingIcon')}${avatar}{/* contents */}${icon(slot, 'hasTrailingIcon', 'TrailingIcon')}`;
}

function render() {
    // Figma nests the ColumnGroup inside Body; in code `<colgroup>` belongs directly under `<table>`.
    if (part === 'root') {
        return figma.code`<Table.Root>
    ${child('columnGroup')}
    ${child('header')}
    ${child('body')}
    ${child('footer')}
</Table.Root>`;
    }

    if (part === 'header' || part === 'body' || part === 'footer') {
        return figma.code`<${component}>${children(['row'])}</${component}>`;
    }

    if (part === 'row') {
        return figma.code`<Table.Row>${children(['heading', 'cell'])}</Table.Row>`;
    }

    if (part === 'columnGroup') {
        return figma.code`<Table.ColumnGroup>${children(['column'])}</Table.ColumnGroup>`;
    }

    // Figma draws a Column as a vertical stack of cells; in code it is an empty `<col>`.
    if (part === 'column') {
        return figma.code`<Table.Column />`;
    }

    if (part === 'heading') {
        return figma.code`<Table.Heading>${content('🟨Table.Heading/SlotLayer', 'hasCheckbox')}</Table.Heading>`;
    }

    // `hasChceckBox` is misspelled that way in Figma.
    return figma.code`<Table.Cell>${content('🟨Table.Cell/SlotLayer', 'hasChceckBox')}</Table.Cell>`;
}

export default {
    example: render(),
    imports: ['import { Table } from "@vapor-ui/core"'],
    id: TABLE_PART_ID[part],
    metadata: { nestable: true },
};
