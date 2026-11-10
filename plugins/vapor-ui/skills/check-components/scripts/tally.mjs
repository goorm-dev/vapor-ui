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

const lastName = (tag) => tag.split('.').at(-1);

// An import names every tag the file uses, so it is never evidence that one is rendered.
function withoutImports(lines) {
    let inImport = false;
    return lines.map((l) => {
        if (/^\s*import\b/.test(l)) inImport = true;
        if (!inImport) return l;
        if (/\bfrom\s*['"]|^\s*import\s*['"]|;\s*$/.test(l)) inImport = false;
        return '';
    });
}

function checkEvidence(node, at, root, presets, files) {
    if (!at) return 'no at';
    const m = /^(.+):(\d+)$/.exec(at);
    if (!m) return `at is not file:line`;
    const [, file, lineText] = m;
    const path = isAbsolute(file) ? file : join(root, file);
    if (!files.has(path)) {
        try {
            files.set(path, withoutImports(readFileSync(path, 'utf8').split('\n')));
        } catch {
            files.set(path, null);
        }
    }
    const lines = files.get(path);
    if (!lines) return `${file} does not exist`;
    const line = Number(lineText);
    if (line < 1 || line > lines.length) return `${file} has ${lines.length} lines`;
    const names = [node.tag, ...(presets.get(node.tag) ?? [])].map(lastName);
    const window = lines.slice(line - 1, line - 1 + SPAN).join('\n');
    return names.some((n) => window.includes(n))
        ? null
        : `lines ${line}-${line + SPAN - 1} do not contain ${names.map((n) => `"${n}"`).join(' or ')}`;
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
    const result =
        counts.ok < scorable
            ? 'fail'
            : counts.unscorable || blueprint.unscorable?.length
              ? 'unscorable'
              : 'pass';
    return {
        version: 1,
        result,
        recall: scorable ? counts.ok / scorable : 1,
        ok: counts.ok,
        scorable,
        total,
        counts,
        failures,
        evidence,
        unscorable: blueprint.unscorable ?? [],
        excluded: blueprint.excluded ?? [],
    };
}

function text(t) {
    const row = (r) =>
        `  ${r.status.padEnd(10)} ${r.tag}  ${r.id}${r.at ? `  ${r.at}` : ''}${r.changed ? ' (changed)' : ''}`;
    const out = [
        `result: ${t.result}`,
        `recall: ${t.ok}/${t.scorable} (${t.recall.toFixed(3)}), total ${t.total}`,
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
