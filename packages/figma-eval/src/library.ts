import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { extractTables, transformTemplate } from './build';
import type { Batch } from './figma-mock';

// One Code Connect template (one row of it for a batch template), keyed in `entries` by Figma component (set) key.
export type Pkg = 'core' | 'composites' | 'icons';

export interface Entry {
    name: string;
    pkg: Pkg;
    template: string;
    batch: Batch | null;
}

export interface Tables {
    // core part → icons it draws itself (Select.Trigger's chevron)
    internalIcons: Record<string, string[]>;
    // composites part → core components it draws itself (Dialog.Root's close IconButton)
    internalParts: Record<string, string[]>;
    // composites wrapper → the core element it renders, with fixed props (Dialog.Action is a primary lg Button)
    presets: Record<string, { tag: string; props: Record<string, string> }>;
    // core part → recipe defaultVariants (Button is variant "fill")
    defaults: Record<string, Record<string, string>>;
}

export interface TemplateResult {
    id?: string;
    example?: unknown;
}

export type TemplateFn = () => TemplateResult;

export interface Library {
    entries: Record<string, Entry>;
    tables: Tables;
    runTemplate(entry: Entry): TemplateFn;
}

// Tables from the repo's source, templates transformed and run in place. entriesFile holds `{ entries }`.
export async function fromRepo(root: string, entriesFile: string): Promise<Library> {
    const raw = JSON.parse(readFileSync(entriesFile, 'utf8')) as {
        entries: Record<string, Omit<Entry, 'pkg'>>;
    };
    const entries: Record<string, Entry> = {};
    for (const [key, e] of Object.entries(raw.entries)) {
        const pkg = e.template.match(/^packages\/(core|composites|icons)\//)?.[1] as
            Pkg | undefined;
        if (!pkg) throw new Error(`template outside core, composites, icons: ${e.template}`);
        entries[key] = { ...e, pkg };
    }
    const tables = extractTables(root);

    // .mts: a .ts file outside a "type": "module" package would load as CommonJS.
    const dir = mkdtempSync(join(tmpdir(), 'figma-eval-'));
    const copied = new Map<string, string>();
    const copy = (file: string, wrap: boolean): string => {
        const done = copied.get(file);
        if (done) return done;
        const text = transformTemplate(readFileSync(file, 'utf8'), wrap, (spec) => {
            const dep = resolve(dirname(file), spec);
            return pathToFileURL(copy(/\.\w+$/.test(dep) ? dep : `${dep}.ts`, false)).href;
        });
        const out = join(dir, `${createHash('sha1').update(file).digest('hex').slice(0, 12)}.mts`);
        writeFileSync(out, text);
        copied.set(file, out);
        return out;
    };

    const runs = new Map<string, TemplateFn>();
    try {
        for (const t of new Set(Object.values(entries).map((e) => e.template))) {
            const mod = (await import(pathToFileURL(copy(join(root, t), true)).href)) as {
                default: TemplateFn;
            };
            runs.set(t, mod.default);
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }

    return {
        entries,
        tables,
        runTemplate(entry) {
            const run = runs.get(entry.template);
            if (!run) throw new Error(`no template loaded for ${entry.template}`);
            return run;
        },
    };
}
