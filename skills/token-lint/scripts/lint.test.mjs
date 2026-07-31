import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { extractFromFile, loadCanonical } from './extract-tokens.mjs';
import {
    VAR_RE,
    damerauLevenshtein,
    iterTargetFiles,
    renderReportBlocks,
    scanText,
    segmentDistance,
    suggest,
} from './lint.mjs';

test('damerauLevenshtein: identical → 0', () => {
    assert.equal(damerauLevenshtein('abc', 'abc'), 0);
});

test('damerauLevenshtein: single substitution → 1', () => {
    assert.equal(damerauLevenshtein('color', 'coler'), 1);
});

test('damerauLevenshtein: adjacent transposition → 1', () => {
    assert.equal(damerauLevenshtein('foregruond', 'foreground'), 1);
    assert.equal(damerauLevenshtein('ab', 'ba'), 1);
});

test('damerauLevenshtein: length diff over cutoff → cutoff+1', () => {
    assert.equal(damerauLevenshtein('a', 'abcd', 2), 3);
});

test('damerauLevenshtein: early exit via cutoff', () => {
    assert.equal(damerauLevenshtein('abcdef', 'uvwxyz', 2), 3);
});

test('segmentDistance: missing vapor prefix → too far', () => {
    assert.equal(segmentDistance('--foo-bar', '--vapor-color-red-100'), 3);
});

test('segmentDistance: different segment counts → too far', () => {
    assert.equal(segmentDistance('--vapor-color-red', '--vapor-color-red-100'), 3);
});

test('segmentDistance: single-segment typo', () => {
    assert.equal(segmentDistance('--vapor-color-red-10O', '--vapor-color-red-100'), 1);
});

test('segmentDistance: per-segment cap blocks 2-edit segment', () => {
    assert.equal(segmentDistance('--vapor-color-zzz-100', '--vapor-color-red-100'), 3);
});

test('suggest: returns top-K within distance 2 sorted by distance then name', () => {
    const canonical = [
        '--vapor-color-red-100',
        '--vapor-color-red-200',
        '--vapor-color-pink-100',
        '--vapor-color-grape-100',
    ];
    const out = suggest('--vapor-color-red-10O', canonical);
    assert.deepEqual(out, [['--vapor-color-red-100', 1]]);
});

test('suggest: empty when nothing within distance', () => {
    const out = suggest('--vapor-zzzzz-zzzzz-zzz', ['--vapor-color-red-100']);
    assert.deepEqual(out, []);
});

test('VAR_RE: matches single-line var()', () => {
    VAR_RE.lastIndex = 0;
    const m = VAR_RE.exec('color: var(--vapor-color-red-500);');
    assert.equal(m[1], '--vapor-color-red-500');
});

test('VAR_RE: matches multi-line var()', () => {
    VAR_RE.lastIndex = 0;
    const m = VAR_RE.exec('var(\n  --vapor-color-red-500\n)');
    assert.equal(m[1], '--vapor-color-red-500');
});

test('VAR_RE: matches var() with fallback comma', () => {
    VAR_RE.lastIndex = 0;
    const m = VAR_RE.exec('var(--vapor-color-red-500, red)');
    assert.equal(m[1], '--vapor-color-red-500');
});

test('VAR_RE: rejects prefix-only string (no closing paren)', () => {
    VAR_RE.lastIndex = 0;
    const m = VAR_RE.exec("'var(--vapor-color-'");
    assert.equal(m, null);
});

test('VAR_RE: rejects trailing dash', () => {
    VAR_RE.lastIndex = 0;
    const m = VAR_RE.exec('var(--vapor-color-)');
    assert.equal(m, null);
});

test('scanText: reports unknown var with correct line number', () => {
    const canonical = new Set(['--vapor-color-red-100']);
    const text = [
        '/* line 1 */',
        '/* line 2 */',
        'a { color: var(--vapor-color-red-10O); }',
        'b { color: var(--vapor-color-red-100); }',
    ].join('\n');
    const found = scanText(text, canonical);
    assert.deepEqual(found, [[3, '--vapor-color-red-10O']]);
});

test('scanText: skips var refs present in canonical set', () => {
    const canonical = new Set(['--vapor-color-red-100']);
    const text = 'a { color: var(--vapor-color-red-100); }';
    assert.deepEqual(scanText(text, canonical), []);
});

test('renderReportBlocks: single case, single suggestion', () => {
    const out = renderReportBlocks([
        ['a.css:3', '--vapor-color-red-10O', [['--vapor-color-red-100', 1]]],
    ]);
    assert.equal(
        out,
        [
            '[1] a.css:3',
            '    토큰: --vapor-color-red-10O',
            '    추천:',
            '      1. --vapor-color-red-100   1글자 차이 — 오타 가능성 높음',
        ].join('\n'),
    );
});

test('renderReportBlocks: multiple suggestions list each with hint', () => {
    const out = renderReportBlocks([
        [
            'a.css:3',
            '--vapor-color-red-XYZ',
            [
                ['--vapor-color-red-100', 2],
                ['--vapor-color-red-200', 2],
                ['--vapor-color-red-300', 2],
            ],
        ],
    ]);
    const lines = out.split('\n');
    assert.equal(lines[0], '[1] a.css:3');
    assert.equal(lines[2], '    추천:');
    assert.equal(lines[3], '      1. --vapor-color-red-100   2글자 차이');
    assert.equal(lines[4], '      2. --vapor-color-red-200   2글자 차이');
    assert.equal(lines[5], '      3. --vapor-color-red-300   2글자 차이');
});

