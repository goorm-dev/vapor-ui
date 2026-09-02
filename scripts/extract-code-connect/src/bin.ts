import { main } from './cli';

main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err: unknown) => {
        console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
    },
);
