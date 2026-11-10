import { existsSync, globSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ts from 'typescript';

import { FIGMA_KEY } from './figma-mock';
import type { Pkg, Tables } from './library';

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

// Writes each template (wrapped) and every helper it imports by relative path to outDir, at its path in pkgDir.
// `figma-blueprint build` ships them as JS (.mjs, since composites has no "type": "module"). fromRepo writes TypeScript
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
function internalIcons(core: string) {
    const out: Tables['internalIcons'] = {};
    const components = join(core, 'src/components');
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
// A root also takes a default its own recipe lacks from the file's other recipes when they all agree on it: Tabs.Root
// hands size and variant to its parts through context, and Tabs.Button's recipe defaults them. A part that renders
// another core component with `{...props}` takes that component's defaults under its own: IconButton is a Button.
function defaults(core: string) {
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
    const components = join(core, 'src/components');
    const roots = (dir: string) => [pascal(dir), `${pascal(dir)}.Root`];
    for (const dir of readdirSync(components)) {
        let src;
        try {
            src = readFileSync(join(components, dir, `${dir}.css.ts`), 'utf8');
        } catch {
            continue;
        }
        const recipes: Record<string, string>[] = [];
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
                recipes.push(dv);
                const name = d.name.getText();
                const tags = name === 'root' ? roots(dir) : [`${pascal(dir)}.${pascal(name)}`];
                for (const t of tags) out[t] = dv;
            }
        }
        const agreed: Record<string, string> = {};
        for (const k of new Set(recipes.flatMap(Object.keys))) {
            const values = new Set(recipes.flatMap((r) => (k in r ? [r[k]] : [])));
            if (values.size === 1) agreed[k] = [...values][0];
        }
        if (Object.keys(agreed).length)
            for (const t of roots(dir)) out[t] = { ...agreed, ...out[t] };
    }
    for (const dir of readdirSync(components)) {
        const file = join(components, dir, `${dir}.tsx`);
        if (!existsSync(file)) continue;
        const sf = tsx(file, readFileSync(file, 'utf8'));
        const siblings = new Set(
            sf.statements.flatMap((s) =>
                ts.isImportDeclaration(s) &&
                ts.isStringLiteral(s.moduleSpecifier) &&
                /^\.\.\/[\w-]+$/.test(s.moduleSpecifier.text)
                    ? namedImports(s).map((e) => e.name.text)
                    : [],
            ),
        );
        let base: string | undefined;
        (function find(n: ts.Node) {
            const o = ts.isJsxElement(n)
                ? n.openingElement
                : ts.isJsxSelfClosingElement(n)
                  ? n
                  : null;
            const tag = o?.tagName.getText();
            if (
                o &&
                tag &&
                siblings.has(tag) &&
                o.attributes.properties.some(ts.isJsxSpreadAttribute)
            )
                base ??= tag;
            ts.forEachChild(n, find);
        })(sf);
        if (base && out[base]) for (const t of roots(dir)) out[t] = { ...out[base], ...out[t] };
    }
    return out;
}

// A package's Code Connect files, relative to pkgDir, within its figma.config.json include and exclude.
export function codeConnectFiles(pkgDir: string): string[] {
    const { include, exclude } = (
        JSON.parse(readFileSync(join(pkgDir, 'figma.config.json'), 'utf8')) as {
            codeConnect: { include: string[]; exclude?: string[] };
        }
    ).codeConnect;
    return globSync(include, { cwd: pkgDir, exclude }).sort();
}

