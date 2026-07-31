#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PREFIX = '--vapor-';
export const DTCG_META_KEYS = new Set([
    '$type',
    '$value',
    '$description',
    '$schema',
    '$extensions',
    '$deprecated',
]);
export const TOP_KEY_REMAP = { colors: 'color' };
export const SKIP_FILES = new Set(['resolver.json']);

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

const isTokenNode = (node) => isPlainObject(node) && '$value' in node;

function walk(node, path, out) {
    if (!isPlainObject(node)) return;
    if (isTokenNode(node)) {
        if (path.length > 0) out.add(PREFIX + path.join('-'));
        return;
    }
    for (const [key, child] of Object.entries(node)) {
        if (DTCG_META_KEYS.has(key)) continue;
        const newKey = path.length === 0 ? (TOP_KEY_REMAP[key] ?? key) : key;
        walk(child, [...path, newKey], out);
    }
}

export async function extractFromFile(jsonPath) {
    const text = await readFile(jsonPath, 'utf8');
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`${jsonPath}: ${e.message}`);
    }
    const out = new Set();
    walk(data, [], out);
    return out;
}

export async function loadCanonical(assetsDir) {
    const entries = await readdir(assetsDir);
    const out = new Set();
    for (const name of entries.sort()) {
        if (!name.endsWith('.json')) continue;
        if (SKIP_FILES.has(name)) continue;
        const fileTokens = await extractFromFile(join(assetsDir, name));
        for (const t of fileTokens) out.add(t);
    }
    return out;
}

async function main(argv) {
    const here = dirname(fileURLToPath(import.meta.url));
    const assetsDir = argv[2] ? resolve(argv[2]) : resolve(here, '..', 'assets');
    const tokens = await loadCanonical(assetsDir);
    for (const name of [...tokens].sort()) console.log(name);
    return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main(process.argv).then(
        (code) => process.exit(code),
        (err) => {
            console.error(`error: ${err.message}`);
            process.exit(1);
        },
    );
}
