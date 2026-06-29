import type { RawExtract, ScanPayload } from '~/shared/schema';

import type { EvaluatorEnv } from './client';
import { EvaluatorHttpError, EvaluatorTimeoutError, postLiteLLM } from './client';
import { EvaluatorParseError, parseScanPayload } from './parse';
import { buildRequest } from './prompt';

export type RunEvaluationOptions = {
    signal?: AbortSignal;
    env?: EvaluatorEnv;
    model?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';

export async function runEvaluation(
    extract: RawExtract,
    options: RunEvaluationOptions = {},
): Promise<ScanPayload> {
    const env = options.env ?? envFromImportMeta();
    const model = options.model ?? importMetaModel() ?? DEFAULT_MODEL;
    const request = buildRequest(extract, model);
    const response = await postLiteLLM(request, { env, signal: options.signal });
    return parseScanPayload(response);
}

function envFromImportMeta(): EvaluatorEnv {
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

export { EvaluatorHttpError, EvaluatorTimeoutError, EvaluatorParseError };
