import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { MqmStageResult, TranslationConfig } from '~/translate/types';

// Bump this when LLM prompts or pipeline semantics change to invalidate stale cache entries.
export const CACHE_VERSION = 'v1';

export interface CacheEntry {
    source: string;
    translated: string;
}

export type CacheStore = Map<string, CacheEntry>;

const DEFAULT_MODEL = 'claude-sonnet-4-6';

export function makeCacheKey(
    source: string,
    config: TranslationConfig,
    glossaryId: string,
): string {
    const postprocessModel = config.llm.postprocessModel ?? DEFAULT_MODEL;
    const validationModel = config.llm.validationModel ?? DEFAULT_MODEL;
    return createHash('sha256')
        .update(
            JSON.stringify({
                version: CACHE_VERSION,
                source,
                targetLocale: config.targetLocale,
                llmEnabled: config.llm.enabled,
                mqmEnabled: config.validation.mqm.enabled,
                postprocessModel,
                validationModel,
                glossaryId,
            }),
        )
        .digest('hex');
}

export function loadCache(outputDir: string): CacheStore {
    if (!outputDir) return new Map();
    const filePath = join(outputDir, '.translation-cache.json');
    if (!existsSync(filePath)) return new Map();
    try {
        const raw = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
        const valid = Object.entries(raw).filter(
            ([, v]) =>
                typeof v === 'object' &&
                v !== null &&
                typeof (v as CacheEntry).source === 'string' &&
                typeof (v as CacheEntry).translated === 'string',
        ) as [string, CacheEntry][];
        return new Map(valid);
    } catch {
        return new Map();
    }
}

export interface FinalEntry {
    /** Final translated text. */
    translated: string;
    /** Set when an LLM API failure caused MQM validation or APE to be skipped. Falls back to the DeepL MT output. */
    llmDegraded?: true;
    /** MQM evaluation result immediately after DeepL MT. Assumed PASS for cache hits. */
    initial: MqmStageResult;
    /** MQM recheck result after LLM post-editing (APE). Assumed PASS for cache hits. */
    final: MqmStageResult;
}

export interface TextEntry {
    text: string;
    kind: 'component' | 'prop';
    componentIndex: number;
    propIndex?: number;
}

export interface CachePartition {
    finalEntries: (FinalEntry | undefined)[];
    missIndices: number[];
    cacheHits: number;
}

export function partitionByCache(
    entries: TextEntry[],
    store: CacheStore,
    config: TranslationConfig,
    glossaryId: string,
): CachePartition {
    const finalEntries: (FinalEntry | undefined)[] = new Array(entries.length);
    const missIndices: number[] = [];
    let cacheHits = 0;

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const entry = entries[entryIndex];
        const key = makeCacheKey(entry.text, config, glossaryId);
        const hit = store.get(key);
        if (hit) {
            finalEntries[entryIndex] = cacheEntryToFinalEntry(hit);
            cacheHits++;
        } else {
            missIndices.push(entryIndex);
        }
    }

    return { finalEntries, missIndices, cacheHits };
}

function cacheEntryToFinalEntry(hit: CacheEntry): FinalEntry {
    // Cache hits are treated as clean results: a previously cached translation
    // already went through the full pipeline once. Report verdicts are reset
    // to PASS — fresh validation/postprocess data is intentionally not preserved.
    return {
        translated: hit.translated,
        initial: { verdict: 'PASS', errors: [] },
        final: { verdict: 'PASS', errors: [] },
    };
}

export function saveCache(outputDir: string, store: CacheStore): void {
    if (!outputDir) return;
    try {
        const filePath = join(outputDir, '.translation-cache.json');
        mkdirSync(dirname(filePath), { recursive: true });
        const obj = Object.fromEntries(store);
        writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
            `[cache] Failed to save translation cache: ${message}. Continuing without cache.`,
        );
    }
}
