import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

export interface PropDefinition {
    name: string;
    type: string | string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
    detailedType?: string;
}

export interface ComponentApi {
    name: string;
    description?: string;
    props: PropDefinition[];
    /** Vapor-ui type definitions referenced by `props[].type`, keyed by their public name. */
    typeRefs?: Record<string, string>;
}

const PAGES_DIRS = [
    path.join(process.cwd(), 'content/docs/components'),
    path.join(process.cwd(), 'content/docs/composites'),
];

const DOCS_ROOT = path.join(process.cwd(), 'content/docs');

/**
 * Reads `<page>/api/<lang>/<name>.json`, written next to each component page by
 * `pnpm docs:api`: `en` holds the English source from JSDoc, `ko` its Korean
 * translation from `pnpm docs:translate` (Composites JSDoc is already Korean, so
 * its `ko` mirror is the English source unchanged). Part names are unique across
 * pages, so the name alone finds the file. Runs at build time on the server;
 * returns undefined when the file is missing.
 */
export function readComponentApi(name: string, lang: 'en' | 'ko'): ComponentApi | undefined {
    for (const dir of PAGES_DIRS) {
        const match = findApiJson(dir, name, lang);
        if (match) return JSON.parse(readFileSync(match, 'utf8'));
    }
    return undefined;
}

/**
 * Pages live either directly under <root>/<page>/api/<lang>/<name>.json or inside
 * one route-group level: <root>/(<group>)/<page>/api/<lang>/<name>.json. Resolving
 * these two shapes directly avoids `fs.globSync`, which Turbopack's dev server
 * does not expose on its `node:fs` externals wrapper.
 */
function findApiJson(root: string, name: string, lang: 'en' | 'ko'): string | undefined {
    if (!existsSync(root)) return undefined;

    const file = `${name}.json`;
    const entries = readdirSync(root, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const direct = path.join(root, entry.name, 'api', lang, file);
        if (existsSync(direct)) return direct;

        if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
            const nested = findApiJson(path.join(root, entry.name), name, lang);
            if (nested) return nested;
        }
    }
    return undefined;
}

/**
 * Composites-only. Reads the API JSON a docs page points to by its exact path,
 * matching the `<Demo file="..." />` convention. `file` is the path to the API
 * JSON relative to `content/docs/`, e.g.
 * `composites/(components)/menu/api/ko/menu-root.json`. The lang segment
 * (`/en/` or `/ko/`) in `file` is rewritten to the requested `lang`, so the
 * caller can point at whichever language file is natural in the MDX and still
 * read the other side (the English source for the LLM output, or the Korean
 * translation for the UI).
 *
 * Kept separate from `readComponentApi` so migrating core docs to the same
 * file-based input can ship as its own PR; once core is migrated this should
 * replace `readComponentApi`.
 */
export function _readComponentApi(file: string, lang: 'en' | 'ko'): ComponentApi | undefined {
    const localized = file.replace(/\/(en|ko)\//, `/${lang}/`);
    const resolved = path.resolve(DOCS_ROOT, localized);
    if (!resolved.startsWith(`${DOCS_ROOT}${path.sep}`)) return undefined;
    if (!existsSync(resolved)) return undefined;
    return JSON.parse(readFileSync(resolved, 'utf8'));
}
