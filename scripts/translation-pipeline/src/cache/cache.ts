import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
    DEFAULT_POSTPROCESS_MODEL,
    DEFAULT_TRANSLATION_MODEL,
    DEFAULT_VALIDATION_MODEL,
} from '~/defaults';

// v2 reflects the LLM JSON-mode lifecycle. Older cache entries are not reused.
export const CACHE_VERSION = 'v2';

export interface CacheEntry {
    source: string;
    translated: string;
}

export type CacheStore = Map<string, CacheEntry>;

export function makeCacheKey(source: string): string {
    return createHash('sha256')
        .update(
            JSON.stringify({
                version: CACHE_VERSION,
                source,
                targetLocale: 'ko',
                translationModel: DEFAULT_TRANSLATION_MODEL,
                validationModel: DEFAULT_VALIDATION_MODEL,
                postprocessModel: DEFAULT_POSTPROCESS_MODEL,
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
            ([, value]) =>
                typeof value === 'object' &&
                value !== null &&
                typeof (value as CacheEntry).source === 'string' &&
                typeof (value as CacheEntry).translated === 'string',
        ) as [string, CacheEntry][];
        return new Map(valid);
    } catch {
        return new Map();
    }
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
