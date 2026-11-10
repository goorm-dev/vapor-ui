import { globSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { StoredEntry } from './entries-file';

export type Batch = Record<string, unknown>;

// A package's Code Connect files, relative to pkgDir, within its figma.config.json include and exclude.
export function codeConnectFiles(pkgDir: string): string[] {
    const { include, exclude } = (
        JSON.parse(readFileSync(join(pkgDir, 'figma.config.json'), 'utf8')) as {
            codeConnect: { include: string[]; exclude?: string[] };
        }
    ).codeConnect;
    return globSync(include, { cwd: pkgDir, exclude }).sort();
}

type Connection = Omit<StoredEntry, 'name'>;

// Every Code Connect entry a package ships: a `*.figma.ts` with a `// url=` header, or one row of a
// `*.figma.batch.json`. template is relative to pkgDir.
export function connections(pkgDir: string): Connection[] {
    return codeConnectFiles(pkgDir).flatMap((f): Connection[] => {
        const text = readFileSync(join(pkgDir, f), 'utf8');
        if (!f.endsWith('.json')) {
            const url = text.match(/^\/\/ url=(\S+)/m)?.[1];
            return url ? [{ url, template: f, batch: null }] : [];
        }
        const { templateFile, components } = JSON.parse(text) as {
            templateFile: string;
            components: (Batch & { url: string })[];
        };
        const template = join(dirname(f), templateFile);
        return components.map((batch) => ({ url: batch.url, template, batch }));
    });
}
