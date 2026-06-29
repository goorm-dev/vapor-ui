import type { RawExtract, ScanPayload } from '~/common/schemas';

import type { LlmEnv } from './client';
import { LlmHttpError, LlmTimeoutError, postLiteLLM } from './client';
import { LlmParseError, parseScanPayload } from './parse';
import { buildRequest } from './prompt';

export type RunLlmEvaluationOptions = {
    signal?: AbortSignal;
    env?: LlmEnv;
    model?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';

export async function runLlmEvaluation(
    extract: RawExtract,
    options: RunLlmEvaluationOptions = {},
): Promise<ScanPayload> {
    const env = options.env ?? envFromImportMeta();
    const model = options.model ?? importMetaModel() ?? DEFAULT_MODEL;
    const request = buildRequest(extract, model);
    const response = await postLiteLLM(request, { env, signal: options.signal });
    return parseScanPayload(response);
}

function envFromImportMeta(): LlmEnv {
    const baseUrl = importMetaString('VITE_LITELLM_BASE_URL');
    const apiKey = importMetaString('VITE_LITELLM_API_KEY');
    if (!baseUrl) throw new Error('VITE_LITELLM_BASE_URL 누락');
    if (!apiKey) throw new Error('VITE_LITELLM_API_KEY 누락');
    return { baseUrl, apiKey };
}

function importMetaModel(): string | undefined {
    return importMetaString('VITE_LITELLM_MODEL') || undefined;
}

function importMetaString(key: string): string | undefined {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    return env ? env[key] : undefined;
}

export { LlmHttpError, LlmTimeoutError, LlmParseError };
