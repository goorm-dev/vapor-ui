#!/usr/bin/env node
/**
 * Detect Vapor UI version in current codebase
 * Usage: node detect-version.mjs [start-path]
 *
 * Strategy: Find monorepo root by walking up, then run package manager CLI
 * from the start path (app folder) to get workspace-specific dependencies.
 *
 * Supports: npm, yarn (classic & berry), pnpm, bun
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

const startPath = resolve(process.argv[2] || process.cwd());

const LOCK_FILES = [
    { file: 'pnpm-lock.yaml', pm: 'pnpm' },
    { file: 'yarn.lock', pm: 'yarn' },
    { file: 'bun.lockb', pm: 'bun' },
    { file: 'bun.lock', pm: 'bun' },
    { file: 'package-lock.json', pm: 'npm' },
];

/**
 * Find monorepo root by walking up and looking for lock files
 */
function findMonorepoRoot(fromPath) {
    let currentDir = fromPath;

    while (currentDir !== dirname(currentDir)) {
        for (const { file, pm } of LOCK_FILES) {
            if (existsSync(join(currentDir, file))) {
                if (pm === 'yarn' && existsSync(join(currentDir, '.yarnrc.yml'))) {
                    return { root: currentDir, pm: 'yarn-berry' };
                }
                return { root: currentDir, pm: pm === 'yarn' ? 'yarn-classic' : pm };
            }
        }
        currentDir = dirname(currentDir);
    }

    return null;
}

/**
 * Execute command in specified directory
 */
function execInDir(command, cwd) {
    try {
        const result = execSync(command, {
            cwd,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, output: error.stdout || '', error: error.stderr || error.message };
    }
}

/**
 * Get version using npm
 */
function getVersionNpm(packageName, cwd) {
    const result = execInDir(`npm list ${packageName} --depth=0 --json`, cwd);
    if (!result.success) return null;

    try {
        const data = JSON.parse(result.output);
        return data.dependencies?.[packageName]?.version || null;
    } catch {
        return null;
    }
}

/**
 * Get version using yarn classic (v1)
 */
function getVersionYarnClassic(packageName, cwd) {
    const result = execInDir(`yarn list --pattern "${packageName}" --depth=0 --json`, cwd);
    if (!result.success) return null;

    try {
        const lines = result.output.trim().split('\n');
        for (const line of lines) {
            const data = JSON.parse(line);
            if (data.type === 'tree' && data.data?.trees) {
                for (const tree of data.data.trees) {
                    if (tree.name?.startsWith(packageName + '@')) {
                        return tree.name.split('@').pop();
                    }
                }
            }
        }
    } catch {
        return null;
    }
    return null;
}

/**
 * Get version using yarn berry (v2+)
 */
function getVersionYarnBerry(packageName, cwd) {
    const result = execInDir(`yarn info ${packageName} --json`, cwd);
    if (!result.success) return null;

    try {
        const data = JSON.parse(result.output);
        return data.children?.Version || data.version || null;
    } catch {
        return null;
    }
}

/**
 * Get version using pnpm
 */
function getVersionPnpm(packageName, cwd) {
    const result = execInDir(`pnpm ls ${packageName} --depth=0 --json`, cwd);
    if (!result.success) return null;

    try {
        const data = JSON.parse(result.output);
        const deps = data[0]?.dependencies || data[0]?.devDependencies || {};
        return deps[packageName]?.version || null;
    } catch {
        return null;
    }
}

/**
 * Get version using bun
 */
function getVersionBun(packageName, cwd) {
    const result = execInDir(`bun pm ls`, cwd);
    if (!result.success) return null;

    try {
        const regex = new RegExp(`${packageName.replace('/', '\\/')}@([\\d][^\\s]+)`);
        const match = result.output.match(regex);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

/**
 * Fallback: read from node_modules directly (recursive upward lookup)
 */
function getVersionFromNodeModules(packageName, fromPath) {
    let currentDir = fromPath;

    while (currentDir !== dirname(currentDir)) {
        const pkgPath = join(currentDir, 'node_modules', packageName, 'package.json');
        if (existsSync(pkgPath)) {
            try {
                const content = readFileSync(pkgPath, 'utf-8');
                const pkg = JSON.parse(content);
                return pkg.version;
            } catch {
                // corrupted package.json, continue searching
            }
        }
        currentDir = dirname(currentDir);
    }
    return null;
}

/**
 * Get version with package manager detection
 */
function getVersion(packageName, pm, cwd) {
    let version = null;

    switch (pm) {
        case 'npm':
            version = getVersionNpm(packageName, cwd);
            break;
        case 'yarn-classic':
            version = getVersionYarnClassic(packageName, cwd);
            break;
        case 'yarn-berry':
            version = getVersionYarnBerry(packageName, cwd);
            break;
        case 'pnpm':
            version = getVersionPnpm(packageName, cwd);
            break;
        case 'bun':
            version = getVersionBun(packageName, cwd);
            break;
    }

    if (version) {
        return { version, source: pm };
    }

    // Fallback: recursive upward lookup in node_modules
    version = getVersionFromNodeModules(packageName, cwd);
    if (version) {
        return { version, source: 'node_modules' };
    }

    return null;
}

// Main
const monorepo = findMonorepoRoot(startPath);

if (!monorepo) {
    console.error('ERROR: No lock file found');
    console.error(`Searched from: ${startPath}`);
    process.exit(1);
}

const { pm } = monorepo;
const coreResult = getVersion('@vapor-ui/core', pm, startPath);
const iconsResult = getVersion('@vapor-ui/icons', pm, startPath);

if (!coreResult && !iconsResult) {
    console.error('ERROR: No Vapor UI package found');
    console.error(`Package manager: ${pm}`);
    console.error(`Searched from: ${startPath}`);
    process.exit(1);
}

if (coreResult) {
    console.log(`CORE: ${coreResult.version}`);
}
if (iconsResult) {
    console.log(`ICONS: ${iconsResult.version}`);
}
