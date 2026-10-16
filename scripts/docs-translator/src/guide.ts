import fs from 'node:fs';

/** `guide.md`: the translation guide, with the `version` and `model` every translation is recorded against. */
export interface Guide {
    version: number;
    model: string;
    body: string;
}

export function parseGuide(text: string): Guide {
    const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text.replace(/\r\n/g, '\n'));
    if (!match) throw new Error('guide.md has no frontmatter');

    const field = (name: string) =>
        new RegExp(`^${name}:\\s*['"]?(.+?)['"]?\\s*$`, 'm').exec(match[1])?.[1];
    const version = Number(field('version'));
    const model = field('model');
    if (!Number.isInteger(version))
        throw new Error('guide.md frontmatter needs an integer version');
    if (!model) throw new Error('guide.md frontmatter needs a model');

    return { version, model, body: match[2].trim() };
}

export function readGuide(filePath: string): Guide {
    return parseGuide(fs.readFileSync(filePath, 'utf8'));
}

const codeSpans = (text: string) => (text.match(/`[^`]*`/g) ?? []).sort();

/**
 * Why `ko` can't be used as the translation of `en`, or null when it can. Code
 * in backticks must come through unchanged: a translated prop value breaks code
 * copied from the docs.
 */
export function checkTranslation(en: string, ko: string): string | null {
    if (!ko.trim()) return 'empty translation';

    const want = codeSpans(en);
    const have = codeSpans(ko);
    if (want.join('\n') !== have.join('\n')) {
        return `code spans changed: expected ${want.join(' ') || 'none'}, got ${have.join(' ') || 'none'}`;
    }
    return null;
}
