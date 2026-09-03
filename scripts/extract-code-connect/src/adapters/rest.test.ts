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
});
