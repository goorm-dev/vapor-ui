import fs from 'node:fs';
import path from 'node:path';

export interface PropDefinition {
    name: string;
    type: string | string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
}

export interface ComponentApi {
    name: string;
    description?: string;
    props: PropDefinition[];
}

const PAGES_DIR = path.join(process.cwd(), 'content/docs/components');

/**
 * Reads `<page>/api/<name>.json`, written next to each component page by
 * `pnpm docs:api`. Part names are unique across pages, so the name alone finds
 * the file. Runs at build time on the server; returns undefined when the file is missing.
 */
export function readComponentApi(name: string): ComponentApi | undefined {
    const [file] = fs.globSync(`**/api/${name}.json`, { cwd: PAGES_DIR });
    if (!file) return undefined;

    return JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf8'));
}
