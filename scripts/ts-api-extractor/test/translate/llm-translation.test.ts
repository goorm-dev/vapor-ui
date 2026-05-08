import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { translateComponentUnits } from '~/translate/llm-translation';
import type { TranslationConfig, TranslationUnit } from '~/translate/types';

const config: TranslationConfig = {
    enabled: true,
    skipCache: false,
    targetLocale: 'ko',
    llm: {
        translationModel: 'claude-sonnet-4-6',
        validationModel: 'claude-opus-4-7',
        postprocessModel: 'claude-sonnet-4-6',
    },
    validation: { mqm: { enabled: true } },
};

const units: TranslationUnit[] = [
    {
        id: 'component.description',
        kind: 'component.description',
        ownerName: 'Button',
        source: 'A button component.',
        componentIndex: 0,
    },
    {
        id: 'props[0].size.description',
        kind: 'prop.description',
        ownerName: 'size',
        source: 'Controls the size.',
        componentIndex: 0,
        propIndex: 0,
    },
];

function mockFetchContent(content: string): void {
    vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content } }] }),
    } as Response);
}

describe('translateComponentUnits', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        vi.stubEnv('LITELLM_BASE_URL', 'https://litellm.internal');
        vi.stubEnv('LITELLM_API_KEY', 'test-key');
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
                    { id: 'component.description', translated: 'Button 컴포넌트입니다.' },
                    { id: 'props[0].size.description', translated: '크기를 지정합니다.' },
                ],
            }),
        );

        const result = await translateComponentUnits('Button', units, config);

        expect(result).toEqual(
            new Map([
                ['component.description', 'Button 컴포넌트입니다.'],
                ['props[0].size.description', '크기를 지정합니다.'],
            ]),
        );

        const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as {
            model: string;
            response_format?: { type: string };
            messages: { role: string; content: string }[];
        };
        expect(body.model).toBe('claude-sonnet-4-6');
        expect(body.response_format).toEqual({ type: 'json_object' });
        expect(body.messages.at(-1)?.content).toContain('"componentName":"Button"');
        expect(body.messages.at(-1)?.content).toContain('"id":"props[0].size.description"');
    });

    it('parses JSON responses wrapped in markdown code fences', async () => {
        mockFetchContent(`\`\`\`json
${JSON.stringify({
    translations: [
        { id: 'component.description', translated: 'Button 컴포넌트입니다.' },
        { id: 'props[0].size.description', translated: '크기를 지정합니다.' },
    ],
})}
\`\`\``);

        const result = await translateComponentUnits('Button', units, config);

        expect(result).toEqual(
            new Map([
                ['component.description', 'Button 컴포넌트입니다.'],
                ['props[0].size.description', '크기를 지정합니다.'],
            ]),
        );
    });

    it('throws when an expected id is missing', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [{ id: 'component.description', translated: 'Button입니다.' }],
            }),
        );

        await expect(translateComponentUnits('Button', units, config)).rejects.toThrow(
            /Missing translation id: props\[0\]\.size\.description/,
        );
    });

    it('throws when response contains a duplicate id', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'component.description', translated: 'Button입니다.' },
                    { id: 'component.description', translated: '중복입니다.' },
                    { id: 'props[0].size.description', translated: '크기입니다.' },
                ],
            }),
        );

        await expect(translateComponentUnits('Button', units, config)).rejects.toThrow(
            /Duplicate translation id: component\.description/,
        );
    });

    it('throws when response contains an unknown id', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'component.description', translated: 'Button입니다.' },
                    { id: 'props[0].size.description', translated: '크기입니다.' },
                    { id: 'props[9].ghost.description', translated: '알 수 없음' },
                ],
            }),
        );

        await expect(translateComponentUnits('Button', units, config)).rejects.toThrow(
            /Unknown translation id: props\[9\]\.ghost\.description/,
        );
    });

    it('throws when translated is empty', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'component.description', translated: '' },
                    { id: 'props[0].size.description', translated: '크기입니다.' },
                ],
            }),
        );

        await expect(translateComponentUnits('Button', units, config)).rejects.toThrow(
            /Empty translation for id: component\.description/,
        );
    });

    it('allows translated text to equal source', async () => {
        mockFetchContent(
            JSON.stringify({
                translations: [
                    { id: 'component.description', translated: 'A button component.' },
                    { id: 'props[0].size.description', translated: 'Controls the size.' },
                ],
            }),
        );

        const result = await translateComponentUnits('Button', units, config);

        expect(result.get('component.description')).toBe('A button component.');
        expect(result.get('props[0].size.description')).toBe('Controls the size.');
    });
});
