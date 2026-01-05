/**
 * CLI module - handles command line interface configuration and execution
 */

export { createCli } from './config';
export type { CliFlags, CliInstance } from './config';

export { CliRunner } from './runner';

/**
 * Main CLI entry point function
 * This can be called directly or used as the bin entry point
 */
export function runCli(): void {
    const { createCli: create } = require('./config');
    const { CliRunner: Runner } = require('./runner');

    const cli = create();
    const runner = new Runner(cli.flags);
    runner.run();
}
