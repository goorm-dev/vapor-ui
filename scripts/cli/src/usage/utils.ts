import { createPathsMatcher, getTsconfig } from 'get-tsconfig';
import { glob } from 'glob';
import fs from 'node:fs';
import path from 'node:path';

import type { Spreadsheet } from '~/utils/google';
import { createSheets } from '~/utils/google';

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

// --- Spreadsheets ---

async function ensureSheet(sheet: Spreadsheet, repoName: string) {
    const sheets = await sheet.getSheets();

    if (!sheets.some((s) => s.properties?.title === repoName)) {
        console.log(`Sheet '${repoName}' not found. Creating new sheet...`);
        await sheet.addSheet(repoName);
    }
}

function updateHeader(
    currentHeader: string[],
    usageByEntry: Map<string, Map<string, number>>,
    packageName: string,
) {
    const header = currentHeader.length ? [...currentHeader] : ['Key'];
    const colMap = new Map<string, number>();

    // Index existing columns
    header.forEach((col, idx) => {
        if (idx > 0 && col) colMap.set(col, idx);
    });

    // Find new components
    const newComponents = new Set<string>();
    for (const usage of usageByEntry.values()) {
        for (const component of usage.keys()) {
            const key = `${packageName}:${component}`;
            if (!colMap.has(key)) newComponents.add(key);
        }
    }

    // Append new columns alphabetically
    Array.from(newComponents)
        .sort()
        .forEach((comp) => {
            colMap.set(comp, header.length);
            header.push(comp);
        });

    return { header, colMap };
}

function getBatchIndex(rows: string[][], sprintNumber: number): number {
    const prefix = `${sprintNumber}#`;

    for (let i = 1; i < rows.length; i++) {
        const key = rows[i][0];
        if (typeof key !== 'string' || !key.startsWith(prefix)) return 0;

        const match = key.match(/#(\d+):/);
        if (!match) return 0;

        const idx = parseInt(match[1], 10);
        if (!isNaN(idx)) return idx + 1;
    }

    return 0;
}

function compareUsageRows(rowA: string[], rowB: string[]) {
    const partsA = rowA[0].split('/');
    const partsB = rowB[0].split('/');
    const length = Math.min(partsA.length, partsB.length);

    for (let i = 0; i < length; i++) {
        if (partsA[i] !== partsB[i]) {
            const isFileA = i === partsA.length - 1;
            const isFileB = i === partsB.length - 1;

            // Folder comes first
            if (isFileA !== isFileB) return isFileA ? 1 : -1;

            return partsA[i].localeCompare(partsB[i]);
        }
    }

    return partsB.length - partsA.length;
}

function createDataRows(
    usageByEntry: Map<string, Map<string, number>>,
    columnMapping: Map<string, number>,
    meta: { sprint: number; batch: number; packageName: string; columnCount: number },
) {
    const rows: string[][] = [];
    const cwd = process.cwd();

    for (const [absolutePath, usage] of usageByEntry) {
        const file = path.relative(cwd, absolutePath);
        const row = new Array(meta.columnCount).fill('-');

        row[0] = `${meta.sprint}#${meta.batch}:${file}`;

        for (const [component, count] of usage) {
            const columnIndex = columnMapping.get(`${meta.packageName}:${component}`);
            if (columnIndex !== undefined) row[columnIndex] = count.toString();
        }
        rows.push(row);
    }

    return rows.toSorted(compareUsageRows);
}

function normalizeRows(rows: string[][], length: number) {
    return rows.map((r) => {
        const row = [...r];
        while (row.length < length) row.push('');
        return row;
    });
}

const SPRINT_START_DATE = new Date(2021, 0, 7);
const SPRINT_CYCLE_WEEKS = 3;
const SPRINT_OFFSET = 23;
const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

const SUM_FUNCTION = '=SUM(INDIRECT(ADDRESS(2, COLUMN()) & ":" & ADDRESS(ROW()-1, COLUMN())))';

export function getSprint(date = new Date()) {
    const diffInMs = date.getTime() - SPRINT_START_DATE.getTime();
    const diffInWeeks = diffInMs / MS_PER_WEEK;
    const sprintIndex = Math.floor(diffInWeeks / SPRINT_CYCLE_WEEKS);

    return sprintIndex + 1 + SPRINT_OFFSET;
}

export async function submitAnalysis(
    usageByEntry: Map<string, Map<string, number>>,
    packageName: string,
) {
    if (usageByEntry.size === 0) {
        console.error('No usage found or no files to analyze.');
        return;
    }

    try {
        const sheetClient = await createSheets();
        const repoName = path.basename(process.cwd());

        await ensureSheet(sheetClient, repoName);

        const sheetRange = `${repoName}!A1:ZZ`;
        const [sheetData] = await sheetClient.getValues([sheetRange]);
        const currentRows = sheetData?.values || [];

        // 1. Prepare Header
        const existingHeader = currentRows[0] || [];
        const { header, colMap } = updateHeader(existingHeader, usageByEntry, packageName);

        // 2. Prepare Data
        const currentSprint = getSprint();
        const currentBatch = getBatchIndex(currentRows, currentSprint);

        const newRows = createDataRows(usageByEntry, colMap, {
            sprint: currentSprint,
            batch: currentBatch,
            packageName: packageName,
            columnCount: header.length,
        });

        // 3. Merge & Normalize
        const existingData = currentRows.slice(1).filter((row) => row[0] !== '합계');
        const sumRow = new Array(header.length).fill(SUM_FUNCTION);
        sumRow[0] = '합계';

        const finalRows = [
            header,
            ...normalizeRows(newRows, header.length),
            ...normalizeRows(existingData, header.length),
            sumRow,
        ];

        // 4. Save
        await sheetClient.setValues(`${repoName}!A1`, finalRows);
        console.log(`Successfully logged ${newRows.length} entries to Google Sheets.`);
    } catch (error) {
        console.error('Error updating usage report:', error);
    }
}
