import type { NodePath } from '@babel/core';
import { parseSync, traverse } from '@babel/core';
import type { ImportDeclaration, JSXOpeningElement } from '@babel/types';
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import pico from 'picocolors';

import type { PathsMatcher } from './utils';
import {
    createAnalysisCache,
    expandTargetFiles,
    getTsconfigPathsMatcher,
    resolveImportPath,
    submitAnalysis,
} from './utils';

/**
 * Tracks Vapor UI component imports in a file.
 */
function collectVaporImports(path: NodePath<ImportDeclaration>, importsMap: Map<string, string>) {
    path.node.specifiers.forEach((specifier) => {
        if (specifier.type !== 'ImportSpecifier') return;
        if (!('name' in specifier.imported)) return;

        const localName = specifier.local.name;
        const importedName = specifier.imported.name;

        importsMap.set(localName, importedName);
    });
}

interface CollectJSXUsageParams {
    path: NodePath<JSXOpeningElement>;
    importsMap: Map<string, string>;
    componentsMap: Map<string, number>;
}

/**
 * Tracks usage of Vapor UI components in JSX.
 */
function collectJSXUsage({ path, importsMap, componentsMap }: CollectJSXUsageParams) {
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
    if (!importsMap.has(targetLocalName)) return;

    const originalName = importsMap.get(targetLocalName)!;
    componentsMap.set(originalName, (componentsMap.get(originalName) || 0) + 1);
}

/**
 * Collects a dependency path if it resolves to a valid file.
 */
function collectFileDependency(sourceValue: string, context: DependencyCollectorContext) {
    const { baseDir, shallow, pathsMatcher, files } = context;

    if (shallow) return;

    const resolvedPath = resolveImportPath(baseDir, sourceValue, pathsMatcher);

    if (resolvedPath) {
        files.push(resolvedPath);
    }
}

/**
 * Parses and traverses a single file to find Vapor UI component usage.
 * Returns the analysis result containing used components and file dependencies.
 */
function analyzeSourceFile(file: string, config: AnalyzerConfig): AnalyzeFileResult {
    const fileDir = path.dirname(file);
    const code = fs.readFileSync(file, 'utf-8');

    const files: string[] = [];
    const componentsMap = new Map<string, number>();
    const importsMap = new Map<string, string>();

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

        const context: DependencyCollectorContext = {
            ...config,
            baseDir: fileDir,
            files,
        };

        traverse(ast, {
            ImportDeclaration(path) {
                const sourceValue = path.node.source.value;

                if (sourceValue.startsWith(context.packageName)) {
                    collectVaporImports(path, importsMap);
                } else {
                    collectFileDependency(sourceValue, context);
                }
            },
            ExportNamedDeclaration(path) {
                if (path.node.source?.value) {
                    collectFileDependency(path.node.source.value, context);
                }
            },
            ExportAllDeclaration(path) {
                if (path.node.source?.value) {
                    collectFileDependency(path.node.source.value, context);
                }
            },
            CallExpression(path) {
                const { callee, arguments: nodeArgs } = path.node;

                // Handle dynamic imports: import('...')
                if (
                    callee.type === 'Import' &&
                    nodeArgs.length > 0 &&
                    nodeArgs[0].type === 'StringLiteral'
                ) {
                    collectFileDependency(nodeArgs[0].value, context);
                }
            },
            JSXOpeningElement(path) {
                collectJSXUsage({ path, importsMap, componentsMap });
            },
        });
    } catch (_e) {
        // Fail silently on parse errors
    }

    return { componentsMap, files };
}

/**
 * Main execution function for the usage command.
 */
export async function usageCommand(targets: string[], options: RunOptions) {
    const { shallow = false, package: packageName = '@vapor-ui/core', repo } = options;
    const initialTargets = targets.length > 0 ? targets : ['.'];
    const cwd = process.cwd();

    console.log(pico.cyan(`\n[ @vapor-ui/cli ]\n`));

    console.log(`Analyzing targets ${pico.gray(`(mode: ${shallow ? 'Shallow' : 'Deep'})`)}`);
    console.log(pico.gray(`- ${initialTargets.join('\n- ')}`));

    const pathsMatcher = getTsconfigPathsMatcher();
    const entries = await expandTargetFiles(cwd, initialTargets);

    console.log(`\nFound ${entries.length} entry files to analyze.\n`);

    // --- Usage Analysis Loop ---
    const fileAnalysisCache = createAnalysisCache<string, AnalyzeFileResult>();
    const usageByEntry = new Map<string, Map<string, number>>();

    for (const entry of entries) {
        const pageUsageMap = new Map<string, number>();
        const visited = new Set<string>();
        const queue = [entry];

        // BFS Traversal of file import graph
        while (queue.length > 0) {
            const file = queue.shift();

            if (!file) continue;
            if (visited.has(file)) continue;

            visited.add(file);

            // 1. Check Cache or Analyze
            fileAnalysisCache.update(
                file,
                (prev) => prev || analyzeSourceFile(file, { shallow, pathsMatcher, packageName }),
            );
            const analysisResult = fileAnalysisCache.get(file)!;

            // 2. Aggregate Usages
            for (const [component, count] of analysisResult.componentsMap) {
                const currentCount = pageUsageMap.get(component) || 0;
                pageUsageMap.set(component, currentCount + count);
            }

            if (shallow) continue;

            // 3. Enqueue Dependencies (if deep mode)
            for (const depFile of analysisResult.files) {
                if (!visited.has(depFile)) {
                    queue.push(depFile);
                }
            }
        }

        // ignore entries with no usage
        if (pageUsageMap.size === 0) continue;

        usageByEntry.set(entry, pageUsageMap);
    }

    try {
        await submitAnalysis({ repo, usageByEntry, packageName });
    } catch (error) {
        console.error('Failed to update Google Sheet:', error);
    }
}

export default new Command('usage')
    .arguments('[targets...]')
    .description('Analyze Vapor UI component usage')
    .requiredOption('--repo <repositoryName>', 'Specify the repository name to analyze')
    .option('--package <packageName>', 'Specify the package name to analyze', '@vapor-ui/core')
    .option('--shallow', 'Analyze only specified files without following imports', false)
    .action(usageCommand);

// --- Types ---

export interface AnalyzerConfig {
    packageName: string;
    shallow: boolean;
    pathsMatcher: PathsMatcher | null;
}

export interface DependencyCollectorContext extends AnalyzerConfig {
    /** The directory of the current file being analyzed */
    baseDir: string;
    /** Output array for collected files */
    files: string[];
}

export interface AnalyzeFileResult {
    componentsMap: Map<string, number>;
    files: string[];
}

export interface RunOptions {
    repo: string;
    shallow?: boolean;
    package?: string;
}

export interface UsageReport {
    [file: string]: {
        [component: string]: number;
    };
}
