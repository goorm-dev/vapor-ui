import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { validateWithMqm } from '~/translate/mqm-validator';
import type { TranslationConfig } from '~/translate/types';

const baseConfig: TranslationConfig = {
    enabled: true,
    targetLocale: 'ko',
    llm: { enabled: true },
    validation: {
        mqm: { enabled: true, failOnError: false },
    },
};

describe('validateWithMqm', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        vi.stubEnv('LITELLM_BASE_URL', 'https://litellm.internal');
        vi.stubEnv('LITELLM_API_KEY', 'test-key');
        vi.stubEnv('LITELLM_MODEL', 'claude-sonnet-4-6');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('llm.enabled: false → returns PASS immediately, no fetch', async () => {
        const config = { ...baseConfig, llm: { ...baseConfig.llm, enabled: false } };
        const result = await validateWithMqm('hello', '안녕', config);
        expect(result).toEqual({ verdict: 'PASS', errors: [] });
        expect(fetch).not.toHaveBeenCalled();
    });

    it('mqm.enabled: false → returns PASS immediately, no fetch', async () => {
        const config = {
            ...baseConfig,
            validation: { mqm: { enabled: false, failOnError: false } },
        };
        const result = await validateWithMqm('hello', '안녕', config);
        expect(result).toEqual({ verdict: 'PASS', errors: [] });
        expect(fetch).not.toHaveBeenCalled();
    });

    it('no LITELLM_BASE_URL → returns PASS + console.warn, no fetch', async () => {
        vi.stubEnv('LITELLM_BASE_URL', '');
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await validateWithMqm('hello', '안녕', baseConfig);
        expect(result).toEqual({ verdict: 'PASS', errors: [] });
        expect(fetch).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('fetch returns non-ok status → returns PASS + console.warn', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 429 } as Response);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await validateWithMqm('hello', '안녕', baseConfig);
        expect(result).toEqual({ verdict: 'PASS', errors: [] });
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('response has no choices → returns PASS + console.warn', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [] }),
        } as Response);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await validateWithMqm('hello', '안녕', baseConfig);
        expect(result).toEqual({ verdict: 'PASS', errors: [] });
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('valid PASS response → returns PASS result', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: '{"verdict":"PASS","errors":[]}' } }],
            }),
        } as Response);
        const result = await validateWithMqm('hello', '안녕', baseConfig);
        expect(result).toEqual({ verdict: 'PASS', errors: [] });
    });

    it('valid FAIL response with terminology error → returns FAIL with errors', async () => {
        const failPayload = {
            verdict: 'FAIL',
            errors: [
                {
                    category: 'accuracy',
                    type: 'terminology',
                    severity: 'major',
                    source: 'onClick',
                    translation: '클릭',
                    message: 'identifier must not be translated',
                },
            ],
        };
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: JSON.stringify(failPayload) } }],
            }),
        } as Response);
        const result = await validateWithMqm('onClick handler', '클릭 handler', baseConfig);
        expect(result.verdict).toBe('FAIL');
        expect(result.errors).toHaveLength(1);
    });

    it('response wrapped in markdown fences → strips fences and parses', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: '```json\n{"verdict":"PASS","errors":[]}\n```' } }],
            }),
        } as Response);
        const result = await validateWithMqm('hello', '안녕', baseConfig);
        expect(result).toEqual({ verdict: 'PASS', errors: [] });
    });

    it('malformed JSON in response → returns PASS + console.warn', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: 'this is not json' } }] }),
        } as Response);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await validateWithMqm('hello', '안녕', baseConfig);
        expect(result).toEqual({ verdict: 'PASS', errors: [] });
        expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('fetch throws network error → returns PASS + console.warn', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await validateWithMqm('hello', '안녕', baseConfig);
        expect(result).toEqual({ verdict: 'PASS', errors: [] });
        expect(warnSpy).toHaveBeenCalledOnce();
    });
});
