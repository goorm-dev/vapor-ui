import type { GlossaryTerm } from '@vapor-ui/docs-extractor/translation';
import { globSync } from 'glob';
import meow from 'meow';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { billingSource, createClaudeTranslator } from './claude';
import { readGuide } from './guide';
import { translatePage } from './page';

const here = path.dirname(fileURLToPath(import.meta.url));

// ponytail: fixed pool of 4 pages at a time; raise it if rate limits allow.
const CONCURRENCY = 4;

async function runCli(): Promise<number> {
    const cli = meow(
        `
  Usage
    $ docs-translator --pages <dir>

  Translates every missing translation under <pages>/<page>/api/en/ into
  <page>/api/ko/ and updates <page>/api/ko.lock.json, one Claude call per page.

  Options
    --pages      Directory holding one folder per page (<page>/api/en/)
    --guide      Translation guide (default: guide.md next to this package)
    --glossary   Glossary (default: glossary.json next to this package)
`,
        {
            importMeta: import.meta,
            flags: {
                pages: { type: 'string', isRequired: true },
                guide: { type: 'string', default: path.join(here, '..', 'guide.md') },
                glossary: { type: 'string', default: path.join(here, '..', 'glossary.json') },
            },
        },
    );

    const guide = readGuide(cli.flags.guide);
    const glossary: GlossaryTerm[] = JSON.parse(fs.readFileSync(cli.flags.glossary, 'utf8'));
    const apiDirs = globSync('*/api', { cwd: path.resolve(cli.flags.pages), absolute: true })
        .filter((dir) => fs.existsSync(path.join(dir, 'en')))
        .sort();

    console.error(
        `Model ${guide.model}, guide version ${guide.version}, ${glossary.length} glossary terms`,
    );
    console.error(`Billing: ${billingSource(process.env)}`);

    let cost = 0;
    const translate = createClaudeTranslator(guide, (usd) => (cost += usd));
    const written: string[] = [];
    const failures: string[] = [];
    let translated = 0;
    let pagesTranslated = 0;

    const queue = [...apiDirs];
    const worker = async () => {
        for (let dir = queue.shift(); dir; dir = queue.shift()) {
            const page = path.relative(path.resolve(cli.flags.pages), path.dirname(dir));
            try {
                const result = await translatePage(dir, guide, glossary, translate);
                written.push(...result.written);
                translated += result.translated;
                if (result.translated > 0) pagesTranslated += 1;
                if (result.translated > 0)
                    console.error(`${page}: ${result.translated} translated`);
            } catch (error) {
                failures.push(page);
                console.error(`${page}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    // Match the extractor's formatting so CI's regenerate-and-diff check stays clean.
    if (written.length > 0)
        execFileSync('npx', ['prettier', '--write', ...written], { stdio: 'ignore' });

    console.error(
        `Translated ${translated} texts in ${pagesTranslated} pages, $${cost.toFixed(2)} reported cost.`,
    );
    if (failures.length > 0) console.error(`Failed pages (rerun to retry): ${failures.join(', ')}`);
    return failures.length > 0 ? 1 : 0;
}

runCli().then(
    (code) => process.exit(code),
    (error) => {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    },
);
