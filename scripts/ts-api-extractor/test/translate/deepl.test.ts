import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { translateWithDeepl } from '~/translate/deepl';

describe('translateWithDeepl', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        vi.stubEnv('DEEPL_ENDPOINT', 'https://api-free.deepl.com/v2/translate');
        vi.stubEnv('DEEPL_API_KEY', 'test-api-key');
        vi.stubEnv('DEEPL_GLOSSARY_ID', '');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it('glossary_id 포함 시 body에 glossary_id 필드 포함', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                translations: [{ text: '번역된 텍스트' }],
            }),
        } as Response);

        await translateWithDeepl(['Hello world'], 'glossary-abc-123');

        expect(mockFetch).toHaveBeenCalledOnce();
        const [, options] = mockFetch.mock.calls[0];
        const body = JSON.parse((options as RequestInit).body as string) as Record<string, unknown>;
        expect(body.glossary_id).toBe('glossary-abc-123');
    });

    it('glossary_id 미설정 시 body에 glossary_id 없음', async () => {
        vi.stubEnv('DEEPL_GLOSSARY_ID', '');

        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                translations: [{ text: '번역된 텍스트' }],
            }),
        } as Response);

        await translateWithDeepl(['Hello world'], '');

        expect(mockFetch).toHaveBeenCalledOnce();
        const [, options] = mockFetch.mock.calls[0];
        const body = JSON.parse((options as RequestInit).body as string) as Record<string, unknown>;
        expect(body).not.toHaveProperty('glossary_id');
    });

    it('API 키 없을 때 원문 반환 + warn', async () => {
        vi.stubEnv('DEEPL_API_KEY', '');
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const texts = ['Hello', 'World'];
        const result = await translateWithDeepl(texts, '');

        expect(result).toEqual(texts);
        expect(warnSpy).toHaveBeenCalledOnce();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('번역 성공 시 번역된 텍스트 배열 반환', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                translations: [{ text: '안녕하세요' }, { text: '세계' }],
            }),
        } as Response);

        const result = await translateWithDeepl(['Hello', 'World'], '');

        expect(result).toEqual(['안녕하세요', '세계']);
    });

    it('fetch 실패 시 원문 반환 + warn', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const texts = ['Hello'];
        const result = await translateWithDeepl(texts, '');

        expect(result).toEqual(texts);
        expect(warnSpy).toHaveBeenCalledOnce();
    });
});
