// Code Connect templates as modules this package can run: written once by `figma-blueprint ship` (JS) or fromRepo
// (TypeScript), and imported back by the catalog. The written file and the import agree on one path rule, here.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// A value import on purpose: a compiled template reads globalThis[FIGMA_KEY] when it is imported, so stand-in.ts must
// have registered there first. Loading this file loads stand-in.ts, so importTemplate can never run before it.
import { FIGMA_KEY } from './stand-in';
import type { TemplateFn } from './stand-in';

const extOf = (js: boolean) => (js ? '.mjs' : '.mts');

const IMPORT = /^import\s[\s\S]*?from\s+['"]([^'"]+)['"];?[ \t]*$/gm;
const FIGMA = `globalThis[Symbol.for(${JSON.stringify(FIGMA_KEY.description)})]`;

// A template's module body becomes a function, so each instance re-runs it under its own figma.selectedInstance.
// `figma` is looked up on globalThis, where stand-in.ts registers itself, so the output needs no path to this package.
// resolveImport maps every other import specifier to where the transformed copy of that file lives.
function transformTemplate(
    source: string,
    wrap: boolean,
    resolveImport: (spec: string) => string,
): string {
    const imports: string[] = [];
    let body = source.replace(IMPORT, (stmt: string, spec: string) => {
        if (spec === 'figma') {
            if (/^import\s+type\s/.test(stmt)) return '';
            const name = stmt.match(/^import\s+(\w+)\s+from\s/)?.[1];
            if (!name) throw new Error(`unsupported import from 'figma': ${stmt}`);
            imports.push(`const ${name} = ${FIGMA};`);
            return '';
        }
        imports.push(stmt.replace(/(['"])[^'"]+\1/, `'${resolveImport(spec)}'`));
        return '';
    });
    if (wrap)
        body = `export default function __run() {\n${body.replace(/^export default /m, 'return ')}\n}`;
    return `${imports.join('\n')}\n${body}`;
}

// Writes each template (wrapped) and every helper it imports by relative path to outDir, at its path in pkgDir.
// `figma-blueprint ship` writes them as JS (.mjs, since composites has no "type": "module"). fromRepo writes TypeScript
// and leaves stripping the types to Node, as .mts for the same reason.
export function writeTemplates(pkgDir: string, templates: string[], outDir: string, js: boolean) {
    const ext = extOf(js);
    const written = new Set<string>();
    const write = (file: string, wrap: boolean) => {
        if (written.has(file)) return;
        written.add(file);
        let text = transformTemplate(readFileSync(join(pkgDir, file), 'utf8'), wrap, (spec) => {
            const dep = spec.endsWith('.ts') ? spec : `${spec}.ts`;
            write(join(dirname(file), dep), false);
            return dep.replace(/\.ts$/, ext);
        });
        if (js)
            text = ts.transpileModule(text, {
                fileName: file,
                compilerOptions: {
                    module: ts.ModuleKind.ESNext,
                    target: ts.ScriptTarget.ESNext,
                    verbatimModuleSyntax: true,
                },
            }).outputText;
        const out = join(outDir, file.replace(/\.ts$/, ext));
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, text);
    };
    for (const t of templates) write(t, true);
}

// The template writeTemplates wrote to outDir, imported: its default export is the module body, wrapped.
export async function importTemplate(
    outDir: string,
    template: string,
    js: boolean,
): Promise<TemplateFn> {
    const file = join(outDir, template.replace(/\.ts$/, extOf(js)));
    return ((await import(pathToFileURL(file).href)) as { default: TemplateFn }).default;
}
