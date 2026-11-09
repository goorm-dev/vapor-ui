// Component recall: every expected-set line must appear in the code as an element with the same tag, inside the same
// expected tag (data-in), carrying every expected prop with the same value. A tag that exists but never matches is a
// props mismatch; no such tag at all is missing. Both count as not recalled.
// Code side: each JSX element whose tag is imported from '@vapor-ui/*'; its parent is the nearest one above that the
// expected set names, so layout elements in between (Box, HStack) do not count.
// A local component (PascalCase function in a scanned file) is inlined at each call site, with the JSX passed to it as
// props or children rendered where its body reads that prop, so <SideToolTab icon={<MemoIcon />}> puts MemoIcon in
// the IconButton the tab draws. ponytail: .map() over data is read once and props are bound by name only.
import ts from 'typescript';

import type { ExpectedSet } from './expected';
import type { Tables } from './library';

export interface SourceFile {
    path: string;
    text: string;
}

// true = bare flag; an object = an expression, matching any string the consts it reads hold.
type PropValue = string | true | { expr: string | undefined; values: Set<string> };

interface CodeElement {
    tag: string;
    above: string[];
    props: Record<string, PropValue>;
    at: string;
}

export type Row =
    | { line: string; status: 'ok'; at: string }
    | { line: string; status: 'missing' }
    | { line: string; status: 'mismatch'; closest: string; diff: string[] };

export interface CompareResult {
    recall: number;
    ok: number;
    total: number;
    rows: Row[];
    unmapped: string[];
    errors: string[];
}

// "tag" + { prop: value }; value true = bare flag. "*" (aria-label) and "..." (template placeholder) match any value.
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
function scan(files: SourceFile[], presets: Tables['presets']) {
    const sources = files.map((f) =>
        ts.createSourceFile(f.path, f.text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
    );
    const consts = new Map<string, ts.Node>();
    // name → { body, props: names it destructures, or null for a `props` object }
    const components = new Map<string, { body: ts.Node; props: Set<string> | null }>();
    for (const sf of sources)
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
                    const p = init.parameters[0]?.name;
                    components.set(name.text, {
                        body: init.body,
                        props:
                            p && ts.isObjectBindingPattern(p)
                                ? new Set(p.elements.map((e) => e.name.getText()))
                                : null,
                    });
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

    function codeElements(sf: ts.SourceFile) {
        const vapor = new Map<string, string>(); // local name → package
        for (const s of sf.statements)
            if (
                ts.isImportDeclaration(s) &&
                ts.isStringLiteral(s.moduleSpecifier) &&
                /^@vapor-ui\//.test(s.moduleSpecifier.text)
            ) {
                const spec = s.moduleSpecifier.text;
                const nb = s.importClause?.namedBindings;
                if (nb && ts.isNamedImports(nb))
                    for (const e of nb.elements) vapor.set(e.name.text, spec);
            }
        const out: CodeElement[] = [];
        const open = (n: ts.JsxElement | ts.JsxSelfClosingElement) =>
            ts.isJsxElement(n) ? n.openingElement : n;
        // bound: inside an inlined component body, prop name → the call-site nodes passed for it.
        (function visit(
            n: ts.Node,
            parent: string[],
            bound = new Map<string, ts.Node[]>(),
            depth = 0,
        ) {
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
                for (const b of passed) visit(b, parent, new Map(), depth);
                return;
            }
            if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
                let tag = open(n).tagName.getText();
                const local = !vapor.has(tag.split('.')[0]) && components.get(tag);
                if (local && depth < 4) {
                    const args = new Map<string, ts.Node[]>();
                    for (const a of open(n).attributes.properties)
                        if (
                            ts.isJsxAttribute(a) &&
                            a.initializer &&
                            ts.isJsxExpression(a.initializer) &&
                            a.initializer.expression
                        )
                            args.set(a.name.getText(), [a.initializer.expression]);
                    if (ts.isJsxElement(n)) args.set('children', [...n.children]);
                    visit(local.body, parent, args, depth + 1);
                }
                const pkg = vapor.get(tag.split('.')[0]);
                if (pkg) {
                    // A composites preset wrapper is the core element it renders: <Dialog.Action> is a primary lg Button.
                    const preset = pkg === '@vapor-ui/composites' ? presets[tag] : undefined;
                    const props: Record<string, PropValue> = { ...preset?.props };
                    if (preset) tag = preset.tag;
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
                    out.push({ tag, above: parent, props, at: where });
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
                    if (
                        ts.isJsxElement(n) &&
                        as &&
                        (ts.isJsxSelfClosingElement(as) || ts.isJsxElement(as)) &&
                        vapor.has(open(as).tagName.getText().split('.')[0])
                    ) {
                        visit(n.openingElement, parent, bound, depth);
                        for (const c of n.children)
                            visit(c, [open(as).tagName.getText(), ...parent], bound, depth);
                        return;
                    }
                }
            }
            ts.forEachChild(n, (c) => void visit(c, parent, bound, depth));
        })(sf, []);
        return out;
    }

    return sources.filter((sf) => sf.fileName.endsWith('.tsx')).flatMap(codeElements);
}

export function compare(expected: ExpectedSet, files: SourceFile[], tables: Tables): CompareResult {
    const { defaults, presets } = tables;
    // got undefined means the code left the prop to the part's variant default.
    const same = (want: string | true, got: PropValue | undefined, tag: string, k: string) =>
        want === got ||
        (got === undefined && defaults[tag]?.[k] === want) ||
        want === '*' ||
        want === '...' ||
        (want === true && got === 'true') ||
        (typeof got === 'object' && typeof want === 'string' && got.values.has(want));

    const tags = new Set(expected.lines.map((l) => parseLine(l).tag));
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
    const wants = expected.lines.map(parseLine);
    const hit = wants.map((w) => code.find((c) => c.tag === w.tag && !diff(w, c).length));
    // The closest candidate for a miss is never an element another line already matched: that element is accounted
    // for, and showing its props as this line's diff reads as if correct code were wrong.
    const used = new Set(hit.filter(Boolean));
    const rows = expected.lines.map((l, i): Row => {
        const found = hit[i];
        if (found) return { line: l, status: 'ok', at: found.at };
        const candidates = code.filter((c) => c.tag === wants[i].tag && !used.has(c));
        if (!candidates.length) return { line: l, status: 'missing' };
        const best = candidates
            .map((c) => ({ c, d: diff(wants[i], c) }))
            .sort((a, b) => a.d.length - b.d.length)[0];
        return { line: l, status: 'mismatch', closest: best.c.at, diff: best.d };
    });
    const ok = rows.filter((r) => r.status === 'ok').length;
    return {
        recall: rows.length ? ok / rows.length : 1,
        ok,
        total: rows.length,
        rows,
        unmapped: expected.unmapped,
        errors: expected.errors,
    };
}
