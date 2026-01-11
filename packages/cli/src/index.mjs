import { Command } from 'commander';

import { trackerAction } from './commands/tracker.mjs';

const program = new Command();

program.name('@vapor-ui/cli').description('Vapor UI CLI tools').version('0.0.1');

program
    .command('tracker [targets...]')
    .description('Analyze Vapor UI component usage')
    .option('--shallow', 'Analyze only specified files without following imports', false)
    .action(trackerAction);

program.parse(process.argv);
