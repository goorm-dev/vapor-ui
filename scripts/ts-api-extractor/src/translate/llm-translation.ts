import { callLlm, logLlmMetadata } from '~/translate/llm-client';
import { parseLlmJson } from '~/translate/llm-json';
import type { TranslationConfig, TranslationUnit } from '~/translate/types';

const DEFAULT_TRANSLATION_MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are a professional Korean translator for design-system API documentation. Respond ONLY with valid JSON.

Translate each source string to natural Korean while preserving component names, prop names, enum values, markdown, inline code, URLs, token names, and TypeScript identifiers exactly.

Return exactly this JSON shape:
{"translations":[{"id":"component.description","translated":"Korean translation"}]}`;

interface TranslationResponseItem {
    id: string;
    translated: string;
}

function readTranslations(content: string): TranslationResponseItem[] {
    const parsed = parseLlmJson(content);
    if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Translation response must be a JSON object');
    }

    const translations = (parsed as Record<string, unknown>).translations;
    if (!Array.isArray(translations)) {
        throw new Error('Translation response must contain translations[]');
    }

    return translations.map((item): TranslationResponseItem => {
        if (typeof item !== 'object' || item === null) {
            throw new Error('Translation item must be a JSON object');
        }
        const record = item as Record<string, unknown>;
        if (typeof record.id !== 'string') {
            throw new Error('Translation item id must be a string');
        }
        if (typeof record.translated !== 'string') {
            throw new Error(`Translation item translated must be a string for id: ${record.id}`);
        }
        return { id: record.id, translated: record.translated };
    });
}

function validateTranslations(
    units: TranslationUnit[],
    translations: TranslationResponseItem[],
): Map<string, string> {
    const expectedIds = new Set(units.map((unit) => unit.id));
    const seen = new Set<string>();
    const result = new Map<string, string>();

    for (const translation of translations) {
        if (!expectedIds.has(translation.id)) {
            throw new Error(`Unknown translation id: ${translation.id}`);
        }
        if (seen.has(translation.id)) {
            throw new Error(`Duplicate translation id: ${translation.id}`);
        }
        if (translation.translated.trim().length === 0) {
            throw new Error(`Empty translation for id: ${translation.id}`);
        }
        seen.add(translation.id);
        result.set(translation.id, translation.translated);
    }

    for (const unit of units) {
        if (!seen.has(unit.id)) {
            throw new Error(`Missing translation id: ${unit.id}`);
        }
    }

    return result;
}

export async function translateComponentUnits(
    componentName: string,
    units: TranslationUnit[],
    config: TranslationConfig,
    log?: (message: string) => void,
): Promise<Map<string, string>> {
    if (units.length === 0) {
        return new Map();
    }

    const request = {
        componentName,
        units: units.map(({ id, kind, ownerName, source }) => ({
            id,
            kind,
            ownerName,
            source,
        })),
    };

    const result = await callLlm(
        [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(request) },
        ],
        {
            model: config.llm.translationModel ?? DEFAULT_TRANSLATION_MODEL,
            responseFormat: 'json',
        },
    );
    logLlmMetadata(log, `translation ${componentName}`, result);

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        throw new Error(`[llm-translation] ${result.error ?? 'empty response'}${statusInfo}`);
    }

    return validateTranslations(units, readTranslations(result.content));
}
