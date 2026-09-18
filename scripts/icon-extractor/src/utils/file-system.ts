import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Walk up to the directory holding `pnpm-workspace.yaml`. Output paths in the config are
 * repo-relative because the tool writes into another workspace package.
 */
const findRepoRoot = (from: string): string => {
    if (existsSync(path.join(from, 'pnpm-workspace.yaml'))) return from;
    const parent = path.dirname(from);
    if (parent === from) {
        throw new Error('Could not find project root (pnpm-workspace.yaml not found)');
    }
    return findRepoRoot(parent);
};

const REPO_ROOT = findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));

export { REPO_ROOT, findRepoRoot };
