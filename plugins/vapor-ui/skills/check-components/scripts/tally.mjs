#!/usr/bin/env node
// Checks a verifier report against the blueprint it judged, then counts it.
// Exit 0 pass, 1 fail, 2 unscorable, 3 refused input.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, join, resolve } from 'node:path';

const USAGE = 'usage: node tally.mjs <blueprint.json> <report.json> [--root <dir>] [--json]';
const STATUSES = ['ok', 'missing', 'props', 'position', 'unscorable'];
// Lines after `at` that may still hold the tag of a multi-line opening element.
const SPAN = 3;

function refuse(message) {
    console.error(`tally: ${message}`);
    process.exit(3);
}

function parseArgs(argv) {
    const positional = [];
    let root = process.cwd();
    let json = false;
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--json') json = true;
        else if (argv[i] === '--root') root = resolve(argv[++i] ?? refuse(USAGE));
        else positional.push(argv[i]);
    }
    if (positional.length !== 2) refuse(USAGE);
    return { blueprintPath: positional[0], reportPath: positional[1], root, json };
}

function readJson(path) {
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
        return refuse(`cannot read ${path}: ${e.message}`);
    }
}

function flatten(nodes, out = []) {
    for (const n of nodes) {
        out.push(n);
        flatten(n.children ?? [], out);
    }
    return out;
}

// A composites wrapper that renders a core element (<Dialog.Action> is a Button) stands for that element.
function presetNames(root) {
    try {
        const path = createRequire(join(root, 'noop.js')).resolve(
            '@vapor-ui/composites/figma-blueprint/tables.json',
        );
        const { presets = {} } = JSON.parse(readFileSync(path, 'utf8'));
        const byTag = new Map();
        for (const [name, { tag }] of Object.entries(presets))
            byTag.set(tag, [...(byTag.get(tag) ?? []), name]);
        return byTag;
    } catch {
        return new Map();
    }
}

