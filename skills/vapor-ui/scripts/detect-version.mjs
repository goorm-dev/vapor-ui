#!/usr/bin/env node

/**
 * Detect Vapor UI version in current codebase
 * Usage: node detect-version.mjs [path-to-package.json]
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const packageJsonPath = process.argv[2] || 'package.json';
const absolutePath = resolve(process.cwd(), packageJsonPath);

try {
    const content = readFileSync(absolutePath, 'utf-8');
    const pkg = JSON.parse(content);

    const dependencies = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
    };

    const coreVersion = dependencies['@vapor-ui/core'];
    const iconsVersion = dependencies['@vapor-ui/icons'];

    if (coreVersion || iconsVersion) {
        if (coreVersion) console.log(`CORE: ${coreVersion}`);
        if (iconsVersion) console.log(`ICONS: ${iconsVersion}`);
    } else {
        console.error('ERROR: No Vapor UI package found');
        process.exit(1);
    }
} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`ERROR: package.json not found at ${absolutePath}`);
    } else {
        console.error(`ERROR: ${error.message}`);
    }
    process.exit(1);
}
