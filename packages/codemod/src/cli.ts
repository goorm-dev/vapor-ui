#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const TRANSFORMS_DIR = join(__dirname, '..', 'src', 'transforms');
const AVAILABLE_TRANSFORMS = ['update-callout'];

function showHelp() {
    console.log(`
@vapor-ui/migrate - Code migration tools using jscodeshift

Usage:
  npx @vapor-ui/migrate <transform> <path> [options]

Available transforms:
${AVAILABLE_TRANSFORMS.map((t) => `  - ${t}`).join('\n')}

Options:
  --dry               Dry run (no changes, print only)
  --parser <parser>   Parser to use (babel, babylon, flow, ts, tsx)
  --extensions <ext>  File extensions to transform (default: js,jsx,ts,tsx)
  --help             Show this help message

Examples:
  npx @vapor-ui/migrate update-callout src/
  npx @vapor-ui/migrate update-callout src/ --dry
  npx @vapor-ui/migrate update-callout src/ --parser tsx --extensions tsx,ts
  `);
}

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }

    const transform = args[0];
    const targetPath = args[1];

    if (!transform || !targetPath) {
        console.error('Error: Both transform and path are required.');
        showHelp();
        process.exit(1);
    }

    if (!AVAILABLE_TRANSFORMS.includes(transform)) {
        console.error(`Error: Unknown transform "${transform}"`);
        console.error(`Available transforms: ${AVAILABLE_TRANSFORMS.join(', ')}`);
        process.exit(1);
    }

    if (!existsSync(targetPath)) {
        console.error(`Error: Path "${targetPath}" does not exist.`);
        process.exit(1);
    }

    const transformPath = join(TRANSFORMS_DIR, transform, 'index.js');

    if (!existsSync(transformPath)) {
        console.error(`Error: Transform file not found at "${transformPath}"`);
        process.exit(1);
    }

    // Build jscodeshift command
    const jscodeshiftOptions = [];

    // Parse additional options
    const remainingArgs = args.slice(2);
    let parser = 'tsx';
    let extensions = 'js,jsx,ts,tsx';
    let isDryRun = false;

    for (let i = 0; i < remainingArgs.length; i++) {
        const arg = remainingArgs[i];

        if (arg === '--dry') {
            isDryRun = true;
        } else if (arg === '--parser' && i + 1 < remainingArgs.length) {
            parser = remainingArgs[i + 1];
            i++; // Skip next arg
        } else if (arg === '--extensions' && i + 1 < remainingArgs.length) {
            extensions = remainingArgs[i + 1];
            i++; // Skip next arg
        }
    }

    jscodeshiftOptions.push(`--parser=${parser}`);
    jscodeshiftOptions.push(`--extensions=${extensions}`);

    if (isDryRun) {
        jscodeshiftOptions.push('--dry');
    }

    const command = [
        'node',
        require.resolve('jscodeshift/bin/jscodeshift.js'),
        ...jscodeshiftOptions,
        '--transform',
        transformPath,
        targetPath,
    ].join(' ');

    console.log(`Running: ${command}`);

    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`\n✅ Transform "${transform}" completed successfully!`);
    } catch (error) {
        console.error(`\n❌ Transform "${transform}" failed.`);
        process.exit(1);
    }
}

main();
