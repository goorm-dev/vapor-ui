#!/usr/bin/env node
// Committed, not built: pnpm links a bin only when its file exists at install time, before dist/ does.
import '../dist/bin/cli.mjs';
