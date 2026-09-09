import type { ArgumentsCamelCase, Argv, CommandModule } from 'yargs';

import { generate } from '../generate';
import { resolveContext } from './context';

function builder(y: Argv) {
    return y
        .positional('figma-url', {
            type: 'string',
            demandOption: true,
            describe: 'Figma design URL with node-id (component or component set)',
        })
        .options({
            'from-json': {
                type: 'string',
                describe: 'Use a saved get_context_for_code_connect JSON instead of the REST API',
            },
            out: {
                type: 'string',
                describe: 'Output path (default: src/components/<kebab>/<kebab>.figma.ts)',
            },
            utils: {
                type: 'string',
                default: 'src/utils/figma-utils',
                describe: 'Module that exports getProperties',
            },
            force: {
                type: 'boolean',
                default: false,
                describe: 'Overwrite an existing output file',
            },
        })
        .epilogue(
            [
                'Paths are relative to the current working directory (the consuming package root).',
                'Env: FIGMA_TOKEN (required unless --from-json). Read from <cwd>/.env when present.',
            ].join('\n'),
        );
}

type GenerateArgs = ReturnType<typeof builder> extends Argv<infer T> ? T : never;

const cmdGenerate: CommandModule<object, GenerateArgs> = {
    command: '$0 <figma-url>',
    describe: 'Generate a parserless Code Connect template (.figma.ts) from a Figma component',
    builder,
    handler: (argv: ArgumentsCamelCase<GenerateArgs>) =>
        generate(
            {
                url: argv.figmaUrl,
                fromJson: argv.fromJson,
                out: argv.out,
                utils: argv.utils,
                force: argv.force,
            },
            resolveContext(),
        ),
};

export default cmdGenerate;
