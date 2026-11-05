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

const PAGES_DIRS = {
    components: path.join(process.cwd(), 'content/docs/components'),
    composites: path.join(process.cwd(), 'content/docs/composites'),
} as const;

export type ComponentApiScope = keyof typeof PAGES_DIRS;

/**
 * Reads `<page>/api/<lang>/<name>.json`, written next to each component page by
 * `pnpm docs:api`: `en` holds the English source from JSDoc, `ko` its Korean
 * translation from `pnpm docs:translate` (Composites JSDoc is already Korean, so
 * its `ko` mirror is the English source unchanged). `scope` picks the docs root;
 * core and composites can share a part name (`menu-root`, `menu-item`,
 * `menu-group`) so callers must specify which side they want. Runs at build time
 * on the server; returns undefined when the file is missing.
 */
export function readComponentApi(
    name: string,
    lang: 'en' | 'ko',
    scope: ComponentApiScope = 'components',
): ComponentApi | undefined {
    const match = findApiJson(PAGES_DIRS[scope], name, lang);
    if (match) return JSON.parse(readFileSync(match, 'utf8'));
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
