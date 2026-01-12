import { createPathsMatcher, getTsconfig } from 'get-tsconfig';
import { glob } from 'glob';
import fs from 'node:fs';
import path from 'node:path';

export const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

/**
 * Checks if a file exists and is a regular file.
 */
export const isFile = (filePath: string) =>
    fs.existsSync(filePath) && fs.statSync(filePath).isFile();

/**
 * Finds files recursively in a directory.
 */
export async function findFilesFromDirectory(dirPath: string) {
    return glob('**/*.{ts,tsx,js,jsx}', {
        cwd: dirPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        absolute: true,
    });
}

/**
 * Finds files matching a glob pattern.
 */
export async function findFilesFromGlob(cwd: string, pattern: string) {
    return glob(pattern, {
        cwd: cwd,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        absolute: true,
        nodir: true,
    });
}

/**
 * Resolves input targets (files, directories, patterns) to a list of files.
 */
export async function resolveTargetFiles(cwd: string, target: string) {
    const resolvedPath = path.resolve(cwd, target);

    // 1. Path Exists
    if (fs.existsSync(resolvedPath)) {
        const stat = fs.statSync(resolvedPath);

        if (stat.isDirectory()) return findFilesFromDirectory(resolvedPath);
        if (stat.isFile()) return [resolvedPath];
    }

    // 2. Glob Pattern
    const files = await findFilesFromGlob(cwd, target);
    if (files.length === 0) {
        console.warn(`[Warning] No files found for target: ${target}`);
    }

    return files;
}

/**
 * Initializes the analysis queue with all files found from the initial targets.
 */
export async function expandTargetFiles(cwd: string, targets: string[]) {
    const results = await Promise.all(targets.map((target) => resolveTargetFiles(cwd, target)));
    const allFiles = results.flat();

    return [...new Set(allFiles)];
}

export type PathsMatcher = (importPath: string) => string[];

/**
 * Checks if the file lacks an extension or has a supported extension.
 */
export const isSupportedExtension = (filePath: string) =>
    FILE_EXTENSIONS.includes(path.extname(filePath));

/**
 * Attempts to find a file by appending supported extensions to the base path.
 */
export function findFileWithExtensions(basePath: string) {
    for (const ext of FILE_EXTENSIONS) {
        const candidate = basePath + ext;
        if (isFile(candidate)) return candidate;
    }

    return null;
}

/**
 * Probes for a file at a given path, checking for exact match, extensions, or index files.
 */
export function probeExtensions(filePath: string) {
    if (isFile(filePath) && isSupportedExtension(filePath)) return filePath;

    const fileWithExt = findFileWithExtensions(filePath);
    if (fileWithExt) return fileWithExt;

    const indexFile = findFileWithExtensions(path.join(filePath, 'index'));
    if (indexFile) return indexFile;

    return null;
}

/**
 * Resolves a relative import path to an absolute file path.
 */
function resolveRelativePath(baseDir: string, importPath: string) {
    if (!importPath.startsWith('.')) return null;
    return probeExtensions(path.resolve(baseDir, importPath));
}

/**
 * Resolves an aliased import path (e.g., '@utils/foo') using tsconfig paths.
 */
function resolveAliasPath(importPath: string, matcher: PathsMatcher | null) {
    if (!matcher) return null;

    const candidates = matcher(importPath);

    for (const candidate of candidates) {
        const result = probeExtensions(candidate);
        if (result) return result;
    }

    return null;
}

/**
 * Resolves a module import to an absolute file path, handling both relative and aliased paths.
 */
export function resolveImportPath(
    baseDir: string,
    importPath: string,
    matcher: PathsMatcher | null,
) {
    return resolveRelativePath(baseDir, importPath) || resolveAliasPath(importPath, matcher);
}

/**
 * Loads tsconfig.json and creates a path matcher for alias resolution.
 * Attempts to find the closest tsconfig relative to the target files.
 */
export function getTsconfigPathsMatcher() {
    const tsconfigResult = getTsconfig();

    if (!tsconfigResult) {
        console.log('No tsconfig.json found. Alias resolution will be disabled.');
        return null;
    }

    return createPathsMatcher(tsconfigResult);
}

export function createAnalysisCache<K extends string, V>() {
    const cache = new Map<K, V>();

    return {
        get: (file: K): V | undefined => {
            return cache.get(file) as V;
        },
        set: (file: K, result: V) => {
            cache.set(file, result);
        },
        update: (file: K, updater: (prev: V | undefined) => V) => {
            const prev = cache.get(file);
            const updated = updater(prev);
            cache.set(file, updated);
        },
    };
}
