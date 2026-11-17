// Code Connect's files, read the way `figma connect` reads them: a package's figma.config.json include and exclude,
// a `*.figma.ts` template's `// url=` and `// component=` headers, and the rows of a `*.figma.batch.json`.
import { globSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

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

// One Code Connect entry: its Figma URL, the template file relative to pkgDir, and the batch row when it has one.
export interface CodeConnectEntry {
    url: string;
    template: string;
    batch: Batch | null;
}

// Every Code Connect entry a package ships: a `*.figma.ts` with a `// url=` header, or one row of a
// `*.figma.batch.json`. template is relative to pkgDir.
export function connections(pkgDir: string): CodeConnectEntry[] {
    return codeConnectFiles(pkgDir).flatMap((f): CodeConnectEntry[] => {
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

// Components a package's Code Connect files connect: a `*.figma.ts`'s `// component=` header, or each row's `component`
// in a `*.figma.batch.json`.
export function connectedComponents(pkgDir: string): Set<string> {
    const names = new Set<string>();
    for (const f of codeConnectFiles(pkgDir)) {
        const text = readFileSync(join(pkgDir, f), 'utf8');
        if (f.endsWith('.json'))
            for (const c of (JSON.parse(text) as { components: { component: string }[] })
                .components)
                names.add(c.component);
        else {
            const name = text.match(/^\/\/ component=(.+)$/m)?.[1].trim();
            if (name) names.add(name);
        }
    }
    return names;
}
