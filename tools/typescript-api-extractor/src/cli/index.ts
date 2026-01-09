import { Command } from 'commander';

import { findComponentFiles } from '../core/scanner';

const program = new Command();

program
    .name('ts-api-extractor')
    .description('TypeScript AST-based API extractor for documentation generation')
    .version('0.0.1');

program
    .command('docs-generate')
    .description('Find component files in given path')
    .argument('<path>', 'Directory path to scan')
    .action(async (inputPath: string) => {
        try {
            const files = await findComponentFiles(inputPath);
            files.forEach((file) => {
                console.log(file);
            });
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program.parse();
