// Gate 2 of the private bench: hand-written code must not position with `absolute` or hardcode a value that has a
// token. Ported from the bench spike unchanged so the bench and the plugin read the same judgment: a regex scan per
// line, after an AST pass marks the lines that are exempt. Values inside var(--…) fallbacks are skipped.
// ponytail: regex. Named colors, unitless numbers and rem pass unseen, and a line with any on-scale px fails as a whole.
import dimension from '@vapor-ui/design-tokens/raws/dimension';
import space from '@vapor-ui/design-tokens/raws/space';
import ts from 'typescript';

import type { SourceFile } from './compare';

export type Exemption = 'asset' | 'srOnly' | 'border1px' | 'untokenized' | 'inputIcon';

export interface Hit {
    at: string;
    text: string;
}

export interface StylingResult {
    version: 1;
    result: 'pass' | 'fail';
    absolute: Hit[];
    hardcoded: Hit[];
    exempt: Record<Exemption, Hit[]>;
}

const pxOf = (tree: unknown): number[] =>
    tree && typeof tree === 'object'
        ? '$value' in tree
            ? [(tree.$value as { value: number }).value]
            : Object.values(tree).flatMap(pxOf)
        : [];

// $css width/height take dimension tokens, which stop at 64px (72px exists only in space).
const DIM_PX = new Set(pxOf(dimension));
const TOKEN_PX = new Set([...pxOf(space), ...DIM_PX]);
const DIM_PROP = /^['"]?(min-?|max-?)?(width|height|block-?size|inline-?size)['"]?$/i;

type JsxNode = ts.JsxElement | ts.JsxSelfClosingElement;

const isElement = (n: ts.Node): n is JsxNode => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);
const tagName = (n: JsxNode) => (ts.isJsxElement(n) ? n.openingElement : n).tagName.getText();

// Lines are keyed "path:line" (1-based) like Hit.at. ts.createSourceFile normalizes fileName, so the path is passed.
const markLines = (into: Set<string>, path: string, sf: ts.SourceFile, n: ts.Node) => {
    const a = sf.getLineAndCharacterOfPosition(n.getStart()).line;
    const b = sf.getLineAndCharacterOfPosition(n.getEnd()).line;
    for (let l = a; l <= b; l++) into.add(`${path}:${l + 1}`);
};

// Meant to make a `{list.map(...)}` child an asset when every JSX it returns is one. ponytail: kept as the spike wrote
// it. The callback always returns truthy, which stops forEachChild, so only the first child at each level is followed
// and `list.map(...)` ends at `list` with no JSX.
const jsxIn = (n: ts.Node, out: ts.Node[] = []): ts.Node[] => {
    ts.forEachChild(n, (c) => (isElement(c) || ts.isJsxFragment(c) ? out.push(c) : jsxIn(c, out)));
    return out;
};

// A childless div/Box layered next to assets (a guide frame over a photo) is a decorative overlay.
const isOverlay = (n: ts.Node) =>
    ts.isJsxSelfClosingElement(n) &&
    !isAsset(n) &&
    (/^[a-z]/.test(tagName(n)) || ['Box', 'Flex'].includes(tagName(n)));

// Illustrations layered from img/svg keep the design's absolute positions and pixel sizes. An asset is an img/svg, an
// element whose JSX holds only assets (no text, no vapor component), or one whose `render` prop is an img/svg.
function isAsset(n: ts.Node): boolean {
    if (ts.isJsxExpression(n)) {
        const els = n.expression ? jsxIn(n.expression) : [];
        return els.length > 0 && els.every(isAsset);
    }
    if (!isElement(n)) return false;
    const tag = tagName(n);
    if (tag === 'img' || tag === 'svg') return true;
    const attrs = (ts.isJsxElement(n) ? n.openingElement : n).attributes.properties;
    if (
        attrs.some(
            (a) =>
                ts.isJsxAttribute(a) &&
                a.name.getText() === 'render' &&
                /<(img|svg)\b/.test(a.initializer?.getText() ?? ''),
        )
    )
        return true;
    if (!ts.isJsxElement(n) || (/^[A-Z]/.test(tag) && !['Box', 'Flex'].includes(tag))) return false;
    // A `{/* comment */}` child is not content.
    const kids = n.children.filter(
        (c) => !(ts.isJsxText(c) && !c.text.trim()) && !(ts.isJsxExpression(c) && !c.expression),
    );
    return kids.length > 0 && kids.every((c) => isAsset(c) || isOverlay(c)) && kids.some(isAsset);
}

