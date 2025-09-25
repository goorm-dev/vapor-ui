import { globby } from 'globby';
/* eslint-disable prefer-template */
/* eslint-disable no-console */
import * as path from 'node:path';
import ts from 'typescript';
import * as tae from 'typescript-api-extractor';

import { createCliCommand } from './cli';
import { ExportProcessor } from './exportProcessor';
import { FileGenerator } from './fileGenerator';
import { RunOptions, TsConfig } from './types';
import { createEnhancedCompilerOptions } from './utils';

async function run(options: RunOptions) {
    const config = tae.loadConfig(options.configPath);
    const files = await getFilesToProcess(options, config);

    // Ensure baseUrl is set for proper path resolution
    const tsConfigDir = path.dirname(options.configPath);
    const enhancedOptions = createEnhancedCompilerOptions(config.options, tsConfigDir);

    const program = ts.createProgram(files, enhancedOptions);

    // Process exports using the new ExportProcessor class
    const processor = new ExportProcessor(program, enhancedOptions);
    const { exports, errorCount, fileExportsMap } = processor.processFiles(files);

    // Generate files using the new FileGenerator class
    const generator = new FileGenerator(options.out, options.language, fileExportsMap);

    generator.generateComponentFiles(exports);

    console.log(`\nProcessed ${files.length} files.`);
    if (errorCount > 0) {
        console.log(`❌ Found ${errorCount} errors.`);
        process.exit(1);
    }
}

async function getFilesToProcess(options: RunOptions, config: TsConfig): Promise<string[]> {
    if (options.files && options.files.length > 0) {
        const files = await globby(options.files, {
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

// Initialize and run CLI
createCliCommand(run).parse();
