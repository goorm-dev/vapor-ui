// Visual score of a running app against a Figma frame, on text lines and component boxes measured in both.
// Block-Match and Position (Design2Code) pair Figma TEXT lines with DOM line boxes by string, so a screen that renders
// real data instead of the design's sample text scores low. Layout IoU (Sketch2Code) compares the boxes of each
// component type. Only visualScore touches a browser; designBoxes and scoreVisual take data.
import type { FigmaTree } from './expected';
import type { FigmaNode, Rect } from './figma-mock';

export type Box = { x: number; y: number; w: number; h: number };
export type TextBox = Box & { text: string };
export type CompBox = Box & { type: CompType };

// Library component types with a DOM counterpart, by the vapor class prefix their element carries (button-abc12).
const CLASS_TYPES = [
    ['IconButton', 'icon-button'],
    ['Button', 'button'],
    ['Badge', 'badge'],
    ['TextInput', 'text-input'],
    ['Select', 'select'],
    ['Breadcrumb', 'breadcrumb'],
    ['Avatar', 'avatar'],
    ['Checkbox', 'checkbox'],
    ['Switch', 'switch'],
    ['Radio', 'radio'],
    ['Textarea', 'textarea'],
    ['Progress', 'progress-bar'],
] as const;

// TableCell is a <td>/<th> with a table-* class, Icon an <svg>.
export type CompType = (typeof CLASS_TYPES)[number][0] | 'TableCell' | 'Icon';

const DOM_TYPES: Record<string, CompType> = Object.fromEntries(CLASS_TYPES.map(([t, p]) => [p, t]));

export interface DesignBoxes {
    width: number;
    height: number;
    blocks: TextBox[];
    comps: CompBox[];
}

export interface VisualScores {
    blockMatch: number;
    position: number;
    // null when the design draws no component box.
    layout: number | null;
    // type → "iou (design count→rendered count)"
    layoutByType: Partial<Record<CompType, string>>;
    // "matched/design lines ref, rendered lines gen"
    matched: string;
    unmatchedRef: string[];
}

// The `visual --json` contract: bump version when a field changes or goes away.
export type VisualResult =
    | ({ version: 1; result: 'scored' } & VisualScores & { errors: string[] })
    | { version: 1; result: 'render-failed'; error: string };

export interface VisualOptions {
    // CSS selector of the element that stands for the frame; its top-left becomes the origin.
    selector?: string;
    // Playwright storageState file, for pages behind a login.
    storageState?: string;
    timeoutMs?: number;
    // Path to save a viewport screenshot of the same render.
    screenshot?: string;
}

const figmaType = (name: string): CompType | undefined => {
    const n = name.replace(/^[^A-Za-z]+/, '');
    if (/Icon$/.test(n)) return 'Icon';
    if (/^Table\.(Cell|Heading)$/.test(n)) return 'TableCell';
    return CLASS_TYPES.find(
        ([t]) =>
            n === t || n.startsWith(`${t}.Root`) || (t === 'Progress' && n.startsWith('Progress')),
    )?.[0];
};

// Text blocks from TEXT nodes and component boxes from library instances, relative to the frame. The instance walk
// stops at an instance and keeps going inside SLOT / 🟨 slot layers / swapped-in local components. Instance types
// without a DOM counterpart are skipped.
export function designBoxes(tree: FigmaTree): DesignBoxes {
    const root = tree.document;
    const o = root.absoluteBoundingBox;
    if (!o) throw new Error(`${root.name} (${root.id}) has no absoluteBoundingBox`);
    const at = (b: Rect): Box => ({ x: b.x - o.x, y: b.y - o.y, w: b.width, h: b.height });

    const blocks: TextBox[] = [];
    const walk = (n: FigmaNode): void => {
        if (n.visible === false) return;
        if (n.type === 'TEXT' && n.characters?.trim()) {
            const b = n.absoluteRenderBounds ?? n.absoluteBoundingBox;
            if (b) blocks.push({ text: n.characters, ...at(b) });
        }
        n.children?.forEach(walk);
    };
    walk(root);

    const comps: CompBox[] = [];
    const slotsIn = (n: FigmaNode, out: FigmaNode[] = []) => {
        for (const c of n.children ?? [])
            if (
                c.type === 'SLOT' ||
                (c.type === 'INSTANCE' && (/^🟨/.test(c.name) || /^[A-Za-z]/.test(c.name)))
            )
                out.push(c);
            else slotsIn(c, out);
        return out;
    };
    const walkC = (n: FigmaNode): void => {
        if (n.visible === false) return;
        const lib =
            n.type === 'INSTANCE' &&
            (/^💙/.test(n.name) || /Icon$/.test(n.name.replace(/^\W+/, '')));
        if (lib) {
            const t = figmaType(n.name);
            const b = n.absoluteBoundingBox;
            if (t && b) comps.push({ type: t, ...at(b) });
            for (const s of slotsIn(n)) s.children?.forEach(walkC);
            return;
        }
        n.children?.forEach(walkC);
    };
    walkC(root);

    return { width: o.width, height: o.height, blocks, comps };
}

