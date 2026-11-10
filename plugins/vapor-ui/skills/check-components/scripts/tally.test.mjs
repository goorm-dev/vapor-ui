import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const TALLY = join(dirname(fileURLToPath(import.meta.url)), 'tally.mjs');

const node = (id, tag, children = [], extra = {}) => ({
    id,
    tag,
    props: [],
    pkg: 'core',
    children,
    ...extra,
});

const SCREEN = [
    "import { Button, Dialog } from '@vapor-ui/core';",
    '',
    'export function Screen() {',
    '    return (',
    '        <Dialog.Popup>',
    '            <Dialog.Footer>',
    '                <Button',
    '                    size="lg"',
    '                >',
    '                    확인',
    '                </Button>',
    '            </Dialog.Footer>',
    '        </Dialog.Popup>',
    '    );',
    '}',
].join('\n');

const BLUEPRINT = {
    version: 2,
    nodes: [
        node('1:1', 'Dialog.Popup', [
            node('1:2', 'Dialog.Footer', [node('1:3', 'Button', [], { props: ['size="lg"'] })]),
        ]),
    ],
    excluded: [],
    unscorable: [],
};

const OK = [
    { id: '1:1', status: 'ok', at: 'src/screen.tsx:5' },
    { id: '1:2', status: 'ok', at: 'src/screen.tsx:6' },
    { id: '1:3', status: 'ok', at: 'src/screen.tsx:7' },
];

function run(
    blueprint,
    verdicts,
    { files = { 'src/screen.tsx': SCREEN }, json = true, report = { version: 1, verdicts } } = {},
) {
    const root = mkdtempSync(join(tmpdir(), 'tally-'));
    for (const [path, text] of Object.entries(files)) {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), text);
    }
    writeFileSync(join(root, 'blueprint.json'), JSON.stringify(blueprint));
    writeFileSync(join(root, 'report.json'), JSON.stringify(report));
    const args = [TALLY, 'blueprint.json', 'report.json', '--root', root];
    const r = spawnSync(process.execPath, json ? [...args, '--json'] : args, {
        cwd: root,
        encoding: 'utf8',
    });
    return {
        code: r.status,
        out: json && r.status !== 3 ? JSON.parse(r.stdout) : r.stdout,
        err: r.stderr,
    };
}

test('every node ok with real evidence passes', () => {
    const { code, out } = run(BLUEPRINT, OK);
    assert.equal(code, 0);
    assert.equal(out.result, 'pass');
    assert.equal(out.recall, 1);
    assert.deepEqual(out.counts, {
        ok: 3,
        missing: 0,
        props: 0,
        position: 0,
        unscorable: 0,
        evidence: 0,
    });
});

test('a missing node fails and is listed', () => {
    const { code, out } = run(BLUEPRINT, [...OK.slice(0, 2), { id: '1:3', status: 'missing' }]);
    assert.equal(code, 1);
    assert.equal(out.result, 'fail');
    assert.equal(out.recall, 2 / 3);
    assert.deepEqual(
        out.failures.map((f) => [f.id, f.tag, f.status]),
        [['1:3', 'Button', 'missing']],
    );
});

test('an ok whose line does not show the tag is an evidence failure', () => {
    const fabricated = [
        OK[0],
        { id: '1:2', status: 'ok', at: 'src/screen.tsx:1' },
        { id: '1:3', status: 'ok', at: 'src/elsewhere.tsx:7' },
    ];
    const { code, out } = run(BLUEPRINT, fabricated);
    assert.equal(code, 1);
    assert.equal(out.result, 'fail');
    assert.equal(out.counts.ok, 1);
    assert.equal(out.counts.evidence, 2);
    assert.deepEqual(
        out.evidence.map((e) => e.id),
        ['1:2', '1:3'],
    );
    assert.equal(out.failures.length, 0);
});

