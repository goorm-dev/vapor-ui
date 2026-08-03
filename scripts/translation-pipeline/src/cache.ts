import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
    DEFAULT_POSTPROCESS_MODEL,
    DEFAULT_TRANSLATION_MODEL,
    DEFAULT_VALIDATION_MODEL,
} from '~/defaults';
import { errorMessage } from '~/util';

export const CACHE_VERSION = 'v2';

export type CacheStore = Map<string, string>;

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
    const filePath = join(outputDir, '.translation-cache.json');
    if (!existsSync(filePath)) return new Map();
    try {
        const raw = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
        return new Map(
            Object.entries(raw).filter(
                (entry): entry is [string, string] => typeof entry[1] === 'string',
            ),
        );
    } catch {
        return new Map();
    }
}

export function saveCache(outputDir: string, store: CacheStore): void {
    try {
        const filePath = join(outputDir, '.translation-cache.json');
        mkdirSync(dirname(filePath), { recursive: true });
        const obj = Object.fromEntries(store);
        writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (error) {
        console.warn(
            `[cache] Failed to save translation cache: ${errorMessage(error)}. Continuing without cache.`,
        );
    }
}
