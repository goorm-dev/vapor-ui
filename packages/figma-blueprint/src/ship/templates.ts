import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ts from 'typescript';

export const FIGMA_KEY = Symbol.for('@vapor-ui/figma-blueprint');

export interface TemplateResult {
    id?: string;
    example?: unknown;
}

export type TemplateFn = () => TemplateResult;

const IMPORT = /^import\s[\s\S]*?from\s+['"]([^'"]+)['"];?[ \t]*$/gm;
const FIGMA = `globalThis[Symbol.for(${JSON.stringify(FIGMA_KEY.description)})]`;

// A template's module body becomes a function, so each instance re-runs it under its own figma.selectedInstance.
// `figma` is looked up on globalThis, where figma-mock registers itself, so the output needs no path to this package.
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
    const ext = js ? '.mjs' : '.mts';
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
