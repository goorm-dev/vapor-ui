import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

import { connectedComponents } from '~/code-connect/files';
import type { Pkg } from '~/packages';

export interface Tables {
    internalIcons: Record<string, string[]>;
    internalParts: Record<string, string[]>;
    presets: Record<string, { tag: string; props: Record<string, string | string[]> }>;
    defaults: Record<string, Record<string, string>>;
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

const mentions = (name: string, decl: ts.Node) => {
    const ids = new Set<string>();
    (function visit(n: ts.Node) {
        if (ts.isIdentifier(n) && n.text !== name) ids.add(n.text);
        ts.forEachChild(n, visit);
    })(decl);
    return ids;
};

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

const pascal = (s: string) => s.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());

const literalProps = (obj: ts.ObjectLiteralExpression) =>
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
                ts.isStringLiteral(p.initializer) ? p.initializer.text : p.initializer.getText(),
            ]),
    );

function recipeDefaults(cssSource: string) {
    const recipes: { name: string; defaults: Record<string, string> }[] = [];
    for (const s of ts.createSourceFile('x.ts', cssSource, ts.ScriptTarget.Latest, true)
        .statements) {
        if (!ts.isVariableStatement(s)) continue;
        for (const d of s.declarationList.declarations) {
            let dv: Record<string, string> | undefined;
            (function find(n: ts.Node) {
                if (
                    ts.isPropertyAssignment(n) &&
                    n.name.getText() === 'defaultVariants' &&
                    ts.isObjectLiteralExpression(n.initializer)
                )
                    dv = literalProps(n.initializer);
                ts.forEachChild(n, find);
            })(d);
            if (dv) recipes.push({ name: d.name.getText(), defaults: dv });
        }
    }
    return recipes;
}

function agreedByEveryRecipe(recipes: Record<string, string>[]) {
    const agreed: Record<string, string> = {};
    for (const k of new Set(recipes.flatMap(Object.keys))) {
        const values = new Set(recipes.flatMap((r) => (k in r ? [r[k]] : [])));
        if (values.size === 1) agreed[k] = [...values][0];
    }
    return agreed;
}

function siblingRenderedWithSpread(file: string) {
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
        const o = ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null;
        const tag = o?.tagName.getText();
        if (o && tag && siblings.has(tag) && o.attributes.properties.some(ts.isJsxSpreadAttribute))
            base ??= tag;
        ts.forEachChild(n, find);
    })(sf);
    return base;
}

function defaults(core: string) {
    const out: Tables['defaults'] = {};
    const components = join(core, 'src/components');
    const roots = (dir: string) => [pascal(dir), `${pascal(dir)}.Root`];
    for (const dir of readdirSync(components)) {
        let src;
        try {
            src = readFileSync(join(components, dir, `${dir}.css.ts`), 'utf8');
        } catch {
            continue;
        }
        const recipes = recipeDefaults(src);
        // ponytail: `<dir>.css.ts` recipe names map to parts by convention (root → Button and Button.Root, trigger →
        // Select.Trigger); a recipe named otherwise is missed.
        for (const { name, defaults: dv } of recipes)
            for (const t of name === 'root' ? roots(dir) : [`${pascal(dir)}.${pascal(name)}`])
                out[t] = dv;
        const agreed = agreedByEveryRecipe(recipes.map((r) => r.defaults));
        if (Object.keys(agreed).length)
            for (const t of roots(dir)) out[t] = { ...agreed, ...out[t] };
    }
    for (const dir of readdirSync(components)) {
        const file = join(components, dir, `${dir}.tsx`);
        if (!existsSync(file)) continue;
        const base = siblingRenderedWithSpread(file);
        if (base && out[base]) for (const t of roots(dir)) out[t] = { ...out[base], ...out[t] };
    }
    return out;
}

function libraryComponents(core: string) {
    if (!existsSync(join(core, 'figma.config.json')))
        throw new Error(
            `composites' internalParts needs core's Code Connect files, and ${core} has no figma.config.json`,
        );
    return connectedComponents(core);
}

type Component = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration;

function conditionalStrings(e: ts.Expression): string[] | undefined {
    if (ts.isParenthesizedExpression(e)) return conditionalStrings(e.expression);
    if (ts.isStringLiteral(e)) return [e.text];
    if (!ts.isConditionalExpression(e)) return undefined;
    const [a, b] = [conditionalStrings(e.whenTrue), conditionalStrings(e.whenFalse)];
    return a && b ? [...new Set([...a, ...b])].sort() : undefined;
}

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

function presetOf(fn: Component, core: Map<string, string>): Tables['presets'][string] | undefined {
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
        (ts.isJsxElement(el) ? el.openingElement : ts.isJsxSelfClosingElement(el) ? el : null);
    const tag = open && core.get(open.tagName.getText());
    if (!open || !tag || !open.attributes.properties.some(ts.isJsxSpreadAttribute))
        return undefined;
    const props: Tables['presets'][string]['props'] = {};
    for (const a of open.attributes.properties) {
        if (!ts.isJsxAttribute(a) || !a.initializer) continue;
        if (ts.isStringLiteral(a.initializer)) props[a.name.getText()] = a.initializer.text;
        else if (ts.isJsxExpression(a.initializer) && a.initializer.expression) {
            const branches = conditionalStrings(a.initializer.expression);
            if (branches) props[a.name.getText()] = branches;
        }
    }
    return { tag, props };
}

interface CompositesFile {
    publicName: Map<string, string>;
    fns: Map<string, Component>;
    coreImports: Map<string, string>;
    library: Set<string>;
}

function partsAlwaysDrawn(
    fn: Component,
    { publicName, fns, coreImports, library }: CompositesFile,
) {
    const drawn = new Set<string>();
    const seen = new Set<Component>([fn]);
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
        const exported = coreImports.get(head);
        const component = exported && [exported, ...member].join('.');
        if (component && library.has(component)) drawn.add(component);
        for (const a of o.attributes.properties)
            if (ts.isJsxAttribute(a) && a.initializer) visit(a.initializer);
        if (ts.isJsxElement(n)) n.children.forEach(visit);
    };
    fixedReturns(fn).forEach(visit);
    return [...drawn].sort();
}

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
        const coreImports = new Map<string, string>();
        const fns = new Map<string, Component>();
        for (const s of sf.statements) {
            if (fromModule(s, '@vapor-ui/core'))
                for (const e of namedImports(s))
                    coreImports.set(e.name.text, (e.propertyName ?? e.name).getText());
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

        const file: CompositesFile = { publicName, fns, coreImports, library };
        for (const [local, name] of publicName) {
            const fn = fns.get(local);
            if (!fn) continue;
            const preset = presetOf(fn, coreImports);
            if (preset) {
                presets[name] = preset;
                continue;
            }
            const drawn = partsAlwaysDrawn(fn, file);
            if (drawn.length) internalParts[name] = drawn;
        }
    }
    return { presets, internalParts };
}

export const TABLES_OF = {
    core: (dir: string) => ({ internalIcons: internalIcons(dir), defaults: defaults(dir) }),
    composites,
    icons: () => ({}),
} satisfies Record<Pkg, (dir: string) => Partial<Tables>>;

export const extractTables = (root: string): Tables => ({
    ...TABLES_OF.core(join(root, 'packages/core')),
    ...TABLES_OF.composites(join(root, 'packages/composites')),
});
