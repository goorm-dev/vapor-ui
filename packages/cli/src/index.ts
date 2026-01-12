import { Command } from 'commander';
import { createRequire } from 'node:module';

import trackerCommand from './commands/tracker';

const pkgJson = createRequire(import.meta.url)('../package.json');

const program = new Command()
    .name('@vapor-ui/cli')
    .description('Vapor UI CLI tools')
    .version(pkgJson.version);

program.addCommand(trackerCommand);
program.parse(process.argv);
