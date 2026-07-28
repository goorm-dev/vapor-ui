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
        const { input } = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        expect(input.judgmentTargets.semanticColor.map((t) => t.nodeId)).toEqual(['1']);
        expect(input.judgmentTargets.typography.map((t) => t.nodeId)).toEqual(['2']);
    });

    it('targets lookup 은 nodeId(+property) 로 원본 target 을 복원한다', () => {
        const conformant = {
            color: [
                { nodeId: '1', name: 't', property: 'fill-on-text', token: fgKey } as Conformant,
            ],
            typography: [
                { nodeId: '2', name: 'h', property: 'textStyle', token: 'subtitle1' } as Conformant,
            ],
        };
        const { targets } = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        expect(targets.typography.get('2')?.textStyle).toBe('subtitle1');
        expect(targets.color.get('1:fill-on-text')?.token).toBe(fgKey);
        expect(targets.nameByNodeId.get('1')).toBe('t');
        expect(targets.nameByNodeId.get('2')).toBe('h');
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
        const { input } = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        expect(Object.keys(input.rubric.color)).toEqual([fgKey]);
        expect(input.rubric.textStyle['subtitle1']).toBeDefined();
        expect(Object.keys(input.rubric.textStyle).length).toBe(textStyleSchema.order.length);
    });

    it('rubric.textStyle 항목은 rank/when/avoid 만 담는다 (description/totalRanks 제거)', () => {
        const { input } = buildLlmInput({
            extract,
            deterministicConformant: { color: [], typography: [] },
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        const first = Object.values(input.rubric.textStyle)[0]!;
        expect(Object.keys(first).sort()).toEqual(['avoid', 'rank', 'when']);
    });

    it('rubric.color 항목은 when/avoid 만 담는다 (role/description 제거)', () => {
        const conformant = {
            color: [
                { nodeId: '1', name: 't', property: 'fill-on-text', token: fgKey } as Conformant,
            ],
            typography: [],
        };
        const { input } = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        const entry = input.rubric.color[fgKey]!;
        expect(Object.keys(entry).sort()).toEqual(['avoid', 'when']);
    });

    it('결정론 실패 노드는 판정 대상에서 제외', () => {
        const conformant = { color: [], typography: [] };
        const { input } = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        expect(input.judgmentTargets.semanticColor).toHaveLength(0);
        expect(input.judgmentTargets.typography).toHaveLength(0);
        expect(Object.keys(input.rubric.color)).toHaveLength(0);
        expect(Object.keys(input.rubric.textStyle).length).toBe(textStyleSchema.order.length);
    });

    it('context 는 schemaMode/viewport/totalRanks 만 담고 frameName 은 없다', () => {
        const conformant = { color: [], typography: [] };
        const { input } = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        expect(input.context.schemaMode).toBe('light');
        expect(input.context.viewport).toBe('pc');
        expect(input.context.totalRanks).toBe(textStyleSchema.order.length);
        expect((input.context as Record<string, unknown>).frameName).toBeUndefined();
    });

    it('nodeTree가 LlmInput에 그대로 복사된다', () => {
        const nodeTree: NodeInfo[] = [
            {
                id: 'r',
                type: 'FRAME',
                name: 'Root',
                parentId: null,
            },
            {
                id: 'c',
                type: 'TEXT',
                name: 'Caption',
                parentId: 'r',
            },
        ];
        const { input } = buildLlmInput({
            extract,
            deterministicConformant: { color: [], typography: [] },
            colorSchema,
            textStyleSchema,
            nodeTree,
        });
        expect(input.nodeTree).toEqual(nodeTree);
    });

    it('typography target 은 nodeId/textStyle 만 담고 name/characters 를 담지 않는다', () => {
        const conformant = {
            color: [],
            typography: [
                { nodeId: '2', name: 'h', property: 'textStyle', token: 'subtitle1' } as Conformant,
            ],
        };
        const { input } = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        const target = input.judgmentTargets.typography[0]!;
        expect(Object.keys(target).sort()).toEqual(['nodeId', 'textStyle']);
    });

    it('color target 은 nodeId/property/token 만 담고 name 을 담지 않는다', () => {
        const conformant = {
            color: [
                { nodeId: '1', name: 't', property: 'fill-on-text', token: fgKey } as Conformant,
            ],
            typography: [],
        };
        const { input } = buildLlmInput({
            extract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        const target = input.judgmentTargets.semanticColor[0]!;
        expect(Object.keys(target).sort()).toEqual(['nodeId', 'property', 'token']);
    });

    it('같은 스타일 그룹의 형제 노드는 각각 별도의 LLM target 으로 펼쳐진다', () => {
        const fgKey =
            Object.entries(colorSchema.semantic).find(([, v]) => v.role === 'foreground')?.[0] ??
            '';
        const groupedExtract: RawExtract = {
            schemaMode: 'light',
            viewport: 'pc',
            colors: [
                {
                    nodeId: 'A',
                    nodeIds: ['A', 'B', 'C'],
                    name: 'title',
                    property: 'text',
                    token: fgKey,
                    hex: '#000',
                    tokenStatus: 'ok',
                    background: { kind: 'white', hex: '#ffffff' },
                } as unknown as RawExtract['colors'][number],
            ],
            typography: [],
            spaces: [],
            dimensions: [],
            radii: [],
            shadows: [],
            stats: { nodeCount: 3, textNodes: 3, visited: 3 },
        };
        const conformant = {
            color: [
                {
                    nodeId: 'A',
                    nodeIds: ['A', 'B', 'C'],
                    name: 'title',
                    property: 'fill-on-text',
                    token: fgKey,
                } as Conformant,
            ],
            typography: [],
        };
        const { input } = buildLlmInput({
            extract: groupedExtract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        const ids = input.judgmentTargets.semanticColor.map((t) => t.nodeId).sort();
        expect(ids).toEqual(['A', 'B', 'C']);
    });

    it('같은 노드에 fill/stroke 두 색이 붙어도 각 conformant 의 property 를 그대로 보존한다', () => {
        const bgKey =
            Object.entries(colorSchema.semantic).find(([, v]) => v.role === 'background')?.[0] ??
            '';
        const borderKey =
            Object.entries(colorSchema.semantic).find(([, v]) => v.role === 'border')?.[0] ?? '';
        const twoPaintExtract: RawExtract = {
            schemaMode: 'light',
            viewport: 'pc',
            colors: [
                {
                    nodeId: '150:537',
                    name: 'Card',
                    property: 'fill',
                    token: bgKey,
                    hex: '#fff',
                    tokenStatus: 'ok',
                    background: null,
                },
                {
                    nodeId: '150:537',
                    name: 'Card',
                    property: 'stroke',
                    token: borderKey,
                    hex: '#ccc',
                    tokenStatus: 'ok',
                    background: null,
                },
            ],
            typography: [],
            spaces: [],
            dimensions: [],
            radii: [],
            shadows: [],
            stats: { nodeCount: 1, textNodes: 0, visited: 1 },
        };
        const conformant = {
            color: [
                { nodeId: '150:537', name: 'Card', property: 'fill', token: bgKey } as Conformant,
                {
                    nodeId: '150:537',
                    name: 'Card',
                    property: 'stroke',
                    token: borderKey,
                } as Conformant,
            ],
            typography: [],
        };
        const { input } = buildLlmInput({
            extract: twoPaintExtract,
            deterministicConformant: conformant,
            colorSchema,
            textStyleSchema,
            nodeTree: [],
        });
        const byToken = Object.fromEntries(
            input.judgmentTargets.semanticColor.map((t) => [t.token, t.property]),
        );
        expect(byToken[bgKey]).toBe('fill');
        expect(byToken[borderKey]).toBe('stroke');
    });

    it('textStyleRubric 는 스키마 전체 스타일을 포함한다 (사용/미사용 무관)', () => {
        const schema = loadTextStyleSchema();
        const { input } = buildLlmInput({
            extract: makeEmptyExtract(),
            deterministicConformant: { color: [], typography: [] },
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
