import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { extract } from '../extract';
import { fromMcp } from './mcp';

const dialogMcp: unknown = JSON.parse(
    readFileSync(new URL('../fixtures/dialog.mcp.json', import.meta.url), 'utf8'),
);

describe('fromMcp', () => {
    it('INSTANCE descendants 만 트리로 만들고 이름·타입·옵션을 옮긴다', () => {
        const { name, tree } = fromMcp(dialogMcp);
        expect(name).toBe('Dialog');
        expect(tree.kind).toBe('ROOT');
        expect(tree.children.map((c) => c.name)).toEqual(['(Popup)']);

        const popup = tree.children[0];
        expect(popup.props).toEqual([{ name: 'size', type: 'VARIANT', variantOptions: ['md'] }]);
        expect(popup.children.map((c) => c.name)).toEqual(['(Header)', '(Body)', '(Footer)']);

        const header = popup.children[0];
        expect(header.props.map((p) => p.name)).toEqual([
            'title',
            '(has description)',
            'description',
        ]);
        expect(header.children.map((c) => c.name)).toEqual(['💙IconButton']);
    });

    it('배열이면 첫 항목을 쓴다', () => {
        const { name } = fromMcp([{ name: 'X' }, { name: 'Y' }]);
        expect(name).toBe('X');
    });

    it('name 이 없으면 에러', () => {
        expect(() => fromMcp({})).toThrow(/Invalid MCP JSON/);
        expect(() => fromMcp(null)).toThrow(/Invalid MCP JSON/);
    });

    it('Dialog 픽스처 end-to-end: extract 결과가 손으로 쓴 템플릿 구조와 같다', () => {
        const { tree } = fromMcp(dialogMcp);
        const blocks = extract(tree, { warn: () => {} });
        expect(blocks.map((b) => [b.varName, Object.keys(b.entries)])).toEqual([
            ['popup', ['size']],
            ['header', ['title', 'description']],
            ['body', ['children']],
            ['footer', ['assistive', 'action']],
        ]);
        expect(blocks[0].entries.size).toEqual({ kind: 'enum', name: 'size', options: ['md'] });
    });
});
