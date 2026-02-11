import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { CONFIG } from '../constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getRepoRoot(): string {
    try {
        return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
    } catch {
        return path.resolve(__dirname, '..', '..', '..', '..');
    }
}

export function getChangedFiles(): string[] {
    try {
        const changedFiles: string[] = [];
        const repoRoot = getRepoRoot();

        // 1. Changed tracked files
        try {
            const diff = execSync(
                `git diff --name-only origin/main -- "apps/website/public/components/generated/en/*.json"`,
                { encoding: 'utf-8', cwd: repoRoot },
            );
            const diffFiles = diff
                .split('\n')
                .filter((f) => f.endsWith('.json'))
                .map((f) => path.basename(f));
            changedFiles.push(...diffFiles);
        } catch {
            // Ignore
        }

        // 2. New untracked files
        try {
            const status = execSync(
                `git status --porcelain "apps/website/public/components/generated/en/"`,
                { encoding: 'utf-8', cwd: repoRoot },
            );
            const untrackedFiles = status
                .split('\n')
                .filter(
                    (line) =>
                        line.startsWith('??') || line.startsWith(' A') || line.startsWith('A '),
                )
                .map((line) => line.replace(/^[? A]+/, '').trim())
                .filter((f) => f.endsWith('.json'))
                .map((f) => path.basename(f));
            changedFiles.push(...untrackedFiles);
        } catch {
            // Ignore
        }

        // 3. Missing translations (files in en/ but not in ko/)
        const sourceDir = path.resolve(__dirname, '..', CONFIG.sourceDir);
        const targetDir = path.resolve(__dirname, '..', CONFIG.targetDir);

        if (fs.existsSync(sourceDir)) {
            const sourceFiles = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.json'));
            for (const file of sourceFiles) {
                const targetPath = path.join(targetDir, file);
                if (!fs.existsSync(targetPath) && !changedFiles.includes(file)) {
                    changedFiles.push(file);
                }
            }
        }

        // Remove duplicates
        return [...new Set(changedFiles)];
    } catch {
        console.log('No changes detected or git commands failed');
        return [];
    }
}

export function getAllFiles(): string[] {
    const sourceDir = path.resolve(__dirname, '..', CONFIG.sourceDir);
    if (!fs.existsSync(sourceDir)) {
        console.error(`Source directory not found: ${sourceDir}`);
        return [];
    }

    return fs.readdirSync(sourceDir).filter((f) => f.endsWith('.json'));
}
