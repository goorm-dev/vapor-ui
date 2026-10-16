import meow from 'meow';

import { INPUT_FLAGS, loadInputs, pageName } from './inputs';
import { isUpToDate, planPage } from './page';

// CI entry point. Imports nothing that talks to Claude: it only compares en/
// with ko.lock.json under the current guide version and glossary.

const cli = meow(
    `
  Usage
    $ docs-translator-check --pages <dir>

  Fails when any <page>/api/ has a missing translation or a ko.lock.json that
  pnpm docs:translate would rewrite, and prints what to fix.
`,
    { importMeta: import.meta, flags: INPUT_FLAGS },
);

const inputs = loadInputs(cli.flags);
const { guide, glossary } = inputs;

let stale = 0;
for (const apiDir of inputs.apiDirs) {
    const plan = planPage(apiDir, guide, glossary);
    if (isUpToDate(plan)) continue;

    stale += 1;
    const page = pageName(inputs, apiDir);
    for (const { id } of plan.items) console.error(`missing  ${page}/${id}`);
    for (const id of plan.orphans) console.error(`orphan   ${page}/${id}`);
    if (plan.items.length + plan.orphans.length === 0)
        console.error(`lock     ${page} (out of order or hand-edited)`);
}

if (stale > 0) {
    console.error(
        `\n${stale} pages have missing translations or a stale ko.lock.json (guide version ${guide.version}).` +
            '\nRun `pnpm docs:translate` locally and commit the result.',
    );
    process.exit(1);
}
console.error(`All translations are up to date (guide version ${guide.version}).`);
