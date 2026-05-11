import { existsSync } from 'node:fs';
import path from 'node:path';

import { CliError, run } from '~/cli/run';

const envPath = path.resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
}

async function main(): Promise<void> {
    await run(process.argv.slice(2));
}

function handleCliError(error: unknown): never {
    const prefix = error instanceof CliError ? 'Error' : 'Unexpected error';
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${prefix}: ${message}`);
    process.exit(1);
}

main().catch(handleCliError);
