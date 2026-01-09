import { Command } from 'commander';
import { analyze } from '../core/analyzer.js';

const program = new Command();

program
  .name('ts-api-extractor')
  .description('TypeScript AST-based API extractor for documentation generation')
  .version('0.0.1');

program
  .command('extract')
  .description('Extract API information from TypeScript files')
  .argument('<entry>', 'Entry file or glob pattern')
  .option('-o, --output <path>', 'Output file path', './api-docs.json')
  .option('-c, --config <path>', 'Path to tsconfig.json')
  .option('--verbose', 'Enable verbose logging', false)
  .action(async (entry: string, options) => {
    try {
      const result = await analyze({
        entry,
        output: options.output,
        tsconfig: options.config,
        verbose: options.verbose,
      });
      console.log(`Extracted ${result.exports.length} exports`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
