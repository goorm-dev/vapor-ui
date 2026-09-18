import type { Reporter } from '~/domain/reporter';

/**
 * The only place in the package that touches the console.
 * Everything goes to stderr so stdout stays free for piped output.
 */
export function createConsoleReporter(verbose = false): Reporter {
    return {
        info: (message) => console.error(message),
        warn: (message) => console.warn(`[ts-api-extractor] ${message}`),
        debug: (message) => {
            if (verbose) console.error(`[verbose] ${message}`);
        },
    };
}
