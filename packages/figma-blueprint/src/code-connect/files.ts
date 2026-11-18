import { globSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type Batch = Record<string, unknown>;

export function codeConnectFiles(pkgDir: string): string[] {
    const { include, exclude } = (
        JSON.parse(readFileSync(join(pkgDir, 'figma.config.json'), 'utf8')) as {
            codeConnect: { include: string[]; exclude?: string[] };
        }
    ).codeConnect;
    return globSync(include, { cwd: pkgDir, exclude }).sort();
}

export interface CodeConnectEntry {
    url: string;
    template: string;
    batch: Batch | null;
}

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
