#!/usr/bin/env node
// Visual score of a running app against a Figma frame, on text lines and component boxes measured in both.
// Block-Match and Position (Design2Code) pair the design's text lines with DOM line boxes by string, so a screen that
// renders real data instead of the design's sample text scores low. Layout IoU (Sketch2Code) compares the boxes of
// each component type. The design side is a figma-blueprint JSON; only visualScore touches a browser.
// Exit 0 scored, 2 render failed, 1 usage or setup error.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const USAGE =
    'usage: node visual.mjs <blueprint.json | figma URL> <app URL> [--selector <css>] [--storage-state <file>] [--screenshot <file>] [--json]';

const INSTALL =
    'Install it in the app with `npm i -D playwright` and `npx playwright install chromium`, or globally with `npm i -g playwright` and `playwright install chromium`.';

// Library component types with a DOM counterpart, by the vapor class prefix their element carries (button-abc12).
// TableCell is a <td>/<th> with a table-* class, Icon an <svg>.
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
];

const DOM_TYPES = Object.fromEntries(CLASS_TYPES.map(([t, p]) => [p, t]));

// A blueprint tag ("Checkbox.Root") or a Figma instance name ("💙 Table.Cell") → component type, or undefined when it
// has no DOM counterpart.
const figmaType = (name) => {
    const n = name.replace(/^[^A-Za-z]+/, '');
    if (/Icon$/.test(n)) return 'Icon';
    if (/^Table\.(Cell|Heading)$/.test(n)) return 'TableCell';
    return CLASS_TYPES.find(
        ([t]) =>
            n === t || n.startsWith(`${t}.Root`) || (t === 'Progress' && n.startsWith('Progress')),
    )?.[0];
};

// The design side, relative to the graded frame: every text line, and a box for every node at any depth, excluded and
// unscorable instance whose type has a DOM counterpart. Excluded ones count because the code still draws them (a
// Select's chevron is an <svg> in the DOM too).
export function designFromBlueprint(bp) {
    if (bp?.version !== 4)
        throw new Error(
            typeof bp?.version === 'number' && bp.version > 4
                ? `blueprint version ${bp.version} is newer than this script reads (4). Update the vapor-ui plugin.`
                : `blueprint version ${bp?.version ?? '(none)'} is not 4. Upgrade @vapor-ui/figma-blueprint.`,
        );
    if (!bp.size)
        throw new Error('the blueprint has no size: the Figma frame carries no bounds to score.');
    const comps = [];
    const add = (name, box) => {
        const type = figmaType(name);
        if (type && box) comps.push({ type, ...box });
    };
    const walk = (nodes) => {
        for (const n of nodes) {
            add(n.tag, n.box);
            walk(n.children);
        }
    };
    walk(bp.nodes);
    for (const u of [...bp.excluded, ...bp.unscorable]) add(u.name, u.box);
    return {
        width: bp.size.w,
        height: bp.size.h,
        blocks: bp.texts.map((t) => ({ text: t.text, ...t.box })),
        comps,
    };
}

