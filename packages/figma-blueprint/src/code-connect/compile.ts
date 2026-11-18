import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

import { FIGMA_KEY, registerFigma } from './stand-in';
import type { TemplateFn } from './stand-in';

const extOf = (js: boolean) => (js ? '.mjs' : '.mts');

const IMPORT = /^import\s[\s\S]*?from\s+['"]([^'"]+)['"];?[ \t]*$/gm;
const FIGMA = `globalThis[Symbol.for(${JSON.stringify(FIGMA_KEY.description)})]`;

const rerunPerInstance = (body: string) =>
    `export default function __run() {\n${body.replace(/^export default /m, 'return ')}\n}`;

function transformTemplate(
    source: string,
    isTemplate: boolean,
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
    if (isTemplate) body = rerunPerInstance(body);
    return `${imports.join('\n')}\n${body}`;
}

export function writeTemplates(pkgDir: string, templates: string[], outDir: string, js: boolean) {
    const ext = extOf(js);
    const written = new Set<string>();
    const write = (file: string, isTemplate: boolean) => {
        if (written.has(file)) return;
        written.add(file);
        let text = transformTemplate(
            readFileSync(join(pkgDir, file), 'utf8'),
            isTemplate,
            (spec) => {
                const dep = spec.endsWith('.ts') ? spec : `${spec}.ts`;
                write(join(dirname(file), dep), false);
                return dep.replace(/\.ts$/, ext);
            },
        );
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

export async function importTemplate(
    outDir: string,
    template: string,
    js: boolean,
): Promise<TemplateFn> {
    const file = join(outDir, template.replace(/\.ts$/, extOf(js)));
    registerFigma();
    return ((await import(pathToFileURL(file).href)) as { default: TemplateFn }).default;
}