const splitLines = (blocks: TextBox[]): TextBox[] =>
    blocks.flatMap((b) => {
        // Figma keeps an empty paragraph as a lone zero-width space, which trim() does not remove.
        const ls = b.text.split(/[\n\u2028\u2029]/).filter((l) => l.replace(/\u200b/g, '').trim());
        return ls.map((text, i) => ({
            text,
            x: b.x,
            w: b.w,
            h: b.h / ls.length,
            y: b.y + (b.h / ls.length) * i,
        }));
    });

// Block-Match: matched area / all area. Position: mean of 1 - max(|dx|, |dy|) over matched centers, normalized by the
// frame size. Text match: char-bigram Dice ≥ 0.5, greedy best-first, one-to-one.
function blockScores(refB: TextBox[], genB: TextBox[], W: number, H: number) {
    const norm = (s: string) => s.replace(/#\d+$/, '').replace(/\s+/g, '');
    const big = (s: string) => {
        const a = new Map<string, number>();
        for (let i = 0; i < s.length - 1; i++)
            a.set(s.slice(i, i + 2), (a.get(s.slice(i, i + 2)) ?? 0) + 1);
        return a;
    };
    const dice = (a: string, b: string) => {
        if (a === b) return 1;
        const A = big(a);
        const B = big(b);
        let hit = 0;
        for (const [k, v] of A) hit += Math.min(v, B.get(k) ?? 0);
        return (2 * hit) / Math.max(1, a.length - 1 + b.length - 1);
    };
    // Wrapped DOM lines carry the whole node text; score them by containment instead.
    const sim = (r: TextBox, g: TextBox) => {
        const gt = norm(g.text);
        const rt = norm(r.text);
        return gt.includes(rt) && /#\d+$/.test(g.text) ? 0.9 : dice(rt, gt);
    };
    const pairs: [number, number, number, number][] = [];
    refB.forEach((r, i) => {
        genB.forEach((g, j) => {
            const s = sim(r, g);
            // Tie-break by center distance: the same string can appear twice (dialog trigger + title).
            if (s >= 0.5)
                pairs.push([
                    s,
                    i,
                    j,
                    Math.hypot(r.x + r.w / 2 - g.x - g.w / 2, r.y + r.h / 2 - g.y - g.h / 2),
                ]);
        });
    });
    pairs.sort((a, b) => b[0] - a[0] || a[3] - b[3]);
    const ur = new Set<number>();
    const ug = new Set<number>();
    const m: [number, number][] = [];
    for (const [, i, j] of pairs)
        if (!ur.has(i) && !ug.has(j)) {
            ur.add(i);
            ug.add(j);
            m.push([i, j]);
        }
    const area = (b: Box) => b.w * b.h;
    const total = refB.reduce((a, b) => a + area(b), 0) + genB.reduce((a, b) => a + area(b), 0);
    const hit = m.reduce((a, [i, j]) => a + area(refB[i]) + area(genB[j]), 0);
    const c = (b: Box) => [(b.x + b.w / 2) / W, (b.y + b.h / 2) / H];
    const pos = m.map(([i, j]) => {
        const [a, b] = c(refB[i]);
        const [d, e] = c(genB[j]);
        return 1 - Math.max(Math.abs(a - d), Math.abs(b - e));
    });
    return {
        blockMatch: total ? hit / total : 0,
        position: pos.length ? pos.reduce((a, b) => a + b, 0) / pos.length : 0,
        matched: `${m.length}/${refB.length} ref, ${genB.length} gen`,
        unmatchedRef: refB.filter((_, i) => !ur.has(i)).map((b) => b.text),
    };
}

// Per component type, IoU of the union of its boxes (rasterized at 4px), weighted by the union's area. Catches what
// text blocks can't: icons, buttons and inputs that are missing, moved or resized.
function layoutScore(refC: CompBox[], genC: CompBox[], width: number, height: number) {
    const S = 4;
    const W = Math.ceil(width / S);
    const H = Math.ceil(height / S);
    const mask = (boxes: Box[]) => {
        const m = new Uint8Array(W * H);
        for (const b of boxes)
            for (
                let y = Math.max(0, Math.floor(b.y / S));
                y < Math.min(H, Math.ceil((b.y + b.h) / S));
                y++
            )
                for (
                    let x = Math.max(0, Math.floor(b.x / S));
                    x < Math.min(W, Math.ceil((b.x + b.w) / S));
                    x++
                )
                    m[y * W + x] = 1;
        return m;
    };
    const byType: Partial<
        Record<CompType, { iou: number; area: number; ref: number; gen: number }>
    > = {};
    // Only types the design uses: a vapor Table where the design drew plain frames is not a layout error.
    for (const t of new Set(refC.map((b) => b.type))) {
        const r = mask(refC.filter((b) => b.type === t));
        const g = mask(genC.filter((b) => b.type === t));
        let i = 0;
        let u = 0;
        for (let k = 0; k < r.length; k++) {
            i += r[k] & g[k];
            u += r[k] | g[k];
        }
        byType[t] = {
            iou: u ? i / u : 1,
            area: u,
            ref: refC.filter((b) => b.type === t).length,
            gen: genC.filter((b) => b.type === t).length,
        };
    }
    const types = Object.values(byType);
    const tot = types.reduce((a, v) => a + v.area, 0);
    return {
        layout: tot ? types.reduce((a, v) => a + v.iou * v.area, 0) / tot : null,
        layoutByType: Object.fromEntries(
            Object.entries(byType).map(([t, v]) => [t, `${v.iou.toFixed(2)} (${v.ref}→${v.gen})`]),
        ),
    };
}

export function scoreVisual(
    design: DesignBoxes,
    rendered: { blocks: TextBox[]; comps: CompBox[] },
): VisualScores {
    const { blockMatch, position, matched, unmatchedRef } = blockScores(
        splitLines(design.blocks),
        rendered.blocks,
        design.width,
        design.height,
    );
    const { layout, layoutByType } = layoutScore(
        design.comps,
        rendered.comps,
        design.width,
        design.height,
    );
    return { blockMatch, position, layout, layoutByType, matched, unmatchedRef };
}

// Runs in the page. One block per text node line box; Figma splits its TEXT nodes into lines the same way.
function measureText(): TextBox[] {
    const out: TextBox[] = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) {
        const words = n.textContent?.trim();
        if (!words) continue;
        const r = document.createRange();
        r.selectNodeContents(n);
        // getClientRects ignores ancestor clipping, so a 1×1 overflow-hidden wrapper still reports the full glyphs.
        // An absolute box escapes static ancestors, a fixed one escapes them all.
        let cl = -Infinity;
        let ct = -Infinity;
        let cr = Infinity;
        let cb = Infinity;
        let abs = false;
        for (let el = n.parentElement; el && el !== document.body; el = el.parentElement) {
            const s = getComputedStyle(el);
            if (abs && s.position === 'static') continue;
            if (s.overflow !== 'visible') {
                const c = el.getBoundingClientRect();
                cl = Math.max(cl, c.left);
                ct = Math.max(ct, c.top);
                cr = Math.min(cr, c.right);
                cb = Math.min(cb, c.bottom);
            }
            if (s.position === 'fixed') break;
            abs = s.position === 'absolute';
        }
        const rects = [...r.getClientRects()]
            .map((b) => {
                const left = Math.max(b.left, cl);
                const top = Math.max(b.top, ct);
                const right = Math.min(b.right, cr);
                const bottom = Math.min(b.bottom, cb);
                return { left, top, right, bottom, width: right - left, height: bottom - top };
            })
            .filter((b) => b.width > 1 && b.height > 1);
        if (!rects.length) continue;
        const st = getComputedStyle(n.parentElement as Element);
        if (st.visibility === 'hidden' || st.opacity === '0') continue;
        // Lines of a wrapped node: rects that share a top.
        const byTop: Record<number, typeof rects> = {};
        for (const b of rects) (byTop[Math.round(b.top)] ??= []).push(b);
        const lines = Object.values(byTop);
        lines.forEach((ls, i) => {
            const x = Math.min(...ls.map((b) => b.left));
            const y = Math.min(...ls.map((b) => b.top));
            const x2 = Math.max(...ls.map((b) => b.right));
            const y2 = Math.max(...ls.map((b) => b.bottom));
            out.push({
                text: lines.length === 1 ? words : `${words}#${i}`,
                x,
                y,
                w: x2 - x,
                h: y2 - y,
            });
        });
    }
    // Figma draws input values and placeholders as TEXT nodes; the DOM keeps them in attributes.
    for (const el of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea',
    )) {
        const b = el.getBoundingClientRect();
        const text = el.value || el.placeholder;
        if (text && b.width > 1 && b.height > 1)
            out.push({ text, x: b.left, y: b.top, w: b.width, h: b.height });
    }
    return out;
}

