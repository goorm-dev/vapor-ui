import { describe, expect, it } from 'vitest';

import { collectComponentSetIds, fromRest } from './rest';
import type { RestComponentSetDoc, RestNodesResponse } from './rest';

const nodeId = '1:1';

const restJson: RestNodesResponse = {
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
                                    '(has description)#2328:1': { type: 'BOOLEAN', value: true },
                                },
                                children: [{ id: '1:4', type: 'TEXT', name: 'Title' }],
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
                'c-popup-md': { componentSetId: 'set-popup' },
                'c-header': {},
                'c-action': {},
            },
        },
    },
};

const setDocs: Record<string, RestComponentSetDoc> = {
    'set-popup': {
        componentPropertyDefinitions: {
            size: { type: 'VARIANT', variantOptions: ['md', 'lg', 'xl'] },
        },
    },
};

describe('collectComponentSetIds', () => {
    it('INSTANCE 의 componentSetId 를 중복 없이 모은다', () => {
        expect(collectComponentSetIds(restJson, nodeId)).toEqual(['set-popup']);
    });

    it('노드가 응답에 없으면 에러', () => {
        expect(() => collectComponentSetIds({ nodes: {} }, nodeId)).toThrow(/not found/);
    });
});

describe('fromRest', () => {
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

    it('TEXT 자식의 componentPropertyReferences.visible 을 대응 prop 의 visibleWhen 으로 옮긴다', () => {
        const json: RestNodesResponse = {
            nodes: {
                [nodeId]: {
                    document: {
                        id: nodeId,
                        type: 'COMPONENT',
                        name: 'Header',
                        children: [
                            {
                                id: '2:1',
                                type: 'INSTANCE',
                                name: '(Header)',
                                componentProperties: {
                                    'description#2328:2': { type: 'TEXT', value: 'x' },
                                    'title#2328:0': { type: 'TEXT', value: 'y' },
                                },
                                children: [
                                    {
                                        id: '2:2',
                                        type: 'TEXT',
                                        name: 'Description',
                                        componentPropertyReferences: {
                                            characters: 'description#2328:2',
                                            visible: '(has description)#2328:1',
                                        },
                                    },
                                    {
                                        id: '2:3',
                                        type: 'TEXT',
                                        name: 'Title',
                                        componentPropertyReferences: {
                                            characters: 'title#2328:0',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        };
        const { tree } = fromRest(json, nodeId, {});
        const header = tree.children[0];
        expect(header.props).toEqual([
            {
                name: 'description',
                type: 'TEXT',
                visibleWhen: '(has description)',
            },
            { name: 'title', type: 'TEXT' },
        ]);
    });

    it('INSTANCE 자식의 componentPropertyReferences.visible 을 TreeNode.visibleWhen 으로 옮긴다', () => {
        const json: RestNodesResponse = {
            nodes: {
                [nodeId]: {
                    document: {
                        id: nodeId,
                        type: 'COMPONENT',
                        name: 'Footer',
                        children: [
                            {
                                id: '3:1',
                                type: 'INSTANCE',
                                name: '(Footer)',
                                componentProperties: {},
                                children: [
                                    {
                                        id: '3:2',
                                        type: 'INSTANCE',
                                        name: 'Assistive',
                                        componentPropertyReferences: {
                                            visible: '(has assistive)#2122:24',
                                        },
                                        children: [],
                                    },
                                    {
                                        id: '3:3',
                                        type: 'INSTANCE',
                                        name: 'Action',
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        };
        const { tree } = fromRest(json, nodeId, {});
        const footer = tree.children[0];
        expect(footer.children.map((c) => [c.name, c.visibleWhen])).toEqual([
            ['Assistive', '(has assistive)'],
            ['Action', undefined],
        ]);
    });
});
