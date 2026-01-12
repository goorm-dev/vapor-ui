import { Command } from 'commander';
import { createRequire } from 'node:module';

import usageCommand from './usage/command';

const pkgJson = createRequire(import.meta.url)('../package.json');

const program = new Command()
    .name('@vapor-ui/cli')
    .description('Vapor UI CLI tools')
    .version(pkgJson.version);

program.addCommand(usageCommand);
program.parse(process.argv);
