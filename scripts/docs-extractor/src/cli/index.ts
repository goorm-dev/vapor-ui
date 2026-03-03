import { handleCliError, runCli } from '~/adapters/in/cli/meow-cli.adapter';

runCli().catch(handleCliError);