// Runs in the page, with DOM_TYPES passed in. Icons are <svg> elements, so an icon pasted as <img src="x.svg"> does not
// count. Outermost element of each type only, except icons.
function measureComps(classTypes: Record<string, CompType>): CompBox[] {
    const typeOf = (el: Element): CompType | null => {
        if (el.tagName === 'svg') return 'Icon';
        if (
            (el.tagName === 'TD' || el.tagName === 'TH') &&
            [...el.classList].some((c) => c.startsWith('table-'))
        )
            return 'TableCell';
        // IconButton carries both icon-button-* and button-* classes; the more specific one wins.
        const found = [...el.classList]
            .map((c) => classTypes[c.match(/^([a-z]+(?:-[a-z]+)*?)-[a-z0-9]{5,}$/)?.[1] ?? ''])
            .filter(Boolean);
        return found.includes('IconButton') ? 'IconButton' : (found[0] ?? null);
    };
    const out: CompBox[] = [];
    for (const el of document.querySelectorAll('body *')) {
        const t = typeOf(el);
        if (!t) continue;
        let nested = false;
        for (let p = el.parentElement; p; p = p.parentElement)
            if (typeOf(p) === t) {
                nested = true;
                break;
            }
        if (nested && t !== 'Icon') continue;
        const b = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        if (!b.width || !b.height || st.visibility === 'hidden') continue;
        out.push({ type: t, x: b.left, y: b.top, w: b.width, h: b.height });
    }
    return out;
}

