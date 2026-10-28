import type { FigmaNode } from '../model.ts';

/** `Table form` 노드를 markdown table로 직렬화. 첫 번째 direct child가 header, 나머지가 body.
 *  각 row 안의 cell은 DFS로 TEXT를 긁어 모아 `Table row → Slot → Table cell → TEXT` 중첩을
 *  투명하게 처리한다. column 수는 가장 긴 row 기준. 짧은 row는 채우고 긴 row는 자르면서 warning. */
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
