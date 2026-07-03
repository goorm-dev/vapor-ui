import type { Category, LlmContext, RawExtract, ScanPayload } from '~/common/schemas';
import { evaluateColor } from '~/ui/lib/evaluate/color';
import { evaluateDimension } from '~/ui/lib/evaluate/dimension';
import { evaluateRadius } from '~/ui/lib/evaluate/radius';
import { evaluateShadow } from '~/ui/lib/evaluate/shadow';
import { evaluateSpace } from '~/ui/lib/evaluate/space';
import { evaluateTypography } from '~/ui/lib/evaluate/typography';
import { loadColorSchema } from '~/ui/lib/loaders/color';
import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';
import { applyRecommendations } from '~/ui/lib/recommend';
import { buildLlmInput } from '~/ui/lib/rubric';

import type { LlmEnv } from './client';
import { LlmHttpError, LlmTimeoutError, postLiteLLM } from './client';
import type { CategoryDet, MergeArgs } from './merge';
import { mergeScanPayload } from './merge';
import { LlmParseError, parseLlmResponse } from './parse';
import { buildRequest } from './prompt';

export type RunLlmEvaluationOptions = {
    signal?: AbortSignal;
    env?: LlmEnv;
    model?: string;
    frameName?: string;
};

const DEFAULT_MODEL = 'claude-sonnet-4-6';

export async function runLlmEvaluation(
    extract: RawExtract,
    llmContext: LlmContext,
    options: RunLlmEvaluationOptions = {},
): Promise<ScanPayload> {
    const env = options.env ?? envFromImportMeta();
    const model = options.model ?? importMetaModel() ?? DEFAULT_MODEL;
    const frameName = options.frameName ?? '';

    const colorSchema = loadColorSchema(extract.schemaMode);
    const dim = loadDimensionSchemas();
    const textStyleSchema = loadTextStyleSchema();

    const det: Record<Category, CategoryDet> = {
        color: { ...evaluateColor(extract.colors, colorSchema), total: extract.colors.length },
        space: { ...evaluateSpace(extract.spaces, dim.space), total: extract.spaces.length },
        dimension: {
            ...evaluateDimension(extract.dimensions, dim.dimension),
            total: extract.dimensions.length,
        },
        typography: {
            ...evaluateTypography(extract.typography, textStyleSchema),
            total: extract.typography.length,
        },
        borderRadius: {
            ...evaluateRadius(extract.radii, dim.borderRadius),
            total: extract.radii.length,
        },
        shadow: { ...evaluateShadow(extract.shadows, dim.shadow), total: extract.shadows.length },
    };

    const ctx = {
        colorSchema,
        space: dim.space,
        dimension: dim.dimension,
        borderRadius: dim.borderRadius,
        shadow: dim.shadow,
    };
    for (const key of Object.keys(det) as Category[]) {
        det[key].violations = applyRecommendations(det[key].violations, ctx);
    }

    const llmInput = buildLlmInput({
        extract,
        deterministicConformant: {
            color: det.color.conformant,
            typography: det.typography.conformant,
        },
        frameName,
        colorSchema,
        textStyleSchema,
        nodeTree: llmContext.nodeTree,
    });

    const request = buildRequest(llmInput, llmContext.screenshotB64, model);
    const response = await postLiteLLM(request, { env, signal: options.signal });
    const judgments = parseLlmResponse(response);

    const mergeArgs: MergeArgs = {
        deterministic: det,
        llm: judgments,
        schemaMode: extract.schemaMode,
    };
    return mergeScanPayload(mergeArgs);
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