const SOURCE = /\.[cm]?[jt]sx?$/;
const ID_START = /[A-Za-z_$]/;
const ID = /[\w$]/;
// Words after which `<` opens JSX and `/` opens a regex, as after an operator.
const BEFORE_EXPRESSION = new Set([
    'return',
    'yield',
    'await',
    'case',
    'default',
    'else',
    'do',
    'in',
    'of',
    'typeof',
    'void',
    'delete',
    'new',
    'throw',
    'extends',
]);
const startsExpression = (prev) =>
    prev === '' || BEFORE_EXPRESSION.has(prev) || /^[([{,;:=!&|?+\-*%~^>]$/.test(prev);

// What a source file shows as rendered, in the order it is written:
// tags  JSX opening tags, name as written ("D.Root"), with the line of the name.
// refs  dotted identifiers in code outside imports, comments, strings and JSX text, for icons passed as values.
// Comments, strings, JSX text and import declarations never yield either.
function scan(src) {
    const starts = [0];
    for (let k = 0; k < src.length; k++) if (src[k] === '\n') starts.push(k + 1);
    const lineOf = (at) => {
        let lo = 0;
        let hi = starts.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (starts[mid] <= at) lo = mid;
            else hi = mid - 1;
        }
        return lo + 1;
    };
    const tags = [];
    const refs = [];
    // Frames: code (braces counted to find its closing `}`), template, tag (attributes), children (JSX text).
    const stack = [{ kind: 'code', depth: 0 }];
    let prev = '';
    let inImport = false;
    let i = 0;
    const skipPast = (end, from) => {
        const k = src.indexOf(end, from);
        return k < 0 ? src.length : k + end.length;
    };
    const readName = (from) => {
        let k = from;
        while (
            k < src.length &&
            (ID.test(src[k]) || (src[k] === '.' && ID_START.test(src[k + 1] ?? '')))
        )
            k++;
        return k;
    };
    // `<` at i opens an element when a name or `>` follows, possibly on the next line.
    const openElement = () => {
        let k = i + 1;
        while (/\s/.test(src[k] ?? '')) k++;
        if (src[k] === '>') {
            stack.push({ kind: 'children' });
            return k + 1;
        }
        if (!ID_START.test(src[k] ?? '')) return -1;
        const end = readName(k);
        tags.push({ name: src.slice(k, end), line: lineOf(k) });
        stack.push({ kind: 'tag' });
        return end;
    };
    const closeElement = () => {
        if (stack.length > 1) stack.pop();
        prev = 'value';
    };
    while (i < src.length) {
        const f = stack.at(-1);
        const c = src[i];
        const two = src.slice(i, i + 2);
        if (f.kind === 'template') {
            if (c === '\\') i += 2;
            else if (c === '`') {
                stack.pop();
                prev = 'value';
                i++;
            } else if (two === '${') {
                stack.push({ kind: 'code', depth: 0 });
                prev = '';
                i += 2;
            } else i++;
        } else if (f.kind === 'tag') {
            if (c === '"' || c === "'") i = skipPast(c, i + 1);
            else if (two === '//') i = skipPast('\n', i);
            else if (two === '/*') i = skipPast('*/', i + 2);
            else if (c === '{') {
                stack.push({ kind: 'code', depth: 0 });
                prev = '';
                i++;
            } else if (two === '/>') {
                closeElement();
                i += 2;
            } else if (c === '>') {
                stack[stack.length - 1] = { kind: 'children' };
                i++;
            } else i++;
        } else if (f.kind === 'children') {
            if (c === '{') {
                stack.push({ kind: 'code', depth: 0 });
                prev = '';
                i++;
            } else if (c === '<' && /^<\s*\//.test(src.slice(i, i + 64))) {
                i = skipPast('>', i);
                closeElement();
            } else if (c === '<') {
                const next = openElement();
                i = next < 0 ? i + 1 : next;
            } else i++;
        } else if (/\s/.test(c)) i++;
        else if (two === '//') i = skipPast('\n', i);
        else if (two === '/*') i = skipPast('*/', i + 2);
        else if (c === '"' || c === "'") {
            let k = i + 1;
            while (k < src.length && src[k] !== c && src[k] !== '\n') k += src[k] === '\\' ? 2 : 1;
            i = k + 1;
            prev = 'value';
            inImport = false;
        } else if (c === '`') {
            stack.push({ kind: 'template' });
            i++;
        } else if (c === '/' && startsExpression(prev)) {
            let k = i + 1;
            let inClass = false;
            while (k < src.length && src[k] !== '\n' && (inClass || src[k] !== '/')) {
                if (src[k] === '\\') k++;
                else if (src[k] === '[') inClass = true;
                else if (src[k] === ']') inClass = false;
                k++;
            }
            i = k + 1;
            while (ID.test(src[i] ?? '')) i++;
            prev = 'value';
        } else if (c === '<' && startsExpression(prev)) {
            const next = openElement();
            if (next < 0) {
                prev = '<';
                i++;
            } else i = next;
        } else if (c === '{') {
            f.depth++;
            prev = '{';
            i++;
        } else if (c === '}') {
            if (f.depth === 0 && stack.length > 1) stack.pop();
            else f.depth--;
            prev = '}';
            i++;
        } else if (ID_START.test(c)) {
            const end = readName(i);
            const name = src.slice(i, end);
            const after = src.slice(end).match(/^\s*(.)/)?.[1];
            if (name === 'import' && stack.length === 1 && after !== '(' && after !== '.')
                inImport = true;
            else if (!inImport && !BEFORE_EXPRESSION.has(name))
                refs.push({ name, line: lineOf(i) });
            prev = name;
            i = end;
        } else if (/\d/.test(c)) {
            while (/[\w.]/.test(src[i] ?? '')) i++;
            prev = 'value';
        } else {
            if (c === ';') inImport = false;
            prev = c;
            i++;
        }
    }
    return { tags, refs };
}

// Per cited file, read once: its line count and what it shows. null when it cannot be read.
function readSource(path, files) {
    if (!files.has(path)) {
        try {
            const src = readFileSync(path, 'utf8');
            files.set(path, { lines: src.split('\n').length, ...scan(src) });
        } catch {
            files.set(path, null);
        }
    }
    return files.get(path);
}

function checkEvidence(node, at, root, presets, files) {
    if (!at) return 'no at';
    const m = /^(.+):(\d+)$/.exec(at);
    if (!m) return `at is not file:line`;
    const [, file, lineText] = m;
    if (!SOURCE.test(file)) return `${file} is not a JS or TS source file`;
    const source = readSource(isAbsolute(file) ? file : join(root, file), files);
    if (!source) return `${file} does not exist`;
    const line = Number(lineText);
    if (line < 1 || line > source.lines) return `${file} has ${source.lines} lines`;
    const names = new Set([node.tag, ...(presets.get(node.tag) ?? [])]);
    // An icon can be passed as a value (icon={LockIcon}); every other element must be opened as JSX.
    const shown = node.pkg === 'icons' ? [...source.tags, ...source.refs] : source.tags;
    const cited = (e) => e.line >= line && e.line < line + SPAN;
    return shown.some((e) => cited(e) && names.has(e.name))
        ? null
        : `lines ${line}-${line + SPAN - 1} open no ${[...names].map((n) => `<${n}>`).join(' or ')}`;
}

const FIELDS = { id: 'string', status: 'string', at: 'string', note: 'string', changed: 'boolean' };

function shapeProblem(v) {
    if (typeof v !== 'object' || v === null || Array.isArray(v))
        return `is ${JSON.stringify(v)}, not an object`;
    if (v.id === undefined || v.status === undefined) return 'needs id and status';
    const wrong = Object.entries(FIELDS).find(([k, t]) => v[k] !== undefined && typeof v[k] !== t);
    return wrong ? `${wrong[0]} must be a ${wrong[1]}` : null;
}

function tally(blueprint, report, root) {
    if (!Array.isArray(blueprint?.nodes)) refuse('blueprint has no nodes array');
    if (report?.version !== 1 || !Array.isArray(report.verdicts))
        refuse('report must be { version: 1, verdicts: [...] }');
    const shapes = report.verdicts
        .map((v, i) => [i, shapeProblem(v)])
        .filter(([, p]) => p)
        .map(([i, p]) => `verdicts[${i}] ${p}`);
    if (shapes.length) refuse(`report has malformed verdicts:\n  ${shapes.join('\n  ')}`);

    const nodes = flatten(blueprint.nodes);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const verdicts = new Map();
    const problems = [];
    for (const v of report.verdicts) {
        if (!byId.has(v.id)) problems.push(`unknown id ${v.id}`);
        else if (verdicts.has(v.id)) problems.push(`duplicate id ${v.id}`);
        else if (!STATUSES.includes(v.status))
            problems.push(`${v.id}: status "${v.status}" is not one of ${STATUSES.join(', ')}`);
        else if (v.status === 'position' && byId.get(v.id).anyParent)
            problems.push(`${v.id}: anyParent node cannot be judged on position`);
        else if (v.status === 'unscorable' && !v.note?.trim())
            problems.push(`${v.id}: unscorable needs a note saying what could not be read`);
        verdicts.set(v.id, v);
    }
    for (const n of nodes) if (!verdicts.has(n.id)) problems.push(`missing id ${n.id}`);
    if (problems.length) refuse(`report does not match the blueprint:\n  ${problems.join('\n  ')}`);

    const presets = presetNames(root);
    const files = new Map();
    const counts = Object.fromEntries([...STATUSES, 'evidence'].map((s) => [s, 0]));
    const failures = [];
    const evidence = [];
    for (const n of nodes) {
        const { status, at, note, changed } = verdicts.get(n.id);
        const row = {
            id: n.id,
            tag: n.tag,
            status,
            ...(at && { at }),
            ...(note && { note }),
            ...(changed && { changed: true }),
        };
        if (status !== 'ok') {
            counts[status]++;
            failures.push(row);
            continue;
        }
        const reason = checkEvidence(n, at, root, presets, files);
        if (reason) {
            counts.evidence++;
            evidence.push({ ...row, reason });
        } else counts.ok++;
    }

    const total = nodes.length;
    const scorable = total - counts.unscorable;
    const unscorable = blueprint.unscorable ?? [];
    // Nothing graded is not a pass: a design of detached instances and plain frames gives an empty tree.
    const empty = total === 0 && !unscorable.length;
    const result =
        counts.ok < scorable
            ? 'fail'
            : scorable === 0 || counts.unscorable || unscorable.length
              ? 'unscorable'
              : 'pass';
    return {
        version: 1,
        result,
        ...(empty && { reason: 'no library instances in the design' }),
        recall: scorable ? counts.ok / scorable : null,
        ok: counts.ok,
        scorable,
        total,
        counts,
        failures,
        evidence,
        unscorable,
        excluded: blueprint.excluded ?? [],
    };
}

function text(t) {
    const row = (r) =>
        `  ${r.status.padEnd(10)} ${r.tag}  ${r.id}${r.at ? `  ${r.at}` : ''}${r.changed ? ' (changed)' : ''}`;
    const out = [
        `result: ${t.result}${t.reason ? ` (${t.reason})` : ''}`,
        `recall: ${t.ok}/${t.scorable} (${t.recall === null ? 'n/a' : t.recall.toFixed(3)}), total ${t.total}`,
        Object.entries(t.counts)
            .map(([k, v]) => `${k} ${v}`)
            .join(', '),
    ];
    if (t.failures.length)
        out.push('not ok:', ...t.failures.map((r) => `${row(r)}${r.note ? `  ${r.note}` : ''}`));
    if (t.evidence.length)
        out.push(
            'evidence failures (ok verdicts whose at does not show the tag):',
            ...t.evidence.map((r) => `${row(r)}  ${r.reason}`),
        );
    if (t.unscorable.length)
        out.push(
            'blueprint unscorable:',
            ...t.unscorable.map((u) => `  ${u.name} (${u.node}): ${u.cause}`),
        );
    out.push(`excluded: ${t.excluded.length}`);
    return out.join('\n');
}

const { blueprintPath, reportPath, root, json } = parseArgs(process.argv.slice(2));
const t = tally(readJson(blueprintPath), readJson(reportPath), root);
console.log(json ? JSON.stringify(t, null, 2) : text(t));
process.exitCode = { pass: 0, fail: 1, unscorable: 2 }[t.result];