// Components a Figma library instance can stand for: the ones core's Code Connect files connect.
// A core export no file connects (VStack, Box) is layout, not a library part.
function libraryComponents(core: string) {
    if (!existsSync(join(core, 'figma.config.json')))
        throw new Error(
            `composites' internalParts needs core's Code Connect files, and ${core} has no figma.config.json`,
        );
    const names = new Set<string>();
    for (const f of codeConnectFiles(core)) {
        const text = readFileSync(join(core, f), 'utf8');
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

type Component = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration;

// The strings a ternary of string literals can produce, or undefined when any branch is not one.
function conditionalStrings(e: ts.Expression): string[] | undefined {
    if (ts.isParenthesizedExpression(e)) return conditionalStrings(e.expression);
    if (ts.isStringLiteral(e)) return [e.text];
    if (!ts.isConditionalExpression(e)) return undefined;
    const [a, b] = [conditionalStrings(e.whenTrue), conditionalStrings(e.whenFalse)];
    return a && b ? [...new Set([...a, ...b])].sort() : undefined;
}

// What a component returns whatever its props are: a concise body, or a block's only return sitting directly in it.
// An early return or a return under `if` means the props pick what is drawn.
function fixedReturns(fn: Component): ts.Expression[] {
    const body = fn.body;
    if (!body) return [];
    if (!ts.isBlock(body)) return [body];
    const returns: ts.ReturnStatement[] = [];
    (function find(n: ts.Node) {
        if (ts.isReturnStatement(n)) returns.push(n);
        if (!ts.isFunctionLike(n)) ts.forEachChild(n, find);
    })(body);
    const [only] = returns;
    return returns.length === 1 && only.parent === body && only.expression ? [only.expression] : [];
}

// composites preset wrappers (rules/composites.md §7): a public part that returns one core element with fixed
// literal props and `{...props}`, so <Dialog.Action> is <Button size="lg" colorPalette="primary">.
// internalParts: library components a non-preset public part always draws itself (Dialog.Root's close IconButton),
// so a code author cannot add or remove them. Anything a condition guards stays expected, and so does a slot's
// content (Dialog's action Button), which the caller passes: the walk never enters createSlots() arguments.
function composites(pkgDir: string) {
    const presets: Tables['presets'] = {};
    const internalParts: Tables['internalParts'] = {};
    const library = libraryComponents(join(pkgDir, '../core'));
    const components = join(pkgDir, 'src/components');
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
        // local name → core export (DialogPrimitives → Dialog)
        const core = new Map<string, string>();
        const fns = new Map<string, Component>();
        for (const s of sf.statements) {
            if (fromModule(s, '@vapor-ui/core'))
                for (const e of namedImports(s))
                    core.set(e.name.text, (e.propertyName ?? e.name).getText());
            else if (ts.isFunctionDeclaration(s) && s.name) fns.set(s.name.text, s);
            else if (ts.isVariableStatement(s))
                for (const d of s.declarationList.declarations) {
                    const init = d.initializer;
                    if (
                        ts.isIdentifier(d.name) &&
                        init &&
                        (ts.isArrowFunction(init) || ts.isFunctionExpression(init))
                    )
                        fns.set(d.name.text, init);
                }
        }

        for (const [local, name] of publicName) {
            const fn = fns.get(local);
            if (!fn) continue;
            const returns: ts.Expression[] = [];
            (function find(n: ts.Node) {
                if (ts.isReturnStatement(n) && n.expression) returns.push(n.expression);
                if (!ts.isFunctionLike(n) || n === fn) ts.forEachChild(n, find);
            })(fn);
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
            const tag = open && core.get(open.tagName.getText());
            if (open && tag && open.attributes.properties.some(ts.isJsxSpreadAttribute)) {
                const props: Tables['presets'][string]['props'] = {};
                for (const a of open.attributes.properties) {
                    if (!ts.isJsxAttribute(a) || !a.initializer) continue;
                    if (ts.isStringLiteral(a.initializer))
                        props[a.name.getText()] = a.initializer.text;
                    // colorPalette={type === 'critical' ? 'danger' : 'primary'}: either branch is right code.
                    else if (ts.isJsxExpression(a.initializer) && a.initializer.expression) {
                        const branches = conditionalStrings(a.initializer.expression);
                        if (branches) props[a.name.getText()] = branches;
                    }
                }
                presets[name] = { tag, props };
                continue;
            }

            const drawn = new Set<string>();
            const seen = new Set<Component>([fn]);
            // Walks only JSX nesting: a condition, a call or a variable on the way ends the path.
            const visit = (n: ts.Node): void => {
                if (ts.isParenthesizedExpression(n) || ts.isJsxExpression(n)) {
                    if (n.expression) visit(n.expression);
                    return;
                }
                if (ts.isJsxFragment(n)) return n.children.forEach(visit);
                if (!ts.isJsxElement(n) && !ts.isJsxSelfClosingElement(n)) return;
                const o = ts.isJsxElement(n) ? n.openingElement : n;
                const [head, ...member] = o.tagName.getText().split('.');
                if (publicName.has(head)) return;
                const inner = member.length ? undefined : fns.get(head);
                if (inner) {
                    if (!seen.has(inner)) {
                        seen.add(inner);
                        fixedReturns(inner).forEach(visit);
                    }
                    return;
                }
                const exported = core.get(head);
                const component = exported && [exported, ...member].join('.');
                if (component && library.has(component)) drawn.add(component);
                for (const a of o.attributes.properties)
                    if (ts.isJsxAttribute(a) && a.initializer) visit(a.initializer);
                if (ts.isJsxElement(n)) n.children.forEach(visit);
            };
            fixedReturns(fn).forEach(visit);
            if (drawn.size) internalParts[name] = [...drawn].sort();
        }
    }
    return { presets, internalParts };
}

// The tables a package ships, each built from that package's source. composites reads core's sources next to it.
export const TABLES_OF = {
    core: (dir: string) => ({ internalIcons: internalIcons(dir), defaults: defaults(dir) }),
    composites,
    icons: () => ({}),
} satisfies Record<Pkg, (dir: string) => Partial<Tables>>;

export const extractTables = (root: string): Tables => ({
    ...TABLES_OF.core(join(root, 'packages/core')),
    ...TABLES_OF.composites(join(root, 'packages/composites')),
});
