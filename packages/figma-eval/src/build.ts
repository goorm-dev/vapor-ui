import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

import { FIGMA_KEY } from './figma-mock';
import type { Tables } from './library';

const IMPORT = /^import\s[\s\S]*?from\s+['"]([^'"]+)['"];?[ \t]*$/gm;
const FIGMA = `globalThis[Symbol.for(${JSON.stringify(FIGMA_KEY.description)})]`;

// A template's module body becomes a function, so each instance re-runs it under its own figma.selectedInstance.
// `figma` is looked up on globalThis, where figma-mock registers itself, so the output needs no path to this package.
// resolveImport maps every other import specifier to where the transformed copy of that file lives.
export function transformTemplate(
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

const tsx = (file: string, text: string) =>
    ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const namedImports = (s: ts.ImportDeclaration) => {
    const nb = s.importClause?.namedBindings;
    return nb && ts.isNamedImports(nb) ? nb.elements : [];
};

const fromModule = (s: ts.Statement, spec: string): s is ts.ImportDeclaration =>
    ts.isImportDeclaration(s) &&
    ts.isStringLiteral(s.moduleSpecifier) &&
    s.moduleSpecifier.text === spec;

// Every identifier a declaration mentions, its own name aside.
const mentions = (name: string, decl: ts.Node) => {
    const ids = new Set<string>();
    (function visit(n: ts.Node) {
        if (ts.isIdentifier(n) && n.text !== name) ids.add(n.text);
        ts.forEachChild(n, visit);
    })(decl);
    return ids;
};

// Icons a core part draws itself (Select.Trigger's chevron), keyed by displayName: a design that shows one inside the
// part expects nothing from the code. A part owns the '@vapor-ui/icons' imports its declaration mentions, plus those of
// every same-file declaration it mentions, transitively.
function internalIcons(root: string) {
    const out: Tables['internalIcons'] = {};
    const components = join(root, 'packages/core/src/components');
    for (const dir of readdirSync(components))
        for (const f of readdirSync(join(components, dir)).filter((f) => /^[^.]+\.tsx$/.test(f))) {
            const sf = tsx(f, readFileSync(join(components, dir, f), 'utf8'));
            const icons = new Set<string>();
            const decls = new Map<string, ts.Node>();
            const displayName = new Map<string, string>();
            for (const s of sf.statements) {
                if (fromModule(s, '@vapor-ui/icons'))
                    for (const e of namedImports(s)) icons.add(e.name.text);
                else if (ts.isVariableStatement(s)) {
                    for (const d of s.declarationList.declarations)
                        if (ts.isIdentifier(d.name)) decls.set(d.name.text, d);
                } else if (ts.isFunctionDeclaration(s) && s.name) decls.set(s.name.text, s);
                else if (
                    ts.isExpressionStatement(s) &&
                    ts.isBinaryExpression(s.expression) &&
                    ts.isPropertyAccessExpression(s.expression.left) &&
                    s.expression.left.name.text === 'displayName' &&
                    ts.isStringLiteral(s.expression.right)
                )
                    displayName.set(
                        s.expression.left.expression.getText(),
                        s.expression.right.text,
                    );
            }
            if (!icons.size) continue;
            const mentioned = new Map([...decls].map(([name, d]) => [name, mentions(name, d)]));
            const iconsOf = (name: string, seen = new Set<string>()): string[] => {
                if (seen.has(name)) return [];
                seen.add(name);
                return [...(mentioned.get(name) ?? [])].flatMap((id) =>
                    icons.has(id) ? [id] : decls.has(id) ? iconsOf(id, seen) : [],
                );
            };
            for (const [name, part] of displayName) {
                const own = [...new Set(iconsOf(name))].sort();
                if (own.length) out[part] = own;
            }
        }
    return out;
}

// Variant defaults of core parts, so code that omits a default prop still matches (<Button> is variant "fill").
// ponytail: `<dir>.css.ts` recipe names map to parts by convention (root → Button and Button.Root, trigger →
// Select.Trigger); a recipe named otherwise is missed.
function defaults(root: string) {
    const out: Tables['defaults'] = {};
    const pascal = (s: string) => s.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());
    const literal = (obj: ts.ObjectLiteralExpression) =>
        Object.fromEntries(
            obj.properties
                .filter(
                    (p): p is ts.PropertyAssignment =>
                        ts.isPropertyAssignment(p) &&
                        (ts.isStringLiteral(p.initializer) ||
                            p.initializer.kind === ts.SyntaxKind.TrueKeyword ||
                            p.initializer.kind === ts.SyntaxKind.FalseKeyword),
                )
                .map((p) => [
                    p.name.getText().replace(/['"]/g, ''),
                    ts.isStringLiteral(p.initializer)
                        ? p.initializer.text
                        : p.initializer.getText(),
                ]),
        );
    const components = join(root, 'packages/core/src/components');
    for (const dir of readdirSync(components)) {
        let src;
        try {
            src = readFileSync(join(components, dir, `${dir}.css.ts`), 'utf8');
        } catch {
            continue;
        }
        for (const s of ts.createSourceFile('x.ts', src, ts.ScriptTarget.Latest, true).statements) {
            if (!ts.isVariableStatement(s)) continue;
            for (const d of s.declarationList.declarations) {
                let dv: Record<string, string> | undefined;
                (function find(n: ts.Node) {
                    if (
                        ts.isPropertyAssignment(n) &&
                        n.name.getText() === 'defaultVariants' &&
                        ts.isObjectLiteralExpression(n.initializer)
                    )
                        dv = literal(n.initializer);
                    ts.forEachChild(n, find);
                })(d);
                if (!dv) continue;
                const name = d.name.getText();
                const tags =
                    name === 'root'
                        ? [pascal(dir), `${pascal(dir)}.Root`]
                        : [`${pascal(dir)}.${pascal(name)}`];
                for (const t of tags) out[t] = dv;
            }
        }
    }
    return out;
}

// composites preset wrappers (rules/composites.md §7): a public part that returns one core element with fixed
// literal props and `{...props}`, so <Dialog.Action> is <Button size="lg" colorPalette="primary">.
// internalParts: core components a non-preset public part draws itself (Dialog.Root's close IconButton), through
// same-file declarations it mentions. Not through other public parts, and not through createSlots(): a slot renders
// what the caller passes (Dialog's action Button), which the design draws as its own part.
function composites(root: string) {
    const presets: Tables['presets'] = {};
    const internalParts: Tables['internalParts'] = {};
    const components = join(root, 'packages/composites/src/components');
    for (const dir of readdirSync(components)) {
        let parts;
        try {
            parts = readFileSync(join(components, dir, 'index.parts.ts'), 'utf8');
        } catch {
            continue;
        }
        const ns = readFileSync(join(components, dir, 'index.ts'), 'utf8').match(
            /export \* as (\w+)/,
        )?.[1];
        const publicName = new Map(
            [...parts.matchAll(/(\w+) as (\w+)/g)].map(([, local, alias]) => [
                local,
                `${ns}.${alias}`,
            ]),
        );
        const sf = tsx('x.tsx', readFileSync(join(components, dir, `${dir}.tsx`), 'utf8'));
        const core = new Set<string>();
        for (const s of sf.statements)
            if (fromModule(s, '@vapor-ui/core'))
                for (const e of namedImports(s)) if (!e.propertyName) core.add(e.name.text);
        for (const s of sf.statements) {
            if (!ts.isVariableStatement(s)) continue;
            for (const d of s.declarationList.declarations) {
                const name = publicName.get(d.name.getText());
                const init = d.initializer;
                if (!name || !init || !ts.isArrowFunction(init)) continue;
                const returns: ts.Expression[] = [];
                (function find(n: ts.Node) {
                    if (ts.isReturnStatement(n) && n.expression) returns.push(n.expression);
                    if (!ts.isArrowFunction(n) || n === init) ts.forEachChild(n, find);
                })(init);
                const el =
                    returns.length === 1 &&
                    (ts.isParenthesizedExpression(returns[0]) ? returns[0].expression : returns[0]);
                const open =
                    el &&
                    (ts.isJsxElement(el)
                        ? el.openingElement
                        : ts.isJsxSelfClosingElement(el)
                          ? el
                          : null);
                if (
                    !open ||
                    !core.has(open.tagName.getText()) ||
                    !open.attributes.properties.some(ts.isJsxSpreadAttribute)
                )
                    continue;
                const props: Record<string, string> = {};
                for (const a of open.attributes.properties)
                    if (ts.isJsxAttribute(a) && a.initializer && ts.isStringLiteral(a.initializer))
                        props[a.name.getText()] = a.initializer.text;
                presets[name] = { tag: open.tagName.getText(), props };
            }
        }

        const decls = new Map<string, ts.VariableDeclaration>();
        for (const s of sf.statements)
            if (ts.isVariableStatement(s))
                for (const d of s.declarationList.declarations) {
                    const slots =
                        d.initializer &&
                        ts.isCallExpression(d.initializer) &&
                        d.initializer.expression.getText() === 'createSlots';
                    if (ts.isIdentifier(d.name) && !slots) decls.set(d.name.text, d);
                }
        const drawsOf = (name: string, seen: Set<string>): string[] => {
            const decl = decls.get(name);
            if (!decl || seen.has(name)) return [];
            seen.add(name);
            return [...mentions(name, decl)].flatMap((id) =>
                core.has(id) ? [id] : decls.has(id) && !publicName.has(id) ? drawsOf(id, seen) : [],
            );
        };
        for (const [local, name] of publicName) {
            if (presets[name] || !decls.has(local)) continue;
            const own = [...new Set(drawsOf(local, new Set()))].sort();
            if (own.length) internalParts[name] = own;
        }
    }
    return { presets, internalParts };
}

export function extractTables(root: string): Tables {
    return { internalIcons: internalIcons(root), defaults: defaults(root), ...composites(root) };
}
