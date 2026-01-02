#!/usr/bin/env node
/**
 * CLI entry point for docs-extractor
 *
 * This file serves as the entry point for the CLI.
 * All logic has been moved to the cli/ module for better organization.
 */
import { CliRunner, createCli } from '../cli';

const cli = createCli();
const runner = new CliRunner(cli.flags);

runner.run();
