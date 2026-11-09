// Component recall: every expected-set line must appear in the code as an element with the same tag, inside the same
// expected tag (data-in), carrying every expected prop with the same value. A tag that exists but never matches is a
// props mismatch; no such tag at all is missing. Both count as not recalled.
// Code side: each JSX element whose tag is imported from '@vapor-ui/*' (named, aliased or namespace import, any
// subpath), under the name the package exports; its parent is the nearest one above that the expected set names, so
// layout elements in between (Box, HStack) do not count. One code element meets one line at most.
// A local component (PascalCase function in a scanned file) is inlined at each call site, with the JSX passed to it as
// props or children rendered where its body reads that prop, so <SideToolTab icon={<MemoIcon />}> puts MemoIcon in
// the IconButton the tab draws. Its body is read only there, against its own file's imports; one that nothing renders
// is read in place only when exported (the screen itself). ponytail: .map() over data is read once and props are bound
// by name only.
import ts from 'typescript';

import type { ExpectedSet } from './expected';
import type { Pkg, Tables } from './library';

export interface SourceFile {
    path: string;
    text: string;
}

// true = bare flag; an object = an expression, matching any string the consts it reads hold.
type PropValue = string | true | { expr: string | undefined; values: Set<string> };

interface CodeElement {
    tag: string;
    pkg: Pkg;
    above: string[];
    props: Record<string, PropValue>;
    at: string;
}

// local name → what it stands for: an export of a @vapor-ui package, or (namespace) the package itself.
type Imports = Map<string, { pkg: Pkg; name: string | null }>;

export type Row =
    | { line: string; status: 'ok'; at: string }
    | { line: string; status: 'missing' }
    | { line: string; status: 'mismatch'; closest: string; diff: string[] };

// The `compare --json` contract: bump version when a field changes or goes away.
export interface CompareResult {
    version: 1;
    result: 'pass' | 'fail' | 'unscorable';
    recall: number;
    ok: number;
    total: number;
    rows: Row[];
    excluded: ExpectedSet['excluded'];
    unscorable: ExpectedSet['unscorable'];
}

