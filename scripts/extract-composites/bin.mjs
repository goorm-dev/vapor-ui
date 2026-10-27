#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cli = resolve(here, 'src/cli.ts');
const tsx = resolve(here, 'node_modules/.bin/tsx');

const child = spawn(tsx, [cli, ...process.argv.slice(2)], {
    stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 1));
