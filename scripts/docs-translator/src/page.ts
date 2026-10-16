import type { ComponentDoc } from '@vapor-ui/docs-extractor/model';
import {
    type GlossaryTerm,
    type Lock,
    type LockEntry,
    applicableTerms,
    lockEntryFor,
    mirrorDoc,
    missingUnits,
    translationUnits,
} from '@vapor-ui/docs-extractor/translation';
import { type ApiDirFile, readApiDir } from '@vapor-ui/docs-extractor/write';
import fs from 'node:fs';
import path from 'node:path';

import { checkTranslation } from './guide';

export interface TranslationItem {
    /** `<file name without .json>#<unit key>`, e.g. `meter-root#props.value`. */
    id: string;
    text: string;
}

/** Translates every item, returning the Korean keyed by item id. */
export type Translate = (
    items: TranslationItem[],
    terms: GlossaryTerm[],
) => Promise<Record<string, string>>;

function writeJson(filePath: string, data: unknown) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/** `doc` with the text of each unit in `ko` (unit key → Korean) replaced. */
function withTexts(doc: ComponentDoc, ko: Record<string, string>): ComponentDoc {
    return {
        ...doc,
        description: ko.description ?? doc.description,
        props: doc.props.map((prop) => ({
            ...prop,
            description: ko[`props.${prop.name}`] ?? prop.description,
        })),
    };
}

export interface PagePlan {
    lock: Lock;
    files: ApiDirFile[];
    /** Every text whose translation is missing (see missingUnits). */
    items: TranslationItem[];
    /** Lock entries, as item ids, for files or units no longer in `en/`. */
    orphans: string[];
    /** The lock once every item is translated, rebuilt from `en/`. */
    nextLock: Lock;
}

/**
 * What one page's `api/` folder needs, without calling any AI. A page is up to
 * date when isUpToDate(plan); translatePage carries the plan out.
 */
export function planPage(
    apiDir: string,
    guide: { version: number },
    glossary: GlossaryTerm[],
): PagePlan {
    const { lock, files } = readApiDir(apiDir);

    const items = files.flatMap(({ name, en }) =>
        missingUnits(en, lock[name], guide.version, glossary).map(({ key, text }) => ({
            id: `${name}#${key}`,
            text,
        })),
    );

    const nextLock: Lock = Object.fromEntries(
        files.map(({ name, en }) => [
            name,
            Object.fromEntries(
                translationUnits(en)
                    .map(({ key, text }): [string, LockEntry] => [
                        key,
                        lockEntryFor(text, guide.version, glossary),
                    ])
                    // Code-point order, not localeCompare, so every machine writes the same lock.
                    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
            ),
        ]),
    );

    const orphans = Object.entries(lock).flatMap(([name, entries]) =>
        Object.keys(entries)
            .filter((key) => !nextLock[name]?.[key])
            .map((key) => `${name}#${key}`),
    );

    return { lock, files, items, orphans, nextLock };
}

/** No missing translations, and the lock is exactly what translatePage would write. */
export function isUpToDate(plan: PagePlan): boolean {
    return plan.items.length === 0 && JSON.stringify(plan.nextLock) === JSON.stringify(plan.lock);
}

/**
 * Translates the missing translations of one page's `api/` folder in a single
 * `translate` call, then writes its `ko/` files and `ko.lock.json`. The lock is
 * rebuilt from `en/`, so entries for removed files and props are dropped.
 *
 * Writes nothing and throws when any translation is absent or changes code.
 */
export async function translatePage(
    apiDir: string,
    guide: { version: number },
    glossary: GlossaryTerm[],
    translate: Translate,
): Promise<{ written: string[]; translated: number }> {
    const lockPath = path.join(apiDir, 'ko.lock.json');
    const plan = planPage(apiDir, guide, glossary);
    const { lock, files, items, nextLock } = plan;
    if (isUpToDate(plan)) return { written: [], translated: 0 };
    // A page whose en/ is gone keeps nothing to translate; drop its lock.
    if (files.length === 0) {
        fs.rmSync(lockPath);
        return { written: [], translated: 0 };
    }

    const terms = applicableTerms(items.map(({ text }) => text).join('\n'), glossary);
    const result = items.length > 0 ? await translate(items, terms) : {};

    const problems = items.flatMap(({ id, text }) => {
        const problem =
            id in result ? checkTranslation(text, result[id]) : 'no translation returned';
        return problem ? [`${id}: ${problem}`] : [];
    });
    if (problems.length > 0) {
        throw new Error(`Translations rejected for ${apiDir}:\n  ${problems.join('\n  ')}`);
    }

    const written = files.map(({ name, en, ko, koPath }) => {
        const translated = Object.fromEntries(
            items
                .filter(({ id }) => id.startsWith(`${name}#`))
                .map(({ id }) => [id.slice(name.length + 1), result[id]]),
        );
        writeJson(koPath, withTexts(mirrorDoc(en, ko, lock[name]), translated));
        return koPath;
    });
    writeJson(lockPath, nextLock);

    return { written: [...written, lockPath], translated: items.length };
}
