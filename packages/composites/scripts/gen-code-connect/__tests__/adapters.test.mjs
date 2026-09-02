// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { fromMcp } from '../adapters/mcp.mjs';
import { collectComponentSetIds, fromRest } from '../adapters/rest.mjs';
import { extract } from '../extract.mjs';

const dialogMcp = JSON.parse(
    readFileSync(new URL('./fixtures/dialog.mcp.json', import.meta.url), 'utf8'),
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

describe('fromRest', () => {
    const nodeId = '1:1';
    const restJson = {
        nodes: {
            [nodeId]: {
                document: {
                    id: nodeId,
                    type: 'COMPONENT',
                    name: 'Dialog',
                    children: [
                        {
                            id: '1:2',
                            type: 'INSTANCE',
                            name: '(Popup)',
                            componentId: 'c-popup-md',
                            componentProperties: {
                                size: { type: 'VARIANT', value: 'md' },
                            },
                            children: [
                                {
                                    id: '1:3',
                                    type: 'INSTANCE',
                                    name: '(Header)',
                                    componentId: 'c-header',
                                    componentProperties: {
                                        'title#2328:0': { type: 'TEXT', value: 'Title' },
                                        '(has description)#2328:1': {
                                            type: 'BOOLEAN',
                                            value: true,
                                        },
                                    },
                                    children: [
                                        {
                                            id: '1:4',
                                            type: 'TEXT',
                                            name: 'Title',
                                            characters: 'Title',
                                        },
                                    ],
                                },
                                {
                                    id: '1:5',
                                    type: 'INSTANCE',
                                    name: 'Action',
                                    componentId: 'c-action',
                                    componentProperties: {},
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
                components: {
                    'c-popup-md': { key: 'k1', name: 'size=md', componentSetId: 'set-popup' },
                    'c-header': { key: 'k2', name: '(Header)' },
                    'c-action': { key: 'k3', name: 'Action' },
                },
                componentSets: { 'set-popup': { key: 'ks', name: '(Popup)' } },
            },
        },
    };
    const setDocs = {
        'set-popup': {
            id: 'set-popup',
            type: 'COMPONENT_SET',
            name: '(Popup)',
            componentPropertyDefinitions: {
                size: { type: 'VARIANT', defaultValue: 'md', variantOptions: ['md', 'lg', 'xl'] },
            },
        },
    };

    it('collectComponentSetIds: INSTANCE 의 componentSetId 를 중복 없이 모은다', () => {
        expect(collectComponentSetIds(restJson, nodeId)).toEqual(['set-popup']);
    });

    it('#id 접미 제거, VARIANT 옵션은 component set 정의에서 가져온다', () => {
        const { name, tree } = fromRest(restJson, nodeId, setDocs);
        expect(name).toBe('Dialog');
        const popup = tree.children[0];
        expect(popup.props).toEqual([
            { name: 'size', type: 'VARIANT', variantOptions: ['md', 'lg', 'xl'] },
        ]);
        const header = popup.children[0];
        expect(header.props).toEqual([
            { name: 'title', type: 'TEXT' },
            { name: '(has description)', type: 'BOOLEAN' },
        ]);
        expect(header.children).toEqual([]);
        expect(popup.children[1].name).toBe('Action');
    });

    it('set 정의가 없으면 인스턴스의 현재 값만 옵션으로 쓴다', () => {
        const { tree } = fromRest(restJson, nodeId, {});
        expect(tree.children[0].props[0].variantOptions).toEqual(['md']);
    });
});
