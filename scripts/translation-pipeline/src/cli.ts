import { existsSync } from 'node:fs';
import path from 'node:path';

import { run } from '~/run';
import { errorMessage } from '~/util';

const envPath = path.resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
}

function handleCliError(error: unknown): never {
    console.error(`Error: ${errorMessage(error)}`);
    process.exit(1);
}

run(process.argv.slice(2)).catch(handleCliError);