test('renderReportBlocks: no candidate fallback line', () => {
    const out = renderReportBlocks([['x.css:1', '--vapor-zzz-zzz-zzz', []]]);
    assert.match(out, /추천: 이름이 비슷한 토큰 없음/);
    assert.match(out, /Figma 파일에서 토큰 이름을 다시 확인하세요/);
});

test('renderReportBlocks: blank line between blocks', () => {
    const out = renderReportBlocks([
        ['a.css:1', '--vapor-a-b-c', []],
        ['b.css:1', '--vapor-d-e-f', []],
    ]);
    const lines = out.split('\n');
    const firstBlockStart = lines.indexOf('[1] a.css:1');
    const secondBlockStart = lines.indexOf('[2] b.css:1');
    assert.ok(firstBlockStart >= 0 && secondBlockStart > firstBlockStart);
    assert.equal(lines[secondBlockStart - 1], '');
});

async function withTempAssets(fn) {
    const dir = await mkdtemp(join(tmpdir(), 'token-lint-'));
    try {
        await fn(dir);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

test('extractFromFile: emits --vapor-<group>-<name> for token leaf', async () => {
    await withTempAssets(async (dir) => {
        const file = join(dir, 'color.json');
        await writeFile(
            file,
            JSON.stringify({
                colors: {
                    red: {
                        $type: 'color',
                        100: { $value: '#ff0000' },
                        200: { $value: '#cc0000' },
                    },
                },
            }),
        );
        const out = await extractFromFile(file);
        assert.deepEqual([...out].sort(), ['--vapor-color-red-100', '--vapor-color-red-200']);
    });
});

test('extractFromFile: applies TOP_KEY_REMAP only at depth 0', async () => {
    await withTempAssets(async (dir) => {
        const file = join(dir, 'color.json');
        await writeFile(
            file,
            JSON.stringify({
                colors: { white: { $value: '#fff' } },
            }),
        );
        const out = await extractFromFile(file);
        assert.deepEqual([...out], ['--vapor-color-white']);
    });
});

test('extractFromFile: ignores DTCG meta keys', async () => {
    await withTempAssets(async (dir) => {
        const file = join(dir, 'color.json');
        await writeFile(
            file,
            JSON.stringify({
                $schema: 'x',
                colors: {
                    $description: 'skip me',
                    red: { $value: '#f00', $description: 'skip me too' },
                },
            }),
        );
        const out = await extractFromFile(file);
        assert.deepEqual([...out], ['--vapor-color-red']);
    });
});

test('loadCanonical: skips resolver.json', async () => {
    await withTempAssets(async (dir) => {
        await writeFile(
            join(dir, 'color.json'),
            JSON.stringify({ colors: { red: { $value: '#f00' } } }),
        );
        await writeFile(
            join(dir, 'resolver.json'),
            JSON.stringify({ colors: { ignored: { $value: '#000' } } }),
        );
        const out = await loadCanonical(dir);
        assert.deepEqual([...out], ['--vapor-color-red']);
    });
});

test('loadCanonical: merges multiple files', async () => {
    await withTempAssets(async (dir) => {
        await writeFile(
            join(dir, 'a.json'),
            JSON.stringify({ size: { space: { 100: { $value: '8px' } } } }),
        );
        await writeFile(
            join(dir, 'b.json'),
            JSON.stringify({
                typography: { fontWeight: { 400: { $value: 400 } } },
            }),
        );
        const out = await loadCanonical(dir);
        assert.deepEqual([...out].sort(), [
            '--vapor-size-space-100',
            '--vapor-typography-fontWeight-400',
        ]);
    });
});

async function withTempDir(fn) {
    const dir = await mkdtemp(join(tmpdir(), 'token-lint-walk-'));
    try {
        await fn(dir);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

test('iterTargetFiles: yields entries in deterministic alphabetical order', async () => {
    await withTempDir(async (dir) => {
        for (const name of ['c.css', 'a.css', 'b.css', 'z.css', 'm.css']) {
            await writeFile(join(dir, name), '');
        }
        await mkdir(join(dir, 'sub'));
        await writeFile(join(dir, 'sub', 'y.css'), '');
        await writeFile(join(dir, 'sub', 'x.css'), '');
        const rootStat = await stat(dir);
        const out = [];
        for await (const fp of iterTargetFiles(dir, rootStat)) {
            out.push(fp.slice(dir.length + 1));
        }
        assert.deepEqual(out, [
            'a.css',
            'b.css',
            'c.css',
            'm.css',
            join('sub', 'x.css'),
            join('sub', 'y.css'),
            'z.css',
        ]);
    });
});

test('iterTargetFiles: unreadable subdir is skipped, walk continues', async (t) => {
    if (process.platform === 'win32' || process.getuid?.() === 0) {
        t.skip('chmod-based unreadable subdir test requires non-root POSIX');
        return;
    }
    await withTempDir(async (dir) => {
        await writeFile(join(dir, 'a.css'), '');
        await mkdir(join(dir, 'locked'));
        await writeFile(join(dir, 'locked', 'inside.css'), '');
        await writeFile(join(dir, 'z.css'), '');
        await chmod(join(dir, 'locked'), 0o000);
        try {
            const rootStat = await stat(dir);
            const out = [];
            for await (const fp of iterTargetFiles(dir, rootStat)) {
                out.push(fp.slice(dir.length + 1));
            }
            assert.deepEqual(out, ['a.css', 'z.css']);
        } finally {
            await chmod(join(dir, 'locked'), 0o755);
        }
    });
});
