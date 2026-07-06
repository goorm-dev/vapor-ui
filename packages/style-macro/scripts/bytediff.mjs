#!/usr/bin/env node
/**
 * bytediff.mjs — byte-identical tree comparison gate
 *
 * Usage: node bytediff.mjs <treeA> <treeB>
 *
 * Exits 0 when both trees have identical content for every file (ignoring *.map).
 * Exits 1 on first differing file, printing path and both SHA-256 hashes.
 * Exits 2 when either root path does not exist.
 *
 * No third-party dependencies. Node >= 20 required.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Recursively collect all files under `root`, sorted lexicographically,
 * excluding *.map files.
 * @param {string} root
 * @returns {string[]} relative paths from root, sorted
 */
function collectFiles(root) {
    const results = [];

    function walk(dir) {
        const entries = readdirSync(dir, { withFileTypes: true });
        // Sort for deterministic traversal order
        entries.sort((a, b) => a.name.localeCompare(b.name));
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile() && !entry.name.endsWith('.map')) {
                results.push(relative(root, fullPath));
            }
        }
    }

    walk(root);
    return results;
}

/**
 * SHA-256 hex digest of a file's contents.
 * @param {string} filePath
 * @returns {string}
 */
function hashFile(filePath) {
    const contents = readFileSync(filePath);
    return createHash('sha256').update(contents).digest('hex');
}

/**
 * Hash an entire directory tree.
 * Returns a Map<relativePath, sha256hex>.
 * @param {string} root
 * @returns {Map<string, string>}
 */
function hashTree(root) {
    const files = collectFiles(root);
    const map = new Map();
    for (const rel of files) {
        map.set(rel, hashFile(join(root, rel)));
    }
    return map;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const [, , treeA, treeB] = process.argv;

if (!treeA || !treeB) {
    console.error('Usage: node bytediff.mjs <treeA> <treeB>');
    process.exit(2);
}

if (!existsSync(treeA)) {
    console.error(`bytediff: path does not exist: ${treeA}`);
    process.exit(2);
}

if (!existsSync(treeB)) {
    console.error(`bytediff: path does not exist: ${treeB}`);
    process.exit(2);
}

const hashesA = hashTree(treeA);
const hashesB = hashTree(treeB);

// Collect all unique relative paths from both trees
const allPaths = new Set([...hashesA.keys(), ...hashesB.keys()]);
const sortedPaths = [...allPaths].sort();

let identical = true;

for (const rel of sortedPaths) {
    const ha = hashesA.get(rel);
    const hb = hashesB.get(rel);

    if (ha !== hb) {
        identical = false;
        if (ha === undefined) {
            console.error(`DIFF  ${rel}`);
            console.error(`  treeA: <missing>`);
            console.error(`  treeB: ${hb}`);
        } else if (hb === undefined) {
            console.error(`DIFF  ${rel}`);
            console.error(`  treeA: ${ha}`);
            console.error(`  treeB: <missing>`);
        } else {
            console.error(`DIFF  ${rel}`);
            console.error(`  treeA: ${ha}`);
            console.error(`  treeB: ${hb}`);
        }
        // Exit on first differing path per the spec
        process.exit(1);
    }
}

if (identical) {
    const count = hashesA.size;
    console.log(`OK    identical trees (${count} file${count !== 1 ? 's' : ''} compared, *.map excluded)`);
    process.exit(0);
}
