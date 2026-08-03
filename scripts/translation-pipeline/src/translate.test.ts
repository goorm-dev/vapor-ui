import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TranslationUnit } from '~/domain';
import { translateUnits } from '~/translate';

const units: TranslationUnit[] = [
    {
        kind: 'component.description',
        componentDisplayName: 'Button',
        source: 'A button component.',
    },
    {
        kind: 'prop.description',
        componentDisplayName: 'Button',
        propName: 'size',
        source: 'Controls the size.',
    },
];

function mockFetchContent(content: string): void {
    vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content } }] }),
    } as Response);
}

describe('translateUnits', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        vi.stubEnv('LITELLM_BASE_URL', 'https://litellm.internal');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('calls LiteLLM JSON mode with a component-scoped translation-unit payload', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'Button:(description)', translated: 'Button 컴포넌트입니다.' },
                    { id: 'Button:size', translated: '크기를 지정합니다.' },
                ],
            }),
        );

        const result = await translateUnits(units);

        expect(result).toEqual(
            new Map([
                ['Button:(description)', 'Button 컴포넌트입니다.'],
                ['Button:size', '크기를 지정합니다.'],
            ]),
        );

        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            model: string;
            response_format?: { type: string; json_schema?: { strict: boolean } };
            messages: { role: string; content: string }[];
        };
        expect(body.model).toBe('claude-sonnet-4-6');
        expect(body.response_format?.type).toBe('json_schema');
        expect(body.response_format?.json_schema?.strict).toBe(true);
        expect(body.messages.at(-1)?.content).toContain('"componentName":"Button"');
        expect(body.messages.at(-1)?.content).toContain('"id":"Button:size"');
    });

    // 회귀 가드 — compound 파트의 문맥이 'Root'로 뭉개지지 않는지 지킨다.
    it('sends the qualified component name so compound parts are distinguishable', async () => {
        const compoundUnits: TranslationUnit[] = [
            {
                kind: 'component.description',
                componentDisplayName: 'Select.Root',
                source: 'A select root.',
            },
            {
                kind: 'prop.description',
                componentDisplayName: 'Select.Root',
                propName: 'size',
                source: 'The size.',
            },
        ];
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'Select.Root:(description)', translated: '셀렉트 루트입니다.' },
                    { id: 'Select.Root:size', translated: '크기를 지정합니다.' },
                ],
            }),
        );

        await translateUnits(compoundUnits);

        const payload = String(
            JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)).messages.at(-1).content,
        );
        expect(payload).toContain('"componentName":"Select.Root"');
        // 컴포넌트 설명 유닛의 ownerName은 컴포넌트 자신, prop 유닛은 prop 이름
        expect(payload).toContain('"ownerName":"Select.Root"');
        expect(payload).toContain('"ownerName":"size"');
    });

    it('sends a system prompt that includes MQM-mirrored style rules', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'Button:(description)', translated: 'Button 컴포넌트입니다.' },
                    { id: 'Button:size', translated: '크기를 지정합니다.' },
                ],
            }),
        );

        await translateUnits(units);

        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            messages: { role: string; content: string }[];
        };
        const systemMessage = body.messages.find((message) => message.role === 'system');
        expect(systemMessage).toBeDefined();
        const systemContent = systemMessage?.content ?? '';

        // MQM 미러링 패턴
        expect(systemContent).toContain('~를 제어합니다');
        expect(systemContent).toContain('~를 수행합니다');
        expect(systemContent).toContain('~에 적용되는');
        // 문체 규칙
        expect(systemContent).toContain('합쇼체');
        expect(systemContent).toContain('active voice');
        // 식별자 보존
        expect(systemContent).toContain('PascalCase');
        expect(systemContent).toContain('camelCase');
    });

    it('parses JSON responses wrapped in markdown code fences', async () => {
        mockFetchContent(`\`\`\`json
${JSON.stringify({
    translations: [
        { id: 'Button:(description)', translated: 'Button 컴포넌트입니다.' },
        { id: 'Button:size', translated: '크기를 지정합니다.' },
    ],
})}
\`\`\``);

        const result = await translateUnits(units);

        expect(result).toEqual(
            new Map([
                ['Button:(description)', 'Button 컴포넌트입니다.'],
                ['Button:size', '크기를 지정합니다.'],
            ]),
        );
    });

    it('throws when an expected id is missing', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [{ id: 'Button:(description)', translated: 'Button입니다.' }],
            }),
        );

        await expect(translateUnits(units)).rejects.toThrow(/Missing response id: Button:size/);
    });

    it('throws when response contains a duplicate id', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'Button:(description)', translated: 'Button입니다.' },
                    { id: 'Button:(description)', translated: '중복입니다.' },
                    { id: 'Button:size', translated: '크기입니다.' },
                ],
            }),
        );

        await expect(translateUnits(units)).rejects.toThrow(
            /Duplicate response id: Button:\(description\)/,
        );
    });

    it('throws when response contains an unknown id', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'Button:(description)', translated: 'Button입니다.' },
                    { id: 'Button:size', translated: '크기입니다.' },
                    { id: 'Button:ghost', translated: '알 수 없음' },
                ],
            }),
        );

        await expect(translateUnits(units)).rejects.toThrow(/Unknown response id: Button:ghost/);
    });

    it('throws when translated is empty', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'Button:(description)', translated: '' },
                    { id: 'Button:size', translated: '크기입니다.' },
                ],
            }),
        );

        await expect(translateUnits(units)).rejects.toThrow(
            /Empty translation for id: Button:\(description\)/,
        );
    });

    it('allows translated text to equal source', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'Button:(description)', translated: 'A button component.' },
                    { id: 'Button:size', translated: 'Controls the size.' },
                ],
            }),
        );

        const result = await translateUnits(units);

        expect(result.get('Button:(description)')).toBe('A button component.');
        expect(result.get('Button:size')).toBe('Controls the size.');
    });
});
