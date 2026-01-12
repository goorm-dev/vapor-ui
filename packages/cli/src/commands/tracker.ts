import type { NodePath } from '@babel/core';
import { parseSync, traverse } from '@babel/core';
import type {
    ExportAllDeclaration,
    ExportNamedDeclaration,
    ImportDeclaration,
    JSXOpeningElement,
} from '@babel/types';
import { Command } from 'commander';
import { createPathsMatcher, getTsconfig } from 'get-tsconfig';
import { glob } from 'glob';
import fs from 'node:fs';
import path from 'node:path';

const PACKAGE_NAME = '@vapor-ui/core';
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// --- Path Helper Functions ---

/**
 * Checks if a file exists and is a regular file.
 */
export const isFile = (filePath: string) =>
    fs.existsSync(filePath) && fs.statSync(filePath).isFile();

/**
 * Checks if the file lacks an extension or has a supported extension (.tsx, .ts, .jsx, .js).
 */
export const isSupportedExtension = (filePath: string) =>
    EXTENSIONS.includes(path.extname(filePath));

/**
 * Attempts to find a file by appending supported extensions to the base path.
 */
export function findFileWithExtensions(basePath: string) {
    for (const ext of EXTENSIONS) {
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

type PathsMatcher = (importPath: string) => string[];

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
export function resolveFile(baseDir: string, importPath: string, matcher: PathsMatcher | null) {
    return resolveRelativePath(baseDir, importPath) || resolveAliasPath(importPath, matcher);
}

/**
 * Loads tsconfig.json and creates a path matcher for alias resolution.
 * Attempts to find the closest tsconfig relative to the target files.
 */
function getPathsMatcher(cwd: string, targets: string[]) {
    const validPathTarget = targets.find(
        (t) => !glob.hasMagic(t) && fs.existsSync(path.resolve(cwd, t)),
    );

    let tsconfigBase = path.join(cwd, 'dummy.ts');
    if (validPathTarget) {
        const resolvedPath = path.resolve(cwd, validPathTarget);
        tsconfigBase = fs.statSync(resolvedPath).isDirectory()
            ? path.join(resolvedPath, 'dummy.ts')
            : resolvedPath;
    }

    const tsconfigResult = getTsconfig(tsconfigBase);

    if (!tsconfigResult) {
        console.log('No tsconfig.json found. Alias resolution will be disabled.');
        return null;
    }

    return createPathsMatcher(tsconfigResult);
}

/**
 * Finds files recursively in a directory.
 */
async function findFilesFromDirectory(dirPath: string) {
    return glob('**/*.{ts,tsx,js,jsx}', {
        cwd: dirPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        absolute: true,
    });
}

/**
 * Finds files matching a glob pattern.
 */
async function findFilesFromGlob(cwd: string, pattern: string) {
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
async function resolveTargetFiles(cwd: string, target: string) {
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
async function initializeQueue(cwd: string, targets: string[]) {
    const results = await Promise.all(targets.map((target) => resolveTargetFiles(cwd, target)));
    const allFiles = results.flat();

    return [...new Set(allFiles)];
}

/**
 * Tracks Vapor UI component imports in a file.
 */
function processVaporImport(path: NodePath<ImportDeclaration>, vaporImports: Map<string, string>) {
    path.node.specifiers.forEach((specifier) => {
        if (specifier.type !== 'ImportSpecifier') return;
        if (!('name' in specifier.imported)) return;

        const localName = specifier.local.name;
        const importedName = specifier.imported.name;

        vaporImports.set(localName, importedName);
    });
}

interface ProcessJSXUsageParams {
    path: NodePath<JSXOpeningElement>;
    vaporImports: Map<string, string>;
    usageMap: Map<string, number>;
    fileUsage: Map<string, number>;
}

/**
 * Tracks usage of Vapor UI components in JSX.
 */
function processJSXUsage({ path, vaporImports, usageMap, fileUsage }: ProcessJSXUsageParams) {
    const node = path.node;
    let targetLocalName = '';

    if (node.name.type === 'JSXIdentifier') {
        targetLocalName = node.name.name;
    }

    if (
        node.name.type === 'JSXMemberExpression' &&
        node.name.object.type === 'JSXIdentifier' &&
        node.name.property.type === 'JSXIdentifier' &&
        ['Root', 'RootPrimitive'].includes(node.name.property.name)
    ) {
        targetLocalName = node.name.object.name;
    }

    if (!targetLocalName) return;
    if (!vaporImports.has(targetLocalName)) return;

    const originalName = vaporImports.get(targetLocalName)!;

    usageMap.set(originalName, (usageMap.get(originalName) || 0) + 1);
    fileUsage.set(originalName, (fileUsage.get(originalName) || 0) + 1);
}

interface ProcessSourceParams extends TrackerOptions {
    fileDir: string;
    sourceValue: string;
    pathsMatcher: PathsMatcher | null;
    visited: Set<string>;
    queue: string[];
}

/** * Processes an import/export source to enqueue the resolved file if applicable.
 */
const processSource = (params: ProcessSourceParams) => {
    const { shallow, fileDir, sourceValue, pathsMatcher, visited, queue } = params;

    if (shallow) return; // if shallow mode, don't follow imports

    const resolvedPath = resolveFile(fileDir, sourceValue, pathsMatcher);

    if (resolvedPath && !visited.has(resolvedPath)) {
        queue.push(resolvedPath);
    }
};

interface AnalyzeContext extends CollectUsagesParams {
    visited: Set<string>;
    usageMap: Map<string, number>;
}

/**
 * Parses and traverses a single file to find Vapor UI component usage.
 */
function analyzeFile(file: string, context: AnalyzeContext) {
    const { shallow, pathsMatcher, visited, queue, usageMap } = context;
    const fileDir = path.dirname(file);
    const code = fs.readFileSync(file, 'utf-8');

    try {
        const ast = parseSync(code, {
            filename: file,
            sourceType: 'module',
            configFile: false,
            parserOpts: {
                plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
                errorRecovery: true,
            },
        });

        if (!ast) {
            throw new Error(`Failed to parse ${file}`);
        }

        const vaporImports = new Map<string, string>();
        const fileUsage = new Map<string, number>();

        const sources = { shallow, fileDir, pathsMatcher, visited, queue };

        traverse(ast, {
            ImportDeclaration(path: NodePath<ImportDeclaration>) {
                const sourceValue = path.node.source.value;

                if (sourceValue === PACKAGE_NAME) processVaporImport(path, vaporImports);
                else processSource({ ...sources, sourceValue });
            },
            ExportNamedDeclaration(path: NodePath<ExportNamedDeclaration>) {
                if (!path.node.source || !path.node.source.value) return;
                processSource({ ...sources, sourceValue: path.node.source.value });
            },
            ExportAllDeclaration(path: NodePath<ExportAllDeclaration>) {
                if (!path.node.source) return;
                processSource({ ...sources, sourceValue: path.node.source.value });
            },
            JSXOpeningElement(path: NodePath<JSXOpeningElement>) {
                processJSXUsage({ path, vaporImports, usageMap, fileUsage });
            },
        });

        return fileUsage;
    } catch (_e) {
        // ignore
    }
    return false;
}

interface CollectUsagesParams extends TrackerOptions {
    pathsMatcher: PathsMatcher | null;
    queue: string[];
}

/**
 * Collects usage statistics by processing files in the queue.
 */
export function collectUsages({ shallow, pathsMatcher, queue }: CollectUsagesParams) {
    const visited = new Set<string>();
    const usageMap = new Map<string, number>();

    if (queue.length === 0) return usageMap;

    while (queue.length > 0) {
        const file = queue.shift();
        if (!file) continue;
        if (visited.has(file)) continue;

        visited.add(file);
        analyzeFile(file, { shallow, pathsMatcher, visited, queue, usageMap });
    }

    return usageMap;
}

interface TrackerOptions {
    shallow?: boolean;
}

export async function run(targets: string[], options: TrackerOptions) {
    const { shallow = false } = options;
    const initialTargets = targets.length > 0 ? targets : ['.'];
    const cwd = process.cwd();

    const pathsMatcher = getPathsMatcher(cwd, initialTargets);
    const queue = await initializeQueue(cwd, initialTargets);

    console.log(
        `Analyzing targets: ${initialTargets.join(', ')} (Mode: ${shallow ? 'Shallow' : 'Deep'})`,
    );

    const usageMap = collectUsages({ shallow, pathsMatcher, queue });

    if (usageMap.size === 0) {
        console.error('No usage found or no files to analyze.');
        // process.exit(0); // Optional: decide if you want to exit or just print summary
    }

    console.log(usageMap.entries());
}

export default new Command('tracker')
    .arguments('[targets...]')
    .description('Analyze Vapor UI component usage')
    .option('--shallow', 'Analyze only specified files without following imports', false)
    .action(run);
