/**
 * Output port.
 *
 * The pipeline never writes to the console directly; the CLI supplies the only
 * implementation that does (cli/reporter.ts), so library consumers of `extract()`
 * can stay silent or route messages elsewhere.
 */
export interface Reporter {
    /** Progress meant for humans watching a run. */
    info(message: string): void;
    /** Recoverable problem — the run continues with this item skipped. */
    warn(message: string): void;
    /** Verbose tracing; dropped unless the caller asked for it. */
    debug(message: string): void;
}

export const silentReporter: Reporter = {
    info: () => {},
    warn: () => {},
    debug: () => {},
};
