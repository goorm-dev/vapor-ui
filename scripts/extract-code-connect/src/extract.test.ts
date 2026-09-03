import { describe, expect, it, vi } from 'vitest';

import { extract } from './extract';
import type { Prop, TreeNode } from './model';

const node = (name: string, props: Prop[] = [], children: TreeNode[] = []): TreeNode => ({
    kind: 'INSTANCE',
    name,
    props,
    children,
});
const root = (children: TreeNode[]): TreeNode => ({
    kind: 'ROOT',
    name: 'Root',
    props: [],
    children,
});

describe('extract', () => {
    it('괄호 인스턴스는 블록이 되고 속성은 kind 로 매핑된다', () => {
        const tree = root([
            node(
                '(Popup)',
                [{ name: 'size', type: 'VARIANT', variantOptions: ['md', 'lg', 'xl'] }],
                [
                    node('(Header)', [
                        { name: 'title', type: 'TEXT' },
                        { name: 'description', type: 'TEXT' },
                        { name: 'compact', type: 'BOOLEAN' },
                    ]),
                ],
            ),
        ]);

        expect(extract(tree)).toEqual([
            {
                varName: 'popup',
                instanceName: '(Popup)',
                entries: { size: { kind: 'enum', name: 'size', options: ['md', 'lg', 'xl'] } },
                todos: [],
            },
            {
                varName: 'header',
                instanceName: '(Header)',
                entries: {
                    title: { kind: 'string', name: 'title' },
                    description: { kind: 'string', name: 'description' },
                    compact: { kind: 'boolean', name: 'compact' },
                },
                todos: [],
            },
        ]);
    });

    it('괄호 속성은 제외하지만 SLOT 은 항상 children 이다', () => {
        const tree = root([
            node('(Body)', [
                { name: '(content)', type: 'SLOT' },
                { name: '(scroll)', type: 'VARIANT', variantOptions: ['false'] },
                { name: '(has x)', type: 'BOOLEAN' },
                { name: '(label)', type: 'TEXT' },
            ]),
        ]);

        expect(extract(tree)[0].entries).toEqual({
            children: { kind: 'slot', name: '(content)' },
        });
    });

    it('괄호 없는 SLOT 도 children 으로 매핑된다', () => {
        const tree = root([node('(Body)', [{ name: 'content', type: 'SLOT' }])]);
        expect(extract(tree)[0].entries).toEqual({ children: { kind: 'slot', name: 'content' } });
    });

    it('비괄호 인스턴스는 조상 블록에 instance 로 붙고 하위는 탐색하지 않는다', () => {
        const tree = root([
            node(
                '(Footer)',
                [],
                [
                    node(
                        'Assistive',
                        [{ name: 'assistive', type: 'VARIANT', variantOptions: ['button'] }],
                        [node('(Inner)', [{ name: 'x', type: 'TEXT' }])],
                    ),
                    node('Action'),
                ],
            ),
        ]);

        const blocks = extract(tree);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].entries).toEqual({
            assistive: { kind: 'instance', name: 'Assistive' },
            action: { kind: 'instance', name: 'Action' },
        });
    });

    it('이모지 접두 인스턴스는 하위까지 스킵한다', () => {
        const tree = root([
            node(
                '(Header)',
                [{ name: 'title', type: 'TEXT' }],
                [
                    node(
                        '💙IconButton',
                        [{ name: 'size', type: 'VARIANT', variantOptions: ['xl'] }],
                        [node('(Deep)', [{ name: 'y', type: 'TEXT' }])],
                    ),
                ],
            ),
        ]);

        const blocks = extract(tree);
        expect(blocks).toHaveLength(1);
        expect(Object.keys(blocks[0].entries)).toEqual(['title']);
    });

    it('루트 직속 비괄호 인스턴스는 경고 후 스킵한다', () => {
        const warn = vi.fn();
        const tree = root([
            node('Orphan'),
            node('(Popup)', [{ name: 'size', type: 'VARIANT', variantOptions: ['md'] }]),
        ]);

        const blocks = extract(tree, { warn });
        expect(blocks.map((b) => b.varName)).toEqual(['popup']);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Orphan'));
    });

    it('INSTANCE_SWAP 은 todos 로 남긴다', () => {
        const tree = root([node('(Slot)', [{ name: 'Icon', type: 'INSTANCE_SWAP' }])]);
        const [block] = extract(tree);
        expect(block.entries).toEqual({});
        expect(block.todos).toEqual(['Icon']);
    });

    it('블록 변수명 중복은 에러', () => {
        const tree = root([node('(Popup)'), node('(popup)')]);
        expect(() => extract(tree)).toThrow(/duplicate block/i);
    });

    it('같은 블록 안 key 중복은 에러', () => {
        const tree = root([node('(Footer)', [{ name: 'action', type: 'TEXT' }], [node('Action')])]);
        expect(() => extract(tree)).toThrow(/duplicate key/i);
    });

    it('VARIANT 옵션이 비어 있으면 에러', () => {
        const tree = root([
            node('(Popup)', [{ name: 'size', type: 'VARIANT', variantOptions: [] }]),
        ]);
        expect(() => extract(tree)).toThrow(/no variant options/i);
    });
});
