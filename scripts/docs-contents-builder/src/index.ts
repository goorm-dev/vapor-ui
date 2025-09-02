/* eslint-disable prefer-template */
/* eslint-disable no-console */
import glob from 'fast-glob';
import kebabCase from 'lodash/kebabCase';
import * as fs from 'node:fs';
import * as inspector from 'node:inspector';
import * as path from 'node:path';
import ts from 'typescript';
import * as tae from 'typescript-api-extractor';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
    extractNamespaceComponents,
    formatComponentData,
    isNamespaceComponent,
    isPublicComponent,
} from './componentHandler';
import { formatHookData, isPublicHook } from './hookHandler';

const isDebug = inspector.url() !== undefined;

interface RunOptions {
    files?: string[];
    configPath: string;
    out: string;
    language?: string;
}

interface TsConfig {
    options: ts.CompilerOptions;
    fileNames: string[];
}

async function run(options: RunOptions) {
    const config = tae.loadConfig(options.configPath);
    const files = await getFilesToProcess(options, config);

    // Ensure baseUrl is set for proper path resolution
    const tsConfigDir = path.dirname(options.configPath);
    const enhancedOptions = {
        ...config.options,
        baseUrl: config.options.baseUrl || tsConfigDir,
        rootDir: config.options.rootDir || tsConfigDir,
    };

    const program = ts.createProgram(files, enhancedOptions);

    // Debug: check if the program has source files for our target files

    const { exports, errorCount, fileExportsMap } = findAllExports(program, files, enhancedOptions);
    for (const exportNode of exports) {
        try {
            // Find the source file for this export
            let sourceFilePath = '';
            for (const [file, fileExports] of fileExportsMap.entries()) {
                if (fileExports.includes(exportNode)) {
                    sourceFilePath = file;
                    break;
                }
            }

            const componentApiReference = formatComponentData(
                exportNode,
                exports,
                options.language || 'ko',
                sourceFilePath,
            );
            const json = JSON.stringify(componentApiReference, null, 2) + '\n';
            fs.writeFileSync(path.join(options.out, `${kebabCase(exportNode.name)}.json`), json);
            console.log(`✅ Generated ${kebabCase(exportNode.name)}.json`);
        } catch (error) {
            console.error(`❌ Failed to format component ${exportNode.name}: ${error.message}`);
        }
    }

    for (const exportNode of exports.filter(isPublicHook)) {
        try {
            const json = JSON.stringify(formatHookData(exportNode), null, 2) + '\n';
            fs.writeFileSync(path.join(options.out, `${kebabCase(exportNode.name)}.json`), json);
            console.log(`✅ Generated hook ${kebabCase(exportNode.name)}.json`);
        } catch (error) {
            console.error(`❌ Failed to format hook ${exportNode.name}: ${error.message}`);
        }
    }

    for (const exportNode of exports.filter(isNamespaceComponent)) {
        try {
            // Find the source file for this export
            let sourceFilePath = '';
            for (const [file, fileExports] of fileExportsMap.entries()) {
                if (fileExports.includes(exportNode)) {
                    sourceFilePath = file;
                    break;
                }
            }

            const namespaceComponents = extractNamespaceComponents(exportNode, exports);
            for (const [subComponentName, subComponent] of namespaceComponents) {
                const componentApiReference = formatComponentData(
                    subComponent,
                    exports,
                    options.language || 'ko',
                    sourceFilePath,
                    `${exportNode.name}.${subComponentName}`,
                );
                const json = JSON.stringify(componentApiReference, null, 2) + '\n';
                fs.writeFileSync(
                    path.join(
                        options.out,
                        `${kebabCase(exportNode.name)}-${kebabCase(subComponentName)}.json`,
                    ),
                    json,
                );
                console.log(`✅ Generated ${exportNode.name}.${subComponentName} docs`);
            }
        } catch (error) {
            console.error(
                `❌ Failed to process namespace component ${exportNode.name}: ${error.message}`,
            );
        }
    }

    console.log(`\nProcessed ${files.length} files.`);
    if (errorCount > 0) {
        console.log(`❌ Found ${errorCount} errors.`);
        process.exit(1);
    }
}

