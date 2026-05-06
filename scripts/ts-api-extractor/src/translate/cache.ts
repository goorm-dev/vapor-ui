import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Bump this when LLM prompts change to invalidate stale cache entries.
export const CACHE_VERSION = 'v1';

export interface CacheEntry {
    source: string;
    translated: string;
    cachedAt: string;
    pipeline: 'mt-only' | 'mt-mqm-pass' | 'mt-ape';
    hadErrors: boolean;
    hadOverEdit: boolean;
}

export type CacheStore = Map<string, CacheEntry>;

export function makeCacheKey(
    source: string,
    targetLocale: string,
    postprocessModel: string,
    validationModel: string,
    glossaryId: string,
): string {
    return createHash('sha256')
        .update(
            `${CACHE_VERSION}:${source}:${targetLocale}:${postprocessModel}:${validationModel}:${glossaryId}`,
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
                typeof (v as CacheEntry).translated === 'string' &&
                typeof (v as CacheEntry).pipeline === 'string',
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
