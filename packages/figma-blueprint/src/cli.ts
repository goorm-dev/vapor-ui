import { existsSync, readFileSync } from 'node:fs';

import { blueprint } from '~/blueprint/blueprint';
import { formatText } from '~/blueprint/output';
import { buildPackage, fromInstalled, fromRepo } from '~/catalog/catalog';
import { entriesCommand } from '~/entries';
import { fetchFrame } from '~/figma';
import type { FigmaTree } from '~/figma';
import { libraryCommand } from '~/library';

const USAGE = `usage: figma-blueprint <tree.json | figma URL> [--json] [--repo <root>]
       figma-blueprint entries [--repo <root>]
       figma-blueprint library [--repo <root>]
       figma-blueprint ship

Prints the elements the design requires, one per line with the Figma node id it came from.
Without --repo, templates and tables come from the @vapor-ui packages installed in the current directory.
Exits 2 when an instance could not be read (unscorable), so the design cannot be fully graded.
library checks the published Figma libraries of core and composites against packages/<pkg>/figma-entries.json and
figma-exceptions.json, and exits 1 when a component is unlinked without a reason, or an entry or exception is stale.
ship runs in packages/core, composites or icons and writes their figma-blueprint/ folder.
FIGMA_ACCESS_TOKEN is read from the environment or a .env file in the current directory.`;

async function loadTree(arg: string): Promise<FigmaTree> {
    if (!/^https?:\/\//.test(arg)) return JSON.parse(readFileSync(arg, 'utf8')) as FigmaTree;
    return fetchFrame(arg);
}

function parseArgs(argv: string[]) {
    const positional: string[] = [];
    let json = false;
    let repo: string | undefined;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--json') json = true;
        else if (a === '--repo') repo = argv[++i];
        else positional.push(a);
    }
    return { positional, json, repo };
}

async function run(argv: string[]) {
    if (existsSync('.env')) process.loadEnvFile();
    const { positional, json, repo } = parseArgs(argv);
    const [command] = positional;
    if (command === 'entries') return entriesCommand(repo ?? process.cwd());
    if (command === 'library') return libraryCommand(repo ?? process.cwd());
    if (command === 'ship') {
        buildPackage(process.cwd());
        return 0;
    }
    if (!command || positional.length > 1) {
        console.error(USAGE);
        return 1;
    }
    const catalog = repo ? await fromRepo(repo) : await fromInstalled(process.cwd());
    const result = blueprint(await loadTree(command), catalog);
    console.log(json ? JSON.stringify(result, null, 2) : formatText(result));
    return result.unscorable.length ? 2 : 0;
}

export async function main(argv: string[]): Promise<number> {
    try {
        return await run(argv);
    } catch (e) {
        console.error(`figma-blueprint: ${(e as Error).message}`);
        return 1;
    }
}