// Block-Match: matched area / all area. Position: mean of 1 - max(|dx|, |dy|) over matched centers, normalized by the
// frame size. Text match: char-bigram Dice ≥ 0.5, greedy best-first, one-to-one.
function blockScores(refB, genB, W, H) {
    const norm = (s) => s.replace(/#\d+$/, '').replace(/\s+/g, '');
    const big = (s) => {
        const a = new Map();
        for (let i = 0; i < s.length - 1; i++)
            a.set(s.slice(i, i + 2), (a.get(s.slice(i, i + 2)) ?? 0) + 1);
        return a;
    };
    const dice = (a, b) => {
        if (a === b) return 1;
        const A = big(a);
        const B = big(b);
        let hit = 0;
        for (const [k, v] of A) hit += Math.min(v, B.get(k) ?? 0);
        return (2 * hit) / Math.max(1, a.length - 1 + b.length - 1);
    };
    // Wrapped DOM lines carry the whole node text; score them by containment instead.
    const sim = (r, g) => {
        const gt = norm(g.text);
        const rt = norm(r.text);
        return gt.includes(rt) && /#\d+$/.test(g.text) ? 0.9 : dice(rt, gt);
    };
    const pairs = [];
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
    const ur = new Set();
    const ug = new Set();
    const m = [];
    for (const [, i, j] of pairs)
        if (!ur.has(i) && !ug.has(j)) {
            ur.add(i);
            ug.add(j);
            m.push([i, j]);
        }
    const area = (b) => b.w * b.h;
    const total = refB.reduce((a, b) => a + area(b), 0) + genB.reduce((a, b) => a + area(b), 0);
    const hit = m.reduce((a, [i, j]) => a + area(refB[i]) + area(genB[j]), 0);
    const c = (b) => [(b.x + b.w / 2) / W, (b.y + b.h / 2) / H];
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
function layoutScore(refC, genC, width, height) {
    const S = 4;
    const W = Math.ceil(width / S);
    const H = Math.ceil(height / S);
    const mask = (boxes) => {
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
    const byType = {};
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

// layout is null when the design draws no component box. layoutByType: type → "iou (design count→rendered count)".
export function scoreVisual(design, rendered) {
    const { blockMatch, position, matched, unmatchedRef } = blockScores(
        design.blocks,
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

// Runs in the page. One block per text node line box; the blueprint splits Figma text into lines the same way. Only
// text under the selected element counts, so an app shell around the screen cannot stand in for a missing line.
function measureText(selector) {
    const root = selector ? document.querySelector(selector) : document.body;
    const out = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
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
        const st = getComputedStyle(n.parentElement);
        if (st.visibility === 'hidden' || st.opacity === '0') continue;
        // Lines of a wrapped node: rects that share a top.
        const byTop = {};
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
    for (const el of root.querySelectorAll(
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
// count. Outermost element of each type under the selected element only, except icons.
function measureComps({ classTypes, selector }) {
    const root = selector ? document.querySelector(selector) : document.body;
    const typeOf = (el) => {
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
    const out = [];
    for (const el of root.querySelectorAll('*')) {
        const t = typeOf(el);
        if (!t) continue;
        let nested = false;
        for (let p = el.parentElement; p && root.contains(p); p = p.parentElement)
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

// Opens the app the caller runs at the frame size and scores what it renders. Anything that goes wrong with the page
// is a render-failed result. Page errors are collected and the page is still scored.
export async function visualScore(
    design,
    url,
    chromium,
    { selector, storageState, timeoutMs = 30_000, screenshot } = {},
) {
    const browser = await chromium.launch().catch((e) => {
        throw new Error(`chromium did not launch: ${e.message}\n${INSTALL}`);
    });
    const failed = (error) => ({ version: 1, result: 'render-failed', error });
    try {
        const context = await browser.newContext({
            viewport: { width: Math.round(design.width), height: Math.round(design.height) },
            storageState,
        });
        context.setDefaultTimeout(timeoutMs);
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e)));
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        if (response && !response.ok())
            return failed(`${url} answered ${response.status()} ${response.statusText()}`);
        await page.waitForTimeout(500);
        // Dialogs autofocus their first control; the focus ring is not in the design.
        await page.evaluate(() => document.activeElement?.blur());
        if (screenshot) await page.screenshot({ path: screenshot });
        const origin = selector
            ? await page.evaluate((s) => {
                  const r = document.querySelector(s)?.getBoundingClientRect();
                  return r ? { x: r.left, y: r.top } : null;
              }, selector)
            : { x: 0, y: 0 };
        if (!origin) return failed(`no element matches ${selector}`);
        const shift = (b) => ({ ...b, x: b.x - origin.x, y: b.y - origin.y });
        const blocks = (await page.evaluate(measureText, selector)).map(shift);
        const comps = (await page.evaluate(measureComps, { classTypes: DOM_TYPES, selector })).map(
            shift,
        );
        return { version: 1, result: 'scored', ...scoreVisual(design, { blocks, comps }), errors };
    } catch (e) {
        return failed(String(e));
    } finally {
        await browser.close();
    }
}

class SetupError extends Error {}

function parseArgs(argv) {
    const flags = new Map();
    const positional = [];
    let json = false;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--json') json = true;
        else if (a === '--selector' || a === '--storage-state' || a === '--screenshot') {
            if (argv[i + 1] === undefined) throw new SetupError(USAGE);
            flags.set(a, argv[++i]);
        } else positional.push(a);
    }
    if (positional.length !== 2) throw new SetupError(USAGE);
    return {
        src: positional[0],
        url: positional[1],
        json,
        selector: flags.get('--selector'),
        storageState: flags.get('--storage-state'),
        screenshot: flags.get('--screenshot'),
    };
}

// A Figma URL runs the user's figma-blueprint, which exits 2 when an instance is unscorable but still prints the JSON.
function loadBlueprint(src) {
    if (!src.startsWith('http')) {
        try {
            return JSON.parse(readFileSync(src, 'utf8'));
        } catch (e) {
            throw new SetupError(`cannot read ${src}: ${e.message}`);
        }
    }
    const r = spawnSync('npx', ['--no', 'figma-blueprint', src, '--json'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
    });
    if (r.error) throw new SetupError(`npx did not run: ${r.error.message}`);
    if (r.status !== 0 && r.status !== 2)
        throw new SetupError(`figma-blueprint failed (exit ${r.status}):\n${r.stderr.trim()}`);
    try {
        return JSON.parse(r.stdout);
    } catch {
        throw new SetupError(`figma-blueprint printed no JSON:\n${r.stderr.trim()}`);
    }
}

function resolvePlaywright(dir) {
    try {
        return createRequire(join(dir, 'package.json')).resolve('playwright');
    } catch {
        return undefined;
    }
}

// From the user's project, not the plugin folder, which has no node_modules, then from npm's global root.
// pnpm, yarn and volta keep their globals elsewhere and are not looked up.
async function loadChromium() {
    const path =
        resolvePlaywright(process.cwd()) ??
        resolvePlaywright(
            spawnSync('npm', ['root', '-g'], { encoding: 'utf8' }).stdout?.trim() ?? '',
        );
    if (!path) throw new SetupError(`playwright is not installed. ${INSTALL}`);
    const pw = await import(pathToFileURL(path).href);
    return pw.chromium ?? pw.default.chromium;
}

function summary(result) {
    const out = [
        `Block-Match  ${result.blockMatch.toFixed(3)}`,
        `Position     ${result.position.toFixed(3)}`,
        `Layout IoU   ${result.layout === null ? '없음 (시안에 컴포넌트 박스가 없음)' : result.layout.toFixed(3)}`,
    ];
    const byType = Object.entries(result.layoutByType).map(([t, v]) => `${t} ${v}`);
    if (byType.length) out.push(`유형별 IoU    ${byType.join(', ')}`);
    out.push(`텍스트 매칭  ${result.matched}`);
    if (result.unmatchedRef.length)
        out.push(`매칭 안 된 시안 텍스트:\n  ${result.unmatchedRef.join('\n  ')}`);
    if (result.errors.length) out.push(`페이지 오류:\n  ${result.errors.join('\n  ')}`);
    return out.join('\n');
}

async function main(argv) {
    const { src, url, json, selector, storageState, screenshot } = parseArgs(argv);
    if (storageState && !existsSync(storageState))
        throw new SetupError(`${storageState} does not exist`);
    let design;
    try {
        design = designFromBlueprint(loadBlueprint(src));
    } catch (e) {
        throw e instanceof SetupError ? e : new SetupError(`${src}: ${e.message}`);
    }
    const chromium = await loadChromium();
    const result = await visualScore(design, url, chromium, {
        selector,
        storageState,
        screenshot,
    }).catch((e) => {
        throw new SetupError(e.message);
    });
    if (json) console.log(JSON.stringify(result, null, 2));
    else if (result.result === 'render-failed') console.error(`렌더링 실패: ${result.error}`);
    else console.log(summary(result));
    return result.result === 'scored' ? 0 : 2;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(new URL(import.meta.url)))
    process.exitCode = await main(process.argv.slice(2)).catch((e) => {
        if (!(e instanceof SetupError)) throw e;
        console.error(`visual: ${e.message}`);
        return 1;
    });
