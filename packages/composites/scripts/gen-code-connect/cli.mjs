#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import prettier from 'prettier';

import { fromMcp } from './adapters/mcp.mjs';
import { collectComponentSetIds, fromRest } from './adapters/rest.mjs';
import { extract } from './extract.mjs';
import { parseFigmaUrl } from './figma-url.mjs';
import { toKebab, toPascal } from './naming.mjs';
import { render } from './render.mjs';

const USAGE = `Usage: node scripts/gen-code-connect/cli.mjs <figma-url> [--force] [--from-json <path>] [--out <path>]

  <figma-url>        Figma design URL with node-id (component or component set)
  --from-json <p>    Use a saved get_context_for_code_connect JSON instead of the REST API
  --out <p>          Output path (default: src/components/<kebab>/<kebab>.figma.ts)
  --force            Overwrite an existing output file

Env: FIGMA_TOKEN (required unless --from-json)`;

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function main(argv) {
    const { values, positionals } = parseArgs({
        args: argv,
        allowPositionals: true,
        options: {
            force: { type: 'boolean', default: false },
            'from-json': { type: 'string' },
            out: { type: 'string' },
            help: { type: 'boolean', short: 'h', default: false },
        },
    });

    if (values.help || positionals.length !== 1) {
        console.log(USAGE);
        return values.help ? 0 : 1;
    }

    const url = positionals[0];
    const { fileKey, nodeId } = parseFigmaUrl(url);

    const { name, tree } = values['from-json']
        ? fromMcp(JSON.parse(readFileSync(path.resolve(values['from-json']), 'utf8')))
        : await loadFromRest(fileKey, nodeId);

    const componentName = toPascal(name);
    const kebab = toKebab(name);
    const componentDir = path.join(PKG_ROOT, 'src/components', kebab);
    const outPath = values.out
        ? path.resolve(values.out)
        : path.join(componentDir, `${kebab}.figma.ts`);

    if (existsSync(outPath) && !values.force) {
        console.error(`Refusing to overwrite ${path.relative(PKG_ROOT, outPath)} (use --force)`);
        return 1;
    }

    const blocks = extract(tree, { warn: (m) => console.warn(`warn: ${m}`) });
    if (blocks.length === 0) {
        console.error('No parenthesized instances found; nothing to generate');
        return 1;
    }

    const raw = render({
        blocks,
        url,
        componentName,
        kebab,
        hasParts: existsSync(path.join(componentDir, 'index.parts.ts')),
    });

    // 프로젝트 Prettier 설정을 쓴다. --out 이 패키지 밖이어도 동일 포맷.
    const prettierConfig =
        (await prettier.resolveConfig(path.join(PKG_ROOT, 'package.json'))) ?? {};
    const formatted = await prettier.format(raw, { ...prettierConfig, filepath: outPath });

    writeFileSync(outPath, formatted, 'utf8');
    console.log(`Wrote ${path.relative(process.cwd(), outPath)} (${blocks.length} blocks)`);
    return 0;
}

async function loadFromRest(fileKey, nodeId) {
    const token = process.env.FIGMA_TOKEN;
    if (!token) throw new Error('FIGMA_TOKEN is not set (or pass --from-json)');

    const getNodes = async (ids, depth) => {
        const params = new URLSearchParams({ ids: ids.join(',') });
        if (depth) params.set('depth', String(depth));
        const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?${params}`, {
            headers: { 'X-FIGMA-TOKEN': token },
        });
        if (!res.ok) {
            throw new Error(`Figma API ${res.status} ${res.statusText} for ids=${ids.join(',')}`);
        }
        return res.json();
    };

    const nodesJson = await getNodes([nodeId]);
    const setIds = collectComponentSetIds(nodesJson, nodeId);

    /** @type {Record<string, object>} */
    const setDocs = {};
    if (setIds.length > 0) {
        const setsJson = await getNodes(setIds, 1);
        for (const id of setIds) {
            const doc = setsJson.nodes?.[id]?.document;
            if (doc) setDocs[id] = doc;
        }
    }

    return fromRest(nodesJson, nodeId, setDocs);
}

main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err) => {
        console.error(`error: ${err.message}`);
        process.exit(1);
    },
);