async function getFilesToProcess(options: RunOptions, config: TsConfig): Promise<string[]> {
    if (options.files && options.files.length > 0) {
        const files = await glob(options.files, {
            cwd: path.dirname(options.configPath),
            absolute: true,
            onlyFiles: true,
        });

        if (files.length === 0) {
            console.error('No files found matching the provided patterns.');
            process.exit(1);
        } else {
            console.log(`Found ${files.length} files to process based on the provided patterns:`);
            files.forEach((file) => console.log(`- ${file}`));
        }

        return files;
    }

    return config.fileNames;
}

yargs(hideBin(process.argv))
    .command<RunOptions>(
        '$0',
        'Extracts the API descriptions from a set of files',
        (command) => {
            return command
                .option('configPath', {
                    alias: 'c',
                    type: 'string',
                    demandOption: true,
                    description: 'The path to the tsconfig.json file',
                })
                .option('out', {
                    alias: 'o',
                    demandOption: true,
                    type: 'string',
                    description: 'The output directory.',
                })
                .option('files', {
                    alias: 'f',
                    type: 'array',
                    demandOption: false,
                    description:
                        'The files to extract the API descriptions from. If not provided, all files in the tsconfig.json are used. You can use globs like `src/**/*.{ts,tsx}` and `!**/*.test.*`. Paths are relative to the tsconfig.json file.',
                })
                .option('includeExternal', {
                    alias: 'e',
                    type: 'boolean',
                    default: false,
                    description: 'Include props defined outside of the project',
                })
                .option('language', {
                    alias: 'l',
                    type: 'string',
                    default: 'ko',
                    description: 'Language for component descriptions (default: ko)',
                });
        },
        run,
    )
    .help()
    .strict()
    .version(false)
    .parse();

function findAllExports(
    program: ts.Program,
    sourceFiles: string[],
    compilerOptions: ts.CompilerOptions,
) {
    const allExports: tae.ExportNode[] = [];
    const fileExportsMap = new Map<string, tae.ExportNode[]>();
    let errorCounter = 0;

    for (const file of sourceFiles) {
        if (!isDebug) {
            console.log(`Processing ${file}`);
            console.group();
        }

        try {
            // Skip index files as they typically only contain re-exports
            if (path.basename(file) === 'index.ts' || path.basename(file) === 'index.tsx') {
                if (!isDebug) {
                    console.log('Skipping index file (re-exports only)');
                }
                continue;
            }

            // Ensure we have an absolute path
            const absoluteFilePath = path.resolve(file);

            // Check if the program has this source file
            const sourceFile = program.getSourceFile(absoluteFilePath);
            if (!sourceFile) {
                console.error(`  ❌ Source file not found in program: ${absoluteFilePath}`);
                errorCounter += 1;
                continue;
            }
            // Try parseFile instead of parseFromProgram to avoid path resolution issues
            const ast = tae.parseFile(absoluteFilePath, compilerOptions);

            allExports.push(...ast.exports);

            fileExportsMap.set(absoluteFilePath, ast.exports);
        } catch (error) {
            console.error(`⛔ Error processing ${file}:`);
            console.error(`  Message: ${error.message}`);
            console.error(`  Code: ${error.code || 'N/A'}`);
            console.error(`  Stack: ${error.stack || 'N/A'}`);
            if (error.innerError) {
                console.error(`  Inner Error: ${JSON.stringify(error.innerError)}`);
            }
            errorCounter += 1;
        } finally {
            if (!isDebug) {
                console.groupEnd();
            }
        }
    }

    return { exports: allExports, errorCount: errorCounter, fileExportsMap };
}
