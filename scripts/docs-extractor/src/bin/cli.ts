import { run } from '~/cli';
import { CliError } from '~/cli/options';

async function main() {
    try {
        await run();
    } catch (error) {
        if (error instanceof CliError) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }

        const message = error instanceof Error ? error.message : String(error);
        console.error(`Unexpected error: ${message}`);
        process.exit(1);
    }
}

main();
