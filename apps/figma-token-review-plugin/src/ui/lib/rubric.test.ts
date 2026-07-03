import { describe, expect, it } from 'vitest';

import type { Conformant, NodeInfo, RawExtract } from '~/common/schemas';
import { loadColorSchema } from '~/ui/lib/loaders/color';
import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';
import { buildLlmInput } from '~/ui/lib/rubric';

const colorSchema = loadColorSchema('light');
const textStyleSchema = loadTextStyleSchema();

const fgKey =
    Object.entries(colorSchema.semantic).find(([, v]) => v.role === 'foreground')?.[0] ?? '';

const extract: RawExtract = {
    schemaMode: 'light',
    viewport: 'pc',
    colors: [
        {
            nodeId: '1',
            name: 't',
            property: 'text',
            token: fgKey,
            hex: '#000',
            tokenStatus: 'ok',
            background: null,
        },
    ],
    typography: [
        {
            nodeId: '2',
            name: 'h',
            characters: '제목',
            textStyle: 'subtitle1',
            viewport: 'pc',
            appliedStatus: 'styled-clean',
            overriddenFields: [],
            resolved: { fontSize: 14, lineHeight: {}, letterSpacing: {}, fontName: {} },
        },
    ],
    spaces: [],
    dimensions: [],
    radii: [],
    shadows: [],
    stats: { nodeCount: 0, textNodes: 0, visited: 0 },
};

function makeEmptyExtract() {
    return {
        schemaMode: 'light' as const,
        viewport: 'pc' as const,
        colors: [],
        typography: [],
        spaces: [],
        dimensions: [],
        radii: [],
        shadows: [],
        stats: { nodeCount: 0, textNodes: 0, visited: 0 },
    };
}

describe('buildLlmInput', () => {
    it('의미 판정 대상은 결정론 통과 conformant 노드만', () => {
        const conformant = {
            color: [
                { nodeId: '1', name: 't', property: 'fill-on-text', token: fgKey } as Conformant,
            ],
            typography: [
                { nodeId: '2', name: 'h', property: 'textStyle', token: 'subtitle1' } as Conformant,
            ],
        };
        const input = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            frameName: 'frame',
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        expect(input.judgmentTargets.semanticColor.map((t) => t.nodeId)).toEqual(['1']);
        expect(input.judgmentTargets.typography.map((t) => t.nodeId)).toEqual(['2']);
    });

    it('rubric 서브셋은 실제 등장한 토큰만 담는다', () => {
        const conformant = {
            color: [
                { nodeId: '1', name: 't', property: 'fill-on-text', token: fgKey } as Conformant,
            ],
            typography: [
                { nodeId: '2', name: 'h', property: 'textStyle', token: 'subtitle1' } as Conformant,
            ],
        };
        const input = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            frameName: 'frame',
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        expect(Object.keys(input.rubric.color)).toEqual([fgKey]);
        // textStyle rubric 는 스키마 전체(16개)를 포함하므로 subtitle1 포함 여부 확인
        expect(input.rubric.textStyle['subtitle1']).toBeDefined();
        expect(Object.keys(input.rubric.textStyle).length).toBe(textStyleSchema.order.length);
    });

    it('결정론 실패 노드는 판정 대상에서 제외', () => {
        // conformant에 없는 nodeId '3'은 제외되어야 함
        const conformant = {
            color: [],
            typography: [],
        };
        const input = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            frameName: 'frame',
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        expect(input.judgmentTargets.semanticColor).toHaveLength(0);
        expect(input.judgmentTargets.typography).toHaveLength(0);
        expect(Object.keys(input.rubric.color)).toHaveLength(0);
        // textStyle rubric 는 conformant 여부와 무관하게 스키마 전체를 포함
        expect(Object.keys(input.rubric.textStyle).length).toBe(textStyleSchema.order.length);
    });

    it('context 필드가 올바르게 채워진다', () => {
        const conformant = { color: [], typography: [] };
        const input = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            frameName: 'MyFrame',
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        expect(input.context.schemaMode).toBe('light');
        expect(input.context.viewport).toBe('pc');
        expect(input.context.frameName).toBe('MyFrame');
    });

    it('nodeTree가 LlmInput에 그대로 복사된다', () => {
        const nodeTree: NodeInfo[] = [
            { id: 'r', type: 'FRAME', name: 'Root', parentId: null, childIds: ['c'], x: 0, y: 0, w: 100, h: 200 },
            { id: 'c', type: 'TEXT', name: 'Caption', parentId: 'r', childIds: [], x: 10, y: 10, w: 80, h: 20 },
        ];
        const input = buildLlmInput({
            extract,
            deterministicConformant: { color: [], typography: [] },
            frameName: 'F',
            colorSchema,
            textStyleSchema,
            nodeTree,
        });
        expect(input.nodeTree).toEqual(nodeTree);
    });

    it('textStyleRubric 는 스키마 전체 스타일을 포함한다 (사용/미사용 무관)', () => {
        const schema = loadTextStyleSchema();
        const input = buildLlmInput({
            extract: makeEmptyExtract(),
            deterministicConformant: { color: [], typography: [] },
            frameName: 'frame',
            colorSchema: loadColorSchema('light'),
            textStyleSchema: schema,
            nodeTree: [],
        });
        for (const name of schema.order) {
            expect(input.rubric.textStyle[name]).toBeDefined();
        }
        expect(Object.keys(input.rubric.textStyle).length).toBe(schema.order.length);
    });
});
