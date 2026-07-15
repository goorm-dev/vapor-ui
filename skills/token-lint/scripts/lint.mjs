#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadCanonical } from './extract-tokens.mjs';

export const TARGET_EXTS = new Set([
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
]);
export const SKIP_DIRS = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    '.turbo',
    'coverage',
    '.venv',
    '__pycache__',
    '.cache',
    'out',
]);

export const VAR_RE = /var\(\s*(--vapor-[A-Za-z0-9_-]*?[A-Za-z0-9])\s*[,)]/g;

export const VAPOR_PREFIX = '--vapor-';
export const MAX_PER_SEGMENT_DISTANCE = 1;
export const MAX_TOTAL_DISTANCE = 2;
export const TOP_K = 3;

export function damerauLevenshtein(a, b, cutoff = MAX_TOTAL_DISTANCE) {
    if (Math.abs(a.length - b.length) > cutoff) return cutoff + 1;
    if (a === b) return 0;
    const la = a.length;
    const lb = b.length;
    if (la === 0) return lb;
    if (lb === 0) return la;
    let prev2 = new Array(lb + 1).fill(0);
    let prev = Array.from({ length: lb + 1 }, (_, i) => i);
    for (let i = 1; i <= la; i++) {
        const curr = new Array(lb + 1);
        curr[0] = i;
        let rowMin = curr[0];
        for (let j = 1; j <= lb; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                curr[j] = Math.min(curr[j], prev2[j - 2] + 1);
            }
            if (curr[j] < rowMin) rowMin = curr[j];
        }
        if (rowMin > cutoff) return cutoff + 1;
        prev2 = prev;
        prev = curr;
    }
    return prev[lb];
}

export function segmentDistance(name, cand) {
    if (!name.startsWith(VAPOR_PREFIX) || !cand.startsWith(VAPOR_PREFIX)) {
        return MAX_TOTAL_DISTANCE + 1;
    }
    const aSegs = name.slice(VAPOR_PREFIX.length).split('-');
    const bSegs = cand.slice(VAPOR_PREFIX.length).split('-');
    if (aSegs.length !== bSegs.length) return MAX_TOTAL_DISTANCE + 1;
    let total = 0;
    for (let k = 0; k < aSegs.length; k++) {
        const d = damerauLevenshtein(aSegs[k], bSegs[k], MAX_PER_SEGMENT_DISTANCE);
        if (d > MAX_PER_SEGMENT_DISTANCE) return MAX_TOTAL_DISTANCE + 1;
        total += d;
        if (total > MAX_TOTAL_DISTANCE) return MAX_TOTAL_DISTANCE + 1;
    }
    return total;
}

export function suggest(name, canonicalList) {
    const scored = [];
    for (const cand of canonicalList) {
        const d = segmentDistance(name, cand);
        if (d <= MAX_TOTAL_DISTANCE) scored.push([cand, d]);
    }
    scored.sort((x, y) => x[1] - y[1] || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
    return scored.slice(0, TOP_K);
}

function extname(p) {
    const i = p.lastIndexOf('.');
    const slash = p.lastIndexOf(sep);
    return i > slash ? p.slice(i) : '';
}

export async function* iterTargetFiles(rootPath, rootStat) {
    if (rootStat.isFile()) {
        if (TARGET_EXTS.has(extname(rootPath))) yield rootPath;
        return;
    }
    async function* walkDir(dir) {
        let entries;
        try {
            entries = await readdir(dir, { withFileTypes: true });
        } catch {
            return;
        }
        entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
        for (const ent of entries) {
            const full = join(dir, ent.name);
            if (ent.isDirectory()) {
                if (SKIP_DIRS.has(ent.name)) continue;
                yield* walkDir(full);
            } else if (ent.isFile()) {
                if (!TARGET_EXTS.has(extname(ent.name))) continue;
                yield full;
            }
        }
    }
    yield* walkDir(rootPath);
}

export function scanText(text, canonical) {
    const lineStarts = [0];
    for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) === 10) lineStarts.push(i + 1);
    }
    const findings = [];
    VAR_RE.lastIndex = 0;
    let m;
    while ((m = VAR_RE.exec(text)) !== null) {
        const name = m[1];
        if (canonical.has(name)) continue;
        const offset = m.index;
        let lo = 0;
        let hi = lineStarts.length;
        while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            if (lineStarts[mid] <= offset) lo = mid + 1;
            else hi = mid;
        }
        findings.push([lo, name]);
    }
    return findings;
}

async function scanFile(filePath, canonical) {
    let text;
    try {
        text = await readFile(filePath, 'utf8');
    } catch {
        return [];
    }
    return scanText(text, canonical);
}

function formatDistanceHint(dist) {
    if (dist === 1) return '1글자 차이 — 오타 가능성 높음';
    return `${dist}글자 차이`;
}

export function renderReportBlocks(cases) {
    const lines = [];
    cases.forEach(([location, name, cands], idx) => {
        if (idx > 0) lines.push('');
        lines.push(`[${idx + 1}] ${location}`);
        lines.push(`    토큰: ${name}`);
        if (cands.length === 0) {
            lines.push('    추천: 이름이 비슷한 토큰 없음');
            lines.push('          - Figma 파일에서 토큰 이름을 다시 확인하세요.');
            return;
        }
        lines.push('    추천:');
        cands.forEach(([cand, dist], i) => {
            lines.push(`      ${i + 1}. ${cand}   ${formatDistanceHint(dist)}`);
        });
    });
    return lines.join('\n');
}

async function main(argv) {
    if (argv.length < 3) {
        console.error('usage: lint.mjs <path>');
        return 2;
    }
    const target = resolve(argv[2]);
    let targetStat;
    try {
        targetStat = await stat(target);
    } catch {
        console.error(`error: path not found: ${target}`);
        return 2;
    }

    const here = dirname(fileURLToPath(import.meta.url));
    const assetsDir = resolve(here, '..', 'assets');
    const canonical = await loadCanonical(assetsDir);
    if (canonical.size === 0) {
        console.error(`error: no tokens extracted from ${assetsDir}`);
        return 2;
    }
    const canonicalList = [...canonical].sort();

    let totalFiles = 0;
    const suggestCache = new Map();
    const cases = [];

    for await (const fp of iterTargetFiles(target, targetStat)) {
        totalFiles += 1;
        const findings = await scanFile(fp, canonical);
        if (findings.length === 0) continue;
        const rel = targetStat.isDirectory() ? relative(target, fp) : fp.split(sep).pop();
        for (const [lineNo, name] of findings) {
            if (!suggestCache.has(name)) {
                suggestCache.set(name, suggest(name, canonicalList));
            }
            cases.push([`${rel}:${lineNo}`, name, suggestCache.get(name)]);
        }
    }

    if (cases.length === 0) {
        console.log(
            `검사 완료: ${totalFiles}개 파일에서 등록되지 않은 --vapor- 토큰을 찾지 못했습니다.`,
        );
        return 0;
    }

    console.log(renderReportBlocks(cases));
    console.log();
    console.log(
        `요약: ${totalFiles}개 파일에서 등록되지 않은 --vapor- 토큰 ${cases.length}건 발견`,
    );
    return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main(process.argv).then(
        (code) => process.exit(code),
        (err) => {
            console.error(`error: ${err.message}`);
            process.exit(2);
        },
    );
}
