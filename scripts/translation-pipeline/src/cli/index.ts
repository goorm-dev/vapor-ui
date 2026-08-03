import { existsSync } from 'node:fs';
import path from 'node:path';

import { run } from '~/cli/run';

const envPath = path.resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
}

async function main(): Promise<void> {
    await run(process.argv.slice(2));
}

function handleCliError(error: unknown): never {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
}

main().catch(handleCliError);
