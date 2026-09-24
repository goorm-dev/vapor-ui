#!/usr/bin/env node
/**
 * CLI:
 *   node .claude/skills/extract-vapor-docs/scripts/extract.mjs <pageUrl> [slug] [--alias name=value]...
 *
 * `<pageUrl>` must point at a Figma page (CANVAS) — usually obtained by right-clicking a
 * page in the Figma sidebar and choosing "Copy link". If it points at a frame instead,
 * the script errors out with the parent page's URL to try again with.
 *
 * The script auto-discovers four direct children of that page by exact name:
 *   "Overview", "Best practices", "Examples", "Related components"
 * (whitespace / casing must match). Any missing name is reported.
 *
 * `[slug]` defaults to the page's own name in kebab-case. Output goes to
 * `apps/website/public/composites/<slug>/{overview,best-practices,examples,related}.json`.
 *
 * `--alias name=value` (repeatable) rewrites the walker's group name — e.g.
 *   `--alias Size=Properties`
 * folds a sibling "Size" frame under the "Properties" group in the emitted JSON.
 *
 * Requires FIGMA_TOKEN in the environment. Load it from repo-root .env with
 * Node's native --env-file flag; do NOT export in shell or install dotenv:
 *   node --env-file="$(git rev-parse --show-toplevel)/.env" \
 *     .claude/skills/extract-vapor-docs/scripts/extract.mjs "<pageUrl>" [slug] [--alias ...]
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractSection } from './blocks.mjs';
import { fetchNodes, fetchPagesWithDirectChildren, parseDesignUrl } from './rest.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../../../..');
const OUTPUT_ROOT = 'apps/website/public/composites';

const SECTION_TARGETS = {
    overview: 'Overview',
    bestPractices: 'Best practices',
    examples: 'Examples',
    related: 'Related components',
};
const SECTION_FILENAMES = {
    overview: 'overview.json',
    bestPractices: 'best-practices.json',
    examples: 'examples.json',
    related: 'related.json',
};

function usage(extra) {
    if (extra) console.error(extra);
    console.error(
        'Usage: node .claude/skills/extract-vapor-docs/scripts/extract.mjs <pageUrl> [slug] [--alias name=value]...',
    );
    process.exit(1);
}

function parseArgs(argv) {
    const positional = [];
    const aliases = {};
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--alias') {
            const spec = argv[++i];
            if (!spec || !spec.includes('=')) usage(`Bad --alias arg: ${spec}`);
            const [name, value] = spec.split('=');
            aliases[name] = value;
        } else if (arg.startsWith('--alias=')) {
            const spec = arg.slice('--alias='.length);
            if (!spec.includes('=')) usage(`Bad --alias arg: ${arg}`);
            const [name, value] = spec.split('=');
            aliases[name] = value;
        } else {
            positional.push(arg);
        }
    }
    return { positional, aliases };
}

function kebabCase(s) {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

async function writeJson(filePath, data) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/**
 * Preserve previously-populated `samples[*].code` values on a re-run.
 * Matches by `sample.nodeId`; if a nodeId isn't in the existing file, the
 * incoming null stands.
 */
async function mergeExistingCodes(section, filePath) {
    let existing;
    try {
        existing = JSON.parse(await readFile(filePath, 'utf8'));
    } catch (err) {
        if (err.code === 'ENOENT') return 0;
        throw err;
    }
    const codeByNodeId = new Map();
    for (const b of existing.blocks ?? []) {
        for (const s of b.samples ?? []) {
            if (s?.nodeId && s.code != null) codeByNodeId.set(s.nodeId, s.code);
        }
    }
    let merged = 0;
    for (const b of section.blocks ?? []) {
        for (const s of b.samples ?? []) {
            if (s?.nodeId && codeByNodeId.has(s.nodeId)) {
                s.code = codeByNodeId.get(s.nodeId);
                merged++;
            }
        }
    }
    return merged;
}

async function resolvePage(fileKey, targetNodeId, token) {
    const pages = await fetchPagesWithDirectChildren(fileKey, token);
    if (!targetNodeId) {
        const named = pages.filter((p) => p.type === 'CANVAS').map((p) => `${p.id} (${p.name})`);
        usage(
            `URL missing node-id. Copy a page link (Figma sidebar → right-click → Copy link).\nAvailable pages:\n  - ${named.join('\n  - ')}`,
        );
    }

    // targetNodeId may be either a CANVAS (the page) or a FRAME inside a page.
    for (const page of pages) {
        if (page.type !== 'CANVAS') continue;
        if (page.id === targetNodeId) return page;
        const isChildFrame = (page.children ?? []).some((c) => c.id === targetNodeId);
        if (isChildFrame) {
            usage(
                `URL points at a frame inside page "${page.name}" (${page.id}), not the page itself.\n` +
                    `Copy the page link instead: Figma sidebar → right-click "${page.name}" → Copy link.`,
            );
        }
    }
    usage(`Node ${targetNodeId} does not belong to any top-level page of ${fileKey}.`);
}

function findSectionFrames(page) {
    const found = {};
    const missing = [];
    const byName = new Map();
    for (const child of page.children ?? []) {
        if (child.type !== 'FRAME') continue;
        if (!byName.has(child.name)) byName.set(child.name, child.id);
    }
    for (const [key, name] of Object.entries(SECTION_TARGETS)) {
        const id = byName.get(name);
        if (id) found[key] = id;
        else missing.push(name);
    }
    if (missing.length) {
        throw new Error(
            `Page "${page.name}" (${page.id}) is missing required top-level frames: ${missing
                .map((n) => `"${n}"`)
                .join(', ')}`,
        );
    }
    return found;
}

async function main() {
    const { positional, aliases } = parseArgs(process.argv.slice(2));
    const [pageUrl, slugArg] = positional;
    if (!pageUrl) usage();

    const token = process.env.FIGMA_TOKEN;
    if (!token) {
        console.error(
            'FIGMA_TOKEN not set. Add it to <repo-root>/.env and run with:\n' +
                '  node --env-file="$(git rev-parse --show-toplevel)/.env" \\\n' +
                '    .claude/skills/extract-vapor-docs/scripts/extract.mjs "<pageUrl>" [slug] [--alias ...]\n' +
                'Get a token at https://www.figma.com/settings (Personal access tokens, scope: File content read).',
        );
        process.exit(1);
    }

    const { fileKey, nodeId } = parseDesignUrl(pageUrl);
    const page = await resolvePage(fileKey, nodeId, token);
    const frames = findSectionFrames(page);

    const slug = slugArg ?? kebabCase(page.name);
    if (!slug) usage(`Cannot derive slug from page name "${page.name}". Pass slug as 2nd arg.`);

    console.log(`Page: "${page.name}" (${page.id}) → slug=${slug}`);
    for (const [key, id] of Object.entries(frames)) console.log(`  · ${key} = ${id}`);

    const nodes = await fetchNodes(fileKey, Object.values(frames), token);
    const outDirAbs = resolve(REPO_ROOT, OUTPUT_ROOT, slug);

    for (const key of Object.keys(SECTION_TARGETS)) {
        const id = frames[key];
        const frameNode = nodes[id];
        if (!frameNode) throw new Error(`Frame ${id} missing in Figma response`);
        const section = extractSection(slug, key, id, frameNode, aliases);
        const target = join(outDirAbs, SECTION_FILENAMES[key]);
        const merged = await mergeExistingCodes(section, target);
        await writeJson(target, section);
        console.log(
            `✓ ${key}: ${section.blocks.length} block(s), ${merged} code(s) preserved → ${target.slice(REPO_ROOT.length + 1)}`,
        );
    }
}

main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
