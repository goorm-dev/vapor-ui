import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import pkg from '../../package.json';
import cmdGenerate from './cmdGenerate';

await yargs(hideBin(process.argv))
    .scriptName('extract-code-connect')
    .usage('$0 <figma-url> [options]')
    .command(cmdGenerate)
    .strict()
    .help()
    .version(pkg.version)
    .showHelpOnFail(false)
    .exitProcess(false)
    .fail((msg, err, instance) => {
        if (msg) {
            instance.showHelp();
            console.error(`\n${msg}`);
        } else if (err) {
            console.error(err.message);
        }
        process.exit(1);
    })
    .parseAsync();