const INSTALL = 'Install it with `npm i -D playwright` and `npx playwright install chromium`.';

// Opens the app the caller runs at the frame size and scores what it renders. Throws only when Playwright or its
// chromium is missing; anything that goes wrong with the page is a render-failed result. Page errors are collected
// and the page is still scored.
export async function visualScore(
    tree: FigmaTree,
    url: string,
    { selector, storageState, timeoutMs = 30_000, screenshot }: VisualOptions = {},
): Promise<VisualResult> {
    const design = designBoxes(tree);
    const { chromium } = await import('playwright').catch(() => {
        throw new Error(`playwright is not installed. ${INSTALL}`);
    });
    const browser = await chromium.launch().catch((e: Error) => {
        throw new Error(`chromium did not launch: ${e.message}\n${INSTALL}`);
    });
    const failed = (error: string): VisualResult => ({
        version: 1,
        result: 'render-failed',
        error,
    });
    try {
        const context = await browser.newContext({
            viewport: { width: Math.round(design.width), height: Math.round(design.height) },
            storageState,
        });
        context.setDefaultTimeout(timeoutMs);
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        if (response && !response.ok())
            return failed(`${url} answered ${response.status()} ${response.statusText()}`);
        await page.waitForTimeout(500);
        // Dialogs autofocus their first control; the focus ring is not in the design.
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
        if (screenshot) await page.screenshot({ path: screenshot });
        const origin = selector
            ? await page.evaluate((s) => {
                  const r = document.querySelector(s)?.getBoundingClientRect();
                  return r ? { x: r.left, y: r.top } : null;
              }, selector)
            : { x: 0, y: 0 };
        if (!origin) return failed(`no element matches ${selector}`);
        const shift = <B extends Box>(b: B): B => ({ ...b, x: b.x - origin.x, y: b.y - origin.y });
        const blocks = (await page.evaluate(measureText)).map(shift);
        const comps = (await page.evaluate(measureComps, DOM_TYPES)).map(shift);
        return { version: 1, result: 'scored', ...scoreVisual(design, { blocks, comps }), errors };
    } catch (e) {
        return failed(String(e));
    } finally {
        await browser.close();
    }
}
