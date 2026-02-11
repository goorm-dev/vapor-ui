/**
 * translate-docs entry point
 * Runs the CLI command.
 */
import { translate } from './commands/translate.js';

translate().catch(console.error);