export function checkStyling(files: SourceFile[]): StylingResult {
    const assetLines = new Set<string>();
    const srOnlyLines = new Set<string>();
    const inputIconLines = new Set<string>();
    // Collected across every file and applied to every file. ponytail: CSS rules match by class name only, helpers by
    // name only.
    const assetClasses = new Set<string>();
    const assetHelpers = new Set<string>();

    const css = files.filter((f) => f.path.endsWith('.css'));
    const sources = files
        .filter((f) => !f.path.endsWith('.css'))
        .map((f) => ({
            path: f.path,
            sf: ts.createSourceFile(
                f.path,
                f.text,
                ts.ScriptTarget.Latest,
                true,
                ts.ScriptKind.TSX,
            ),
        }));

    for (const { path, sf } of sources) {
        const collect = (n: ts.Node) => {
            if (ts.isPropertyAccessExpression(n) && /styles?$/i.test(n.expression.getText()))
                assetClasses.add(n.name.text);
            if (
                ts.isJsxAttribute(n) &&
                n.name.getText() === 'className' &&
                n.initializer &&
                ts.isStringLiteral(n.initializer)
            )
                for (const c of n.initializer.text.split(/\s+/).filter(Boolean))
                    assetClasses.add(c);
            if (ts.isCallExpression(n) && ts.isIdentifier(n.expression))
                assetHelpers.add(n.expression.text);
            ts.forEachChild(n, collect);
        };
        const visit = (n: ts.Node): void => {
            if (isElement(n) && isAsset(n)) {
                markLines(assetLines, path, sf, n);
                return collect(n);
            }
            // A visually hidden box written inline ($css/style: absolute + 1px × 1px + overflow hidden).
            if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
                const t = n.attributes.getText();
                if (
                    /absolute/.test(t) &&
                    /width:\s*['"]1px/.test(t) &&
                    /height:\s*['"]1px/.test(t) &&
                    /overflow:\s*['"]hidden/.test(t)
                )
                    markLines(srOnlyLines, path, sf, n);
            }
            // DS gap: TextInput has no icon slot, so an icon is overlaid with absolute. Exempt only an absolute,
            // non-interactive (aria-hidden or pointerEvents none) element holding only an icon, or the icon itself,
            // whose sibling is a TextInput or `{children}` (an InputWithIcon wrapper).
            if (isElement(n) && ts.isJsxElement(n.parent)) {
                const open = ts.isJsxElement(n) ? n.openingElement : n;
                const t = open.attributes.getText();
                const kids = ts.isJsxElement(n)
                    ? n.children.filter((c) => !(ts.isJsxText(c) && !c.text.trim()))
                    : [];
                const iconOnly =
                    /Icon$/.test(tagName(n)) ||
                    (kids.length === 1 &&
                        (ts.isJsxExpression(kids[0]) ||
                            (isElement(kids[0]) && /Icon$/.test(tagName(kids[0])))));
                const inputSibling = n.parent.children.some(
                    (c) =>
                        (isElement(c) && /TextInput$/.test(tagName(c))) ||
                        (ts.isJsxExpression(c) && c.expression?.getText() === 'children'),
                );
                if (
                    /absolute/.test(t) &&
                    /aria-hidden|pointerEvents:\s*['"]none/.test(t) &&
                    iconOnly &&
                    inputSibling
                )
                    markLines(inputIconLines, path, sf, open);
            }
            ts.forEachChild(n, visit);
        };
        visit(sf);
    }

    // Helpers may be declared anywhere (often inside the component), so walk every declaration.
    for (const { path, sf } of sources) {
        const find = (n: ts.Node) => {
            if (
                (ts.isFunctionDeclaration(n) || ts.isVariableDeclaration(n)) &&
                n.name &&
                assetHelpers.has(n.name.getText())
            )
                markLines(assetLines, path, sf, n);
            ts.forEachChild(n, find);
        };
        find(sf);
    }

    // Visually hidden helpers need absolute + 1px by definition.
    for (const { path, text } of css) {
        let inSrOnly = false;
        let inAsset = false;
        text.split('\n').forEach((line, i) => {
            const sel = line.match(/^\s*([^{}]+)\{/);
            if (sel) {
                inSrOnly = /\.(sr-only|visually-hidden)\b/.test(sel[1]);
                inAsset = [...sel[1].matchAll(/\.([\w-]+)/g)].some(
                    ([, c]) =>
                        assetClasses.has(c) ||
                        assetClasses.has(c.replace(/-(\w)/g, (_, x: string) => x.toUpperCase())),
                );
            }
            if (inSrOnly) srOnlyLines.add(`${path}:${i + 1}`);
            if (inAsset) assetLines.add(`${path}:${i + 1}`);
            if (line.includes('}')) inSrOnly = inAsset = false;
        });
    }

    const absolute: Hit[] = [];
    const hardcoded: Hit[] = [];
    const exempt: Record<Exemption, Hit[]> = {
        asset: [],
        srOnly: [],
        border1px: [],
        untokenized: [],
        inputIcon: [],
    };

    for (const { path, text } of files) {
        // Numbers inside comments are not code. ponytail: line-based, a `/*` inside a string fools it.
        let inComment = false;
        const rows = text.split('\n');
        for (let i = 0; i < rows.length; i++) {
            const raw = rows[i];
            const hit = { at: `${path}:${i + 1}`, text: raw.trim() };
            let line = raw;
            if (inComment) {
                const end = line.indexOf('*/');
                if (end < 0) continue;
                line = line.slice(end + 2);
                inComment = false;
            }
            line = line.replace(/\/\*.*?\*\//g, '');
            const open = line.indexOf('/*');
            if (open >= 0) {
                line = line.slice(0, open);
                inComment = true;
            }
            line = line.replace(/(^|[^:])\/\/.*$/, '$1');

            if (assetLines.has(hit.at)) {
                if (/absolute|\d+(\.\d+)?px|#[0-9a-fA-F]{3,8}\b/.test(line)) exempt.asset.push(hit);
                continue;
            }
            if (srOnlyLines.has(hit.at)) {
                if (/absolute|\d+(\.\d+)?px/.test(line)) exempt.srOnly.push(hit);
                continue;
            }
            if (inputIconLines.has(hit.at) && /absolute|\d+(\.\d+)?px/.test(line)) {
                exempt.inputIcon.push(hit);
                continue;
            }
            // An absolute line still goes on to the color and px checks, so it can land in both lists.
            if (/position\s*[:=]\s*\{?\s*['"]?absolute/.test(line)) absolute.push(hit);
            const bare = line.replace(/var\(--[^)]*\)/g, '');
            if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(bare)) {
                hardcoded.push(hit);
                continue;
            }
            const px = [...bare.matchAll(/\b(\d+(?:\.\d+)?)px\b/g)]
                .map((m) => Number(m[1]))
                .filter(Boolean);
            if (!px.length) continue;
            // A `key: value` segment whose key is width/height is judged against the dimension scale. `0px` is
            // dropped above but still matches the space scale here.
            const hasToken = bare.split(/[,;{}]/).some((seg) => {
                const key = seg.match(/^\s*([\w'"-]+)\s*:/)?.[1] ?? '';
                const scale = DIM_PROP.test(key) ? DIM_PX : TOKEN_PX;
                return [...seg.matchAll(/\b(\d+(?:\.\d+)?)px\b/g)].some((m) =>
                    scale.has(Number(m[1])),
                );
            });
            // 1px borders have no token, and px off the token scale stay out of the gate.
            if (px.every((v) => v === 1) && /border|outline/i.test(bare))
                exempt.border1px.push(hit);
            else if (hasToken) hardcoded.push(hit);
            else exempt.untokenized.push(hit);
        }
    }

    return {
        version: 1,
        result: absolute.length || hardcoded.length ? 'fail' : 'pass',
        absolute,
        hardcoded,
        exempt,
    };
}
