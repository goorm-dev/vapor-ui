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
import { readApiDir } from '@vapor-ui/docs-extractor/write';
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

/** The text of each unit in `doc`, keyed by unit key. */
const textsOf = (doc: ComponentDoc | undefined) =>
    new Map(doc ? translationUnits(doc).map(({ key, text }) => [key, text]) : []);

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
    const { lock, files } = readApiDir(apiDir);

    const items = files.flatMap(({ name, en, ko }) => {
        const missing = new Set(
            missingUnits(en, lock[name], guide.version, glossary).map(({ key }) => key),
        );
        // The lock can match while ko/ holds the English placeholder, e.g. after a
        // ko/ file was deleted and docs:api rewrote it. Translate those too.
        // ponytail: a translation identical to its source text is retranslated every run.
        const koTexts = textsOf(ko);
        return translationUnits(en)
            .filter(({ key, text }) => missing.has(key) || (koTexts.get(key) ?? text) === text)
            .map(({ key, text }) => ({ id: `${name}#${key}`, text }));
    });

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
    if (items.length === 0 && JSON.stringify(nextLock) === JSON.stringify(lock)) {
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