test('an ok citing an import is an evidence failure', () => {
    const files = {
        'src/screen.tsx': `import {\n    Dialog,\n    Button,\n} from '@vapor-ui/core';\n${SCREEN}`,
    };
    const verdicts = [
        { id: '1:1', status: 'ok', at: 'src/screen.tsx:9' },
        { id: '1:2', status: 'ok', at: 'src/screen.tsx:10' },
        { id: '1:3', status: 'ok', at: 'src/screen.tsx:2' },
    ];
    const { out } = run(BLUEPRINT, verdicts, { files });
    assert.deepEqual(
        out.evidence.map((e) => e.id),
        ['1:3'],
    );
    assert.equal(out.counts.ok, 2);
});

test('an ok past the end of the file is an evidence failure', () => {
    const { out } = run(BLUEPRINT, [
        ...OK.slice(0, 2),
        { id: '1:3', status: 'ok', at: 'src/screen.tsx:99' },
    ]);
    assert.equal(out.counts.evidence, 1);
});

test('an ok without at is an evidence failure', () => {
    const { out } = run(BLUEPRINT, [...OK.slice(0, 2), { id: '1:3', status: 'ok' }]);
    assert.equal(out.counts.evidence, 1);
});

test('a tag on a later line of a multi-line opening element counts', () => {
    const files = { 'src/screen.tsx': SCREEN.replace('<Button', '<\n                    Button') };
    const { code } = run(BLUEPRINT, OK, { files });
    assert.equal(code, 0);
});

test('a duplicated, missing or unknown id refuses with exit 3', () => {
    const dup = run(BLUEPRINT, [...OK, OK[2]]);
    assert.equal(dup.code, 3);
    assert.match(dup.err, /1:3/);
    const missing = run(BLUEPRINT, OK.slice(0, 2));
    assert.equal(missing.code, 3);
    assert.match(missing.err, /1:3/);
    const unknown = run(BLUEPRINT, [...OK, { id: '9:9', status: 'ok', at: 'src/screen.tsx:5' }]);
    assert.equal(unknown.code, 3);
    assert.match(unknown.err, /9:9/);
});

test('an unknown status refuses with exit 3', () => {
    const { code, err } = run(BLUEPRINT, [...OK.slice(0, 2), { id: '1:3', status: 'mismatch' }]);
    assert.equal(code, 3);
    assert.match(err, /mismatch/);
});

test('an unscorable instance in the blueprint makes an all-ok report unscorable', () => {
    const blueprint = {
        ...BLUEPRINT,
        unscorable: [{ node: 'I1:9', name: '💙Dialog.Body', cause: 'no-template' }],
    };
    const { code, out } = run(blueprint, OK);
    assert.equal(code, 2);
    assert.equal(out.result, 'unscorable');
    assert.equal(out.unscorable.length, 1);
});

test('a failure beats unscorable', () => {
    const blueprint = {
        ...BLUEPRINT,
        unscorable: [{ node: 'I1:9', name: '💙Dialog.Body', cause: 'no-template' }],
    };
    const { code, out } = run(blueprint, [
        ...OK.slice(0, 2),
        { id: '1:3', status: 'props', at: 'src/screen.tsx:7' },
    ]);
    assert.equal(code, 1);
    assert.equal(out.result, 'fail');
});

test('an unscorable verdict leaves the recall denominator and makes the result unscorable', () => {
    const { code, out } = run(BLUEPRINT, [
        ...OK.slice(0, 2),
        { id: '1:3', status: 'unscorable', note: 'x' },
    ]);
    assert.equal(code, 2);
    assert.equal(out.recall, 1);
    assert.equal(out.scorable, 2);
});

test('an unscorable verdict without a note refuses with exit 3', () => {
    const { code, err } = run(BLUEPRINT, [...OK.slice(0, 2), { id: '1:3', status: 'unscorable' }]);
    assert.equal(code, 3);
    assert.match(err, /1:3.*note/);
});

test('recall is not applicable when no node is scorable', () => {
    const verdicts = OK.map(({ id }) => ({ id, status: 'unscorable', note: 'generated code' }));
    const { code, out } = run(BLUEPRINT, verdicts);
    assert.equal(code, 2);
    assert.equal(out.result, 'unscorable');
    assert.equal(out.scorable, 0);
    assert.equal(out.recall, null);
    const text = run(BLUEPRINT, verdicts, { json: false });
    assert.match(text.out, /^recall: 0\/0 \(n\/a\)/m);
});

