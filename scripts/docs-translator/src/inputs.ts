import type { GlossaryTerm } from '@vapor-ui/docs-extractor/translation';
import { globSync } from 'glob';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { type Guide, readGuide } from './guide';

// Shared by the translate CLI and the CI check. Keep it free of anything that
// talks to Claude, so the check never loads the Agent SDK.

const here = path.dirname(fileURLToPath(import.meta.url));

export const INPUT_FLAGS = {
    pages: { type: 'string', isRequired: true },
    guide: { type: 'string', default: path.join(here, '..', 'guide.md') },
    glossary: { type: 'string', default: path.join(here, '..', 'glossary.json') },
} as const;

export interface Inputs {
    pagesDir: string;
    guide: Guide;
    glossary: GlossaryTerm[];
    /** Every `<page>/api/` with an `en/` folder or a leftover `ko.lock.json`. */
    apiDirs: string[];
}

export function loadInputs(flags: { pages: string; guide: string; glossary: string }): Inputs {
    const pagesDir = path.resolve(flags.pages);
    return {
        pagesDir,
        guide: readGuide(flags.guide),
        glossary: JSON.parse(fs.readFileSync(flags.glossary, 'utf8')),
        apiDirs: globSync('**/api', { cwd: pagesDir, absolute: true })
            .filter(
                (dir) =>
                    fs.existsSync(path.join(dir, 'en')) ||
                    fs.existsSync(path.join(dir, 'ko.lock.json')),
            )
            .sort(),
    };
}

/** `<pagesDir>/(components)/meter/api` → `meter`: route groups `(…)` are not part of the name. */
export const pageName = (inputs: Inputs, apiDir: string) =>
    path
        .relative(inputs.pagesDir, path.dirname(apiDir))
        .split(path.sep)
        .filter((segment) => !/^\(.+\)$/.test(segment))
        .join('/');
