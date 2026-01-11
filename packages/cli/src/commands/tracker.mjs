import parser from '@babel/parser';
import _traverse from '@babel/traverse';
import fs from 'fs';
import { createPathsMatcher, getTsconfig } from 'get-tsconfig';
import { glob } from 'glob';
import path from 'path';

// traverse의 default export 처리 호환성
const traverse = typeof _traverse === 'function' ? _traverse : _traverse.default;

const VAPOR_CORE_PACKAGE = '@vapor-ui/core';
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// --- Path Helper Functions ---

export const isFile = (filePath) => fs.existsSync(filePath) && fs.statSync(filePath).isFile();
export const isSupportedExtension = (filePath) => EXTENSIONS.includes(path.extname(filePath));

export function findFileWithExtensions(basePath) {
    for (const ext of EXTENSIONS) {
        const candidate = basePath + ext;
        if (isFile(candidate)) return candidate;
    }
    return null;
}

/**
 * 파일 경로 확인 함수
 */
export function probeExtensions(filePath) {
    if (isFile(filePath) && isSupportedExtension(filePath)) return filePath;

    const fileWithExt = findFileWithExtensions(filePath);
    if (fileWithExt) return fileWithExt;

    const indexFile = findFileWithExtensions(path.join(filePath, 'index'));
    if (indexFile) return indexFile;

    return null;
}

function resolveRelativePath(baseDir, importPath) {
    if (!importPath.startsWith('.')) return null;
    return probeExtensions(path.resolve(baseDir, importPath));
}

function resolveAliasPath(importPath, matcher) {
    if (!matcher) return null;
    const candidates = matcher(importPath);
    for (const candidate of candidates) {
        const result = probeExtensions(candidate);
        if (result) return result;
    }
    return null;
}

export function resolveFile(baseDir, importPath, matcher) {
    return resolveRelativePath(baseDir, importPath) || resolveAliasPath(importPath, matcher);
}

function getPathsMatcher(cwd, targets) {
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

    if (tsconfigResult) {
        console.log(`Loaded tsconfig from: ${tsconfigResult.path}`);
        return createPathsMatcher(tsconfigResult);
    }

    console.log('No tsconfig.json found. Alias resolution will be disabled.');
    return null;
}

async function findFilesFromDirectory(dirPath) {
    return glob('**/*.{ts,tsx,js,jsx}', {
        cwd: dirPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        absolute: true,
    });
}

async function findFilesFromGlob(cwd, pattern) {
    return glob(pattern, {
        cwd: cwd,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        absolute: true,
        nodir: true,
    });
}

async function resolveTargetFiles(cwd, target) {
    const resolvedPath = path.resolve(cwd, target);

    // 1. Path Exists
    if (fs.existsSync(resolvedPath)) {
        const stat = fs.statSync(resolvedPath);
        if (stat.isDirectory()) {
            return findFilesFromDirectory(resolvedPath);
        }
        if (stat.isFile()) {
            return [resolvedPath];
        }
    }

    // 2. Glob Pattern
    const files = await findFilesFromGlob(cwd, target);
    if (files.length === 0) {
        console.warn(`[Warning] No files found for target: ${target}`);
    }
    return files;
}

async function initializeQueue(cwd, targets) {
    const results = await Promise.all(targets.map((target) => resolveTargetFiles(cwd, target)));
    const allFiles = results.flat();

    return [...new Set(allFiles)];
}

function processVaporImport(path, vaporImports) {
    path.node.specifiers.forEach((specifier) => {
        if (specifier.type !== 'ImportSpecifier') return;
        if (!('name' in specifier.imported)) return;

        const localName = specifier.local.name;
        const importedName =
            typeof specifier.imported.name === 'string'
                ? specifier.imported.name
                : specifier.imported.name.name;

        vaporImports.set(localName, importedName);
    });
}

function processJSXUsage(path, vaporImports, usageMap, fileUsage) {
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

    const originalName = vaporImports.get(targetLocalName);

    usageMap.set(originalName, (usageMap.get(originalName) || 0) + 1);
    fileUsage.set(originalName, (fileUsage.get(originalName) || 0) + 1);
}

function printFileUsage(file, fileUsage) {
    const relativePath = path.relative(process.cwd(), file);

    console.log(`[Found] ${relativePath}:`);

    for (const [component, count] of fileUsage.entries()) {
        console.log(`  - ${component}: ${count}`);
    }
}

function analyzeFile(file, context) {
    const { shallow, pathsMatcher, visited, queue, usageMap } = context;
    const fileDir = path.dirname(file);
    const code = fs.readFileSync(file, 'utf-8');

    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
            errorRecovery: true,
        });

        const vaporImports = new Map();
        const fileUsage = new Map();

        const processSource = (sourceValue) => {
            if (shallow) return; // if shallow mode, don't follow imports

            const resolvedPath = resolveFile(fileDir, sourceValue, pathsMatcher);

            if (resolvedPath && !visited.has(resolvedPath)) {
                queue.push(resolvedPath);
            }
        };

        traverse(ast, {
            ImportDeclaration(path) {
                const sourceValue = path.node.source.value;
                if (sourceValue === VAPOR_CORE_PACKAGE) {
                    processVaporImport(path, vaporImports);
                } else {
                    processSource(sourceValue);
                }
            },
            ExportNamedDeclaration(path) {
                if (path.node.source) processSource(path.node.source.value);
            },
            ExportAllDeclaration(path) {
                if (path.node.source) processSource(path.node.source.value);
            },
            JSXOpeningElement(path) {
                processJSXUsage(path, vaporImports, usageMap, fileUsage);
            },
        });

        if (fileUsage.size > 0) {
            printFileUsage(file, fileUsage);
            return true;
        }
    } catch (_e) {
        // ignore
    }
    return false;
}

function printSummary(usageMap) {
    if (process.stdout.isTTY) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
    }

    console.log('--- Vapor UI Component Usage ---');
    const sortedUsage = Array.from(usageMap.entries()).sort((a, b) => b[1] - a[1]);

    if (sortedUsage.length === 0) {
        console.log('No usage found.');
    } else {
        sortedUsage.forEach(([component, count]) => {
            console.log(`${component}: ${count}`);
        });
    }
}

export async function trackerAction(targets, options) {
    const { shallow = false } = options;
    const initialTargets = targets.length > 0 ? targets : ['.'];
    const cwd = process.cwd();

    console.log(
        `Analyzing targets: ${initialTargets.join(', ')} (Mode: ${shallow ? 'Shallow' : 'Deep'})`,
    );

    const pathsMatcher = getPathsMatcher(cwd, initialTargets);

    // Note: initializeQueue returns Array, but we need a dynamic queue for deep traversal.
    // Arrays in JS can be used as Queue (push/shift).
    const queue = await initializeQueue(cwd, initialTargets);

    console.log(`Initial queue size: ${queue.length}`);

    if (queue.length === 0) {
        console.error('No files to analyze.');
        process.exit(0);
    }

    const visited = new Set();
    const usageMap = new Map();

    while (queue.length > 0) {
        const file = queue.shift();

        if (visited.has(file)) continue;
        visited.add(file);

        analyzeFile(file, { shallow, pathsMatcher, visited, queue, usageMap });
    }

    printSummary(usageMap);
}
