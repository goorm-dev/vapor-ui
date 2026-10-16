import type { ComponentDoc } from '#model';
import { createHash } from 'node:crypto';

/**
 * What `api/ko.lock.json` records for one translation. The extractor reads only
 * `source`; the translate script writes all three and CI compares all three.
 */
export interface LockEntry {
    /** hashText() of the source text the translation was made from. */
    source: string;
    /** `version` of the translation guide used. */
    guide: number;
    /** Hash of the glossary terms that applied. */
    terms: string;
}

/** `api/ko.lock.json`: file name without `.json` → translation unit key → entry. */
export type Lock = Record<string, Record<string, LockEntry>>;

export function hashText(text: string): string {
    return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

export interface TranslationUnit {
    /** `description` for the component, `props.<name>` for a prop. */
    key: string;
    text: string;
}

/** Every text in a doc that has a translation: the component description and each prop description. */
export function translationUnits(doc: ComponentDoc): TranslationUnit[] {
    const units: TranslationUnit[] = [];
    if (doc.description) units.push({ key: 'description', text: doc.description });
    for (const prop of doc.props) {
        if (prop.description) units.push({ key: `props.${prop.name}`, text: prop.description });
    }
    return units;
}

/**
 * The Korean mirror of `en`: the same structure, with each text taken from `ko`
 * when the lock says that translation was made from the current source text, and
 * the English otherwise, as a placeholder until the next `pnpm docs:translate`.
 */
export function mirrorDoc(
    en: ComponentDoc,
    ko: ComponentDoc | undefined,
    lock: Record<string, LockEntry> = {},
): ComponentDoc {
    const pick = (key: string, enText: string | undefined, koText: string | undefined) =>
        enText && koText && lock[key]?.source === hashText(enText) ? koText : enText;

    const koProps = new Map(ko?.props.map((prop) => [prop.name, prop.description]));

    return {
        ...en,
        description: pick('description', en.description, ko?.description),
        props: en.props.map((prop) => ({
            ...prop,
            description: pick(`props.${prop.name}`, prop.description, koProps.get(prop.name)),
        })),
    };
}