test('a verdict that is not { id, status, at?, note?, changed? } refuses with exit 3', () => {
    const bad = [
        null,
        'ok',
        { status: 'ok', at: 'src/screen.tsx:7' },
        { id: '1:3', status: 'ok', at: 7 },
        { id: '1:3', status: 'missing', note: ['x'] },
        { id: '1:3', status: 'ok', at: 'src/screen.tsx:7', changed: 'yes' },
    ];
    for (const v of bad) {
        const { code, err } = run(BLUEPRINT, [...OK.slice(0, 2), v]);
        assert.equal(code, 3, JSON.stringify(v));
        assert.doesNotMatch(err, /TypeError/);
        assert.match(err, /verdicts\[2\]/);
    }
});

test('an anyParent node cannot be judged on position', () => {
    const blueprint = {
        ...BLUEPRINT,
        nodes: [node('1:1', 'Dialog.Popup', [node('1:3', 'Button', [], { anyParent: true })])],
    };
    const ok = run(blueprint, [OK[0], OK[2]]);
    assert.equal(ok.code, 0);
    const position = run(blueprint, [
        OK[0],
        { id: '1:3', status: 'position', at: 'src/screen.tsx:7' },
    ]);
    assert.equal(position.code, 3);
    assert.match(position.err, /anyParent/);
});

test('ids nested under #n children are all required', () => {
    const blueprint = {
        ...BLUEPRINT,
        nodes: [
            node('1:1', 'Dialog.Popup', [
                node('1:1#1', 'Dialog.Footer', [node('1:3', 'Button', [node('1:3#1', 'Button')])]),
            ]),
        ],
    };
    const verdicts = [
        OK[0],
        { id: '1:1#1', status: 'ok', at: 'src/screen.tsx:6' },
        OK[2],
        { id: '1:3#1', status: 'missing' },
    ];
    assert.equal(run(blueprint, verdicts.slice(0, 3)).code, 3);
    const { code, out } = run(blueprint, verdicts);
    assert.equal(code, 1);
    assert.equal(out.total, 4);
    assert.deepEqual(
        out.failures.map((f) => f.id),
        ['1:3#1'],
    );
});

test('a composites preset wrapper is evidence for the core element it renders', () => {
    const files = {
        'src/screen.tsx':
            "import { Dialog } from '@vapor-ui/composites';\n\n<Dialog.Action>확인</Dialog.Action>\n",
        'node_modules/@vapor-ui/composites/package.json': '{"name":"@vapor-ui/composites"}',
        'node_modules/@vapor-ui/composites/figma-blueprint/tables.json': JSON.stringify({
            presets: { 'Dialog.Action': { tag: 'Button', props: { size: 'lg' } } },
        }),
    };
    const blueprint = { ...BLUEPRINT, nodes: [node('1:3', 'Button')] };
    const verdicts = [{ id: '1:3', status: 'ok', at: 'src/screen.tsx:3' }];
    assert.equal(run(blueprint, verdicts, { files }).code, 0);
    const { 'src/screen.tsx': screen } = files;
    assert.equal(run(blueprint, verdicts, { files: { 'src/screen.tsx': screen } }).code, 1);
});

test('a verdict in a changed file keeps its mark', () => {
    const verdicts = [
        ...OK.slice(0, 2),
        { id: '1:3', status: 'props', at: 'src/screen.tsx:7', changed: true },
    ];
    const { out } = run(BLUEPRINT, verdicts);
    assert.equal(out.failures[0].changed, true);
});

test('text output names the result, recall and each failure', () => {
    const { code, out } = run(BLUEPRINT, [...OK.slice(0, 2), { id: '1:3', status: 'missing' }], {
        json: false,
    });
    assert.equal(code, 1);
    assert.match(out, /^result: fail$/m);
    assert.match(out, /recall: 2\/3/);
    assert.match(out, /missing\s+Button\s+1:3/);
});
