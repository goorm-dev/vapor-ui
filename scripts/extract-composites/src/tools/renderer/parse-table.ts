import type { FigmaNode } from '../../shared/types.ts';

/** Render a `Table form` node as a markdown table.
 *  - First direct child (positional) = header row.
 *  - Remaining direct children = body rows, in canvas order.
 *  - Within each row, cells are DFS-collected TEXT nodes (handles `Table row → Slot →
 *    Table cell → TEXT` nesting transparently).
 *  - Column count = max across rows. Short rows padded, long rows trimmed with warning. */
export function renderTableForm(
    tableForm: FigmaNode,
    warnings: string[],
    locator: string,
): string | undefined {
    const rowNodes = tableForm.children ?? [];
    if (rowNodes.length === 0) return undefined;
    const rows = rowNodes.map(collectRowCells);
    const columnCount = Math.max(...rows.map((r) => r.length));
    if (columnCount === 0) return undefined;
    const normalized = rows.map((row) => {
        if (row.length === columnCount) return row;
        if (row.length < columnCount) {
            warnings.push(`${locator}: short row padded (${row.length} → ${columnCount} cells)`);
            return [...row, ...new Array(columnCount - row.length).fill('')];
        }
        warnings.push(`${locator}: long row trimmed (${row.length} → ${columnCount} cells)`);
        return row.slice(0, columnCount);
    });
    const [header, ...body] = normalized;
    if (!header) return undefined;
    const divider = new Array(columnCount).fill('---');
    const lines = [renderRow(header), renderRow(divider), ...body.map(renderRow)];
    return lines.join('\n');
}

function collectRowCells(row: FigmaNode): string[] {
    const texts: string[] = [];
    const visit = (n: FigmaNode): void => {
        if (n !== row && n.type === 'TEXT' && typeof n.characters === 'string') {
            const trimmed = n.characters.trim();
            if (trimmed) texts.push(trimmed);
        }
        for (const child of n.children ?? []) visit(child);
    };
    visit(row);
    return texts;
}

function renderRow(cells: string[]): string {
    return `| ${cells.map(escapeCell).join(' | ')} |`;
}

function escapeCell(cell: string): string {
    return cell.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br/>');
}
