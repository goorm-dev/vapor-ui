#!/usr/bin/env node
// Committed, not built: pnpm links a bin only when its file exists at install time, before dist/ does.
import { main } from '../dist/bin/cli.mjs';

process.exitCode = await main(process.argv.slice(2));