// "tag" + { prop: value }; value true = bare flag. "*" (aria-label, Figma text) matches any value the code sets, "..."
// (template placeholder) any value at all.
const parseLine = (l: string) => {
    const [, tag, rest] = l.match(/^<(\S+)\s*(.*?)\s*\/>$/) ?? [];
    const props: Record<string, string | true> = {};
    for (const [, k, , , s, b] of rest.matchAll(/([^\s=]+)(=("([^"]*)"|\{([^}]*)\}))?/g))
        props[k] = s ?? b ?? true;
    const { 'data-in': parent = null, ...own } = props;
    return { tag, parent, props: own };
};

type Want = ReturnType<typeof parseLine>;

// Reads the scanned files: top-level consts of every file, so a data-driven prop (colorPalette={STATUS_COLOR[doc.status]})
// can match any string the consts it reads hold, and local components to inline. ponytail: one table for all files by
// name, no import resolution, no props flowing in; a name declared twice keeps the last.
const importsOf = (sf: ts.SourceFile): Imports => {
    const out: Imports = new Map();
    for (const s of sf.statements) {
        if (!ts.isImportDeclaration(s) || !ts.isStringLiteral(s.moduleSpecifier)) continue;
        const pkg = s.moduleSpecifier.text.match(
            /^@vapor-ui\/(core|composites|icons)(\/|$)/,
        )?.[1] as Pkg | undefined;
        const nb = s.importClause?.namedBindings;
        if (!pkg || !nb) continue;
        if (ts.isNamespaceImport(nb)) out.set(nb.name.text, { pkg, name: null });
        else
            for (const e of nb.elements)
                out.set(e.name.text, { pkg, name: (e.propertyName ?? e.name).getText() });
    }
    return out;
};

// <CDialog.Root> with `Dialog as CDialog`, <V.Button> with `* as V`: the package's own name, or null for a non-vapor tag.
const resolveTag = (text: string, imports: Imports) => {
    const [head, ...rest] = text.split('.');
    const i = imports.get(head);
    if (!i) return null;
    const tag = i.name === null ? rest.join('.') : [i.name, ...rest].join('.');
    return tag ? { tag, pkg: i.pkg } : null;
};

const exportedNames = (sf: ts.SourceFile) => {
    const out = new Set<string>();
    const exported = (n: ts.Node) =>
        ts.canHaveModifiers(n) &&
        !!ts.getModifiers(n)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    for (const s of sf.statements)
        if (ts.isVariableStatement(s) && exported(s))
            for (const d of s.declarationList.declarations) out.add(d.name.getText());
        else if (ts.isFunctionDeclaration(s) && s.name && exported(s)) out.add(s.name.text);
        else if (ts.isExportAssignment(s) && ts.isIdentifier(s.expression))
            out.add(s.expression.text);
        else if (ts.isExportDeclaration(s) && s.exportClause && ts.isNamedExports(s.exportClause))
            for (const e of s.exportClause.elements) out.add((e.propertyName ?? e.name).text);
    return out;
};

function scan(files: SourceFile[], presets: Tables['presets']) {
    const sources = files.map((f) =>
        ts.createSourceFile(
            f.path,
            f.text,
            ts.ScriptTarget.Latest,
            true,
            f.path.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.TSX,
        ),
    );
    const consts = new Map<string, ts.Node>();
    // name → { body, its file's imports, whether that file exports it }
    const components = new Map<
        string,
        { decl: ts.Node; body: ts.Node; imports: Imports; exported: boolean }
    >();
    // Every tag a scanned file renders, so a component someone renders is read only where it is rendered.
    const rendered = new Set<string>();
    for (const sf of sources) {
        const imports = importsOf(sf);
        const exported = exportedNames(sf);
        (function tags(n: ts.Node) {
            if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n))
                rendered.add(n.tagName.getText());
            ts.forEachChild(n, tags);
        })(sf);
        for (const s of sf.statements) {
            const decls: [ts.BindingName, ts.Node | undefined][] = ts.isVariableStatement(s)
                ? s.declarationList.declarations.map((d) => [d.name, d.initializer])
                : ts.isFunctionDeclaration(s) && s.name
                  ? [[s.name, s]]
                  : [];
            for (const [name, init] of decls) {
                if (!ts.isIdentifier(name) || !init) continue;
                consts.set(name.text, init);
                if (
                    /^[A-Z]/.test(name.text) &&
                    (ts.isArrowFunction(init) ||
                        ts.isFunctionDeclaration(init) ||
                        ts.isFunctionExpression(init)) &&
                    init.body
                ) {
                    components.set(name.text, {
                        decl: ts.isFunctionDeclaration(init) ? init : init.parent,
                        body: init.body,
                        imports,
                        exported: exported.has(name.text),
                    });
                }
            }
        }
    }

    // The initializer an identifier reads: the nearest enclosing block's const of that name (const badge = MAP[x]
    // inside a .map() callback), else a top-level const of any scanned file.
    const declared = (id: ts.Identifier) => {
        for (let p: ts.Node | undefined = id.parent; p; p = p.parent)
            if (ts.isBlock(p) || ts.isSourceFile(p))
                for (const s of p.statements)
                    if (ts.isVariableStatement(s))
                        for (const d of s.declarationList.declarations)
                            if (ts.isIdentifier(d.name) && d.name.text === id.text && d.initializer)
                                return d.initializer;
        return consts.get(id.text);
    };
    const strings = (n: ts.Node, out = new Set<string>(), seen = new Set<ts.Node>()) => {
        if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) out.add(n.text);
        else if (ts.isIdentifier(n) && !seen.has(n)) {
            const init = declared(n);
            if (init) {
                seen.add(n);
                strings(init, out, seen);
            }
        }
        ts.forEachChild(n, (c) => void strings(c, out, seen)); // a truthy return would stop forEachChild
        return out;
    };

    const skipped = new Set(
        [...components]
            .filter(([name, c]) => rendered.has(name) || !c.exported)
            .map(([, c]) => c.decl),
    );

    function codeElements(sf: ts.SourceFile) {
        const out: CodeElement[] = [];
        const open = (n: ts.JsxElement | ts.JsxSelfClosingElement) =>
            ts.isJsxElement(n) ? n.openingElement : n;
        // vapor: the imports the node's file has. bound: inside an inlined component body, prop name → the call-site
        // nodes passed for it, read against the call site's imports.
        (function visit(
            n: ts.Node,
            parent: string[],
            vapor: Imports,
            bound = new Map<string, { nodes: ts.Node[]; vapor: Imports }>(),
            depth = 0,
        ) {
            if (skipped.has(n)) return;
            const read =
                ts.isJsxExpression(n) &&
                n.expression &&
                (ts.isIdentifier(n.expression)
                    ? n.expression.text
                    : ts.isPropertyAccessExpression(n.expression)
                      ? n.expression.name.text
                      : null);
            const passed = read ? bound.get(read) : undefined;
            if (passed) {
                for (const b of passed.nodes) visit(b, parent, passed.vapor, new Map(), depth);
                return;
            }
            if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
                const text = open(n).tagName.getText();
                const resolved = resolveTag(text, vapor);
                const local = !resolved && components.get(text);
                if (local && depth < 4) {
                    const args = new Map<string, { nodes: ts.Node[]; vapor: Imports }>();
                    for (const a of open(n).attributes.properties)
                        if (
                            ts.isJsxAttribute(a) &&
                            a.initializer &&
                            ts.isJsxExpression(a.initializer) &&
                            a.initializer.expression
                        )
                            args.set(a.name.getText(), {
                                nodes: [a.initializer.expression],
                                vapor,
                            });
                    if (ts.isJsxElement(n)) args.set('children', { nodes: [...n.children], vapor });
                    // The call site's children and props are rendered where the body reads them, not here as well.
                    return visit(local.body, parent, local.imports, args, depth + 1);
                }
                if (resolved) {
                    let { tag, pkg } = resolved;
                    // A composites preset wrapper is the core element it renders: <Dialog.Action> is a primary lg Button.
                    const preset = pkg === 'composites' ? presets[tag] : undefined;
                    const props: Record<string, PropValue> = {};
                    // A preset prop the wrapper picks from its context (AlertDialog.Action's danger or primary) is any of them.
                    for (const [k, v] of Object.entries(preset?.props ?? {}))
                        props[k] = Array.isArray(v) ? { expr: undefined, values: new Set(v) } : v;
                    if (preset) [tag, pkg] = [preset.tag, 'core'];
                    for (const a of open(n).attributes.properties) {
                        if (!ts.isJsxAttribute(a)) continue;
                        const init = a.initializer;
                        const e = init && ts.isJsxExpression(init) ? init.expression : init;
                        props[a.name.getText()] = !init
                            ? true
                            : e && (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e))
                              ? e.text
                              : e?.kind === ts.SyntaxKind.TrueKeyword
                                ? true
                                : e?.kind === ts.SyntaxKind.FalseKeyword
                                  ? 'false'
                                  : e && ts.isNumericLiteral(e)
                                    ? e.text
                                    : { expr: e?.getText(), values: e ? strings(e) : new Set() };
                    }
                    const at = n.getSourceFile();
                    const where = `${at.fileName}:${at.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;
                    out.push({ tag, pkg, above: parent, props, at: where });
                    parent = [tag, ...parent];
                    // render={<Toggle />} makes the element render as Toggle, so its children (not the render
                    // element itself, an attribute) sit inside a Toggle.
                    const render = open(n).attributes.properties.find(
                        (a): a is ts.JsxAttribute =>
                            ts.isJsxAttribute(a) && a.name.getText() === 'render',
                    );
                    const as =
                        render?.initializer &&
                        ts.isJsxExpression(render.initializer) &&
                        render.initializer.expression;
                    const asTag =
                        as &&
                        (ts.isJsxSelfClosingElement(as) || ts.isJsxElement(as)) &&
                        resolveTag(open(as).tagName.getText(), vapor);
                    if (ts.isJsxElement(n) && asTag) {
                        visit(n.openingElement, parent, vapor, bound, depth);
                        for (const c of n.children)
                            visit(c, [asTag.tag, ...parent], vapor, bound, depth);
                        return;
                    }
                }
            }
            ts.forEachChild(n, (c) => void visit(c, parent, vapor, bound, depth));
        })(sf, [], importsOf(sf));
        return out;
    }

    return sources.filter((sf) => /\.[jt]sx$/.test(sf.fileName)).flatMap(codeElements);
}

export function compare(expected: ExpectedSet, files: SourceFile[], tables: Tables): CompareResult {
    const { defaults, presets } = tables;
    // got undefined means the code left the prop to the part's variant default.
    const same = (want: string | true, got: PropValue | undefined, tag: string, k: string) =>
        want === got ||
        (got === undefined && defaults[tag]?.[k] === want) ||
        (want === '*' && got !== undefined) ||
        want === '...' ||
        (want === true && got === 'true') ||
        (typeof got === 'object' && typeof want === 'string' && got.values.has(want));

    const wants = expected.lines.map(({ line, pkg }) => ({ ...parseLine(line), pkg }));
    const tags = new Set(wants.map((w) => w.tag));
    const code = scan(files, presets).map((c) => ({
        ...c,
        parent: c.above.find((t) => tags.has(t)) ?? null,
    }));
    const diff = (want: Want, c: (typeof code)[number]) => [
        ...Object.entries(want.props)
            .filter(([k, v]) => !same(v, c.props[k], c.tag, k))
            .map(([k, v]) => {
                const got = c.props[k];
                return `${k}: ${JSON.stringify(v)} → ${(typeof got === 'object' ? got.expr : undefined) ?? JSON.stringify(got ?? null)}`;
            }),
        ...(want.parent && c.parent !== want.parent
            ? [`data-in: ${want.parent} → ${c.parent ?? 'none'}`]
            : []),
    ];
    const sameTag = (w: (typeof wants)[number], c: (typeof code)[number]) =>
        c.tag === w.tag && c.pkg === w.pkg;
    // Each line gets its own code element: a maximum matching (augmenting paths), so one <Button disabled> cannot
    // stand for both the enabled and the disabled Button the design draws.
    const fits = wants.map((w) =>
        code.flatMap((c, j) => (sameTag(w, c) && !diff(w, c).length ? [j] : [])),
    );
    const owner = new Map<number, number>(); // code index → line index
    const assign = (i: number, seen: Set<number>): boolean =>
        fits[i].some((j) => {
            if (seen.has(j)) return false;
            seen.add(j);
            const o = owner.get(j);
            if (o !== undefined && !assign(o, seen)) return false;
            owner.set(j, i);
            return true;
        });
    for (let i = 0; i < wants.length; i++) assign(i, new Set());
    const hit = new Map([...owner].map(([j, i]) => [i, code[j]]));
    // The closest candidate for a miss is never an element another line already matched: that element is accounted
    // for, and showing its props as this line's diff reads as if correct code were wrong.
    const used = new Set(hit.values());
    const rows = expected.lines.map(({ line: l }, i): Row => {
        const found = hit.get(i);
        if (found) return { line: l, status: 'ok', at: found.at };
        const candidates = code.filter((c) => sameTag(wants[i], c) && !used.has(c));
        if (!candidates.length) return { line: l, status: 'missing' };
        const best = candidates
            .map((c) => ({ c, d: diff(wants[i], c) }))
            .sort((a, b) => a.d.length - b.d.length)[0];
        return { line: l, status: 'mismatch', closest: best.c.at, diff: best.d };
    });
    const ok = rows.filter((r) => r.status === 'ok').length;
    return {
        version: 1,
        // Unscorable wins: a pass built on instances nobody could read is a mis-grade.
        result: expected.unscorable.length ? 'unscorable' : ok === rows.length ? 'pass' : 'fail',
        recall: rows.length ? ok / rows.length : 1,
        ok,
        total: rows.length,
        rows,
        excluded: expected.excluded,
        unscorable: expected.unscorable,
    };
}
